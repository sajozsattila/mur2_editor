function ParserCollection(
    markdownit,
    updateCallback,
    result_destination,
    result_destination_pre,
    sourceGetter,
     imageLoader
) {
    /* default for markdown-it */
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
    // some globel to make local
    var domSetHighlightedContent = g_domSetHighlightedContent;
        var imageLoader = imageLoader;
        
    var browserlanguage = document.querySelector('meta[name="mur2language"]').content;       
    switch (browserlanguage) {
        case 'hu':
            defaults.quotes = '„”»«';
            break;
        case 'zh_Hant':
            defaults.quotes = '「」『』';
            break;
        case 'es':
            defaults.quotes = '«»“”';
            break;
    };
               
    var _mdPreview = markdownit(defaults)
        .use(markdownitCriticmarkup)
        .use(markdownItAttrs, {})
        .use(implicitFigures, {
            figcaption: true,  // <figcaption>alternative text</figcaption>, default: false
            tabindex: true // <figure tabindex="1+n">..., default: false
        })        
        .use(markdownitS2Tex)                
        .use(markdownitFootnote)
        .use(markdownitMultimdTable, {
            rowspan: true,
            multiline:  true
        }) 
        .use(markdownitSub)
        .use(markdownitSup)
        .use(markdownitIns)
        ;

    var _mdHtmlAndImages = markdownit(defaults)
        .use(markdownitCriticmarkup)
        .use(markdownItAttrs, {})
        .use(implicitFigures, {
            figcaption: true,  // <figcaption>alternative text</figcaption>, default: false
            tabindex: true // <figure tabindex="1+n">..., default: false
        })
        .use(markdownitS2Tex)
        .use(markdownitMultimdTable, {
            rowspan: true,
            multiline:  true
        })
        .use(markdownitSub)
        .use(markdownitSup)
        .use(markdownitFootnote)
        .use(markdownitIns)
        ;
        

    var _mdHtmlAndTex = markdownit(defaults)
        .use(markdownitCriticmarkup)
        .use(markdownItAttrs, {})
        .use(implicitFigures, {
            figcaption: true,  // <figcaption>alternative text</figcaption>, default: false
            tabindex: true // <figure tabindex="1+n">..., default: false
        })    
        .use(markdownitS2Tex, {
            noreplace: true
        })
        .use(markdownitMultimdTable, {
            rowspan: true,
            multiline:  true
        })
        .use(markdownitSub)
        .use(markdownitSup)
        .use(markdownitFootnote)
        .use(markdownitIns)
        ;
    
    /*
    var _mdHtmlHabrAndImages = markdownit(defaults)
        .use(markdownitCriticmarkup)
        .use(markdownitS2Tex, defaults._habr)
        .use(markdownitMultimdTableLaTeX, {
            rowspan: true,
            multiline:  true
        })
        .use(markdownitSub)
        .use(markdownitSup)
        .use(markdownitFootnote)
        .use(markdownitIns)
        ;
    */
    var _mdHtmlHabrAndImages = markdownit(defaults)
        .use(markdownitCriticmarkup)
        .use(markdownitS2Tex, defaults._habr)
        .use(markdownitMultimdTableLaTeX, {
            rowspan: true,
            multiline:  true
        })
        .use(markdownitSub)
        .use(markdownitSup)
        .use(markdownitFootnote)
        .use(markdownitIns)
        .use(markdownitCitationMur2)
        ;
    var _mdBackend =  markdownit("zero")
        .enable("table")
        .use(markdownitMultimdTableLaTeX, {
            rowspan: true,
            multiline:  true
        })
    ;

    var _mdMdAndImages = markdownit('zero')
        .use(markdownitS2Tex);

    /* overwite Footnote */
    var mdsnames = [_mdPreview, _mdHtmlAndImages, _mdHtmlAndTex, _mdHtmlHabrAndImages, _mdMdAndImages];
    var languageFootnote = document.querySelector('meta[name="endnotetext"]').content
    for (var i = 0; i < mdsnames.length; i++) {
        mdsnames[i].renderer.rules.footnote_block_open = () => (
            '<h1 class="mt-1">' + languageFootnote + '</h1>\n' +
            '<section class="footnotes">\n' +
            '<ol class="footnotes-list">\n'
        );
    }

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

    /**
     * Inject line numbers for sync scroll. Notes:
     * - We track only headings and paragraphs on first level. That's enough.
     * - Footnotes content causes jumps. Level limit filter it automatically.
     *
     * @param tokens
     * @param idx
     * @param options
     * @param env
     * @param self
     */
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
    }

    // Habrahabr does not ignore <p> tags and meanwhile uses whitespaces
    function habrHeading(tokens, idx, options, env, self) {
        var prefix = "";
        if (idx > 0 && tokens[idx - 1].type === 'paragraph_close' && !hasBlockFormula(tokens, idx - 2)) {
            prefix = "\n";
        }

        return prefix + self.renderToken(tokens, idx, options, env, self);
    }

    function habrParagraphOpen(tokens, idx, options, env, self) {
        var prefix = "";
        if (idx > 0 && tokens[idx - 1].type === 'paragraph_close' && !hasBlockFormula(tokens, idx - 2)) {
            prefix = "\n";
        }
        return prefix; //+ self.renderToken(tokens, idx, options, env, self);
    }

    function habrParagraphClose(tokens, idx, options, env, self) {
        var prefix = "\n";
        return prefix; //+ self.renderToken(tokens, idx, options, env, self);
    }

    function injectCentering(tokens, idx, options, env, self) {
        // Hack (maybe it is better to use block renderers?)
        if (hasBlockFormula(tokens, idx + 1)) {
            tokens[idx].attrPush(['align', 'center']);
            tokens[idx].attrPush(['style', 'text-align: center;']);
        }
        return self.renderToken(tokens, idx, options, env, self);
    }

    _mdPreview.renderer.rules.paragraph_open = _mdPreview.renderer.rules.heading_open = injectLineNumbersAndCentering;
    _mdHtmlAndImages.renderer.rules.paragraph_open = _mdHtmlAndImages.renderer.rules.heading_open = injectCentering;

    _mdHtmlHabrAndImages.renderer.rules.heading_open = habrHeading;
    _mdHtmlHabrAndImages.renderer.rules.paragraph_open = habrParagraphOpen;
    _mdHtmlHabrAndImages.renderer.rules.paragraph_close = habrParagraphClose;
    // same with backend
    _mdBackend.renderer.rules.heading_open = habrHeading;
    _mdBackend.renderer.rules.paragraph_open = habrParagraphOpen;
    _mdBackend.renderer.rules.paragraph_close = habrParagraphClose;
    

    // A copy of Markdown-it original backticks parser.
    // We want to prevent from parsing dollars inside backticks as TeX delimeters (`$$`).
    // But we do not want HTML in result.
    _mdMdAndImages.inline.ruler.before('backticks', 'backticks2', function(state, silent) {
        var start, max, marker, matchStart, matchEnd, token,
            pos = state.pos,
            ch = state.src.charCodeAt(pos);
        if (ch !== 0x60 /* ` */ ) {
            return false;
        }

        start = pos;
        pos++;
        max = state.posMax;

        while (pos < max && state.src.charCodeAt(pos) === 0x60 /* ` */ ) {
            pos++;
        }

        marker = state.src.slice(start, pos);

        matchStart = matchEnd = pos;

        while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
            matchEnd = matchStart + 1;

            while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60 /* ` */ ) {
                matchEnd++;
            }

            if (matchEnd - matchStart === marker.length) {
                if (!silent) {
                    token = state.push('backticks2_inline', 'code', 0); // <-- The change
                    token.markup = marker;
                    token.content = state.src.slice(pos, matchStart)
                }
                state.pos = matchEnd;
                return true;
            }
        }

        if (!silent) {
            state.pending += marker;
        }
        state.pos += marker.length;
        return true;
    });

    _mdMdAndImages.renderer.rules.backticks2_inline = function(tokens, idx /*, options, env, slf*/ ) {
        var token = tokens[idx];
        return token.markup + token.content + token.markup;
    };

    // Prevents HTML escaping.
    _mdMdAndImages.renderer.rules.text = function(tokens, idx /*, options, env */ ) {
        return tokens[idx].content;
    };
    _mdBackend.renderer.rules.text = function(tokens, idx /*, options, env */ ) {
        return tokens[idx].content;
    };
        

    // Custom image embedding for smooth UX
    _mdPreview.renderer.rules.math_inline = function (tokens, idx) {
        return imageLoader.getHtmlStub(tokens[idx].content);
    };                

    /**
     * Habrahabr hack for numerating formulas
     */
    _mdHtmlHabrAndImages.renderer.rules.math_number = function(tokens, idx) {
        return '<img align="right" src="//mur2.co.uk/math/svg/' + tokens[idx].content + '" />';
    };

    /**
     * Habrahabr "source" tag
     *
     * @param tokens
     * @param idx
     * @param options
     * @param env
     * @param self
     * @returns {string}
     */
    _mdHtmlHabrAndImages.renderer.rules.fence = function(tokens, idx, options, env, self) {
        var token = tokens[idx],
            info = token.info ? _mdHtmlHabrAndImages.utils.unescapeAll(token.info).trim() : '',
            langName = '',
            highlighted;

        if (info) {
            langName = info.split(/\s+/g)[0];
            token.attrPush(['lang', langName]);
        }

        if (options.highlight) {
            highlighted = options.highlight(token.content, langName) || _mdHtmlHabrAndImages.utils.escapeHtml(token.content);
        } else {
            highlighted = _mdHtmlHabrAndImages.utils.escapeHtml(token.content);
        }

        return '\n<source' + self.renderAttrs(token) + '>' +
            highlighted +
            '</source>\n';
    };

    function getHabraMarkup(source) {
        var html = _mdHtmlHabrAndImages.render(source);

        html = html.replace('<spoiler ', '\n<spoiler ');
        return html;
    }

    this.getSource = sourceGetter;
    var old_source = null;
        

    this.updateResult = function(imageLoader, force) {
        var _view = g_view;

        var source = sourceGetter();
        
        if ( !force ) {
            if ( source === old_source ) {
                return;
            }
        }
        // update old source
        old_source = source;

        // Update only active view to avoid slowdowns
        // (debug & src view with highlighting are a bit slow)
        switch (_view) {
            case 'html':
                imageLoader.reset();
                domSetHighlightedContent(result_destination, _mdPreview.render(source), 'none');
                imageLoader.fixDom();
                break;
            case 'htmltex':
                domSetHighlightedContent(result_destination_pre, '<script src="https://mur2.co.uk/math/latex.js"></script>\n' + _mdHtmlAndTex.render(source), 'html');
                break;
            case 'habr':
                domSetHighlightedContent(result_destination_pre, getHabraMarkup(source), 'html');
                break;
            case 'md':
                domSetHighlightedContent(result_destination_pre, _mdMdAndImages.renderInline(source), 'md');
                break;
            case 'mdp':
                domSetHighlightedContent(result_destination_pre, source, 'md');
                break;
            case 'src':
                domSetHighlightedContent(result_destination_pre, _mdHtmlAndImages.render(source), 'html');
                break;
        }

        // save the version
        updateCallback(source);
        
        // update embdeds
        collapsible_listener();
    };

    this.getDisplayedResult = function() {
        var _view = g_view;
        var source = sourceGetter();

        switch (_view) {
            case 'habr':
                return _mdHtmlHabrAndImages.render(source);
            case 'htmltex':
                return '<script src="https://mur2.co.uk/math/latex.js"></script>\n' + _mdHtmlAndTex.render(source);
            case 'md':
                return _mdMdAndImages.renderInline(source);
            case 'mdp':
                return source;
            default:
                return _mdHtmlAndImages.render(source);
        }
    };

    // return the rendered HMTL with img
    this.getHtmlImg = function() {
        var source = sourceGetter();
        return _mdHtmlAndImages.render(source);

    }
        
    // reurn result for backend
   this.getMdBackend = function() {
       var source = sourceGetter();
       var result = _mdBackend.render(source);
       // var result = getHabraMarkup(source);
       return result;
   }
}

