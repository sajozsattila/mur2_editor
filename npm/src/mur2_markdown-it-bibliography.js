var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// translate
var i18next = require('i18next');
i18next.init({
  lng: ['en', 'hu'],
  debug: true,
  resources: {
    en: {
      translation: {
        "Bibliography": "Bibliography"
      }
    },
    hu: {
      translation: {
        "Bibliography": "Irodalomjegyzék"
      }  
    }
  }
}).then(function(t) {
  // initialized and ready to go!
  return i18next.t(t);
});;

/* https://github.com/DerDrodt/markdown-it-bibliography */
(function(f){if(typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f()
} else if (typeof define === "function" && define.amd) {
    define([], f)
} else {
    var g;
    if (typeof window !== "undefined") {
        g = window
    } else if (typeof global !== "undefined") {
        g = global
    } else if (typeof self !== "undefined") {
        g = self
    } else {
        g = this
    }
    g.markdownitCitationMur2 = f()
}
})(function() {
    var define, module, exports;
    return (function() {
        function r(e, n, t) {
            function o(i, f) {
                if (!n[i]) {
                    if (!e[i]) {
                        var c = "function" == typeof require && require;
                        if (!f && c) return c(i, !0);
                        if (u) return u(i, !0);
                        var a = new Error("Cannot find module '" + i + "'");
                        throw a.code = "MODULE_NOT_FOUND", a
                    }
                    var p = n[i] = {
                        exports: {}
                    };
                    e[i][0].call(p.exports, function(r) {
                        var n = e[i][1][r];
                        return o(n || r)
                    }, p, p.exports, r, e, n, t)
                }
                return n[i].exports
            }
            for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
            return o
        }
        return r
    })()({
        1: [function(require, module, exports) {

            "use strict";
            var __assign = (this && this.__assign) || function() {
                __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                        s = arguments[i];
                        for (var p in s)
                            if (Object.prototype.hasOwnProperty.call(s, p))
                                t[p] = s[p];
                    }
                    return t;
                };
                return __assign.apply(this, arguments);
            };
            exports.__esModule = true;
            // the script which process style, BibLaTeX file and language settings
            var citeproc_1 = require("citeproc");
            // the script which actually preprocess the citations in the text
            var citation_parser_js_1 = require("./citation-parser.js");

            function citations(md, _c) {
                
                // read BibTLaTeX file
                var cslFromBibLatex = function (biblatexfilname) {
                    var fs = require('fs');
                    var biblatex = fs.readFileSync(biblatexfilname, 'utf8');
                    var biblatex_csl_converter_ts_1 = require("biblatex-csl-converter-ts");
                    var parsed = new biblatex_csl_converter_ts_1.BibLatexParser(biblatex).parse();
                    for (var _i = 0, _a = parsed.errors; _i < _a.length; _i++) {
                        var error = _a[_i];
                        throw new Error("Encountered error while parsing biblatex: " + JSON.stringify(error));
                    }
                    var idToKey = new Map();
                    for (var id in parsed.entries) {
                        idToKey.set(parsed.entries[id].entry_key, id);
                    }
                    var csl = new biblatex_csl_converter_ts_1.CSLExporter(parsed.entries).parse();
                    for (var id in csl) {
                        csl[id].title = csl[id].title.replace(/<span class="nocase">(\w)<\/span>/g, "$1");
                        csl[id].title = csl[id].title.replace(/[“”]/g, csl[id].type === "book" ? '"' : "'");
                    }
                    return [csl, idToKey];
                };
                var _f = cslFromBibLatex(_c.bibfile);
                var items = _f[0];
                _c.idToKey = _f[1];                
                
                // get style from url
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://raw.githubusercontent.com/citation-style-language/styles/master/' + _c.style + '.csl', false);
                xhr.send(null);
                var styleAsText = xhr.responseText;                
                
                var style = styleAsText,
                    lang = _c.lang,
                    idToKey = _c.idToKey,
                    locales = (_c.locales) ? _c.locales : _c.defaultLocale,
                    defaultLocale = _c.defaultLocale;
                i18next.changeLanguage(lang);
                
                // style                
                var sys = {
                    // get language settings from the https://github.com/Juris-M/citeproc-js-doc
                    retrieveLocale: function (lang){
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', 'https://raw.githubusercontent.com/Juris-M/citeproc-js-docs/fce16b33c4b03041eb6819e4c13c029b36b48b50/_static/data/locales/locales-' + lang + '.xml', false);
                        xhr.send(null);
                        // read the XML data and parse to Javascript object 
                        //var fulldata = parser.toJson(xhr.responseText, { object: true });
                        // return fulldata.locale;
                        return xhr.responseText
                    },
                    retrieveItem: function(id){
                        return items[id];
                    }
                };
                
                // Create Citeproc and add items
                var citeproc = new citeproc_1.Engine(sys, style, lang);
                citeproc.opt.mode = "text";
                var computeAllCitations = function(cits, env) {
                    var prev = [];
                    env.citations.rendered = {};
                    for (var _i = 0, cits_1 = cits; _i < cits_1.length; _i++) {
                        var cit = cits_1[_i];
                        var result = citeproc.processCitationCluster(cit, prev.map(function(c) {
                            return [c.citationID, c.properties.noteIndex];
                        }), [])[1];
                        for (var _c = 0, result_1 = result; _c < result_1.length; _c++) {
                            var _d = result_1[_c],
                                _ = _d[0],
                                str = _d[1],
                                id = _d[2];
                            env.citations.rendered[id] = str;
                        }
                        prev.push(cit);
                    }
                };
                var render_citation_auto = function(tokens, idx, _options, env, _self) {
                    var token = tokens[idx];
                    var id = token.meta.id;
                    var cit = env.citations.list[id];
                    if (!env.citations.rendered) {
                        var citationsvalus = env.citations.list
                            .map(function(c) {
                                if (c.citationItems) {
                                return c.citationItems.map(function(i) {
                                    if ( i.id ) {
                                        return i.id;
                                    }    
                                })};
                            }).flat()                      
                        ;
                        citeproc.updateItems(citationsvalus);
                        computeAllCitations(env.citations.list, env);
                    }
                    return env.citations.rendered[cit.citationID];
                };
                var render_citation_text = function(tokens, idx, _options, env, _self) {
                    var _c;
                    var token = tokens[idx];
                    var id = token.meta.id;
                    var cit = env.citations.list[id];
                    if (!env.citations.rendered) {
                        citeproc.updateItems(env.citations.list
                            .map(function(c) {
                                return c.citationItems.map(function(i) {
                                    return i.id;
                                });
                            })
                            .flat());
                        computeAllCitations(env.citations.list, env);
                    }
                    if (((_c = cit.properties) === null || _c === void 0 ? void 0 : _c.isPartOfInTextCitation) === true) {
                        return env.citations.rendered[cit.citationID] + " ";
                    }
                    return env.citations.rendered[cit.citationID];
                };
                var renderBibOpen = function(_a, _b, options) {
                    return (options.xhtmlOut ? '<hr class="bib-sep" />\n' : '') + "<section class=\"bibliography\">\n    <h1>"+i18next.t("Bibliography")+"</h1>\n";
                };
                var renderBib = function() {
                    var bib = citeproc.makeBibliography();
                    return bib[0].bibstart + " " + bib[1].join("") + " " + bib[0].bibend;
                };
                var renderBibClose = function() {
                    return "</section>\n";
                };

                // the actuall process of the citations
                function citationsPlugin(md) {
                    var parseLinkLabel = md.helpers.parseLinkLabel;
                    md.renderer.rules.citation_auto = render_citation_auto;
                    md.renderer.rules.citation_text = render_citation_text;
                    md.renderer.rules.citation_bib = renderBib;
                    md.renderer.rules.citation_bib_open = renderBibOpen;
                    md.renderer.rules.citation_bib_close = renderBibClose;
                    
                    // parse the all possible location
                    const parser = require('xml2json'); // parsing xml->javascript object
                    // collect all of the possibel label from the locale file
                    var possibleLabels = function (locale) {
                        var _a;
                        // parsing the xml file to javascript object
                        locale = parser.toJson(locale, { object: true }).locale;
                        var terms = locale.terms.term;
                        if (terms === undefined)
                            return {};
                        var res = {};
                        // iterate over the possible term
                        for (var _i = 0, _b = terms; _i < _b.length; _i++) {        
                            var term = _b[_i];
                            var label = term.name; 
                            if (typeof label === "string") {
                                if (!(label in res))
                                    res[label] = label;
                            } 
                            // check for short forumlas
                            if (term.single) {
                                if (!(term.single in res))
                                    res[term.single] = label;
                            }
                            // check for short forumlas
                            if (term.multiple) {
                                if (!(term.multiple in res))
                                    res[term.multiple] = label;
                            }
                        }
                        return res;
                    };
                    // get the details of the citation from the bib file
                    var loc = sys.retrieveLocale(locales);
                    var possible = possibleLabels(loc);
                    
                    // @key | @key[post] | @key[pre][post]
                    var textCitation = function(state, silent) {
                        if (silent)
                            return false;
                        var max = state.posMax,
                            start = state.pos;
                        if (start + 2 >= max)
                            return false;
                        var isNormal = state.src.charCodeAt(start) === 0x40; /* @ */
                        var isSuppressedAuthor = state.src.charCodeAt(start) === 0x2d /* - */ &&
                            state.src.charCodeAt(start + 1) === 0x40; /* @ */
                        if (!isNormal && !isSuppressedAuthor)
                            return false;
                        if (start > 0 && state.src.charCodeAt(start - 1) === 0x5b /* [ */ )
                            return false;
                        var end = start;
                        if (!state.env.citations) {
                            state.env.citations = {};
                        }
                        if (!state.env.citations.list) {
                            state.env.citations.list = [];
                        }
                        var possibleCiteItems = citation_parser_js_1.parseCitationItem(state, start, max, possible, defaultLocale, function(text) {
                            return md.renderInline(text, __assign(__assign({}, state.env.citations), {
                                disableBib: true
                            }));
                        }, idToKey);
                        if (!possibleCiteItems)
                            return false;
                        var citationItem = possibleCiteItems[0],
                            afterItem = possibleCiteItems[1];
                        var citeId = state.env.citations.list.length;
                        var token = state.push("citation_text", "", 0);
                        token.meta = {
                            id: citeId
                        };
                        var itemId = idToKey ? idToKey.get(citationItem.id) : citationItem.id;
                        if (isSuppressedAuthor) {
                            state.env.citations.list[citeId] = {
                                citationItems: [
                                    __assign(__assign({}, citationItem), {
                                        id: itemId,
                                        "suppress-author": true
                                    }),
                                ],
                                properties: {
                                    noteIndex: 0
                                }
                            };
                        } else {
                            var shouldUseHack = "original-date" in items[itemId] &&
                                items[itemId]["original-date"]["date-parts"].length === 2;
                            state.env.citations.list[citeId] = {
                                citationItems: [
                                    __assign(__assign({}, citationItem), {
                                        id: shouldUseHack ? "author_only_" + itemId : itemId,
                                        suffix: undefined,
                                        locator: undefined
                                    }),
                                ],
                                properties: {
                                    noteIndex: 0,
                                    mode: "author-only",
                                    isPartOfInTextCitation: true
                                }
                            };
                            var citeId2 = citeId + 1;
                            var token_1 = state.push("citation_text", "", 0);
                            token_1.meta = {
                                id: citeId2
                            };
                            state.env.citations.list[citeId2] = {
                                citationItems: [
                                    __assign(__assign({}, citationItem), {
                                        id: itemId,
                                        "suppress-author": true,
                                        prefix: undefined
                                    }),
                                ],
                                properties: {
                                    noteIndex: 0
                                }
                            };
                        }
                        end = afterItem;
                        state.pos = end;
                        state.posMax = max;
                        return true;
                    };
                    // (@key | @key[post] | @key[pre][post])
                    // (^@key | ^@key[post] | ^@key[pre][post])
                    // [@key] | [@key[post]] | [@key[pre][post]]
                    var autoCitation = function(state, silent) {
                        var labelStart;
                        var labelEnd;
                        var token;
                        var max = state.posMax,
                            start = state.pos;
                        if (start + 2 >= max)
                            return false;
                        var isNormalAuto = state.src.charCodeAt(start) === 0x5b /* [ */ &&
                            state.src.charCodeAt(start + 1) === 0x40; /* @ */
                        var isSuppressedAuto = state.src.charCodeAt(start) === 0x5b /* [ */ &&
                            state.src.charCodeAt(start + 1) === 0x2d /* - */ &&
                            state.src.charCodeAt(start + 2) === 0x40; /* @ */
                        if (!isNormalAuto && !isSuppressedAuto)
                            return false;
                        labelStart = start + 1;
                        labelEnd = parseLinkLabel(state, start);
                        // parser failed to find ']', so it's not a valid citation
                        if (labelEnd < 0)
                            return false;
                        // We found the end of the link, and know for a fact it's a valid link
                        var end = labelEnd + 1;
                        if (!silent) {
                            if (!state.env.citations) {
                                state.env.citations = {};
                            }
                            if (!state.env.citations.list) {
                                state.env.citations.list = [];
                            }
                            state.md.disable("citation_text");
                            // get out from the test the individual citation settings, like id, page etc.
                            var possibleCiteItems = citation_parser_js_1.parseCitationItems(state, labelStart, max, labelEnd, possible, defaultLocale, function(text) {
                                return md.renderInline(text, __assign(__assign({}, state.env.citations), {
                                    disableBib: true
                                }));
                            }, idToKey);
                            if (!possibleCiteItems)
                                return false;
                            
                            var citationItems = possibleCiteItems[0],
                                afterItems = possibleCiteItems[1];
                            if (state.src.charCodeAt(afterItems) !== 0x5d /* ] */ )
                                return false;
                            var citeId = state.env.citations.list.length;
                            token = state.push("citation_auto", "", 0);                            
                            token.meta = {
                                id: citeId
                            };
                            state.env.citations.list[citeId] = {
                                citationItems: idToKey ?
                                    citationItems.map(function(i) {
                                        return (__assign(__assign({}, i), {
                                            id: idToKey.get(i.id)
                                        }));
                                    }) :
                                    citationItems,
                                properties: {
                                    noteIndex: 0
                                }
                            };
                        } // !silent
                        state.pos = end;
                        state.posMax = max;
                        state.md.enable("citation_text");
                        return true;
                    }; // autoCitation
                    var citationBib = function(state) {
                        if (!state.env.citations ||
                            state.env.citations.length === 0 ||
                            state.env.disableBib) {
                            return false;
                        }
                        var open = new state.Token("citation_bib_open", "", 1);
                        state.tokens.push(open);
                        var inner = new state.Token("citation_bib", "", 1);
                        state.tokens.push(inner);
                        var close = new state.Token("citation_bib_close", "", 1);
                        state.tokens.push(close);
                        return true;
                    };
                    md.inline.ruler.after("image", "citation_auto", autoCitation);
                    md.inline.ruler.after("image", "citation_text", textCitation);
                    md.core.ruler.after("inline", "citation_bib", citationBib);
                }
                citationsPlugin(md);
            } // citations
            module.exports = citations;

        }, {}]
    }, {}, [1])(1)
});