# Table of content


+ [Guide for μr² editor](#mur2)
  + [Toolbar](#toolbar)
    + [Different view modes](#views)
    + [Markdown shortcuts](#mshort)
    - [Editorial changes](#ec)
    - [Bibliography](#bib)
  + [Document settings](#docs)
    + [Title and abstract](#ta)
    + [Canonical URL](#curl)
    + [Authors](#authors)
  + [Side menu](#sidebar)
    + [Preview formats](#preview)
    + [Version control](#vc)
    + [Publish and export](#export)
  + [Internationalization and Localization](#loc)
  + [Features for registered users](#fru)
    + [Access to Article everywhere](#ac)
    + [Collaborative real-time editing](#cor)
+ [Markdown](#markdown)
   + [Heading](#heading)
   + [Text organizing](#to)
   + [Text formating](#te)
   + [Math](#math)
   + [Lists](#lists)
   + [Quotes](#Quotes)
   + [Code](#codes)
   + [Tables](#tables)
   + [Links](#links)
   + [Images](#images)
   + [Footnotes](#footnote)
   + [Typographic replacements](#tr)


# Guide for μr² editor {#mur2}

## Toolbar {#toolbar}

The Toolbar is the top section of the editor, and looks like:

![Toolbar](https://mur2.co.uk/_uploads/photos/1/mur2_toolbar_2.png)

### Document saving and loading

The basic toolbar icons for document saving and loading are as follows:

<span class="fas fa-file-upload" style="display: unset;"></span> -- upload a Markdown file

<span class="fontawsome fas fa-file-download" style="display: unset;"></span> -- download the [Preview](#preview). In the side menu you can choose between HTML and Markdown format, for details, see [there](#preview).

<span class="fontawsome fas fa-save" style="display: unset;"></span> -- save Article, just for [registered users](#ac).


### Different view modes {#views}

The next section in the toolbar is to control the view of the editors:

<span class="fontawsome far fa-arrow-alt-circle-left " style="display: unset;"></span> -- hide the input side, it helps previewing the document.

<span class="fontawsome far fa-arrow-alt-circle-down" style="display: unset;"></span> -- display the [Document settings](#docs)

<span class="fontawsome far fa-arrow-alt-circle-right" style="display: unset;"></span> -- hide the preview side of the editor. This allows more room for working.

<span class="fontawsome fab fa-markdown fontawsome " style="display: unset;"></span> -- switch off Syntax highlighting in the input side

It is ideal to work without distraction. This is why it's possible in the μr² editor to switch off most of the field. If you hide the preview side, switch off the Syntax highlighting and hide the toolbar, you can actually focus on the text you are writing.

![Focus mode](https://mur2.co.uk/_uploads/photos/1/mur2_focusemode.png)

### Markdown shortcuts {#mshort}

The right side of the Toolbar is WYSIWYG controls for the most used Markdown syntax:

<span class="fontawsome fas fa-heading" style="display: unset;"></span> -- add heading

<span class="fontawsome fas fa-italic" style="display: unset;"></span> -- italic fonts

<span class="fontawsome fas fa-bold" style="display: unset;"></span> -- bold fonts

<span class="fontawsome far fa-image" style="display: unset;"></span> -- add picture, it is uploading the files in the Media page at the same time.

<span class="fontawsome fas fa-link" style="display: unset;"></span> -- add link

<span class="fontawsome fas fa-list" style="display: unset;"></span> -- add unnumbered list

<span class="fontawsome fas fa-list-ol" style="display: unset;"></span> -- add numbered list

<span class="fontawsome fas fa-superscript" style="display: unset;"></span> -- add footnote

<span class="fontawsome fas fa-th-large" style="display: unset;"></span> -- add a basic table skeleton 

<span class="fontawsome fas fa-code" style="display: unset;"></span> -- add code 

**Σ** -- add mathematical expression


### Editorial changes {#ec}

The "Editorial changes" can be understood as syntax for documenting editing notes and changes. It helps the collaboration amongst coauthors. This is not part of the standard Markdown, but especially useful. The μr² editor is using the  [CriticMarkup ](http://criticmarkup.com/) syntax for this. Example:

Deletions: This is {--is --}a test.

Additions: This {++is ++}a test.

Substitutions: This {~~isn’t~>is~~} a test.

Highlighting: This is a {==test==}.

Comments: This is a test.{>>What is a test for?<<}

These marks are hidden by default in the Preview side. If you would like to see them, click on the <span class="fontawsome  fas fa-i-cursor" style="display: unset;"></span> symbol on the toolbar. These marks can be accepted or rejected. In export file generation we assume that the writers are aware of these marks in the document and just leave those he accepted unindicated. In the exported file, all of these marks are in "accept" status and will appear as in the Preview side when the <span class="fontawsome  fas fa-i-cursor" style="display: unset;"></span> is switched off.

### Bibliography {#bib}

The μr² editor uses [BibTeX ](http://www.bibtex.org/) file to manage the bibliography. BibTeX is a widely used bibliography management tool which makes it easy to cite sources in a consistent manner by separating bibliographic information from its presentation. Similarly, the separation of content and presentation/style is supported by Markdown and LaTeX itself. With BibTeX, the bibliography entries are kept in a separate file and then imported into the main document. 
The first step is to create a bib. file with your Bibliography entities. This file is a standard BibTeX file. For example, we can add the [Markdown Guide](https://www.markdownguide.org/getting-started/) like this:

```
@misc{whatm,
    howpublished = {\url{https://www.markdownguide.org/getting-started/}},
    title={Getting Started: 
           An overview of Markdown, how it works, and what you can do with it.},
    organization={The Markdown Guide}
}
```

To add this file to your document, click on the <span class="fontawsome fas fa-book"></span> icon in the toolbar. Find the BibTex file on your computer and load. The μr² editor will render this file to HTML code and append to the end of the Markdown code. For example, the entry above will appear like:

```

# Bibliography

<div id="refs" class="references csl-bib-body hanging-indent" role="doc-bibliography">
<div id="ref-whatm" class="csl-entry" role="doc-biblioentry">
<span>“Getting Started: An Overview of Markdown, How It Works, and What You Can Do with It.”</span> n.d. The Markdown Guide; <a href="https://www.markdownguide.org/getting-started/">https://www.markdownguide.org/getting-started/</a>.
</div>
</div>
```

Those will be rendered in the Preview side appear as:

![Example rendered Bibliography entry](https://mur2.co.uk/_uploads/photos/1/mur_bib_1.png)

These bibliography entries don't just appear at the end of the document but also can be referred to from the main text. You can define a reference key in your BibTeX file, and after the rendering, you can use the `ref-<key>` form to link to the specific document.  For example, in the last part, we set the reference to `whatm` for the Markdown Guide, now we can refer to it as: [see. MG](#ref-whatm)


## Document settings {#docs}

To open the Document settings, click on the toolbar <span class="fontawsome far fa-arrow-alt-circle-down"></span>. This will hide the main editing window and display the settings. You can go back to the main section by clicking again on the <span class="fontawsome far fa-arrow-alt-circle-down"></span>.

### Title and abstract {#ta}

These files are self-explaining.  If you are a [registered user](#fru), you cannot save a document without a title. This is to prevent possible confusion or repetition in document creation. The Abstract is a short summary of the main text. When you export your document, the Abstract will be placed in front of the main text.

### Categories and Keywords

These fields are self-explaining too. The difference between them: the Categories is a predefined list, while the Keywords are free to choose.  

### Canonical URL {#curl}
When posting content to multiple platforms at the same time (such as your website, [WordPress ](#wp) or [Medium](#medium)), it is important to make sure that a single source of that content is the ultimate authority. Search engines use canonical links to determine and prioritize the ultimate source of content, removing confusion when there are multiple copies of the same document in different locations. Sites that publish an overabundance of duplicate content without indicating a canonical link may be penalized in search engine rankings.

### Text type

### Authors {#authors}
If you are [registered user](#fru), you can add or remove authors for an Article.  The μr² is a [Collaborative real-time editor](#cor). You can add new Authors by adding their usernames to the bottom of the section and setting they workshare:

![Add new Author](https://mur2.co.uk/_uploads/photos/1/mur2_addnewauthor.png)

The Workshare measures the individual Authors' contribution to the Article in percentage. The Authors with 0 Workshare won't be accepted as a contributor and are not allowed to save their changes. The μr² recommends this setting for [editors](#ec) model. It is not possible to change the Authors Workshare without removing and adding. So if you would like to update your Author Workshare settings, you need to remove and add them again to the Article.


To remove an Author, you should first click the Remove bottom next to his name. Then you need to redistribute the Workshare between the remaining Authors. 


## Side menu {#sidebar}

To open the side menu, click on the <span class="fontawsome fas fa-bars"></span> icon on the right side of the toolbar. Then you will see this opened menu on the right side:

![Sidebar](https://mur2.co.uk/_uploads/photos/1/mur2_sidebar.png)

It has six sections:
+ Navigation
+ [Preview formats](#preview)
+ [Version control](#vc)
+ Finish editing
+ [Publis and export](#export)

### Preview formats {#preview}

This part manages the right side of the main windows. The supported formats are:

+ Preview -- rendered HTML
+ HTML -- raw HTML code
+ HTML + LaTeX -- raw HTML with the math formulas as LaTeX
+ Markdown -- Markdown, same as on the right side
+ Markdown + img -- Markdown with rendered LaTeX images
+ H -- habr.com Markdown 

You can download your work locally by clicking on <span class="fontawsome fas fa-file-download"></span> in the toolbar. The content of this file will be the same as in the preview.  So for example: if you want to save the output in Markdown you should switch the preview to Markdown first.

### Version control {#vc}
For saved Article, we keep the last 20 version in our database. So you can roll back to your changes to a specific historical time if needed. 

### Publish and export {#export}

#### Wordpress.com {#wp}
You can export your work directly to Wordpress.com in the side menu icon. To run the export, you need to set up your username, password and site address. These settings will be saved in cookies on your browser. 

#### Medium.com {#medium}

Inline math formula is not supported. You will need to set your integration token for this to work and it will be saved in cookies on your browser. Unfortunately, Medium.com does not support client-side calls, so this integration token needs to skip the server. 

#### LaTeX and PDF {#pdf}
The HTML standard is improving with time. But honestly speaking, it is still far from meeting the real typography standard. This is why μr² prefer [LaTeX](#pdf) to handle the following tasks:

+ Loading the language-specific hyphenation patterns and other typographical conventions. Babel provides basic line breaking for CJK scripts as well as non-standard hyphenation such as “ff” → “ff-f”, repeated hyphens, and ranked rules.
+ Setting the script and language tags of the current font, if possible. 
+ Translating document labels (such as “chapter”, “figure”, “bibliography”).
+ Formatting dates according to language-specific conventions.
+ Formatting numbers for languages with different numbering system.

The μr² use [LaTeX](#pdf) to generate the [PDF](#pdf) output， so these settings are the same in both formats.

To generate direct PDF output, click on the side menu <span class="fas fa-file-pdf" style="display: unset;"></span>  icon. The PDF generation happens on the μr² server and can be a little slow, don‘t be surprised if it takes around 20 seconds.  

When generate PDF or LaTeX document， you need to be careful with your ``$$`` as everything between them will be processed as LaTeX [math ](#math) formula, which means if you use them for something else, the generation will not work.


#### ePUB

ePUB is the most widely supported vendor-independent XML-based (as opposed to PDF) e-book format in that it is supported by almost all hardware readers except for Kindle^[Amazon Kindles are a closed ecosystem that limits users to books purchased from Amazon only. In other words, Amazon wants to monopolize your reading, making you dependant. If you still want to read ePUB on Kindle [there’s a little-known trick](https://www.digitaltrends.com/mobile/how-to-read-epub-books-on-your-kindle/) that lets you easily send ePub files to a Kindle or Kindle app by changing the ePub file extension to PNG.  ]. The μr² is generating the latest ePUB 3 version. 

#### Microsoft Word

Microsoft Word is a word-processor software launched in 1983 by the Microsoft Corporation. It has become the leading word processor for both Windows and Macintosh users since 1990s. The Microsoft Word is a WYSIWYG (what you see is what you get) editor, meaning that formatting tags were hidden^[Not like in Markdown or [LaTeX](#pdf).] and whatever a document looked like on a user’s computer screen, it was how it would look when printed—or at least semi-WYSIWYG, as screen fonts were not of the same quality as printer fonts.  There is a definite improvement over the years on the Microsoft Word math input, but honestly, it is still far from Markdown or [LaTeX](#pdf) comfort.


##  Internationalization and Localization {#loc}

The Internationalization and Localization are important for us and they are happening on multiple levels. 

### Input

The preview and HTML rendering is UTF-8 based, so you can type any character:

《水滸傳》，是以白話文寫成的章回小說，列為中國古典四大文學名著之一，六才子書之一。其內容講述北宋山東梁山泊以宋江為首的梁山好漢，由被逼落草，發展壯大，直至受到朝廷招安，東征西討的歷程。

### Quotation marks {#qm}

Quotation marks have a variety of forms in different languages. In American writing, quotation marks are normally the double kind (the primary style). If quotation marks are used inside another pair of quotation marks, then single quotation marks are used. For example: "_Didn't she say 'I like red best' when I asked her about wine preferences?_" he asked his guests.  At μr² we follow this marking style on the Markdown input. However, the rendered output is localised. For example: in a Hungarian text the opening `"` will be rendered as: „ and the closing one as: ”.

### Editor frontend

We are constantly working on Internationalization of the editor menu and other settings such as the label of the footnote in the preview. But if we have missed something, please drop us an email and help us do better. 

## Features for registered users {#fru}

### Access your Article everywhere {#ac}
If you are a [registered ](https://mur2.co.uk/auth/register) user, you can create and keep Articles on μr² server. If you do this, you can access and work on your Articles from everywhere with an internet browser.

After [login ](https://mur2.co.uk/auth/login) you will land on your profile page. This page can be accessed directly with the https://mur2.co.uk/user/\<username\> address, where you need to replace the \<username\> with your registered username.

[test](ref-jia2013emergence)

#### Create new Article {#ca}
There you can create a new Article by clicking on the "New Article" link. This will lead you to a new Editor page, which you can save on our server. You can save your work with a click on <span class="fontawsome fas fa-save"></span> in the toolbar. The basic information which you need to define before saving your Article is the title. Without title, one is not allowed to create an Article. And, it is not allowed to create multiple Article with the same title by the same user.  

#### Open existing Article {#oa}

To open an existing article，please go to your profile page.  There you will see your Article's title and abstract. In the white area next to the Abstract you will found icons related to the Article. Example:

![Article with title "Editor Manual" on the profile page.](https://mur2.co.uk/_uploads/photos/1/open_article1.png)

And if you move your mouse over the icons:

![Article with title "Editor Manual" on the profile page showing the related icons.](https://mur2.co.uk/_uploads/photos/1/open_article2.png)

If you click on the <span class="far fa-edit"></span> icon you can edit the Article.

#### Delete Article



You can delete and Article by clicking on the <span class="fas fa-trash"></span> icon next to the Article abstract. 



### Collaborative real-time editing between Writers {#cor}

If you are a registered user, you can share your document with another user. The first step is to [create and save a new document](#ca). After it is saved, you can share it with another user by [adding](#authors) him as Writer. Now you are ready to collaborate with others. The Article will appear in the new Author Profile page and you can start to work together. The collaborating is in real-time, so your documents will be synchronised continuously. Example: you will see when they are typing in. Saving is not needed. 

# Markdown {#markdown}

## Heading {#heading}

To create a heading, add "number signs" (#) in front of a word or phrase. The number of "number signs" you use should correspond to the heading level. For example: to create a heading level three, use three signs (`### My Header`).  We can also add an anchor to the header with the `{#id}`, and point from the text in it [here](#foo).

### A third level of heading with anchor {#foo}
#### A fourth  level of heading
##### The fifth level of heading


## Text organizing {#to}

To create paragraphs, use a blank line to *separate* the paragraphs of text. So this is a paragraph.

And this is another one.

You can *use* two or more spaces (referred to as "trailing whitespace") for line breaks, but this is controversial as it’s hard to see trailing whitespace in an editor and many people accidentally or intentionally (good old habit from *vim* users ) put two spaces after every sentence. For this reason, you may want to use something other than trailing whitespace for line breaks. Fortunately, there is another option supported by nearly every Markdown application: the HTML tag.

Creating horizontal rules are also simple:

---

***

## Text formating {#te}

You can add emphasis by making text bold or italic, for example:

**This is bold text**

__This is also a bold text__

*This is italic text*

_This is another italic text_

~~Strikethrough~~


You can also make sup- or substrings, like this:

- 19^th^
- H~2~O



## Math {#math}
You can use math formulas inline such as $$ \mu r^2 $$ or you can use in a block like this: 



$$ T^{\mu\nu}=\begin{pmatrix}
\varepsilon&0&0&0\\
0&\varepsilon/3&0&0\\
0&0&\varepsilon/3&0\\
0&0&0&\varepsilon/3\\
\end{pmatrix}, $$

If you label block formula, it will be automatically numbered:

$$
P_{\omega}=2+\frac{n_{\omega}}{2}\hbar\omega\,\frac{1+R}{1-v^2}\int\limits_{-1}^{1}dx\,(x-v)|x-v|
$${#eq:1}

$$
\text{Euler's identity: } e^{i \pi } + 1 = 0
$${#eq:2}


Block equations are numbered on the left side. This numbering is added automatically.

You can cross-reference to these equalisations as links. For example, the [integrals](#eq:1).^[If you repeat a formula multiple times, the link is ambiguous and it's browser dependant on where the link leads. But it's usually the first occurrence. ]

Beware of dragons living in the  [*PDF*](#pdf) or [*LaTeX*](#pdf) generation! They render everything between the `$$` as a *math formula* which means `\LaTeX` and similar non-math mode commands will break the export. Except if you handle them in `\text{}`.[^1] ^[Unfortunatelly with ePUB this is not true. It can handle `\text{some text}`, but text commands such as `\LaTeX`, will fail.] The tikz-pictures will also break. If you need this kind of things in [PDF](#pdf), insert them as SVG.^[You can generate example on [i.Upmath](https://i.upmath.me/).]

[^1]: E.g: `\text{\LaTeX}`


## Lists {#lists}

You can make unordered lists:

+ Create a list by starting a line with `+` or `-` or `*`
+ Sub-lists are made by indenting 2 spaces:
  - Change of marker character starts a new list:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ It's very easy!

You can make ordered lists:

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers like `1`

Start numbering with offset:

57. foo
1. bar

Please practise if you write the list in a separated block. Both codes below are working in the HTML generation:
```
this is a list:

+ list 

and this is also:
+ list 
```

However, the latter one is ambiguous and can cause problem in [PDF](#pdf) and [LaTeX](#pdf) generation.  

## Quotes {#Quotes}

To create a blockquote, add a `>` in front of a paragraph.

> Blockquotes can also be nested in HTML 
>> ...by using consecutive greater-than signs... ) 
> > > ...or with spaces between them **_but not in PDF and LaTeX_**.... 

For [PDF](#pdf) and [LaTeX](#pdf), just use single-level Blockquotes like this:

> This is a multi-paragraph quote which works in pdf and LaTeX and you can still use multiple paragraphs...
> 
> There is a second paragraph of the quote.

For inline quotes international localisation, you can see details in  [Internationalization and Localization](#qm) section.

## Code {#codes}

Inline `code`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

```
Sample text here...
```

Syntax highlighting

``` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
```

## Tables {#tables}
To add a table, use three or more hyphens (`---`) to create each column’s header and use pipes (`|`) to separate each column. You can optionally add pipes on either end of the table. A simple table would look like this:

| Column1 | Column2 |
| ------ | ----------- |
| 1   | 2  |
| 3   | 4  |

You are also able to add a caption to the table and anchor:

|  output format | μr² supporting? |
| ------ | ----------- |
| WordPress | yes |
| Medium | yes |
| [PDF](#pdf) | yes |
| ePUB | yes |
| [LaTeX](#pdf) | yes |
| Microsoft World| yes |

Table: Demonstration of a simple table with caption, anchoor and footnote[^space] {#tbl:1}


You can align text in the columns to the left, right or centre by adding a colon (`:`) to the left, right or on both side of the hyphens within the header row:

|  output format | μr² supporting? |
| :------: | -----------: |
| Wordpress | yes |
| Medium | yes |
| [PDF](#pdf) | yes |
| ePUB | yes |
| [LaTeX](#pdf) | yes |
| Microsoft World| yes |

Table: Demonstration of centre and right-aligned table. {#tbl:2}


And there is a reference of the table: [first table](#tbl:1)

[^space]: The space between the caption and the attribute is important!

## Links {#links}
Simple link:

[link text](http://www.mur2.co.uk)

You can optionally add a title for a link. This will appear as a tooltip when the user hovers over the link:

[link with title](http://www.mur2.co.uk "title text!")


## Images {#images}

![Metal moveble types](https://upload.wikimedia.org/wikipedia/commons/a/ae/Metal_movable_type.jpg "Metal movable types")

As with links, images have a footnote style syntax

![A ligature][id]

With a reference later in the document defining the URL location:

[id]: https://upload.wikimedia.org/wikipedia/commons/8/8b/Long_S-I_Garamond_sort_001.png  "A ligature"


It is also possible to refer to an image with an anchor: 

![Image with reference](https://upload.wikimedia.org/wikipedia/commons/a/ae/Metal_movable_type.jpg "Metal movable types"){#img:1}

And later we can link to it: [Images](#img:1)

### Resizing images

Unfortunately, there is not a standard for resizing images in Markdown and we use the syntax from the Pandoc:

![Resized image of the ligature](https://upload.wikimedia.org/wikipedia/commons/8/8b/Long_S-I_Garamond_sort_001.png){ width=50% }


[Medium.com](#medium) will redefine your image settings so there is no way to set the size of the image.

## Footnotes {#footnote}

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

    and multiple paragraphs.

[^second]: Footnote text.



## Typographic replacements {#tr}

There are build in Typographic replacement: 

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'


# Bibliography

<div id="refs" class="references csl-bib-body hanging-indent" role="doc-bibliography">
<div id="ref-whatm" class="csl-entry" role="doc-biblioentry">
<span>“Getting Started: An Overview of Markdown, How It Works, and What You Can Do with It.”</span> n.d. The Markdown Guide; <a href="https://www.markdownguide.org/getting-started/">https://www.markdownguide.org/getting-started/</a>.
</div>
</div>

