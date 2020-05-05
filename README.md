
# Overview 

The aim of this project to provide a lightweight editor for long-form journalist and academic writers. An editor which help them to concentrate on the *most important* part of the publication: *the text*.  

Most of the part of the editor is written in Javascript and it works in browsers, except math equations and specific export file generation. The editor stores your text in the browser to prevent the loss of your work in case of software or hardware failures. It is also secure as your work store on your computer.   

## Text formating
The text formatting is based on the Markdown syntax with a focus of academic usability. So footnotes^[like this] and math equations and diagrams are supported. You can insert inline; like this: $$\mu r ^2$$; and block math code also: 

$$ \text{Euler's identity: } e^{i \pi } + 1 = 0 $$

## Export formating
You can export your work in:
+ PDF
+ HTML
+ direct import to Wordpress.com
+ $$\LaTeX$$

## Internationalization and Localization 

The internationalisation is important for us, which is supported on multiple levels. The generated $$\LaTeX$$ and PDF documents are fully localised based on your browser language settings. There is also some level of localisation support in the generated HTML. 

## Title and Abstract 
The editor has separated fields for the title and abstract. With this, the formated text can match with the academical standards and also help to correctly set up the fields in a direct blog publishing. 

# Editor screen 

There is two possible usage o the editor: Focus mode and Preview mode. 

## Focus mode
In Focus mode, every possible distraction is switched off and just the current sentence is highlighted: 

![Focus mode](http://mur2.co.uk/_uploads/photos/attila/mur2_focuse_mode.png "Focus mode")

## Preview mode
In preview mode you have a live HTML view on the right side of the screen, with Markdown highlighting on the input field:

![Preview mode](http://mur2.co.uk/_uploads/photos/attila/mur2_preview.png "preview mode")

There is also a WYSIWYG style toolbar which provides very handy formatting buttons and shortcuts:
![Toolbar](http://mur2.co.uk/_uploads/photos/attila/mur2_toolbar.png "toolbar")

