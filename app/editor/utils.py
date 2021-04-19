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
# for multimarkdown tables
import markdown
import app.editor.mdx_latex as mdx_latex
# for BibTeX
from app.models import Article

# - command -- what we are runing
# - directory -- where we are writing
def run_os_command(command, directory="/tmp"):
    stdout = None
    stderr = None
    try:
        stdout = check_output(command, stderr=subprocess.STDOUT).decode('utf-8')
    except subprocess.CalledProcessError as e:
        print("returncode:", e.returncode)
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

def make_latex(mdtxt, title, abstract, language, author, article_id, extractmedia=True):
            mdtxt = make_pandoc_md(mdtxt)
            title = title
            abstract = abstract
    
            # save to file
            #  # generate random string for dir
            dirname = make_tmpdirname()
            if not os.path.exists(dirname):
                os.mkdir(dirname)
            mdname = os.path.join(dirname,'pdf.md')
            
            ##########################
            # proces HTML table in the markdown code            
            # get the tables from the text 
            if re.search('<span class="mur2_latextable">', mdtxt):
                # find the tables
                #tables = re.findall(r'<span class="mur2_latextable">(.*?)</span>', mdtxt, flags=re.DOTALL)
                tables = re.findall(r'<span class="mur2_latextable">(.*?)</span>(\n\{#tbl:\d+\}?)?', mdtxt, flags=re.DOTALL)
                
                # generate the Markdown without the tables
                mdtxt = re.sub('<span class="mur2_latextable">.*?</span>(\n\{#tbl:\d+\}?)?','\$murlatextable\$', mdtxt , flags=re.DOTALL)
                
                # process the tables
                if len(tables) > 0:
                    # markdown->LaTeX processor
                    md = markdown.Markdown(extensions=['smarty', 'sane_lists'])
                    latex_mdx = mdx_latex.LaTeXExtension()
                    latex_mdx.extendMarkdown(md, markdown.__dict__)
                    # itterate over tables
                    for t in range(len(tables)):                        
                        # the aprox. length of the table
                        tablewidth = 0
                        # the label of the table
                        tablelable = tables[t][1]
                        # dictionary of the table
                        tables[t] = json.loads(tables[t][0])

                        # update format
                        tables[t]['format'] = ''.join([ 
                            tables[t]['format'][i]+'@{\\extracolsep{\\fill}}' if i < len(tables[t]['format'])-1 
                            else tables[t]['format'][i]
                            for i in range(len(tables[t]['format'])) 
                        ])
                        # create string LaTeX table
                        tablestring = "\n\\begin{table}\n"
                        # if there is caption
                        if tables[t]['caption'] is not None and len(tables[t]['caption']) > 0:                            
                            # label it if there is caption or label
                            if len(tablelable) > 0:
                                llabel = tablelable.replace('\n{#','').replace('}','')
                                tablestring += "\n\t\t\\label{"+llabel+"}\hypertarget{"+llabel+"}{\centering"
                            else :
                                tablestring += "\n\t\t\\label{"+tables[t]['caption'].replace(' ','').lower()+"}"
                            # add caption
                            tablestring += "\n\t\t\\caption{"+tables[t]['caption']+"}"
                            if len(tablelable) > 0:
                                tablestring += "}"
                        # add begining of the table content
                        tablestring += "\n\t\t\\begin{tabular*}{\\textwidth}{@{}"+tables[t]['format']+"@{}}\n\t\t\t\\toprule\n"
                        # itterate over table cells and process the Markdown
                        # the rows
                        for r in range(len(tables[t]["content"])):
                            # the aprox. length of the line
                            linelength = 0
                            tablestring  += "\t\t\t"
                            # add midrule
                            if len(tables[t]["content"][r]) > 0 and 'midrule' in tables[t]["content"][r][0].keys() :
                                tablestring += "\n\t\t\t\\midrule\n\t\t\t"
                            
                            # the columns
                            # need cline?
                            cline = False   
                            for c in range(len(tables[t]["content"][r])):
                                # process markdown to LaTeX
                                if "text" in tables[t]["content"][r][c].keys() \
                                and len(tables[t]["content"][r][c]["text"]) > 0:
                                    # count linelength
                                    linelength += max([ len(l) for l in tables[t]["content"][r][c]["text"].split('\n') if not re.search('\^\[', l) ])
                                    # markdown->LaTeX
                                    tables[t]["content"][r][c]["text"] = md.convert(tables[t]["content"][r][c]["text"])\
                                    .replace('<root>\n\n', '').replace('\n\n\n</root>', '')
                                
                                    
                                # add to tablestring                                                             
                                if 'colspan' in tables[t]["content"][r][c].keys() and 'head' in tables[t]["content"][r][0].keys():
                                    cline = True            
                                if 'colspan' in tables[t]["content"][r][c].keys():
                                    tablestring  += "\\multicolumn{"+str(tables[t]["content"][r][c]['colspan'])+"}{c}{"
                                if 'rowspan' in tables[t]["content"][r][c].keys():
                                    tablestring  += "\\multirow{"+str(tables[t]["content"][r][c]['rowspan'])+"}*{"
                                if 'head' in tables[t]["content"][r][0].keys():
                                    tablestring  += "\\textbf{"            
                                if 'text' in tables[t]["content"][r][c].keys():
                                    # if there is list we wrap it in parbox
                                    if re.search('\\\\begin\{enumerate\}', tables[t]["content"][r][c]['text']) or \
                                     re.search('\\\\begin\{itemize\}', tables[t]["content"][r][c]['text']):
                                        tablestring  += '\\parbox{'+"{:.2f}".format(0.9/len(tables[t]["content"]))+'\\textwidth}{'+tables[t]["content"][r][c]['text'] + '}'
                                    else:
                                        tablestring  += tables[t]["content"][r][c]['text']
                                if 'head' in tables[t]["content"][r][0].keys():
                                    tablestring  += "}"
                                if 'rowspan' in tables[t]["content"][r][c].keys():
                                    tablestring  += "}"            
                                if 'colspan' in tables[t]["content"][r][c].keys():
                                    tablestring  += "}"            
                                if c == len(tables[t]["content"][r])-1 :
                                    tablestring  += "\\\\\n"
                                else:
                                    tablestring  += "&"                                
                            # add header clines
                            if cline:
                                index = 0 # the index of the last column
                                for c in range(len(tables[t]["content"][r])):                
                                    if 'colspan' in tables[t]["content"][r][c].keys() :
                                        if index == 0:
                                            index = c+1                                            
                                        tablestring  += "\t\t\t\\cmidrule{"+str(index)+"-"+str(index+ tables[t]["content"][r][c]['colspan']-1)+"}"
                                        index += tables[t]["content"][r][c]['colspan']
                                tablestring  += "\n"
                            # if this is the longest line in the table save the value
                            if tablewidth < linelength:
                                tablewidth = linelength
                        tablestring += "\n\t\t\t\\bottomrule\n\t\t\\end{tabular*}\n\n\\end{table}\n"
                        # if table widt rotate
                        if tablewidth > 45:
                            tablestring = '\\begin{landscape}\n'+tablestring.replace("\\textwidth", "\\linewidth")+'\\end{landscape}\n'
                        # repace the dict with string
                        tables[t] = tablestring  
                        
            # process BibTeX
            thereisbibtex = False
            if int(article_id) > 0:
                a = Article.query.filter_by(id=int(article_id)).first_or_404()
                if a.bibtex is not None:
                    thereisbibtex = True
                    # save BibTeX data
                    with open('mur2.bib', 'w') as f:
                        f.write(a.bibtex)
                    # remove html bibtex data
                    mdtxt = re.sub('<div id="refs" class="references csl-bib-body hanging-indent" role="doc-bibliography">.*?</div>','\$murbibtex\$', mdtxt , flags=re.DOTALL)
                    
            
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
                           "\nmainfontoptions:\n    - BoldFont=LibertinusSerif-Bold.otf"+
                           "\n    - ItalicFont=LibertinusSerif-Italic.otf"+
                           "\n    - BoldItalicFont=LibertinusSerif-SemiboldItalic.otf"+
                           "\nheader-includes:\n    - \\usepackage[autostyle=true]{csquotes}"+
                           "\n    - \\usepackage{booktabs}"+
                           "\n    - \\usepackage{enumitem}" +
                           "\n    - \\usepackage{pdflscape}" + 
                           "\n    - \\usepackage{multirow}" 
                          )
                file.write("\n---")
            
            # preprocess
            result, error = run_os_command(['pancritic', 
                                        mdname, 
                                        '-t', 'markdown', 
                                        '-m', 'a', 
                                        '-o', os.path.join(dirname,'pancritic.md')], dirname)
            if error is None:
                pandoccommand = ['/usr/bin/pandoc', 
                                     os.path.join(dirname, 'settings.txt'),
                                     os.path.join(dirname,'pancritic.md'),
                                     '-f', 'markdown', 
                                     '-t',  'latex', 
                                     '-V',  '"CJKmainfont=Noto Serif CJK SC"',
                                     '--citeproc',
                                     "-F", "/opt/pandoc-crossref/bin/pandoc-crossref",
                                     '-s',                                      
                                     '-o', os.path.join(dirname,'mur2.tex')]
                # do we download the media files?
                if extractmedia:
                    pandoccommand.append('--extract-media='+dirname)
                if thereisbibtex:
                    pandoccommand += ['--bibliography', 'mur2.bib' ]
                result, error = run_os_command(pandoccommand, dirname)                
                
                
                # add back the tables
                latexcode = None
                with open(os.path.join(dirname,'mur2.tex'), 'r') as file:
                    latexcode = file.read()
                for t in tables:
                    latexcode = latexcode.replace('\$murlatextable\$', f'\n\n{t}\n\n', 1)
                # add back bibtex
                if thereisbibtex:
                    latexcode = latexcode.replace('\$murbibtex\$', '\\bibliography{mur2}\n\\bibliographystyle{ieeetr}\n')
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
def pdf_generation(title, author, language, abstract, body, article_id):    
    mdtxt = make_pandoc_md(body)
    article_title = make_pandoc_md(title)
    article_abstract = make_pandoc_md(abstract)
    
    dirname, error = make_latex(mdtxt, article_title, article_abstract, language, author, article_id)
    
    
    if error is None:
        """
        # make pdf
        result, error = run_os_command( ['/usr/bin/pandoc', 
                                     os.path.join(dirname,'mur2.tex'), 
                                     '-f', 'latex', 
                                     '-t',  'pdf', 
                                     '--pdf-engine=xelatex',                                     
                                     '-s',                                      
                                     '-o', os.path.join(dirname,'mur2.pdf')], dirname)
        
        """
        result, error = run_os_command( ['/usr/local/texlive/2020/bin/x86_64-linux/xelatex', 
                                         "-output-directory="+dirname,
                                         "-interaction=nonstopmode",
                                         "--no-pdf",
                                         os.path.join(dirname,'mur2.tex'),                                         
                                         ], dirname)
        # run twice because of the indexing
        result, error = run_os_command( ['/usr/local/texlive/2020/bin/x86_64-linux/xelatex', 
                                         "-output-directory="+dirname,
                                         "-interaction=nonstopmode",
                                         "--no-pdf",
                                         os.path.join(dirname,'mur2.tex'),                                         
                                         ], dirname)
        # make the actuall pdf
        if os.path.isfile(os.path.join(dirname,'mur2.xdv')):            
            result, error = run_os_command( ['/usr/local/texlive/2020/bin/x86_64-linux/xdvipdfmx', 
                                         "-o", os.path.join(dirname,'mur2.pdf'),
                                         os.path.join(dirname,'mur2.xdv'),                                         
                                         ], dirname)
        print(error)
        
        
        
    return dirname, error

