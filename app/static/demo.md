# Overview of the μr² editor

The [μr² editor](https://mur2.co.uk/editor) an easy to use, a versatile and comprehensive text editor for academic writing.

Reasons to try:

+ Complicated tables: row and column merge, cells in multiple lines, multiple tbody  [Example](#tables)
+ Collaborative *real-time* editing. [Example](#collaborat).
+ Citation and Bibliography support.  [Example](#bib)
+ Comments, Editor notes [Example](#editorial)
+ Fully supports LaTeX math input as SVG output. It means you can use the output without Javascript, for example on Medium.com. [Example](#math)
+ The user interface is minimal, helping to focus on what you are writing
+ Easily export your document to PDF, ePuB, LaTeX, HTML and Microsoft Word
+ Alternatively, publish your work directly to Wordpress.com, Medium.com or on our page
+ It is fast; the simple formatting saves a significant amount of time over other word processors
+ It is easy to learn; it uses Markdown syntax, which is so simple that one can barely call it “syntax”


Most academic articles are the result of shared effort by multiple Writers. To help Writers work together, the μr² supports collaborative real-time editing. Any registered user is welcome to work on your document and you will be able to edit it simultaneously.

# Examples


## Tables {#tables}

Row and columns merge, with multiple tbody:

|               |          Grouping             ||         Grouping 2         ||  Not Grouped    |
| First Header  | Second Header | Third Header   | Forth Header | Fifth Header | Sixth Header    |
| ------------- | :-----------: | -------------: | :----------: | :----------: | --------------- |
| Tall Cell     |          *Long Cell*          ||         *Long Long Cell*                    |||
| ^^            |   **Bold**    | 1. first item  | *Italic*     | 3. third item | + first point  |\
| ^^            |               | 1. second item |              | 1. forth item | + second point |

| New section   |     More      |         Data   | ... - -- --- |||
| And more      | With an escaped \|          || "Try 'quotes' in quotes "         |||
[Compicated table]

## Mathematical expressions {#math}

The μr² renders mathematics from LaTeX expressions inside your markdown file. You can use inline:  $$ \mu r^2 $$, block:

$$ \text{Bayes' theorem: } P(A\mid B) = \frac{P(B \mid A) P(A)}{P(B)} $$ 

Or numbered and [linked](#eq:1) blocks:

$$ \text{Euler's identity: } e^{i \pi } + 1 = 0 $${#eq:1}

The output is rendered as SVG images, this means you can use them everywhere, even when you have no JavaScript. 

## Citations and Bibliography {#bib}

The citations are very simple: this is a citation [@knuthwebsite], and another one with page info  [@einstein{p. 900}], one with a prefix [@knuthfa{See}{chapter 1.2}]. The bibliography information you can write in standard [BibLaTeX](https://github.com/plk/biblatex/) format:


```
@article{einstein,
    author =       "Albert Einstein",
    title =        "{Zur Elektrodynamik bewegter K{\"o}rper}. ({German})
    [{On} the electrodynamics of moving bodies]",
    journal =      "Annalen der Physik",
    volume =       "322",
    number =       "10",
    pages =        "891--921",
    year =         "1905",
    DOI =          "http://dx.doi.org/10.1002/andp.19053221004",
    keywords =     "physics"
}
```

You can choose [Citation Style Language](https://citationstyles.org) styles to render them, for example, you can use APA:

![APA^[The 7th edition.] formatted citations](https://mur2.co.uk/_uploads/photos/1/Kepernyofoto_2021-05-13_-_21.47.51.png)

Or IEEE:

![IEEE formatted citations](https://mur2.co.uk/_uploads/photos/1/Kepernyofoto_2021-05-13_-_21.48.15.png)

The Bibliography will be automatically included at the end of the generated output, like for the above example in IEEE style:

![IEEE formatted Bibliography](https://mur2.co.uk/_uploads/photos/1/Kepernyofoto_2021-05-13_-_21.53.06.png)

## Collaborative real-time editing {#collaborat}

With μr², you can share collaborative documents, thanks to the synchronization mechanism.  The collaborating is *real-time*, so there is no merge mechanism. Simple multiple writers can work on the same document at the same time. 
For a recorded example check out the bellow video:

<iframe width="560" height="600" src="https://www.youtube.com/embed/hAq17feU1SQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Editorial changes {#editorial}

If multiple people are working on the same document, track changes are necessary. 
This is not part of the standard Markdown but it is especially useful. 
The μr² editor uses [CriticMarkup](http://criticmarkup.com) syntax for this. 
It is very easy, just switch on in the toolbar, and you can create {==highlights==},  
{>>comments,<<} {++additions++}, {--deletions--} or {~~bad~>good~~} substitutation.

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

Using Javascript helps μr² to better answer these questions. The editor can only be accessed via HTTPS (secure communication over a computer network) from anywhere with an internet connection, so you do not need to install anything.  However, as it is a client-side technology, after the first load it can work even when you drop your connection in the meantime.^[Which is unfortunately common in our mobile World.] 
However, your work can be stored *only* locally.^[But if you wish to store them online, and access them from everywhere. Currently, we have some space on the demo server, so after registration, you can store them there.]     

## Academic writing and publishing
We aim to support academic quality writing which is a huge task that very few publication platforms offer.  We support LaTeX type mathematical input, footnotes, cross-reference, equation numbering, citations and bibliography and editorial changes to name a few.

In the  μr² editor, you can create HTML, PDF, ePUB, LaTeX or Microsoft Word with one click. You can also directly publish your document in [Wordpress.com](https://wordpress.com) or [Medium](https://medium.com). If you don't have to place to publish it, the project has a free to use [webpage](https://mur2.co.uk) where work can publish.  There we also provide extra features for registered users. 

## How you can help?
If you would like to help, there is plenty of things to do. The most simple one: use the editor and if you find some error or you just have a good idea, do not keep it for yourself. 
If you can program on JavaScript or Python you can collaborate in the development also. I am not a frontend developer, so I am sure there is plenty of place for improvement there. Also, a lot of tests is waiting to be written.  
I am also looking for translators of the frontend. For this do not need any IT knowledge. If you speak English and any other language just have a look a messages.po files on the [Gihub](https://github.com/sajozsattila/mur2_editor/tree/master/app/translations).   

# Thanks

This editor based on multiple open source project, we would like to say many thanks to them:

+ [markdown-it](https://github.com/markdown-it/markdown-it)
  + [markdown-it-attrs](https://github.com/arve0/markdown-it-attrs)
  + [markdown-it-cjk-breaks](https://github.com/markdown-it/markdown-it-cjk-breaks)
  + [markdown-it-criticmarkup](https://github.com/GerHobbelt/markdown-it-criticmarkup)
  + [markdown-it-footnote](https://github.com//markdown-it/markdown-it-footnote)
  + [markdown-it-implicit-figures](https://github.com/arve0/markdown-it-implicit-figures)
  + [markdown-it-ins](https://github.com//markdown-it/markdown-it-ins )
  + [markdown-it-multimd-table](https://github.com/RedBug312/markdown-it-multimd-table)
  + [markdown-it-sub](https://github.com//markdown-it/markdown-it-sub)
  + [markdown-it-bibliography](https://github.com/DerDrodt/markdown-it-bibliography)
+ [UpMath](https://github.com/parpalak/upmath.me)
+ [pandoc](https://pandoc.org/)
+ [Convergence](https://github.com/convergencelabs/)
+ [CriticMarkup](http://criticmarkup.com/)
+ [markdown2latex](https://github.com/rufuspollock/markdown2latex)
+ [tex4ebook](https://github.com/michal-h21/tex4ebook)
+ [SweetAlert](https://sweetalert.js.org/)
+ [FileSaver.js](https://github.com/eligrey/FileSaver.js)
+ [Draggabilly](https://draggabilly.desandro.com)