(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.markdownitCriticmarkup = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * critic markup                HTML                    LaTeX
    {--[text]--}            <del>[text]</del>                     \st{[text]}
    {++[text]++}            <ins>[text]</ins>                     \underline{[text]}
    {~~[text1]~>[text2]~~}  <del>[text1]</del><ins>[text2]</ins>  \st{[text1]}\underline{[text2]}
    {==[text]==}            <mark>[text]</mark>                   \hl{[text]}
    {>>[text]<<}            <aside>[text]</aside>                 \marginpar{[text]}
  */


'use strict';


/*! markdown-it-criticmarkup 0.0.1-5 https://github.com//GerHobbelt/markdown-it-criticmarkup @license ISC */

/**
 * critic markup                HTML                    LaTeX
    {--[text]--}            <del>[text]</del>                     \st{[text]}
    {++[text]++}            <ins>[text]</ins>                     \underline{[text]}
    {~~[text1]~>[text2]~~}  <del>[text1]</del><ins>[text2]</ins>  \st{[text1]}\underline{[text2]}
    {==[text]==}            <mark>[text]</mark>                   \hl{[text]}
    {>>[text]<<}            <aside>[text]</aside>                 \marginpar{[text]}
  */

/**
 * CriticMarkup rule
 */
function critcmarkup_plugin(md) {
  md.inline.ruler.before('strikethrough', 'critic-markup', (state, silent) => {
    const src = state.src,
          pos = state.pos;

    if (src[pos] === '{' && (src[pos + 1] === '-' && src[pos + 2] === '-' || src[pos + 1] === '+' && src[pos + 2] === '+' || src[pos + 1] === '~' && src[pos + 2] === '~' || src[pos + 1] === '=' && src[pos + 2] === '=' || src[pos + 1] === '>' && src[pos + 2] === '>')) {
      let tag = src.slice(pos + 1, pos + 3);
      let closeTag = tag;

      if (closeTag[0] === '>') {
        closeTag = '<<}';
      } else {
        closeTag += '}';
      }

      let i = pos + 3,
          end = -1,
          content = null;

      while (i < src.length) {
        if (src.startsWith(closeTag, i)) {
          end = i;
          break;
        }

        i += 1;
      }

      if (end >= 0) {
        content = src.slice(pos + 3, end);
      } else {
        return false;
      }

      if (content && !silent) {
        const token = state.push('critic-markup');
        token.content = content;
        token.tag = tag;
        state.pos = end + closeTag.length;
        return true;
      }

      return false;
    }

    return false;
  });
  /**
   * CriticMarkup renderer
   */

  md.renderer.rules['critic-markup'] = (tokens, idx) => {
    const token = tokens[idx],
          tag = token.tag,
          content = token.content;

    if (tag === '--') {
      return `<del>${content}</del>`;
    } else if (tag === '++') {
      return `<ins>${content}</ins>`;
    } else if (tag === '==') {
      return `<mark>${content}</mark>`;
    } else if (tag === '>>') {
      return `<aside>${content}</aside>`;
    } // {~~[text1]~>[text2]~~}


    const arr = content.split('~>');

    if (arr.length === 2) {
      return `<del>${arr[0]}</del><ins>${arr[1]}</ins>`;
    }

    throw new Error(`Error: '~>' not found in critic markup chunk {~~${content}--}`);
  }
}
},{}]},{},[1])(1)
});