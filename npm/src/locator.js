/*
* This file has taken from the: https://github.com/DerDrodt/markdown-it-bibliography project at 2021-05 
*    The markdown-it-bibliography  is Daniel Drodt (daniel@drodt.info) works and published under MIT license 
*
*/
"use strict";
exports.__esModule = true;
exports.getLocator = void 0;

// check the actuall citation have got label
var getLabel = function (s, possible) {    
    var label = undefined;
    var searchTerm = "";
    var i = 0;
    for (var _i = 0, _a = s.split(""); _i < _a.length; _i++) {
        var c = _a[_i];
        searchTerm += c;
        if (searchTerm in possible) {
            label = possible[searchTerm];
            i = searchTerm.length;
        }
    }
    return [label, s.substring(i)];
};
var item = function (s) {
    var re = /^(\d+|[ivxlcdm]+|[IVXLCDM]+)(.*)$/;
    var match = re.exec(s);
    if (!match)
        return false;
    var m = match[1], rest = match[2];
    rest = rest.trim();
    var double = restOfRange(rest, re, "--");
    var single = restOfRange(rest, re, "-");
    var slash = restOfRange(rest, re, "/");
    if (double) {
        m += double[0];
        rest = double[1];
    }
    else if (single) {
        m += single[0];
        rest = single[1];
    }
    else if (slash) {
        m += slash[0];
        rest = slash[1];
    }
    return [m, rest];
};
var restOfRange = function (s, re, rangeSymb) {
    var rre = new RegExp("^" + rangeSymb + "[\\diIvVxXlLcCdDmM]");
    if (rre.test(s)) {
        var m = "–";
        s = s.substring(rangeSymb.length);
        var match2 = re.exec(s);
        if (!match2)
            return false;
        var m2 = match2[1], r = match2[2];
        m += m2;
        r = r.trim();
        return [m, r];
    }
    return false;
};
var items = function (s) {
    var possibleItem = item(s);
    if (!possibleItem)
        return false;
    var i = possibleItem[0], r = possibleItem[1];
    while (r[0] === "," || r[0] === ";" || r[0] === "&") {
        var sep = r[0] === "&" ? " &" : r[0];
        var oldR = r;
        r = r.substring(1).trim();
        var pi = item(r);
        if (pi) {
            i += sep + " " + pi[0];
            r = pi[1];
        }
        else {
            r = oldR;
            return [i, r];
        }
    }
    return [i, r];
};
var getLocator = function (s, loc) {
    var _a = getLabel(s, loc), label = _a[0], afterLabel = _a[1];
    var is = items(afterLabel.trim());
    var locator;
    var suffix;
    if (is) {
        locator = is[0], suffix = is[1];
    }
    return { label: label, locator: locator, suffix: suffix };
};
exports.getLocator = getLocator;
