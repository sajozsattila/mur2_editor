

# Why the μr² editor?
## Designed for long-form

The aim of this project to provide a lightweight online editor for long-form bloggers, journalists and academic writers by clearly separating the content and the format of your document.

The allows the writer to focus on the “_what_”, the creative part of the work, rather than the “_how_” is it going to look on the webpage or final paper. The μr² creates a clean, simple and distraction-free writing environment for when you need to focus on your words:

 ![μr² in focus mode](https://mur2.co.uk/_uploads/photos/attila/mur2_focuse_mode_en.png) 

## Markdown and more

What is Markdown? Markdown is a plain text formatting syntax aimed at making writing easy. The philosophy behind it is that documents should be readable without confusing tags, but still allow for text modifiers such as lists, bold, italics to be added. It is a great alternative to WYSIWYG (what you see is what you get) editors.^[Like Microsoft Word, Apple’s Pages or Google Docs]

Here’s a quick example: to emphasize words using Markdown enclose them in * (asterisks). So, *\*emphasize word\** would look like *emphasize word* in the live preview.

Why should I try Markdown?:
+ It's easy to learn; the syntax is so easy it can barely be called “syntax”
+ It’s fast; the simple formatting saves significant amounts of time over using a word processor or WYSIWYG editor
+ It’s portable; your documents are cross-platform by nature. Edit them in any text-capable application on any operating system. Transporting files does not require zipping or archiving as the file size is very small 
+ It’s futureproof; for as long as plain text is the standard, Markdown will be usable by modern programs. Compare this to Microsoft (r) Word, which has 8 filetypes. Keeping things plain text ensures it will never be outdated (the software doesn’t need to update to keep up with the format).

But that's not everything. The μr² is more than a basic Markdown editor. There's also a “Live preview” in the editor to see instant results, a menu containing common writing functions and a Markdown cheatsheet.

## Mathematical expressions in $$\mu r^2$$

Do you want a block formatted mathematical expression which is automatically numbered and linkable? [Here](#eq:1) you are:
$$ \text{Euler's identity: } e^{i \pi } + 1 = 0 $$

It is a simple task in μr² but in most editors it would not be possible or take multiple steps to achieve. In μr² just write the expression:
```
$$ \text{Euler's identity: } e^{i \pi } + 1 = 0 $$
```
As easy as that. Of course, you can write inline math code also: $$ \mu r^2 $$, even in the headers, as above.

## Publish
Your work is finished and it's time to publish. At the moment you are definitely reading one of the published versions of this document. Probably the [original post](https://mur2.co.uk/reader/18), on  Wordpress or on Medium republishing. In μr² you can post directly onto these platforms. Maybe you want to publish in an Academic Journal and need [LaTeX]()?^[Lot of Academic Journals are happy to receive your paper in LaTeX. You can see a selection of them [here](https://fr.overleaf.com/latex/templates/tagged/academic-journal). ]  All of these methods are as easy as creating a [PDF]() or an [ePUB](): one-click.

## Internationalization and Localization
We are different and proud. Not only do we speak different languages but we also think differently about beauty. A big part of μr² is to translate and format the text in the correct way. This is just the beginning the all frontend fully supporting translation but there are automatic localisations in the Markdown processing. One example is the quotation mark.

Quotation marks take a variety of forms in different languages. In American writing, quotation marks are normally the double kind on a primary level. On the μr² we follow this marking style on the Markdown input. However, the rendered output is localised. For example in Hungarian, the output quotations will be rendered as „ and ”.

If you publish work on the μr² server, there is more localisation happening. When a reader opens a post, the server loads the best display settings for the Article language meaning different fonts, paragraph indents etc...

At μr² we also take care of the PDF, ePUB and LaTeX localization. In these files all of the keywords^[Like Abstract, Table, Picture etc., which exact section of the document.] will be translated to the language of the document. It also loads the best typographical rules for the language.