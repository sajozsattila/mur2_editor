

# Markdown

## Heading

To create a heading, add "number signs" (#) in front of a word or phrase. The number of "number signs" you use should correspond to the heading level. For example, to create a heading level three, use three signs (e.g., `### My Header`).  We can add anchor to the header also with the `{#id}`, and point from the text on it like [here](#foo).

### A third level of heading with anchor {#foo}
#### A fourth  level of heading
##### A fifth level of heading


## Text organizing 

To create paragraphs, use a blank line to *separate* the paragraphs of text. So this is a paragraph.

And this is another one.

You can *use* two or more spaces (referred to as "trailing whitespace") for line breaks, but it’s controversial. It’s hard to see trailing whitespace in an editor, and many people accidentally or intentionally (good old habit from *vi* users ) put two spaces after every sentence. For this reason, you may want to use something other than trailing whitespace for line breaks. Fortunately, there is another option supported by nearly every Markdown application: the <br> HTML tag.

Creating horizontal rules are also simple:

- list1
- list2

---

***

## Text emphasis

You can add emphasis by making text bold or italic. Like:

**This is bold text**

__This is also a bold text__

*This is italic text*

_This is another italic text_

~~Strikethrough~~



## Math
You can use math formulas inline like $$ \mu r^2 $$. Or you can use in a block as: 

$$
\text{Euler's identity: } e^{i \pi } + 1 = 0
$$

You can also use more complicated formula, like matrices:

$$ T^{\mu\nu}=\begin{pmatrix}
\varepsilon&0&0&0\\
0&\varepsilon/3&0&0\\
0&0&\varepsilon/3&0\\
0&0&0&\varepsilon/3\\
\end{pmatrix}, $$

or integrals:

$$ P_\omega=2+{n_\omega\over 2}\hbar\omega\,{1+R\over 1-v^2}\int\limits_{-1}^{1}dx\,(x-v)|x-v| $$

The block equations are numbered on the left side. This numbering happening automatically. The repeated math blocks are numbered the same, independently where they are in the text. So example, if we copy here again the Euler's identity it will be numbered as one:

$$
\text{Euler's identity: } e^{i \pi } + 1 = 0
$$

You can cross-reference to these equalisations, with the `#eq:id`, where the *id* is the number of the math block. See the [integrals](#eq:3).^[If you repeat the formulas multiple times, the link is ambiguous and is depending on the browser where it is lead. Most of time to the first occurrence. ]

There are dragons living in the  *PDF* or *LaTeX* generation! They render everything between the `$$` as a *math formula*, which means `\LaTeX` and similar non-math mode commands will break the export. Except if you handle them in `\text{}`.^[E.g: `\text{\LaTeX}`].^[Unfortunatelly with ePUB this is not true. It can handle `\text{some text}`, but the text commands, like `\LaTeX`, will fail.] The tikz-pictures will also break. If you need this kind of things in PDF, insert them as SVG.^[You can generate example on [i.Upmath](https://i.upmath.me/).]


## Lists

You can make unordered lists:

+ Create a list by starting a line with `+`, `-`, or `*`
+ Sub-lists are made by indenting 2 spaces:
  - Change of marker character starts a new list:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

or ordered lists:

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as `1.`

Start numbering with offset:

57. foo
1. bar



## Blockquotes

To create a blockquote, add a `>` in front of a paragraph.

> Blockquotes can also be nested in HTML 
>> ...by using additional greater-than signs right next to each other... ) 
> > > ...or with spaces between arrows. But not in PDF and LaTeX.... 

On PDF and LaTeX, just use single-level Blockquotes, like this:

> This is multi-paragraph quote which is working in pdf and LaTeX. But you still can use multiple paragraphs...
> 
> There is a second paragraph of this quote.



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
To add a table, use three or more hyphens (`---`) to create each column’s header, and use pipes (`|`) to separate each column. You can optionally add pipes on either end of the table. A simple table will look like:

| Column1 | Column2 |
| ------ | ----------- |
| 1   | 2  |
| 3   | 4  |

You also able to add a caption to the table and anchor:

|  output format |  μr² supporting? |
| ------ | ----------- |
| Wordpress | yes |
| Medium| yes |
| PDF | yes |
| ePUB    | yes |
| LaTeX | yes |
Table: Demonstration of a simple table with caption and footnote[^tag][^space] {#tbl:1 tag="first table"}


You can align text in the columns to the left, right, or center by adding a colon (`:`) to the left, right, or on both side of the hyphens within the header row:

|  output format |  μr² supporting? |
|:------:| -----------:|
| Wordpress | yes |
| Medium| yes |
| PDF | yes |
| ePUB    | yes |
| LaTeX | yes |
Table: Demonstration of centre and right-aligned table. {#tbl:2}


And there is a reference of the table: [first table](#tbl:1){@tbl:1}^[The Pandoc have got problems with the attributes on the tables, so in this example, there is a combination of a HTML link and an attribute. the `[first table](#tbl:1)` for link, the `{@tbl:1}`. This is OK, in HTML but in the PDF or LaTeX the link will point nowhere. So there just use the attribute. ]

[^space]: The space between the caption and the attribute is important!
[^tag]: The value of the tag element just used in PDF and LaTeX output.

## Links
Simple link:

[link text](http://www.mur2.co.uk)

You can optionally add a title for a link. This will appear as a tooltip when the user hovers over the link:

[link with title](http://www.mur2.co.uk "title text!")


## Images

![Metal moveble types](https://upload.wikimedia.org/wikipedia/commons/a/ae/Metal_movable_type.jpg "Metal movable types")

Like links, Images also have a footnote style syntax

![A ligature][id]

With a reference later in the document defining the URL location:

[id]: https://upload.wikimedia.org/wikipedia/commons/8/8b/Long_S-I_Garamond_sort_001.png  "A ligature"


Also possible refer to the image by an anchor: 

![Image with reference](https://upload.wikimedia.org/wikipedia/commons/a/ae/Metal_movable_type.jpg "Metal movable types"){#img:1}

And later we can link to it: [Images](#img:1)

### Resizing images

Unfortunately, there is not really a standard for resizing images in Markdown. We use the syntax which spread from the Pandoc:

!["Approaching Shadow" by Ho, 1954](http://static.apple.nextmedia.com/images/apple-photos/apple/20160622/large/22la8p12.jpg){ width=50% }


The Medium.com redefining your image settings, so there no way to set the size of the image.

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

Enable typographer option to see result.

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

Quotation marks have a variety of forms in different languages. In American writing, quotation marks are normally the double kind (the primary style). If quotation marks are used inside another pair of quotation marks, then single quotation marks are used. For example: "Didn't she say 'I like red best' when I asked her wine preferences?" he asked his guests.  On the μr² we follow this marking style on the Markdown input. However, the rendered output is localised. Example in a Hungarian text the opening `"` will be rendered as:„ the closing one as: ” .

## Editor frontend

We are constantly working on Internationalization of the editor menu and other settings, like the label of the footnote in the preview. 
If we miss something, please drop us an email, and we ‘ll put it in. 

## Generated export

The HTML standard is improving with time, but honestly speaking, it is still far from meeting the real typography standard. This is why we prefer LaTeX, where the bellow tasks are handled:
+ Loading the language-specific hyphenation patterns and other typographical conventions. Babel provides basic line breaking for CJK scripts, as well as non-standard hyphenation, like “ff” → “ff-f”, repeated hyphens, and ranked rules.
+ Setting the script and language tags of the current font, if possible. 
+ Translating document labels (like “chapter”, “figure”, “bibliography”).
+ Formatting dates according to language-specific conventions.
+ Formatting numbers for languages with different numbering system.

The localization set by the user browser Accept-Language. 

The $$\mu r^2 $$ use LaTeX to generate the Pdf output, so these settings are the same in both formats.

# Different preview format and saving you work

There is multiple preview format which you can use on the left side. To switch between them click on the <span class="fas fa-bars"></span> in the toolbar menu right side. It will open up the side menu:

There in the *Preview* section you can switch between the supported formats. They are:

+ preview -- rendered HTML
+ html -- HTML code
+ html + LaTeX -- HTML with raw LaTeX input
+ md + img -- Mardown with rendered LaTeX images
+ md -- Markdown, same than on the right side
+ H -- habr.com Markdown 

## Save you work
You can save your work locally by clicking on the <span class="fas fa-save"></span> in the toolbar. The content of this file will be the same as in the preview.  So example, if you want to save Markdown you should switch the preview to Markdown first. 

# Exporting to another format 


## Wordpress.com
You can export you work directly in Wordpress.com in the side menu <span class="fab fa-wordpress-simple"></span> icon. For the export, you will need to set up your username, password and your site address. These settings will be saved in cookies on your browser. 

## Medium.com

Not supporting inline math formula. You need to set your integration token for it, this saved as a cookie. Unfortunately the Medium not supporting client-side call, so this integration token need to go across the server. 

## PDF
To generate direct pdf output, click on the side menu <span class="fas fa-file-pdf"></span> icon. The pdf generation happens on the $$\mu r^2 $$ server, and it is a little slow, try not to be surprised if it takes around 20 seconds.  

If you generate a pdf, you need to be careful with your ``$$``. Everything between them will be processed as LaTeX math formula, which means if you are using these for something else, the generation won't work.


## LaTeX export

Turning your Markdown to LaTeX is not a problem, one click on the side menu will do.  However, you also need to be careful here with the ```$$```, as with the PDF generation.

## ePUB

EPUB is the most widely supported vendor-independent XML-based (as opposed to PDF) e-book format; that is, it is supported by almost all hardware readers, except for Kindle^[As Amazon Kindles are a closed ecosystem that limits users to only books purchased from Amazon.  On other words, Amazon wants to monopolize your reading, make you depend on them. Is up to you you like this or not, but [there’s a little-known trick](https://www.digitaltrends.com/mobile/how-to-read-epub-books-on-your-kindle/) that lets you easily send ePub files to a Kindle or Kindle app simply by changing the ePub file extension to PNG.  ]. The μr² is generating the latest ePUB 3 version. 






