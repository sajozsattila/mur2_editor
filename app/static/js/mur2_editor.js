/**
 * Markdown and LaTeX Editor
 * (c) Sajó, Zsolt Attila 2020
 * Based on code by Roman Parpalak, 2016-2018 https://github.com/parpalak/upmath.me
 * 
 */

// what is the actuall preview type 
var g_view = 'html';
// focusmode on?   
var g_focusmode_switch = false;
// preview show?
var g_preview_on = true;
// which textareai is selected
var g_selectedTextarea = null;

//////////
// set a DOM content, with highlighting or not 
//     if 'lang' === 'none' it is setting just the innerHTML
//////////
function g_domSetHighlightedContent(idName, content, lang) {
    var eNode = document.getElementById(idName);
    var result = null;
    // for source without any formating

    if (lang === 'none') {
        eNode.innerHTML = content;
    } else if (window.hljs) {
        // highlighing 
        result = window.hljs.highlight(lang, content)
        eNode.innerHTML = result.value;
    } else {
        eNode.textContent = content;
    }
    return result;
}

/**
 * Searches start position for text blocks
 */
function g_domFindScrollMarks() {
    var resElements = document.querySelectorAll('#article_main .line'),
        resElementHeight = [],
        line,
        mapSrc = [0],
        mapResult = [0],
        i = 0,
        len = resElements.length;

    for (; i < len; i++) {
        line = parseInt(resElements[i].getAttribute('data-line'));
        if (line) {
            resElementHeight[line] = Math.round(resElements[i].offsetTop);
        }
    }

    var srcElements = document.querySelectorAll('.ldt-pre .block-start');

    len = srcElements.length;
    line = 0;

    for (i = 0; i < len; i++) {
        var lineDelta = parseInt(srcElements[i].getAttribute('data-line'));
        if (lineDelta) {
            line += lineDelta;

            // We track only lines in both containers
            if (typeof resElementHeight[line] !== 'undefined') {
                mapSrc.push(srcElements[i].offsetTop);
                mapResult.push(resElementHeight[line]);
            }
        }
    }
    var srcScrollHeight = document.querySelector('.ldt-pre').scrollHeight,
        lastSrcElemPos = mapSrc[mapSrc.length - 1],
        allowedHeight = 5; // workaround for automatic textarea scrolling on entering new source lines

    mapSrc.push(srcScrollHeight - allowedHeight > lastSrcElemPos ? srcScrollHeight - allowedHeight : lastSrcElemPos);
    mapResult.push(document.querySelector('#article_main').scrollHeight);

    return [mapSrc, mapResult];
}

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
        .use(markdownItAttrs, {})
        .use(implicitFigures, {
            figcaption: true,  // <figcaption>alternative text</figcaption>, default: false
            tabindex: true // <figure tabindex="1+n">..., default: false
        })        
        .use(markdownitS2Tex)
        .use(markdownitSub)
        .use(markdownitSup)
        .use(markdownitFootnote)
        .use(markdownitIns);

    var _mdHtmlAndImages = markdownit(defaults)
        .use(markdownItAttrs, {})
        .use(implicitFigures, {
            figcaption: true,  // <figcaption>alternative text</figcaption>, default: false
            tabindex: true // <figure tabindex="1+n">..., default: false
        })
        .use(markdownitS2Tex)
        .use(markdownitSub)
        .use(markdownitSup)
        .use(markdownitFootnote)
        .use(markdownitIns);

    var _mdHtmlAndTex = markdownit(defaults)
        .use(markdownItAttrs, {})
        .use(implicitFigures, {
            figcaption: true,  // <figcaption>alternative text</figcaption>, default: false
            tabindex: true // <figure tabindex="1+n">..., default: false
        })    
        .use(markdownitS2Tex, {
            noreplace: true
        })
        .use(markdownitSub)
        .use(markdownitSup)
        .use(markdownitFootnote)
        .use(markdownitIns);

    var _mdHtmlHabrAndImages = markdownit(defaults)
        .use(markdownitS2Tex, defaults._habr)
        .use(markdownitSub)
        .use(markdownitSup)
        .use(markdownitFootnote)
        .use(markdownitIns);

    var _mdMdAndImages = markdownit('zero')
        .use(markdownitS2Tex);

    /* overwite Footnote */
    var mdsnames = [_mdPreview, _mdHtmlAndImages, _mdHtmlAndTex, _mdHtmlHabrAndImages, _mdMdAndImages];
    var languageFootnote = document.querySelector('meta[name="endnotetext"]').content
    for (var i = 0; i < mdsnames.length; i++) {
        mdsnames[i].renderer.rules.footnote_block_open = () => (
            '<h3 class="mt-3">' + languageFootnote + '</h3>\n' +
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

    // Custom image embedding for smooth UX
    _mdPreview.renderer.rules.math_inline = function (tokens, idx) {
        return imageLoader.getHtmlStub(tokens[idx].content);
    };                

    /**
     * Habrahabr hack for numerating formulas
     */
    _mdHtmlHabrAndImages.renderer.rules.math_number = function(tokens, idx) {
        return '<img align="right" src="//tex.s2cms.ru/svg/' + tokens[idx].content + '" />';
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
                domSetHighlightedContent(result_destination_pre, '<script src="https://tex.s2cms.ru/latex.js"></script>\n' + _mdHtmlAndTex.render(source), 'html');
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
    };

    this.getDisplayedResult = function() {
        var _view = g_view;
        var source = sourceGetter();

        switch (_view) {
            case 'habr':
                return _mdHtmlHabrAndImages.render(source);
            case 'htmltex':
                return '<script src="https://tex.s2cms.ru/latex.js"></script>\n' + _mdHtmlAndTex.render(source);
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
}



(function(document, window) {
    'use strict';

    // globals to make them local 
    var domFindScrollMarks = g_domFindScrollMarks;

    // get the different element of the data
    var titleSource = document.getElementById('title-source'),
        titleResult = document.getElementById('article_title'),
        abstactSource = document.getElementById('abstact-source'),
        abstactResult = document.getElementById('article_abstract_text'),
        mainSource = document.getElementById('main-source'),
        mainResult = document.getElementById('article_main'),
        article_id = document.querySelector('meta[name="article_id"]').content;

    var recalcHeight = debounce(function() {
        decorator.recalcHeight()
    }, 100);

    var scrollMap = new ScrollMap(domFindScrollMarks);

    var iprem = new ImagePreloader();
    // creat the Math imageLoaders we need them because of the debounce destroy the this. object in the ParserCollection
    var mainImageLoader = new ImageLoader(iprem, location.protocol === 'https:' ? 'https:' : 'http:', 'm_');    
    var mainCollection = new ParserCollection(
        window.markdownit,
        function(source) {
            // reset lines mapping cache on content update
            scrollMap.reset();
            // local save
            try {
                localStorage.setItem("mur2_main_content"+article_id, source);
                localStorage.setItem("mur2_main_content"+article_id+'_time', +new Date);
            } catch (e) {}
        },
        "article_main",
        "article_main_pre",
        function domGetSource() {
            return mainSource.value;
        },
        mainImageLoader
    );
    
    var titleImageLoader = new ImageLoader(new ImagePreloader(), location.protocol === 'https:' ? 'https:' : 'http:', 't_');
    var titleCollection = new ParserCollection(
        window.markdownit,
        function(source) {
            // local save
            try {
                localStorage.setItem("mur2_title_content"+article_id, source.split("\n").slice(2, -3).join("\n"));
                localStorage.setItem("mur2_title_content"+article_id+'_time', +new Date);
            } catch (e) {}
        },
        "article_title",
        "article_title",
        function domGetSource() {
            return '<span id="article_title">\n\n' + titleSource.value.replace(/(?:\r\n|\r|\n)/g, '') + '\n\n</span>\n';
        },
        titleImageLoader
    );
    var abstractImageLoader = new ImageLoader(new ImagePreloader(), location.protocol === 'https:' ? 'https:' : 'http:', 'a_');
    var abstractCollection = new ParserCollection(
        window.markdownit,
        function(source) {
            // local save
            try {
                localStorage.setItem("mur2_abstract_content"+article_id, source.split("\n").slice(2, -3).join("\n"));
                localStorage.setItem("mur2_abstract_content"+article_id+'_time', +new Date);
            } catch (e) {}
        },
        "article_abstract_text",
        "article_abstract_text",
        function domGetSource() {
            return '<span id="article_abstract">\n\n' + abstactSource.value.replace(/(?:\r\n|\r|\n)/g, '') + '\n\n</span>\n';
        },
        abstractImageLoader
    );

    // load first everything
    mainCollection.updateResult(mainImageLoader, true);
    abstractCollection.updateResult(abstractImageLoader, true);
    titleCollection.updateResult(titleImageLoader, true);


    // start the decorator we just decorate the main
    var decorator = new TextareaDecorator(mainSource, mdParser);
    // .source has been changed after TextareaDecorator call
    var eNodeSource = document.getElementsByClassName("ldt")[0];

    var syncScroll = new SyncScroll(
        scrollMap,
        new Animator(function() {
            return eNodeSource.scrollTop;
        }, function(y) {
            eNodeSource.scrollTop = y;
        }),
        new Animator(function() {
            return mainResult.scrollTop;
        }, function(y) {
            mainResult.scrollTop = y;
        }),
        eNodeSource,
        mainResult,
        document.querySelector('[id^="maintext"]')
    );


    // debonced updates for resource managment

    var updateMain = debounce(mainCollection.updateResult, 300, {
        maxWait: 3000
    });
    var updateTitle = debounce(titleCollection.updateResult, 300, {
        maxWait: 3000
    });

    var updateAbstract = debounce(abstractCollection.updateResult, 300, {
        maxWait: 3000
    });

    /* Add event listener */
    // make event delegation for all of the input
    //   basically we have three texfiled: title, abstract, main
    //      we can add three event listener, but better one event listener on 
    //      we can do this by organising them under one parent, and use event delegation
    let article_input_side = document.querySelector('#article_input_side');
    article_input_side.addEventListener('input', (event) => {
        let target = event.target;
        var preview_on = g_preview_on;
        // mark as selected area
        g_selectedTextarea = target.id;
        // switching depending which textfiled was an input
        switch (target.id) {
            case 'title-source':
                // if we do not show preview no point to update
                if (preview_on) {
                    updateTitle(titleImageLoader, false);
                }
                break;
            case 'abstact-source':
                if (preview_on) {
                    updateAbstract(abstractImageLoader, false);
                }
                break;
            case 'main-source':
                if (preview_on) {
                    updateMain(mainImageLoader, false);
                }
                break;
        }
    });

    // action to roll on main 
    mainSource.addEventListener('touchstart', syncScroll.switchScrollToSrc);
    mainSource.addEventListener('mouseover', syncScroll.switchScrollToSrc);
    mainResult.addEventListener('touchstart', syncScroll.switchScrollToResult);
    mainResult.addEventListener('mouseover', syncScroll.switchScrollToResult);

    syncScroll.switchScrollToSrc();

    // slider
    (function() {
        var eSlider = document.querySelector('#slider'),
            dragSlider = new Draggabilly(eSlider, {
                axis: 'x'
            }),
            sourceBlock = document.getElementById('article_input_side'),
            resultBLock = document.getElementById('article_preview_side'),
            windowWidth;

        function setWidth(percent) {
            sourceBlock.style.width = 'calc(' + percent + '% - 3px)';
            resultBLock.style.width = 'calc(' + (100 - percent) + '% - 3px)';

            scrollMap.reset();
            recalcHeight();
        }

        eSlider.addEventListener('dblclick', function() {
            setWidth(50);
        });

        dragSlider.on('dragStart', function(event, pointer, moveVector) {
            windowWidth = window.innerWidth;
        });

        dragSlider.on('dragMove', function(event, pointer, moveVector) {
            setWidth(100.0 * pointer.pageX / windowWidth);
        });
    })();

    // Need to recalculate line positions on window resize
    window.addEventListener('resize', function() {
        scrollMap.reset();
        recalcHeight();
    });

    // listener for the toolbar
    var activaton = ["select", "click"];
    for (var i = activaton.length; i--; ) {
        article_input_side.addEventListener(activaton[i], (event) => {
            // switching depending which textfiled was an input
            let target = event.target;
            if (target.id === 'title-source' || target.id === 'abstact-source' || target.id === 'main-source') {
                g_selectedTextarea = target.id;
                if ( g_focusmode_switch ) {
                    decorator.update();
                }
            }
        });
    }

    // uplad the selected area. used for toolbar
    var inputevent = new Event('input');
    // this is used for the toolbars
    function update() {
        var selectedTextarea = g_selectedTextarea;
        if (selectedTextarea === 'main-source') {
            updateMain(mainImageLoader, false);
            // fire inputevent manualy to update highlighted things also
            mainSource.dispatchEvent(inputevent);
        } else if (selectedTextarea === 'title-source') {
            updateTitle(titleImageLoader, false);
        } else if (selectedTextarea === 'abstact-source') {
            updateAbstract(abstractImageLoader, false);
        }
    }

    // file upload event
    document.getElementById('fileElem').addEventListener('change', function() {
        // A file has been chosen
        if (!this.files || !FileReader) {
            return;
        }

        var reader = new FileReader(),
            fileInput = this;

        reader.onload = function() {
            var filecontent = this.result;
            
            var htmlObject = document.createElement('div');
            htmlObject.innerHTML = filecontent;
            var fragment = document.createDocumentFragment(); 
            fragment.appendChild( htmlObject ); 
            var article_title = fragment.getElementById("article_title") ;
            var article_abstract = fragment.getElementById("article_abstract") ;

            abstactSource.value = article_abstract.innerHTML.replace("\n", "");
            titleSource.value = article_title.innerHTML.replace("\n", "");
            article_title.parentNode.removeChild(article_title);
            article_abstract.parentNode.removeChild(article_abstract);
            
            // upload to the main
            mainSource.value = fragment.textContent.replace(/^\s+/g, '');;
            updateMain(mainImageLoader, true);
            mainSource.dispatchEvent(inputevent);
            decorator.update();
            fileInput.value = fileInput.defaultValue;
            fragment = null;
        };
        reader.readAsText(this.files[0]);
    });
    
    // Featured Image
    document.getElementById('feaImg_add').addEventListener('change', function() {
        // A file has been chosen
        if (!this.files || !FileReader) {
            return;
        }
        var file = document.getElementById('feaImg_add').files[0];
        var reader = new FileReader();
        
        reader.onload = function() {
            var image = document.getElementById("article_abstract_div").firstElementChild;
            // the result image data
            image.src = reader.result;
            image.classList.remove("hide");
            // save the image localy
            localStorage.setItem("mur2_featured_image"+article_id, image.src);
            localStorage.setItem("mur2_featured_image"+article_id+'_time', +new Date);
        };
        // you have to declare the file loading
        reader.readAsDataURL(file);     
    });        
    let featureImg = document.querySelector('#id_featureImage');
    featureImg.addEventListener('click', function() {
        let target = event.target;
        if (target.id == "feaImg_del") {            
            var image = document.getElementById("article_abstract_div").firstElementChild;
            // the result image data
            image.src = "";
            image.classList.add("hide");
            // save the image localy
            localStorage.setItem("mur2_featured_image"+article_id, image.src);
            localStorage.setItem("mur2_featured_image"+article_id+'_time', +new Date);
        };
    });    

    // other event delegator for menu and toolbar
    let editor_toolbar = document.querySelector('#menu');
    editor_toolbar.addEventListener('click', (event) => {
        let target = event.target;
        // switching depending which textfiled was an input
        if (target.classList.contains('choice_menu')) {
            var menutarget = target.id.replace("id_", '');
            var menu = document.getElementById('menu');            
            if ( menu.classList.contains(menutarget) ) {
                menu.classList.remove(menutarget);
            } else {
                menu.classList.add(menutarget);
            }
        } else if (target.classList.contains('choice_toolbar')) {
            // the tools
            switch (target.id) {
                case 'id_upload':
                    upload_source();
                    break;
                case 'id_download':
                    download_result([mainCollection, abstractCollection, titleCollection]);
                    break;
                case 'id_save':
                    // fire up an update
                    updateMain(mainImageLoader, true);
                    updateTitle(titleImageLoader, true);
                    updateAbstract(abstractImageLoader, true);
                    save_article([mainCollection, abstractCollection, titleCollection]);
                    break;
                case 'id_syntax_hl':
                    var menubottom = document.getElementById('id_syntax_hl');
                    if (g_focusmode_switch) {
                        menubottom.classList.add('focusmode');
                        g_focusmode_switch = false;
                    } else {
                        menubottom.classList.remove('focusmode');
                        g_focusmode_switch = true;                        
                    };
                    mainSource.dispatchEvent(inputevent);
                    break;
                case 'id_hide_preview':
                    var preview = document.getElementById('article_preview_side');
                    var input = document.getElementById('article_input_side');
                    var menubottom = document.getElementById('id_hide_preview');
                    if (preview.classList.contains('previewoff')) {
                        preview.classList.remove('previewoff');
                        input.classList.remove('previewoff');
                        menubottom.classList.remove('previewoff');
                        g_preview_on = true;
                        // fire up an update
                        updateMain(mainImageLoader, true);
                        updateTitle(titleImageLoader, true);
                        updateAbstract(abstractImageLoader, true);
                    } else {
                        preview.classList.add('previewoff');
                        input.classList.add('previewoff');
                        menubottom.classList.add('previewoff');
                        // switching off update on ParseCollection when it is not showed
                        g_preview_on = false;
                    }
                    break;
                case 'id_hide_input':
                    var preview = document.getElementById('article_preview_side');
                    var input = document.getElementById('article_input_side');
                    var menubottom = document.getElementById('id_hide_input');
                    if (input.classList.contains('inputoff')) {
                        preview.classList.remove('inputoff');
                        input.classList.remove('inputoff');
                        menubottom.classList.remove('inputoff');
                    } else {
                        preview.classList.add('inputoff');
                        input.classList.add('inputoff');
                        menubottom.classList.add('inputoff');
                    }
                    break;
                case 'id_show_title':
                    var sides = document.querySelectorAll("#article_preview_side, #article_input_side");
                    var menubottom = document.getElementById('id_show_title');
                    for (var i = sides.length; i--;) {
                        if (sides[i].classList.contains('titleon')) {
                            sides[i].classList.remove('titleon');
                            menubottom.classList.remove('titleon');
                        } else {
                            sides[i].classList.add('titleon');
                            menubottom.classList.add('titleon');
                        }
                    }
                    break;
                case 'id_head':
                    editorToolbarAction("heading");
                    update();
                    break;
                case 'id_italic':
                    editorToolbarAction("italic");
                    update();
                    break;
                case 'id_strong':
                    editorToolbarAction("strong");
                    update();
                    break;
                case 'id_picture':
                    editorToolbarAction("picture");
                    update();
                    break;
                case 'id_link':
                    editorToolbarAction("link");
                    update();
                    break;
                case 'id_list':
                    editorToolbarAction("list");
                    update();
                    break;
                case 'id_nlist':
                    editorToolbarAction("numbered_list");
                    update();
                    break;
                case 'id_footnote':
                    editorToolbarAction("footnote");
                    update();
                    break;
                case 'id_table':
                    editorToolbarAction("table");
                    update();
                    break;
                case 'id_code':
                    editorToolbarAction("code");
                    update();
                    break;
                case 'id_latex':
                    editorToolbarAction("latex");
                    update();
                    break;                
            }
        }
    });


    // event listener to switch the content
    let side_menu = document.querySelector('#side_menu');
    side_menu.addEventListener('click', (event) => {
        let target = event.target;
        // switching preview 
        if (target.classList.contains('preview-format')) {
            var view = target.id.replace("id_", '');
            var bodyelement = document.body;
            var classlist =  bodyelement.className.split(' ');
            var oldclass = null;
            for (var i = classlist.length; i--; ) {
                if ( /result-as-*/.test(classlist[i]) ) {
                    oldclass = classlist[i];
                }
            }
            bodyelement.classList.remove(oldclass);
            bodyelement.classList.add("result-as-" + view);
            g_view = view;
            updateTitle(titleImageLoader, true);
            updateAbstract(abstractImageLoader, true);
            updateMain(mainImageLoader, true);
        } else if (target.id === "id_wpc_publish") {
            wordpress_on_fly(titleCollection, abstractCollection,  mainCollection);
        } else if (target.id === "id_medium_publish") {
            medium_on_fly(titleCollection, abstractCollection,  mainCollection);
        } else if (target.id === "id_medium_connect") {
            medium_connect();
        } else if (target.id === "id_wpc_clear") {
            clear_cookies("wpc");
        }  else if (target.id === "id_medium_clear") {
            clear_cookies("medium");
        } else if (target.id === "id_pdf") {
            generate_from_md('pdf', mainCollection);
        } else if (target.id === "id_latex_export") {
            generate_from_md('latex', mainCollection);
        } else if (target.id === "id_epub") {
            generate_from_md('epub', mainCollection);
        } else if (target.id === "id_publish_article") {
            // finishe editing article
            var iframe = document.getElementById('transFrame');
            iframe.addEventListener('load', Handler);
            function Handler() {
                window.location.reload(true); 
            }
            
        }

    });
})(document, window);