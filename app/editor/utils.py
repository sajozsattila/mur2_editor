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
            os.mkdir(dirname)
            mdname = os.path.join(dirname,'pdf.md')
            file = open(mdname, 'w')
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
                          "\nheader-includes:\n    - \\usepackage[autostyle=true]{csquotes}"
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
                                     '-V',  'CJKmainfont=Noto Serif CJK SC',
                                     '--citeproc',
                                     "-F", "/opt/pandoc-crossref/bin/pandoc-crossref",
                                     '-s',                                      
                                     '-o', os.path.join(dirname,'mur2.tex')], dirname)

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
        # make pdf
        result, error = run_os_command( ['/usr/bin/pandoc', 
                                     os.path.join(dirname, 'settings.txt'),
                                     os.path.join(dirname,'pancritic.md'), 
                                     '-f', 'markdown', 
                                     '-t',  'pdf', 
                                     '--pdf-engine=xelatex',
                                     '--citeproc',
                                     "-F", "/opt/pandoc-crossref/bin/pandoc-crossref", 
                                     '-V',  'CJKmainfont=Noto Serif CJK SC',
                                     '-s',                                      
                                     '-o', os.path.join(dirname,'mur2.pdf')], dirname)
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