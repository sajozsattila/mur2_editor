# Overview of the μr² editor

The [μr² editor](https://mur2.co.uk/editor) an easy to use, versatile and comprehensive text editor for academic writing.

Reasons to try:

+ It is fast; the simple formatting saves a significant amount of time over other word processors
+ It is easy to learn; it uses Markdown syntax, which is so simple that one can barely call it “syntax”
+ The user interface is minimal, helping to focus on what you are writing
+ Fully supports LaTeX math input
+ Easily export your document to PDF, Microsoft Word, ePuB, LaTeX and HTML
+ Alternatively, publish your work directly to Wordpress.com, Medium.com or on our page
+ It is supporting collaborative real-time editing

Most academic articles are the result of shared effort by multiple Writers. To help Writers work together, the μr² supports collaborative real-time editing. Any registered user is welcome to work on your document and you will be able to edit it simultaneously.


# Some details

For detailed usage of the editor please [read our manual](https://mur2.co.uk/editormanual). 

## Why Markdown?
Markdown uses a plain text formatting syntax aimed at making writing easier. The philosophy behind it; a document should be readable without tags everywhere but still be able to add text modifiers such as lists, bold text and italics quickly. It's an alternative to WYSIWYG (what you see is what you get) editors.^[Like Microsoft Word, Apple’s Pages or Google Docs]

Here’s a quick example of how to emphasize words with Markdown, you simply enclose them in * (asterisks). So, \*emphasize word* would look like *emphasize word* in the final document.

We also help if you are new to markdown or can't remember any of the syntaxes. You can use the toolbar controls within the editor or open up the Markdown cheatsheet in the menu.

## Why Javascript?
There is usually a tradeoff between security and usability with two general approaches:

+ The data in digital publications are stored on a remote server and delivered over the internet via a web browser. Is this secure? At μr² we say that it isn't and we are not just referring to 'man-in-the-middle' attacks. If your provider goes offline, all of your work will be lost. It is useable?  Yes, you can access your data from anywhere with an internet connection.
+ Download and install the platform locally. It is secure? Yes, it is more secure than the previous option, however, you need to install the platform on every device.

Using Javascript helps μr² to better answer these questions. The editor can only be accessed via HTTPS (secure communication over a computer network) from anywhere with an internet connection, so you do not need to install anything.  However, your work is stored locally.  

## Academic writing and publishing
We aim to support academic quality writing which is a huge task that very few publication platforms offer.  We support LaTeX type mathematical input, footnotes, crossreference, equation numbering and editorial changes to name a few.

In the  μr² editor, you can create HTML, PDF, ePUB, LaTeX or Microsoft Word with one-click. You can also directly publish your document in [Wordpress.com](https:wordpress.com) or [Medium](https://medium.com). If you don't have to place to publish it, the project has a free to use [webpage](https://mur2.co.uk) where work can publish.  There we also provide extra features for registered users. 

# Thanks

This editor based on multiple open source project, we would like to say many thanks to them:

+ [markdown-it](https://github.com/markdown-it/markdown-it)
+ [UpMath](https://github.com/parpalak/upmath.me)
+ [pandoc](https://pandoc.org/)
+ [Convergence](https://github.com/convergencelabs/)
+ [CriticMarkup](http://criticmarkup.com/)