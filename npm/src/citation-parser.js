"use strict";
exports.__esModule = true;
exports.parsePreSuffix = exports.parseCitationLabel = exports.parseCitationKey = exports.parseCitationItem = exports.parseCitationItems = void 0;
var locator_js_1 = require("./locator.js");
// parse all of the citation
var parseCitationItems = function (state, start, max, labelEnd, sys, defaultLocale, renderInline, idToKey) {
    var items = [];
    var pos = start;
    while (pos < max && pos < labelEnd) {
        var possibleItem = exports.parseCitationItem(state, pos, max, sys, defaultLocale, renderInline, idToKey);
        if (!possibleItem)
            break;
        var item = possibleItem[0], afterItem = possibleItem[1];
        items.push(item);
        pos = afterItem;
        if (state.src.charCodeAt(pos) !== 0x3b /* ; */) {
            break;
        }
        pos++;
        while (state.src.charCodeAt(pos) === 0x20 /* SPACE */) {
            pos++;
        }
    }
    if (items.length === 0)
        return;
    return [items, pos];
};
exports.parseCitationItems = parseCitationItems;
// parse the individual citations
var parseCitationItem = function (state, start, max, possible, defaultLocale, renderInline, idToKey) {
    var _a;
    var suppressAuthor = state.src.charAt(start) === "-";
    if (suppressAuthor)
        start++;
    var possibleKey = exports.parseCitationKey(state, start, max);
    if (!possibleKey)
        return;
    var id = possibleKey[0], posAfterKey = possibleKey[1];
    var _b = exports.parsePreSuffix(state, posAfterKey, renderInline), prefix = _b[0], postNote = _b[1], afterLabel = _b[2];
    var normalizedId = idToKey ? idToKey.get(id) : id;    
    var _c = postNote
        ? locator_js_1.getLocator(postNote, possible)
        : { locator: undefined, label: undefined, suffix: undefined }, locator = _c.locator, label = _c.label, suffix = _c.suffix;
    return [
        {
            id: id,
            prefix: prefix,
            locator: locator,
            suffix: suffix,
            label: label,
            "suppress-author": suppressAuthor
        },
        afterLabel,
    ];
};
exports.parseCitationItem = parseCitationItem;
var parseCitationKey = function (state, start, max) {
    if (start + 1 >= max)
        return undefined;
    if (state.src.charCodeAt(start) !== 0x40 /* @ */)
        return undefined;
    if (!/[\w\d_]/.test(state.src.charAt(start + 1)))
        return undefined;
    var pos = start + 1;
    var key = "";
    while (pos < max && /[\w\d_:.#$%&-+?<>~/]/.test(state.src.charAt(pos))) {
        key += state.src.charAt(pos);
        pos++;
    }
    return [key, pos];
};
exports.parseCitationKey = parseCitationKey;
var parseCitationLabel = function (state, start) {
    var labelEnd = parseLinkLabel(state, start);
    if (labelEnd < 0)
        return [undefined, start];
    var label = state.src.substring(start, labelEnd);
    return [label, labelEnd];
};
exports.parseCitationLabel = parseCitationLabel;
var parsePreSuffix = function (state, start, renderInline) {
    var _a;
    if (state.src.charCodeAt(start) !== 0x7b)
        return [undefined, undefined, start];
    var _b = exports.parseCitationLabel(state, start + 1), suffix = _b[0], end = _b[1];
    if (suffix === undefined)
        return [undefined, undefined, start];
    if (state.src.charCodeAt(end + 1) !== 0x7b)
        return [undefined, suffix, end + 1];
    var prefix = suffix ? renderInline(suffix) : undefined;
    _a = exports.parseCitationLabel(state, end + 2), suffix = _a[0], end = _a[1];
    return [prefix, suffix, end + 1];
};
exports.parsePreSuffix = parsePreSuffix;
var parseLinkLabel = function (state, start, disableNested) {
    if (disableNested === void 0) { disableNested = false; }
    var found = false;
    var marker;
    var prevPos;
    var labelEnd = -1;
    var max = state.posMax;
    var oldPos = state.pos;
    state.pos = start + 1;
    var level = 1;
    while (state.pos < max) {
        marker = state.src.charCodeAt(state.pos);
        if (marker === 0x7d /* } */) {
            level--;
            if (level === 0) {
                found = true;
                break;
            }
        }
        prevPos = state.pos;
        state.md.inline.skipToken(state);
        if (marker === 0x7b /* { */) {
            if (prevPos === state.pos - 1) {
                // increase level if we find text `{`, which is not a part of any token
                level++;
            }
            else if (disableNested) {
                state.pos = oldPos;
                return -1;
            }
        }
    }
    if (found) {
        labelEnd = state.pos;
    }
    // restore old state
    state.pos = oldPos;
    return labelEnd;
};
