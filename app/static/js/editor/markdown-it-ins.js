(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.markdownitIns = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

/*! markdown-it-ins 3.0.1 https://github.com/markdown-it/markdown-it-mark @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.markdownitIns = factory());
}(this, (function () { 'use strict';

  var markdownItIns = function ins_plugin(md) {
    // Insert each marker as a separate text token, and add it to delimiter list
    //
    function tokenize(state, silent) {
      var i, scanned, token, len, ch,
          start = state.pos,
          marker = state.src.charCodeAt(start);

      if (silent) { return false; }

      if (marker !== 0x2B/* + */) { return false; }

      scanned = state.scanDelims(state.pos, true);
      len = scanned.length;
      ch = String.fromCharCode(marker);

      if (len < 2) { return false; }

      if (len % 2) {
        token         = state.push('text', '', 0);
        token.content = ch;
        len--;
      }

      for (i = 0; i < len; i += 2) {
        token         = state.push('text', '', 0);
        token.content = ch + ch;

        if (!scanned.can_open && !scanned.can_close) { continue; }

        state.delimiters.push({
          marker: marker,
          length: 0,     // disable "rule of 3" length checks meant for emphasis
          jump:   i / 2, // 1 delimiter = 2 characters
          token:  state.tokens.length - 1,
          end:    -1,
          open:   scanned.can_open,
          close:  scanned.can_close
        });
      }

      state.pos += scanned.length;

      return true;
    }


    // Walk through delimiter list and replace text tokens with tags
    //
    function postProcess(state, delimiters) {
      var i, j,
          startDelim,
          endDelim,
          token,
          loneMarkers = [],
          max = delimiters.length;

      for (i = 0; i < max; i++) {
        startDelim = delimiters[i];

        if (startDelim.marker !== 0x2B/* + */) {
          continue;
        }

        if (startDelim.end === -1) {
          continue;
        }

        endDelim = delimiters[startDelim.end];

        token         = state.tokens[startDelim.token];
        token.type    = 'ins_open';
        token.tag     = 'ins';
        token.nesting = 1;
        token.markup  = '++';
        token.content = '';

        token         = state.tokens[endDelim.token];
        token.type    = 'ins_close';
        token.tag     = 'ins';
        token.nesting = -1;
        token.markup  = '++';
        token.content = '';

        if (state.tokens[endDelim.token - 1].type === 'text' &&
            state.tokens[endDelim.token - 1].content === '+') {

          loneMarkers.push(endDelim.token - 1);
        }
      }

      // If a marker sequence has an odd number of characters, it's splitted
      // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
      // start of the sequence.
      //
      // So, we have to move all those markers after subsequent s_close tags.
      //
      while (loneMarkers.length) {
        i = loneMarkers.pop();
        j = i + 1;

        while (j < state.tokens.length && state.tokens[j].type === 'ins_close') {
          j++;
        }

        j--;

        if (i !== j) {
          token = state.tokens[j];
          state.tokens[j] = state.tokens[i];
          state.tokens[i] = token;
        }
      }
    }

    md.inline.ruler.before('emphasis', 'ins', tokenize);
    md.inline.ruler2.before('emphasis', 'ins', function (state) {
      var curr,
          tokens_meta = state.tokens_meta,
          max = (state.tokens_meta || []).length;

      postProcess(state, state.delimiters);

      for (curr = 0; curr < max; curr++) {
        if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
          postProcess(state, tokens_meta[curr].delimiters);
        }
      }
    });
  };

  return markdownItIns;

})));
    
},{}]},{},[1])(1)
});    
