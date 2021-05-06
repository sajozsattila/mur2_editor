/**
 * Connects service to the markdown-it renderer.
 *
 * Inspired by https://github.com/runarberg/markdown-it-math
 *
 * @copyright 2015 Roman Parpalak
 */
(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
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
        g.markdownits2tex = f()
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

            'use strict';

            function scanDelims(state, start) {
                var pos = state.pos,
                    lastChar, nextChar, count,
                    isLastWhiteSpace, isLastPunctChar,
                    isNextWhiteSpace, isNextPunctChar,
                    can_open = true,
                    can_close = true,
                    max = state.posMax,
                    isWhiteSpace = state.md.utils.isWhiteSpace,
                    isPunctChar = state.md.utils.isPunctChar,
                    isMdAsciiPunct = state.md.utils.isMdAsciiPunct;

                // treat beginning of the line as a whitespace
                lastChar = start > 0 ? state.src.charCodeAt(start - 1) : 0x20;
                if (pos >= max) {
                    can_open = false;
                }
                count = pos - start;

                // treat end of the line as a whitespace
                nextChar = pos < max ? state.src.charCodeAt(pos) : 0x20;
                isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
                isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));
                isLastWhiteSpace = isWhiteSpace(lastChar);
                isNextWhiteSpace = isWhiteSpace(nextChar);

                if (isNextWhiteSpace) {
                    can_open = false;
                } else if (isNextPunctChar) {
                    if (!(isLastWhiteSpace || isLastPunctChar)) {
                        can_open = false;
                    }
                }
                if (isLastWhiteSpace) {
                    can_close = false;
                } else if (isLastPunctChar) {
                    if (!(isNextWhiteSpace || isNextPunctChar)) {
                        can_close = false;
                    }
                }

                return {
                    can_open: can_open,
                    can_close: can_close,
                    delims: count
                };
            } // function scanDelims 


            function makeMath_inline(open, close) {
                return function math_inline(state, silent) {
                    var startCount,
                        found,
                        res,
                        token,
                        closeDelim,
                        max = state.posMax,
                        start = state.pos,
                        openDelim = state.src.slice(start, start + open.length);

                    if (openDelim !== open) {
                        return false;
                    }
                    if (silent) {
                        return false;
                    } // Don’t run any pairs in validation mode

                    res = scanDelims(state, start + open.length);
                    startCount = res.delims;

                    if (!res.can_open) {
                        state.pos += startCount;
                        // Earlier we checked !silent, but this implementation does not need it
                        state.pending += state.src.slice(start, state.pos);
                        return true;
                    }

                    state.pos = start + open.length;

                    while (state.pos < max) {
                        closeDelim = state.src.slice(state.pos, state.pos + close.length);
                        if (closeDelim === close) {
                            res = scanDelims(state, state.pos + close.length);
                            if (res.can_close) {
                                found = true;
                                break;
                            }
                        }

                        state.md.inline.skipToken(state);
                    }

                    if (!found) {
                        // Parser failed to find ending tag, so it is not a valid math
                        state.pos = start;
                        return false;
                    }

                    // Found!

                    // Detecting single formula with a line number
                    var m = false,
                        tag = 'tex-inline';

                    if (start == 0) {
                        var srcEnd = state.src.substring(state.pos + close.length);
                        m = srcEnd.match(/^\s*(\([ \t]*\S+[ \t]*\))\s*$/);
                        if (m || srcEnd == '') {
                            tag = 'tex-block';
                        }
                        /* catch labeled equalations */
                        var me = srcEnd.match(/\s*\{#eq\:.*\}\s*$/);
                        if (me) {
                            tag = 'tex-block';
                        }
                    }

                    if (m) {
                        token = state.push('math_number', 'tex-number', 0);
                        token.content = m[1];
                        token.markup = '()';
                    }

                    state.posMax = state.pos;
                    state.pos = start + close.length;

                    // Earlier we checked !silent, but this implementation does not need it
                    token = state.push('math_inline', tag, 0);
                    token.content = state.src.slice(state.pos, state.posMax);
                    token.markup = open;

                    state.pos = m ? max : state.posMax + close.length;
                    state.posMax = max;

                    return true;
                };
            } // function makeMath_inline

            module.exports = function math_plugin(md, options) {
                // Default options
                options = typeof options === 'object' ? options : {};
                var inlineOpen = options.inlineOpen || '$$',
                    inlineClose = options.inlineClose || '$$';

                var math_inline = makeMath_inline(inlineOpen, inlineClose);

                md.inline.ruler.before('escape', 'math_inline', math_inline);

                md.renderer.rules.math_inline = (function(protocol) {
                    protocol = typeof options.protocol !== 'undefined' ? options.protocol : protocol;
                    return function(tokens, idx) {
                        var formula = tokens[idx].content;

                        if (options.noreplace) {
                            var str = inlineOpen + formula + inlineClose;
                            return str
                                .replace(/&/g, '&amp;')
                                .replace(/>/g, '&gt;')
                                .replace(/</g, '&lt;')
                                .replace(/"/g, '&quot;');
                        }

                        var url = protocol + '//mur2.co.uk/math/svg/' + encodeURIComponent(formula),
                            isInline = "tex-inline" === tokens[idx].tag;

                        return isInline ?
                            '<img src="' + url + '" alt="' + md.utils.escapeHtml(formula) + '" />' :
                            '<img align="center" src="' + url + '" alt="' + md.utils.escapeHtml(formula) + '" />';
                    }
                }('https:')); // just https protocol

                md.renderer.rules.math_number = function(tokens, idx) {
                    return '<span style="float:right">' + tokens[idx].content + '</span>';
                };
            }; // module.exports
        }, {}]
    }, {}, [1])(1)
});