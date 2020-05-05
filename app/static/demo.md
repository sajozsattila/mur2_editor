


# h1 Heading
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading

# Text organizing 


To create paragraphs, use a blank line to separate one or more lines of text. So this is a paragraph.

And this is another one.  

You can use two or more spaces (referred to as "trailing whitespace") for line breaks, but it’s controversial. It’s hard to see trailing whitespace in an editor, and many people accidentally or intentionally (good old habit spread from *vi* users ) put two spaces after every sentence. For this reason, you may want to use something other than trailing whitespace for line breaks. Fortunately, there is another option supported by nearly every Markdown application: the <br> HTML tag.

Creating horizontal rules are also simple:

---

***

# Text emphasis

You can add emphasis by making text bold or italic. Like:

**This is bold text**

__This is also a bold text__

*This is italic text*

_This is another italic text_

~~Strikethrough~~



# Math
You can use math formulas inline like $$ \mu r^2 $$. Or you can use in a block as: 

$$
\text{Euler's identity: } e^{i \pi } + 1 = 0
$$

If you want you can use more complicated formula also, like matrices:

$$T^{\mu\nu}=\begin{pmatrix}
\varepsilon&0&0&0\\
0&\varepsilon/3&0&0\\
0&0&\varepsilon/3&0\\
0&0&0&\varepsilon/3
\end{pmatrix},$$

integrals:

$$P_\omega={n_\omega\over 2}\hbar\omega\,{1+R\over 1-v^2}\int\limits_{-1}^{1}dx\,(x-v)|x-v|,$$

However, there are dragons! You need to be careful is you export to *pdf* or *LaTeX*. They rendering everything between the `$$` as a *math formula*.  Which means `\LaTeX` and similar not math mode commands will break the export. Except if you handle them in `\text{}`, but in this case what the point to use them? The tikz-pictures also will break.  If you need this kind of things in pdf, insert them as svg, which you can generate example on [i.Upmath](https://i.upmath.me/).

# Lists

You can make unordered

+ Create a list by starting a line with `+`, `-`, or `*`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
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





# Blockquotes


> Blockquotes can also be nested in HTML but not in pdf and LaTeX... 
>> ...by using additional greater-than signs right next to each other... ) 
> > > ...or with spaces between arrows. 

On pdf and LaTeX you can use just single level Blockquotes, like this:

> This is multi-paragraph quote which is working in pdf and LaTeX
> 
> There is a second paragraph of this quote



# Code

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

# Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


# Links
Simple link:

[link text](http://www.mur2.co.uk)

You can optionally add a title for a link. This will appear as a tooltip when the user hovers over the link:

[link with title](http://www.mur2.co.uk "title text!")


# Images

![Stormtroopocat](https://upload.wikimedia.org/wikipedia/commons/a/ae/Metal_movable_type.jpg "Metal movable types")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://upload.wikimedia.org/wikipedia/commons/8/8b/Long_S-I_Garamond_sort_001.png  "A ligature"

## Resizing images

Unfortunately, there is no really standard to resize images in Markdown. If you still want to do it, you need to use formating which depends on the desired output format: 

In pdf and LaTeX like this:

!["Approaching Shadow" by Ho, 1954](http://static.apple.nextmedia.com/images/apple-photos/apple/20160622/large/22la8p12.jpg){ width=250px }

# Subscript

You can make sup- or substrings also, like this:

- 19^th^
- H~2~O


# Footnotes

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

    and multiple paragraphs.

[^second]: Footnote text.




# Typographic replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'

#  Internationalization and Localization 

The  Internationalization and Localization important for us and it is happening on multiple levels. 

## Input

The preview and HTML rendering is UTF-8 based, so you can type any character:

《水滸傳》，是以白話文寫成的章回小說，列為中國古典四大文學名著之一，六才子書之一。其內容講述北宋山東梁山泊以宋江為首的梁山好漢，由被逼落草，發展壯大，直至受到朝廷招安，東征西討的歷程。

## Editor frontend

We constantly working on Internationalization of the editor menu and other settings, like the label of the footnote in the preview. 
If we miss something drop us an email, and we include. 

## Generated export

The HTML standard is improving with the time, but honestly, it is still far from the real typography standard. This is why we like to use LaTeX. There is where the bellow tasks are handled:
+ Loading the language-specific hyphenation patterns and other typographical conventions. Babel provides basic line breaking for CJK scripts, as well as non-standard hyphenation, like “ff” → “ff-f”, repeated hyphens, and ranked rules.
+ Setting the script and language tags of the current font, if possible. 
+ Translating document labels (like “chapter”, “figure”, “bibliography”).
+ Formatting dates according to language-specific conventions.
+ Formatting numbers for languages that have their own numbering system.

The localization set by the user browser Accept-Language. 

The $$\mu r^2 $$ use LaTeX to generate the Pdf output, so this settings are same in both format.

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
You can export the directly you work in Wordpress.com in the side menu <span class="fab fa-wordpress-simple"></span> icon. For the export, you will need to set up your username, password and your site address.  These settings will be saved in cookies on your browser. 

## Pdf
To generate direct pdf output, click on the side menu <span class="fas fa-file-pdf"></span> icon. The pdf generation is happening on the $$\mu r^2 $$ server, and it is a little slow, do not surprise if it takes around 20 seconds.  

If you generate pdf, you need to be careful with your ``$$``. Everything between them processed as LaTeX math formula, which means if you are using these for something else, the generation won't work.

## LaTeX

Turning your Markdown to LaTeX is not a problem, one click on the side menu.  However, you need to be also careful here with the ```$$```, as like with the pdf generation.





