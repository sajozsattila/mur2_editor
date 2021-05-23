/*
* This file based on the citations.ts file in the the https://github.com/DerDrodt/markdown-it-bibliography project 
*    The markdown-it-bibliography  is Daniel Drodt (daniel@drodt.info) works and published under MIT license 
*
*/

var fs = require('fs'); // for read
var fsp = require('fs').promises; // for write 
var utils = require('./utils.js');
var iprem = new utils.ImagePreloader();
var imageLoader = new utils.ImageLoader(iprem, 'https:', 'm_');

/////////////////////////////////////////////
// configs
// requires
const _ = require('lodash');

// module variables
const config = require('./config.json');
const defaultConfig = config.production;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);
// as a best practice
// all global variables should be referenced via global. syntax
// and their names should always begin with g
global.gConfig = finalConfig;
console.log("Configuration\n" + global.gConfig);


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
    var esc = md.utils.escapeHtml;

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

/**
 * Detects if the paragraph contains the only formula.
 * Parser gives the class 'tex-block' to such formulas.
 *
 * @param tokens
 * @param idx
 * @returns {boolean}
 */
function hasBlockFormula(tokens, idx) {
    if (idx >= 0 && tokens[idx] && tokens[idx].children) {
        for (var i = tokens[idx].children.length; i--;) {
            if (tokens[idx].children[i].tag === 'tex-block') {
                return true;
            }
        }
    }
    return false;
}

function injectLineNumbersAndCentering(tokens, idx, options, env, self) {
    var line;
    if (tokens[idx].map && tokens[idx].level === 0) {
        line = tokens[idx].map[0];
        tokens[idx].attrPush(['class', 'line']);
        tokens[idx].attrPush(['data-line', line + '']);
    }

    // Hack (maybe it is better to use block renderers?)
    if (hasBlockFormula(tokens, idx + 1)) {
        tokens[idx].attrPush(['align', 'center']);
        tokens[idx].attrPush(['style', 'text-align: center;']);
    }

    return self.renderToken(tokens, idx, options, env, self);
};

// Markdown-it global processor
var md;
// 
const jsdom = require("jsdom");
const {
    JSDOM
} = jsdom;

/////////////////////////////////////////////
// webserver
const express = require('express')
const path = require("path");
const app = express();
app.set('json spaces', 40);
const port = 3000;

app.get('/', (req, res) => {
    // receive filename for the original Markdown
    var filepath = req.query.filename; // markdown filename
    var bibtex = req.query.bibtex; // BibTeX filename
    var languageFootnote = req.query.footnote // localised footnote
    var lang = req.query.language; // language filename    
    var locale = lang;
    // if lang is just two letter we extend
    // ISO 639-1 -> IETF language tag
    if (locale.length === 2) {
        switch (locale) {
            case "en":
                // default english
                locale = "en-US"
                break;
            default:
                locale = locale + "-" + lang.toUpperCase()
        }
    } else {
        if (locale.length === 5) {
            locale = locale.slice(0, 3)+locale.slice(3).toUpperCase();
        }
    }
    // the lang is just ISO 639-1
    lang = lang.slice(0, 2);
    var bibsyle = req.query.bibsyle; // bibsyle filename
    if (filepath) {
        // if there is bibtex
        try {
        if (bibtex) {
            // Markdown-it process
            
            md = require('markdown-it')(defaults)
                .use(require('./markdown-it-criticmarkup.js'))
                .use(require('./mur2_markdown-it-bibliography.js'), {
                    bibfile: bibtex,
                    style: bibsyle,
                    lang: lang,
                    defaultLocale: locale,
                    locales: locale
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
                .use(require('markdown-it-cjk-breaks'));
            // overwrite footnote
            md.renderer.rules.footnote_block_open = () => (
                '<h1 class="mt-1">' + languageFootnote + '</h1>\n' +
                '<section class="footnotes">\n' +
                '<ol class="footnotes-list">\n'
            );
            md.renderer.rules.paragraph_open = md.renderer.rules.heading_open = injectLineNumbersAndCentering;
            // add html math images, latter replace them with SVG
            md.renderer.rules.math_inline = function(tokens, idx) {
                return imageLoader.getHtmlStub(tokens[idx].content);
            };
        } else {
            // Markdown-it process
            md = require('markdown-it')(defaults)
                .use(require('./markdown-it-criticmarkup.js'))
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
                .use(require('markdown-it-cjk-breaks'));
            // overwrite footnote
            md.renderer.rules.footnote_block_open = () => (
                '<h1 class="mt-1">' + languageFootnote + '</h1>\n' +
                '<section class="footnotes">\n' +
                '<ol class="footnotes-list">\n'
            );
            md.renderer.rules.paragraph_open = md.renderer.rules.heading_open = injectLineNumbersAndCentering;
            // add html math images, latter replace them with SVG
            md.renderer.rules.math_inline = function(tokens, idx) {
                return imageLoader.getHtmlStub(tokens[idx].content);
            };
        }
        } catch(err) {
            console.log(err.stack);
            res.status(404).send({"Error": "Markdown-it error! Reason: "+err });
            return;
        }


        // read file
        var mdfile = "";
        if (fs.existsSync(filepath)) {
            mdfile = fs.readFileSync(filepath, 'utf8');
        }
        // get the basename
        const dirname = path.dirname(filepath);
        // create new filename
        const newfile = dirname + "/processed.html";
        imageLoader.reset();
        // render md 
        try {
            var text = '<!DOCTYPE html><body>' + md.render(mdfile) + '</body></html>';
        } catch(err) {
            console.log(err.stack);
            res.status(404).json({"Error": "Can not process data. Reason: "+err })
            return;
        }
        const dom = new JSDOM(text);
        var document = dom.window.document;
        // replace the data with SVG        
        async function writerdata() {
            await imageLoader.fixDom(document);
            await fsp.writeFile(newfile, dom.window.document.body.innerHTML);
            console.log("Ready");
            res.send(newfile);
        }
        writerdata();
    } else {
        res.send('Error: No filename!')
    }
})

app.listen(port, () => {
    console.log(`Mur2 Makrdown-it server is listening at http://localhost:${port}`)
})