# export the data to other formats
import requests
import datetime
import json
import re
import string
import random
import os
from flask import make_response, send_file, current_app
from flask_babel import lazy_gettext as _l
# for pandoc
import subprocess
from subprocess import Popen, PIPE
from subprocess import check_output
import copy
from html.parser import HTMLParser
from html.entities import name2codepoint

class Mur2HTMLParser(HTMLParser):
    out = []  # ''
    in_pre = False   # class variables
    in_code = False
    in_table = False
    in_head = False
    in_figure = False
    col_align = ''    # lcr...
    col_counter = 0 # how many column
    table_width = 0 # max width of the table
    line_width = 0 # width of the line
    align_ok = False
    in_tr = 0   # for setting & out
    headrow_cntr = 0 # how many head row
    headcol_cntr = 0 # in a head row how many max column
    lcr_idx = 0
    all_col = True  # there isn't colspan
    cmidrule = []
    p_align = False
    span_color = False

    def __init__(self, encoding='utf-8'):
        HTMLParser.__init__(self)
        # self.data = []
        self.st = self.Switcher_s()  # start tag
        self.et = self.Switcher_e()  # end tag
        # self.out = ""

    # Multiple inner classes:
    class Switcher_s(object):   # start tag processing
        def set_linewidth(self, linewidth):
            self.pc.line_width += linewidth

        def get_linewidth(self):
            return self.pc.line_width 
        
        def tags_to_funcs(self, tag, attrs):
            """Dispatch method"""
            self.pc = Mur2HTMLParser  # =parent class!!! (instance variable)
            method_name = 'tag_' + tag
            # Get the method from 'self'. Default to a lambda.
            method = getattr(self, method_name,
                             lambda: "Invalid start tag!")
            # Call the method as we return it
            #print('method() ===========', method)
            try:
                return method(attrs)
            except:
                return '(Tag-name-error:-' + tag + ')'

        def tag_h1(self, attrs):
            # mert a \part külön oldalon lenne! (6 mm)
            return '\\chapter*{'

        def tag_h2(self, attrs):
            return '\\section*{'      # 4 mm

        def tag_h3(self, attrs):
            return '\\subsection*{'   # 3,5 mm

        def tag_h4(self, attrs):
            return '\\subsubsection{'  # 3 mm

        def tag_h5(self, attrs):
            return '\\paragraph{'     # 3 mm

        def tag_h6(self, attrs):
            return '\\subparagraph{'  # 3 mm

        def tag_p(self, attrs):
            tmp = [y for (x, y) in attrs if x == 'align']
            if len(tmp):
                self.pc.p_align = True
            return '\n'

        def tag_pre(self, attrs):   # preformatted text, monospace!
            # tmp = [y for (x, y) in attrs if x == 'class']
            self.pc.in_pre = True
            return '\\begin{verbatim}'

        def tag_code(self, attrs):
            if not self.pc.in_pre:
                return '\\texttt{'
            self.pc.in_code = True  # kell ez?????????
            return '\\begin{verbatim}'

        def tag_span(self, attrs):
            tmp = [y for (x, y) in attrs if x == 'style']
            if self.pc.in_code:
                return ''
            if len(tmp) and tmp[0].split(':')[0] == 'color':
                self.pc.span_color = True
                return '\\textcolor{' + tmp[0].split(':')[1] + '}{'
            return ''

        def tag_img(self, attrs):
            tmp = [y for (x, y) in attrs if x == 'alt']
            if tmp[0] == "":  # ha valóban kép
                return ''
            elif self.pc.p_align:
                self.pc.p_align = False
                return '$$' + tmp[0] + '$$'
            else:
                return '$' + tmp[0] + '$'

        def tag_ol(self, attrs):
            tmp = [y for (x, y) in attrs if x == 'start']
            if len(tmp):
                enum = '\\setcounter{enumi}{' + tmp[0] + '}'
            else:
                enum = ''

            return '\\parbox{'+"{:.2f}".format(0.9/self.pc.col_counter)+'\\textwidth}{\\begin{enumerate}[itemindent=0pt,leftmargin=3pt,rightmargin=3pt]' + enum

        def tag_ul(self, attrs):
            return '\\parbox{'+"{:.2f}".format(0.9/self.pc.col_counter)+'\\textwidth}{\\begin{itemize}[itemindent=0pt,leftmargin=3pt,rightmargin=3pt]'

        def tag_li(self, attrs):
            return '\\item '

        def tag_em(self, attrs):
            return '\\emph{'

        def tag_strong(self, attrs):
            return '\\textbf{'

        def tag_a(self, attrs):
            tmp = [y for (x, y) in attrs if x == 'href']
            return '\\href{' + tmp[0] + '}{'

        # -------------------------------------------------------
        def tag_table(self, attrs):
            self.pc.in_table = True
            self.pc.align_ok = False
            return '\\begin{table}[htbp]\\centering\n'

        def tag_thead(self, attrs):
            self.pc.in_head = True
            self.pc.out.append('\\begin{tabular*}{0.9\\textwidth}{')
            self.pc.out.append('lllll')   # placeholder
            self.pc.lcr_idx = len(self.pc.out) - 1
            return '}\\toprule\n'

        def tag_tbody(self, attrs):
            if self.pc.in_table:
                return '\\midrule\n'
            else:
                return '\\texttt{<tbody>}'  # block in block error

        def tag_tr(self, attrs):
            self.pc.in_tr = 0
            self.pc.headcol_cntr = 0
            self.pc.all_col = True
            self.pc.headrow_cntr += 1
            self.pc.col_align = ''
            self.pc.cmidrule = []
            self.pc.line_width = 0
            return ''

        def tag_th(self, attrs):  # tábla fejlécben vagyunk
            mc_str = ''
            self.pc.in_tr += 1
            self.pc.headcol_cntr += 1
            if self.pc.in_tr > 1:
                mc_str += ' & '
            tmpst = [y for (x, y) in attrs if x == 'style']
            tmpcs = [y for (x, y) in attrs if x == 'colspan']
            if len(tmpcs):
                self.pc.cmidrule.append(
                    (self.pc.headcol_cntr, self.pc.headcol_cntr + (int(tmpcs[0]) - 1)))
                self.pc.headcol_cntr += (int(tmpcs[0]) - 1)  # int() !!!
                mc_str += '\\multicolumn{' + tmpcs[0] + \
                    '}{' + tmpst[0].split(':')[1][0] + '}'
                self.pc.all_col = False            
            elif len(tmpst):                
                self.pc.col_align += tmpst[0].split(':')[1][0] 
            else:
                self.pc.col_align += 'l'
            # save the max number of column
            if self.pc.headcol_cntr > self.pc.col_counter:
                self.pc.col_counter = self.pc.headcol_cntr    

            return mc_str + '{\\textbf{'

        def tag_td(self, attrs):
            mc_str = ''
            self.pc.in_tr += 1
            if self.pc.in_tr > 1:
                mc_str += ' & '
            tmpst = [y for (x, y) in attrs if x == 'style']
            tmpcs = [y for (x, y) in attrs if x == 'colspan']
            if len(tmpcs):
                mc_str += '\\multicolumn{' + tmpcs[0] + \
                    '}{' + tmpst[0].split(':')[1][0] + '}'
            return mc_str + '{'

        def tag_caption(self, attrs):
            return '\\caption{'
        # ------------------------------------------------------

        def tag_br(self, attrs):
            return '\\\\'

        def tag_aside(self, attrs):
            return '{'

        def tag_figure(self, attrs):
            self.pc.in_figure = True
            return '\\begin{figure}[h!]\\centering\\includegraphics[scale=0.67]{'

        def tag_figcaption(self, attrs):
            return '\\caption{'

    class Switcher_e(object):   # end tag processing
        def pclinewidth(self, linewidth):
            self.pc.line_width += linewidth
        
        def tags_to_funcs(self, tag):
            """Dispatch method"""
            self.pc = Mur2HTMLParser  # =parent class!!! (=top level class)
            method_name = 'tag_' + tag
            # Get the method from 'self'. Default to a lambda.
            method = getattr(self, method_name, lambda: "Invalid end tag!")
            # Call the method as we return it
            return method()

        def tag_h1(self):
            return '}'

        def tag_h2(self):
            return '}'

        def tag_h3(self):
            return '}'

        def tag_h4(self):
            return '}'

        def tag_h5(self):
            return '}'

        def tag_h6(self):
            return '}'

        def tag_p(self):
            return '\n'

        def tag_pre(self):
            self.pc.in_pre = False
            return '\\end{verbatim}'

        def tag_code(self):
            self.pc.in_code = False
            if not self.pc.in_pre:
                return '}'
            return ''

        def tag_span(self):
            if self.pc.in_code:
                # self.pc.in_code = False
                return ''
            if self.pc.span_color:
                self.pc.span_color = False
                return '}'
            return ''

        def tag_img(self):
            # if tmp[0] == "":  # ha valóban kép
            return ''

        def tag_ol(self):
            return '\\end{enumerate}}'

        def tag_ul(self):
            return '\\end{itemize}}'

        def tag_li(self):
            return ''

        def tag_em(self):
            return '}'

        def tag_strong(self):
            return '}'

        def tag_a(self):
            return '}'

        def tag_table(self):
            self.pc.in_table = False
            return '\\bottomrule\n\\end{tabular*}\n\\end{table}'

        def tag_thead(self):
            self.pc.in_head = False
            return ''

        def tag_tbody(self):
            return ''

        def tag_tr(self):
            tr_str = '\\\\\n'
            if self.pc.all_col and not self.pc.align_ok:
                # add flexible column fill
                self.pc.out[self.pc.lcr_idx] = ''.join([ 
                    self.pc.col_align[i]+'@{\\extracolsep{\\fill}}' if i < len(self.pc.col_align)-1 
                    else self.pc.col_align[i]
                    for i in range(len(self.pc.col_align)) 
                ])
                self.pc.align_ok = True
            for i in range(len(self.pc.cmidrule)):
                tr_str += '\\cmidrule{' + \
                    str(self.pc.cmidrule[i][0]) + '-' + \
                    str(self.pc.cmidrule[i][1]) + '}'
            if len(self.pc.cmidrule):
                tr_str += '\n'
                
            return tr_str

        def tag_th(self):
            return '}}'

        def tag_td(self):
            return '}'

        def tag_caption(self):
            return '}\n'

        def tag_aside(self):
            return '}\n'

        def tag_figure(self):
            self.pc.in_figure = False
            return '\\end{figure}'

        def tag_figcaption(self):
            return '}'

    def handle_starttag(self, tag, attrs):
        for attr in attrs:
            # print("     attr:", attr)
            pass
        self.out.append(self.st.tags_to_funcs(tag, attrs))

    def handle_endtag(self, tag):
        self.out.append(self.et.tags_to_funcs(tag))

    def handle_data(self, data):
        if data.isspace():    # ha csak whitespace van a stringben
            return            # ha kiveszem, sok üres sor lesz!
        if data.find('^') > -1: # multirow
            self.out.append(data.replace('^', '\\textasciicircum'))
            return
        # set line width
        self.st.set_linewidth( len(data) )
        # update table width
        if self.st.get_linewidth() > self.table_width:
            self.table_width = self.st.get_linewidth()
        self.out.append(data)

    def handle_comment(self, data):
        # print("Comment  :", data)
        pass

    def handle_entityref(self, name):
        c = chr(name2codepoint[name])        

    def handle_charref(self, name):
        if name.startswith('x'):
            c = chr(int(name[1:], 16))
        else:
            c = chr(int(name))
        

    def handle_decl(self, data):
        # print("Decl     :", data)
        pass