# make EPUB and Microsof Word return the dirname where it is
def epub_generation(title, author, language, abstract, body, article_id):
    
    mdtxt = make_pandoc_md(body)
    article_title = make_pandoc_md(title)
    article_abstract = make_pandoc_md(abstract)
    
    # make latex
    dirname, error = make_latex(mdtxt, article_title, article_abstract, language, author, article_id, extractmedia=False)
    
    # remove pagerotating as epub not supporting
    latexcode = None
    with open(os.path.join(dirname,'mur2.tex'), 'r') as file:
        latexcode = file.read()                   
    latexcode = latexcode.replace('\\begin{landscape}', '').replace('\\end{landscape}', '')
    with open(os.path.join(dirname,'mur2.tex'), 'w') as file:
        file.write(latexcode) 

    if error is None:
        result, error = run_os_command(['/usr/local/texlive/2020/bin/x86_64-linux/tex4ebook',
                                     os.path.join(dirname,'mur2.tex'),
                                     '-d', dirname ], dirname)
        
    
    return dirname, error

def msworld_generation(title, author, language, abstract, body, article_id):
    mdtxt = make_pandoc_md(body)
    article_title = make_pandoc_md(title)
    article_abstract = make_pandoc_md(abstract)
    
    # make latex
    dirname, error = make_latex(mdtxt, article_title, article_abstract, language, author, article_id)
    
    if error is None:
        # Microsoft Word
        
        wordcommand = ['/usr/bin/pandoc',
                                     os.path.join(dirname,'mur2.tex'),
                                     '-f', 'latex', 
                                     '-V',  '"CJKmainfont=Noto Serif CJK SC"',  
                                     '-s',                                      
                                     '-o', dirname + 'mur2.docx']
        
        """
        wordcommand = ['/usr/local/texlive/2020/bin/x86_64-linux/make4ht', 
                                            '-uf', 'odt',
                                            '-d', dirname,
                                            os.path.join(dirname,'mur2.tex')]
        """
        print(" ".join(wordcommand))
        result, error = run_os_command(wordcommand, dirname)
    
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
        maintext = "\n# "+_l("Bibliography")+"\n\n"
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