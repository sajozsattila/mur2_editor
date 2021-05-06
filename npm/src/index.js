var fs = require('fs');

/////////////////////////////////////////////
// markdown it


var defaults = {
    html: true, // Enable HTML tags in source
    xhtmlOut: false, // Use '/' to close single tags (<br />)
    breaks: false, // Convert '\n' in paragraphs into <br>
    langPrefix: 'language-', // CSS language prefix for fenced blocks
    linkify: false, // autoconvert URL-like texts to links
    typographer: true, // Enable smartypants and other sweet transforms
    quotes: '“”‘’',

    // option for tex plugin
    _habr: {
        protocol: ''
    }, // no protocol for habrahabr markup

    // options below are for demo only
    _highlight: true,
    _strict: false
};
/* make working inline code highlighting */
defaults.highlight = function(str, lang) {
    var esc = _mdPreview.utils.escapeHtml;

    try {
        if (!defaults._highlight) {
            throw 'highlighting disabled';
        }

        if (lang && lang !== 'auto' && hljs.getLanguage(lang)) {

            return '<pre class="hljs language-' + esc(lang.toLowerCase()) + '"><code>' +
                hljs.highlight(lang, str, true).value +
                '</code></pre>';

        } else if (lang === 'auto') {

            var result = hljs.highlightAuto(str);

            return '<pre class="hljs language-' + esc(result.language) + '"><code>' +
                result.value +
                '</code></pre>';
        }
    } catch (__) {
        /**/
    }

    return '<pre class="hljs"><code>' + esc(str) + '</code></pre>';
};

var md = require('markdown-it')(defaults)
    .use(require('./markdown-it-criticmarkup.js'))    
    .use(require('./mur2_markdown-it-bibliography.js'), {
        bibfile: './src/testbib.bib',
        style: 'apa-5th-edition',
        lang: 'en',
        defaultLocale: 'en-US', 
        locales: 'en-US'
    })
    .use(require('markdown-it-footnote'))
    .use(require('markdown-it-attrs'), {})
    .use(require('markdown-it-implicit-figures'), {
        figcaption: true, // <figcaption>alternative text</figcaption>, default: false
        tabindex: true // <figure tabindex="1+n">..., default: false
    })
    .use(require('./markdown-it-s2-tex.js'))    
    .use(require('markdown-it-multimd-table'), {
        rowspan: true,
        multiline: true
    })
    .use(require('markdown-it-sub'))
    .use(require('markdown-it-sup'))
    .use(require('markdown-it-ins'))
    .use(require('markdown-it-cjk-breaks'))
;


/////////////////////////////////////////////
// webserver
const express = require('express')
const path = require("path");
const app = express()
const port = 3000

app.get('/', (req, res) => {
    // receive filename for the original Markdown
    var filepath = req.query.filename;
    if (filepath) {
        // read file
        var mdfile = "";
        if (fs.existsSync(filepath)) {            
            mdfile = fs.readFileSync(filepath, 'utf8');
        }
        // get the basename
        const filename = path.basename(filepath);
        // create new filename
        const newfile = "/tmp/"+filename+".html";
        fs.writeFile( newfile, md.render(mdfile), function(err) {
            if (err) {
                return console.error(err);
            }
            console.log("Data written successfully in: "+newfile);
        });
        res.send(newfile);
    } else {
        res.send('Error: No filename!')
    }
})

app.listen(port, () => {
  console.log(`Mur2 Makrdow-it server is listening at http://localhost:${port}`)
})