# - command -- what we are runing
# - directory -- where we are writing
def run_os_command(command, directory="/tmp"):
    stdout = None
    stderr = None
    try:
        stdout = check_output(command, stderr=subprocess.STDOUT).decode('utf-8')
    except subprocess.CalledProcessError as e:
        msg = str(e)+"\n\n---------------\n\n"+e.output.decode()
        # eror was, we return the logfile filename         
        stderr = os.path.join(directory, "error.log")
        # save error in file
        with open(stderr, 'w') as file_object:
            file_object.write(msg)
    
    return stdout, stderr



def make_tmpdirname():
    letters = string.ascii_letters
    return '/tmp/mur2_export_'+''.join(random.choice(letters) for i in range(16))+'/'

def make_latex(mdtxt, title, abstract, language, author):
            mdtxt = make_pandoc_md(mdtxt)
            title = title
            abstract = abstract
    
            # save to file
            #  # generate random string for dir
            dirname = make_tmpdirname()
            if not os.path.exists(dirname):
                os.mkdir(dirname)
            mdname = os.path.join(dirname,'pdf.md')
            
            
            # proces HTML table in the markdown code
            
            # get the tables from the text 
            if re.search('<span class="mur2_latextable">', mdtxt):
                # find the tables
                tables = re.findall(r'<span class="mur2_latextable">\n(.*?)\n</span>', mdtxt, flags=re.DOTALL)
                
                # generate the Markdown without the tables
                mdtxt = re.sub('<span class="mur2_latextable">.*?</span>','\$murlatextable\$', mdtxt , flags=re.DOTALL)
                
                # process the tables
                for t in range(len(tables)):
                    parser = Mur2HTMLParser()
                    parser.feed(tables[t])
                    if parser.table_width < 45:
                        tables[t] = ''.join(parser.out)
                    else:
                        # rotate 90% the page
                        tables[t] = '\\begin{landscape}\n'+''.join(parser.out).replace("\\textwidth", "\\linewidth")+'\\end{landscape}\n'
                    parser.close()
                    
            
            # save madifiled md
            file = open(mdname, 'w+')
            file.write(mdtxt)
            file.close()
            
            # chinese lang
            if language == "zh_Hans":
                language = "zh-CN"
            elif language == "zh_Hant":
                language = "zh-TW"
                

            # make latex
            # first make the setting files
            # make latex
            # first make the setting files
            with open(dirname+'settings.txt', 'w') as file:
                file.write('---\ntitle: \''+title.replace("$$", "$")+"'"+
                           "\nauthor:" + "".join([ "\n    - "+a for a in author.split(",") ]) +
                           "\nabstract: \n    "+abstract.replace('\n', '\n    ').replace("$$", "$")+
                           "\ncsquotes: true"  )
                
                if language == "zh-CN" or language == "zh-TW":
                    file.write("\nmainfont: Noto Serif CJK SC"+
                               "\ndocumentclass:\n    - ctexart" +
                          "\nheader-includes:\n    - \\usepackage[autostyle=true]{csquotes}" )
                else:
                    file.write(
                           "\nlang: " + language +
                           "\nmainfont: LibertinusSerif-Regular.otf\nsansfont: LibertinusSerif-Regular.otf\nmonofont: LibertinusMono-Regular.otf\nmathfont: latinmodern-math.otf" +                          
                           "\nheader-includes:\n    - \\usepackage[autostyle=true]{csquotes}"+
                           "\n    - \\usepackage{booktabs}"+
                           "\n    - \\usepackage{enumitem}" +
                           "\n    - \\usepackage{pdflscape}"
                          )
                    
                file.write("\n---")
            
            # preprocess
            result, error = run_os_command(['pancritic', 
                                        mdname, 
                                        '-t', 'markdown', 
                                        '-m', 'a', 
                                        '-o', os.path.join(dirname,'pancritic.md')], dirname)
            if error is None:
                result, error = run_os_command(['/usr/bin/pandoc', 
                                     os.path.join(dirname, 'settings.txt'),
                                     os.path.join(dirname,'pancritic.md'),
                                     '-f', 'markdown', 
                                     '-t',  'latex', 
                                     '-V',  '"CJKmainfont=Noto Serif CJK SC"',
                                     '--citeproc',
                                     "-F", "/opt/pandoc-crossref/bin/pandoc-crossref",
                                     '-s',                                      
                                     '-o', os.path.join(dirname,'mur2.tex')], dirname)                
                
                
                # add back the tables
                latexcode = None
                with open(os.path.join(dirname,'mur2.tex'), 'r') as file:
                    latexcode = file.read()            
                for t in tables:
                    latexcode = latexcode.replace('\$murlatextable\$', f'\n\n{t}\n\n', 1)
                with open(os.path.join(dirname,'mur2.tex'), 'w') as file:
                    file.write(latexcode) 
                
            return dirname, error


