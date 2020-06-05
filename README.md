
# Overview 

The aim of this project to provide a lightweight editor for long-form journalist and academic writers. An editor which help them to concentrate on the *most important* part of the publication: *the text*.  

Most of the part of the editor is written in Javascript and it works in browsers, except math equations and specific export file generation. The editor stores your text in the browser to prevent the loss of your work in case of software or hardware failures. It is also secure as your work store on your computer.   

# Why the [μr² editor](https://mur2.co.uk/editor)?
## Designed for long-form

The aim of this project to provide a lightweight online editor for long-form bloggers, journalist and academic writers.

Clearly separate the content from the format of your document. As a writer, this gives you the opportunity to focus on the "what", the creative part of your work, rather than the "how" is it going to look on the webpage or paper. The μr² creates a clean, simple and distraction-free writing environment for when you really need to focus on your words:

 ![μr² in focus mode](https://mur2.co.uk/_uploads/photos/attila/mur2_focuse_mode_en.png) 

## Markdown and more

Why Markdown? Markdown is a plain text formatting syntax aimed at making writing easier. The philosophy behind it: a document should be readable without tags mussing everything up, but there should still be ways to add text modifiers like lists, bold, italics, etc. It is an alternative to WYSIWYG (what you see is what you get) editors.^[Like Microsoft Word, Apple’s Pages or Google Docs]

Here’s a quick example: to make words emphasize using Markdown, you simply enclose them in * (asterisks). So, *\*emphasize word\** would look like emphasize word when everything is said and done.

You should try Markdown because:
+ It is dead simple to learn: the syntax is so simple you can barely call it "syntax." 
+ It’s fast: the simple formatting saves a significant amount of time over a word processor or WYSIWYG editor.
+ It’s portable: your documents are cross-platform by nature. You can edit them in any text-capable application on any operating system. Transporting files requires no zipping or archiving, and the file size is as small as it can possibly get. 
+ It's Futureproof: For as long as plain text is the standard (which it will be for a long, long time), Markdown will be usable and openable by modern programs. Compare this to Microsoft Word, which has 8 different filetypes. Keeping things plain text ensures there will never be an outdated version, so the software doesn’t need to update to keep up with the format.

But this is not all. The μr² more than a plain Markdown editor. Switching is always hard, and we give you a lot of help to do. There is a live "Live preview" in the editor to see what you do:

We help also if you do not remember some syntax. You can use the WYSIWYG controls in the editor, or open up the Markdown cheatsheet in the menu.

## Mathematical expressions in <img src="https://tex.s2cms.ru/svg/%5Cmu%20r%5E2" alt="\mu r^2" /> 
Do you want a block formatted mathematical expression, which is automatically numbered and linkable? [Here](#eq:1) you are:


<img src="https://tex.s2cms.ru/svg/%20%5Ctext%7BEuler's%20identity%3A%20%7D%20e%5E%7Bi%20%5Cpi%20%7D%20%2B%201%20%3D%200%20" alt=" \text{Euler's identity: } e^{i \pi } + 1 = 0 " />

It is a simple task, but to do actually. In most of the editor take a lot of steps, if even possible. In    μr² just write the expression: 
```
$$ \text{Euler's identity: } e^{i \pi } + 1 = 0 $$
```

Easy isn't it? Of course, you can write inline math code also: <img src="https://tex.s2cms.ru/svg/%20%5Cmu%20r%5E2%20" alt=" \mu r^2 " />, even in the headers, as above.

## Publish

You finished your work, time to publish. At the moment you definitely reading one of the published version of this document. Probably the [original post](https://mur2.co.uk/reader/18), or the Wordpress or on Medium republishing.  In μr² you can post straight on these platforms. Or you want to publish in an Academic Journal and need [LaTeX]()?^[A a lot of Academic Journal happy to receive your paper in LaTeX. You can see a selection of them [here](https://fr.overleaf.com/latex/templates/tagged/academic-journal). ]  All of this same hard than get a [PDF]() or an [ePUB](): one-click.

## Internationalization and Localization
We are different, and it is good. We do not just speak different languages but we think differently on beauty also. A big part of the μr² is to translate and format the text in the right way. It is just the beginning the all frontend fully supporting translation. But there are automatic localisations also in the Markdown processing. An obvious example, but not the only, is the quotation mark. 

Quotation marks have a variety of forms in different languages. In American writing, quotation marks are normally the double kind in the primary level. On the μr² we follow this marking style on the Markdown input. However, the rendered output is localised. Example in a Hungarian output they will be rendered as „ and ”.

If you publish your work on the μr² server, there are more localisation happening. When a reader opens a post, the server loads the best display settings for the Article language. It means different fonts, different paragraph indents etc. 

The μr² also take care of the PDF, ePUB and LaTeX localization. In these files all of the keywords^[Like Abstract, Table, Picture etc., which exact section of the document.] will be translated to the language of the document. It also loads the best typographical rules for the language.  