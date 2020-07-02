

# Markdown

## Heading

To create a heading add "number signs" (#) in front of a word or phrase. The number of "number signs" you use should correspond to the heading level. For example: to create a heading level three, use three signs (`### My Header`).  We can add an anchor to the header also with the `{#id}`, and point from the text in it [here](#foo).

### A third level of heading with anchor {#foo}
#### A fourth  level of heading
##### A fifth level of heading


## Text organizing 

To create paragraphs, use a blank line to *separate* the paragraphs of text. So this is a paragraph.

And this is another one.

You can *use* two or more spaces (referred to as "trailing whitespace") for line breaks, but this is controversial as It’s hard to see trailing whitespace in an editor and many people accidentally or intentionally (good old habit from *vim* users ) put two spaces after every sentence. For this reason, you may want to use something other than trailing whitespace for line breaks. Fortunately, there is another option supported by nearly every Markdown application: the HTML tag.

Creating horizontal rules are also simple:

- list1
- list2

---

***

## Text emphasis

You can add emphasis by making text bold or italic, for example:

**This is bold text**

__This is also a bold text__

*This is italic text*

_This is another italic text_

~~Strikethrough~~



## Math
You can use math formulas inline such as $$ \mu r^2 $$ or you can use in a block like this: 

$$ T^{\mu\nu}=\begin{pmatrix}
\varepsilon&0&0&0\\
0&\varepsilon/3&0&0\\
0&0&\varepsilon/3&0\\
0&0&0&\varepsilon/3\\
\end{pmatrix}, $$

If you label block formula it will be automatically numbered:

$$ P_\omega=2+{n_\omega\over 2}\hbar\omega\,{1+R\over 1-v^2}\int\limits_{-1}^{1}dx\,(x-v)|x-v| $${#eq:1}

Block equations are numbered on the left side. This numbering is added automatically. Repeated math blocks are independently given the same number where they are in the text. For example: if we write Euler's identity again it will be numbered as *(1)*

$$
\text{Euler's identity: } e^{i \pi } + 1 = 0
$${#eq:2}

You can cross-reference to these equalisations as links. Example the [integrals](#eq:1).^[If you repeat a formula multiple times, the link is ambiguous and it's browser dependant on where the link leads but it's usually the first occurrence. ]

Beware of dragons living in the  *PDF* or *LaTeX* generation! They render everything between the `$$` as a *math formula* which means `\LaTeX` and similar non-math mode commands will break the export. Except if you handle them in `\text{}`.[^1] ^[Unfortunatelly with ePUB this is not true. It can handle `\text{some text}`, but text commands such as `\LaTeX`, will fail.] The tikz-pictures will also break. If you need this kind of things in PDF, insert them as SVG.^[You can generate example on [i.Upmath](https://i.upmath.me/).]

[^1]: E.g: `\text{\LaTeX}`


## Lists

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
1. ...or keep all the numbers as `1`

Start numbering with offset:

57. foo
1. bar



## Blockquotes

To create a blockquote add a `>` in front of a paragraph.

> Blockquotes can also be nested in HTML 
>> ...by using consecutive greater-than signs... ) 
> > > ...or with spaces between them **_but not in PDF and LaTeX_**.... 

For PDF and LaTeX just use single-level Blockquotes like this:

> This is multi-paragraph quote which works in pdf and LaTeX and you still can use multiple paragraphs...
> 
> There is a second paragraph of the quote.



## Code

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

## Tables
To add a table use three or more hyphens (`---`) to create each column’s header and use pipes (`|`) to separate each column. You can optionally add pipes on either end of the table. A simple table would look like this:

| Column1 | Column2 |
| ------ | ----------- |
| 1   | 2  |
| 3   | 4  |

You also able to add a caption to the table and anchor:

|  output format | μr² supporting? |
| ------ | ----------- |
| WordPress | yes |
| Medium | yes |
| PDF | yes |
| ePUB | yes |
| LaTeX | yes |
Table: Demonstration of a simple table with caption, anchoor and footnote[^space] {#tbl:1}


You can align text in the columns to the left, right or centre by adding a colon (`:`) to the left, right or on both side of the hyphens within the header row:

|  output format | μr² supporting? |
| :------: | -----------: |
| Wordpress | yes |
| Medium | yes |
| PDF | yes |
| ePUB | yes |
| LaTeX | yes |

Table: Demonstration of centre and right-aligned table. {#tbl:2}


And there is a reference of the table: [first table](#tbl:1)

[^space]: The space between the caption and the attribute is important!

## Links
Simple link:

[link text](http://www.mur2.co.uk)

You can optionally add a title for a link. This will appear as a tooltip when the user hovers over the link:

[link with title](http://www.mur2.co.uk "title text!")


## Images

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

!["Approaching Shadow" by Ho, 1954](http://static.apple.nextmedia.com/images/apple-photos/apple/20160622/large/22la8p12.jpg){ width=50% }


Medium.com will redefine your image settings so there no way to set the size of the image.

## Subscript

You can also make sup- or substrings, like this:

- 19^th^
- H~2~O


## Footnotes

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

    and multiple paragraphs.

[^second]: Footnote text.




## Typographic replacements

Enable typographer option to see the result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'

#  Internationalization and Localization 

The Internationalization and Localization are important for us and they are happening on multiple levels. 

## Input

The preview and HTML rendering is UTF-8 based, so you can type any character:

《水滸傳》，是以白話文寫成的章回小說，列為中國古典四大文學名著之一，六才子書之一。其內容講述北宋山東梁山泊以宋江為首的梁山好漢，由被逼落草，發展壯大，直至受到朝廷招安，東征西討的歷程。

## Quotation marks

Quotation marks have a variety of forms in different languages. In American writing, quotation marks are normally the double kind (the primary style). If quotation marks are used inside another pair of quotation marks, then single quotation marks are used. For example: "_Didn't she say 'I like red best' when I asked her wine preferences?_" he asked his guests.  At μr² we follow this marking style on the Markdown input. However, the rendered output is localised. For example: in a Hungarian text the opening `"` will be rendered as: „ and the closing one as: ” .

## Editor frontend

We are constantly working on Internationalization of the editor menu and other settings such as the label of the footnote in the preview but if we have missed something please drop us an email and we‘ll do our best to add it. 

## Generated export

The HTML standard is improving with time but honestly speaking, it is still far from meeting the real typography standard. This is why we prefer LaTeX where the bellow tasks are handled:
+ Loading the language-specific hyphenation patterns and other typographical conventions. Babel provides basic line breaking for CJK scripts as well as non-standard hyphenation such as “ff” → “ff-f”, repeated hyphens, and ranked rules.
+ Setting the script and language tags of the current font, if possible. 
+ Translating document labels (such as “chapter”, “figure”, “bibliography”).
+ Formatting dates according to language-specific conventions.
+ Formatting numbers for languages with different numbering system.

Localization is set by the users browser Accept-Language. 

The $$\mu r^2 $$ use LaTeX to generate the Pdf output so these settings are the same in both formats.

## Different preview format and saving you work

There are multiple preview formats which you can use on the right side of the editor. To switch between them click on the ?? in the top toolbar menu and It will open up the side menu:

Here in the *Preview* section you can switch between any of the supported formats which are:

+ preview -- rendered HTML
+ html -- HTML code
+ html + LaTeX -- HTML with raw LaTeX input
+ md + img -- Mardown with rendered LaTeX images
+ md -- Markdown, same than on the right side
+ H -- habr.com Markdown 

## Save you work
You can save your work locally by clicking on <span class="fas fa-save"></span> in the toolbar. The content of this file will be the same as in the preview.  So for example: if you want to save the output in Markdown you should switch the preview to Markdown first. 

# Exporting to other formats 


## Wordpress.com
You can export your work directly to Wordpress.com in the side menu icon. For the export to work you will need to set up your username, password and site address. These settings will be saved in cookies on your browser. 

## Medium.com

Not supporting inline math formula. You will need to set your integration token for this to work and it will be saved in cookies on your browser. Unfortunately, Medium.com does not support client-side calls so this integration token needs to go across the server. 

## PDF
To generate direct PDF output, click on the side menu <span class="fas fa-file-pdf"></span>  icon. The PDF generation happens on the $$\mu r^2 $$ server and can be a little slow, do not be surprised if it takes around 20 seconds.  

If you generate a PDF you need to be careful with your ``$$`` as everything between them will be processed as LaTeX math formula which means if you are using them for something else, the generation will not work.


## LaTeX export

Converting your Markdown to LaTeX is not a problem, one click on the side menu will do it.  However, you also need to be careful with the ```$$``` as with the PDF generation.

## ePUB

ePUB is the most widely supported vendor-independent XML-based (as opposed to PDF) e-book format in that it is supported by almost all hardware readers except for Kindle^[Amazon Kindles are a closed ecosystem that limits users to books purchased from Amazon only. In other words, Amazon wants to monopolize your reading making you dependant on them. If you still want to read ePUB on Kindle [there’s a little-known trick](https://www.digitaltrends.com/mobile/how-to-read-epub-books-on-your-kindle/) that lets you easily send ePub files to a Kindle or Kindle app by changing the ePub file extension to PNG.  ]. The μr² is generating the latest ePUB 3 version. 