def  make_pandoc_md(mdtxt):
            # make some change on the markdown to work with pandoc
            # change $$ if it is in line
            points = []
            for m in re.finditer(r'(?:(?<=(?: |\w))\$\$([^\n\$]+?)\$\$)|(?:\$\$([^\n\$]+?)\$\$(?=(?: |\w)))',  mdtxt):
                points.append( (m.start(), m.end()) )
            for m in reversed(points):
                mdtxt = mdtxt[:m[0]] + ' $' + mdtxt[m[0]:m[1]+1].replace('$$', '').strip() + '$ '+  mdtxt[m[1]+1:]
                
            # change iframe to link
            iframes = []
            for m in re.finditer(r'<button type="button" class="collapsible">.*</a></div>',  mdtxt):
                iframes.append( (m.start(), m.end()) )
            for m in reversed(iframes):
                title = mdtxt[m[0]:m[1]].split('>')[1].replace('</button', '')
                address = mdtxt[m[0]:m[1]].split('>')[5].replace('<a href="', '').replace('"', '')
                mdtxt = mdtxt[:m[0]] +  '['+title+'](https://mur2.co.uk'+address+')\n\n' + mdtxt[m[1]+1:]
            return mdtxt

# make PDF from final published Article
def pdf_generation(title, author, language, abstract, body):    
    mdtxt = make_pandoc_md(body)
    article_title = make_pandoc_md(title)
    article_abstract = make_pandoc_md(abstract)
    
    dirname, error = make_latex(mdtxt, article_title, article_abstract, language, author)
    
    
    if error is None:
        """
        # make pdf
        result, error = run_os_command( ['/usr/bin/pandoc', 
                                     os.path.join(dirname,'mur2.tex'), 
                                     '-f', 'latex', 
                                     '-t',  'pdf', 
                                     '--pdf-engine=xelatex',
                                     '--citeproc',
                                     "-F", "/opt/pandoc-crossref/bin/pandoc-crossref", 
                                     '-V',  'CJKmainfont=Noto Serif CJK SC',
                                     '-s',                                      
                                     '-o', os.path.join(dirname,'mur2.pdf')], dirname)
        """
        result, error = run_os_command( ['/usr/local/texlive/2020/bin/x86_64-linux/xelatex', 
                                         "-output-directory="+dirname,
                                         "-interaction=nonstopmode",                                         
                                         os.path.join(dirname,'mur2.tex'),                                         
                                         ], dirname)
        
        
    return dirname, error

# make EPUB and Microsof Word return the dirname where it is
def epub_generation(title, author, language, abstract, body, doctype = 'epub'):
    
    mdtxt = make_pandoc_md(body)
    article_title = make_pandoc_md(title)
    article_abstract = make_pandoc_md(abstract)

    # make epub
    dirname = make_tmpdirname()
    os.mkdir(dirname)
    # save the body text
    mdname = os.path.join(dirname,'epbub.md')
    file = open(mdname, 'w')
    file.write(mdtxt)
    file.close()
    # save the settings
    with open(dirname+'settings.txt', 'w') as file:
        file.write('---\ntitle: '+article_title.replace("$$", "$")+
                   "\nlang: " + language +
                   "\nauthor:\n    - \"" + author + '\"' + 
                   "\ncsquotes: true" +
                   "\nheader-includes:\n    - \\usepackage[autostyle=true]{csquotes}" +
                   "\n---")
            
    # save the abstract 
    with open(dirname+'abstract.txt', 'w') as file:
        file.write("# {epub:type=abstract}\n"+article_abstract)
    
    # preprocess
    result, error = run_os_command(['pancritic', 
                                    mdname, 
                                    '-t', 'markdown', 
                                    '-m', 'a', 
                                    '-o', os.path.join(dirname,'pancritic.md')], dirname)
    if error is None:
        if doctype == 'epub':
            result, error = run_os_command(['/usr/bin/pandoc',
                                     dirname+'settings.txt',
                                     dirname+'abstract.txt',
                                     os.path.join(dirname,'pancritic.md'),
                                     '-f', 'markdown', 
                                     '-V',  'CJKmainfont=Noto Serif CJK SC', 
                                     '--citeproc',
                                     "-F", "/opt/pandoc-crossref/bin/pandoc-crossref",
                                     '-s', 
                                     '-o', dirname + 'mur2.epub'], dirname)
        else:
            result, error = run_os_command(['/usr/bin/pandoc',
                                     dirname+'settings.txt',
                                     dirname+'abstract.txt',
                                     os.path.join(dirname,'pancritic.md'),
                                     '-f', 'markdown', 
                                     '-V',  'CJKmainfont=Noto Serif CJK SC', 
                                     '--citeproc',
                                     "-F", "/opt/pandoc-crossref/bin/pandoc-crossref", 
                                     '-s',                                      
                                     '-o', dirname + 'mur2.docx'], dirname)
    
    return dirname, error

def bib_generation(bibfile):
    dirname = make_tmpdirname()
    os.mkdir(dirname)
    # save the bib 
    mdname = os.path.join(dirname,'articlebib.bib')
    file = open(mdname, 'w')
    file.write(bibfile)
    file.close()
    # make some suportting file
    supporting = os.path.join(dirname,'articlebib.md')
    file = open(supporting, 'w')
    file.write("""---
title: ArticleBib
bibliography: """+mdname+"""
nocite: '@*'
...

# Bibliography
    """)
    file.close()
    # generate the html
    output = os.path.join(dirname, 'articlebib.html')
    result, error = run_os_command(['pandoc', 
                                    '--citeproc', 
                                    '--standalone', 
                                    supporting, 
                                    '-o', output], dirname)
    if error is None:
        # filter the HTML file
        maintext = "# "+_l("Bibliography")+"\n\n"
        mainflag = False
        with open(output, 'r') as f:
            for line in f:
                if mainflag:
                    if line == "</body>\n":
                        break
                    maintext = maintext+line
                if line == '<h1 class="unnumbered" id="bibliography">Bibliography</h1>\n':
                    mainflag = True
        # overwrite file
        with open(output, 'w') as f:
            f.write(maintext)
                
    return dirname, error