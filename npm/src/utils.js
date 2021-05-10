'use strict';

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
module.exports = {


/**
 * Find the index of a maximum value in values array
 * which is less than maxValue.
 *
 * @param maxValue
 * @param values
 *
 * @returns {object}
 */
findBisect: function(maxValue, values) {
    var a = 0,
        b = values.length - 1,
        f_a = values[a];

    if (f_a >= maxValue) {
        return {
            val: a,
            part: 0
        };
    }

    var f_b = values[b];
    if (f_b < maxValue) {
        return {
            val: b,
            part: 0
        };
    }

    while (b - a > 1) {
        var c = a + Math.round((b - a) / 2),
            f_c = values[c];

        if (f_c >= maxValue) {
            b = c;
            f_b = f_c;
        } else {
            a = c;
            f_a = f_c;
        }
    }

    return {
        val: a,
        part: (maxValue - f_a) / (f_b - f_a)
    };
},

/**
 * Count the number of occurrences of a substring in a string
 *
 * @param substr
 * @param str
 * @returns {number}
 */
substrCount: function(substr, str) {
    var count = -1,
        index = -2;

    while (index != -1) {
        count++;
        index = str.indexOf(substr, index + 1)
    }

    return count;
},

/**
 * Selects the content of the given DOM node.
 *
 * @param eNode
 */
selectText: function(eNode) {
    if (!window.getSelection) {
        return;
    }

    var selection = window.getSelection(),
        range = document.createRange();

    range.selectNodeContents(eNode);
    selection.removeAllRanges();
    selection.addRange(range);
},

/**
 * Realistic animation module based on one-dimensional physical model.
 *
 * @param positionGetter
 * @param positionSetter
 * @constructor
 */
Animator: function(positionGetter, positionSetter) {
    var x = 0,
        x1 = 0,
        x2 = 0,
        v = 0,
        animationTime = 200,
        timerId,
        startedAt = null;

    var loop = function(timestamp) {
        if (startedAt === null) {
            startedAt = timestamp;
        }

        var moveTime = timestamp - startedAt;

        if (moveTime < moveDuration) {
            // New position and velocity
            x = x2 + A * (Math.cos(omega * (moveTime - moveDuration)) - 1);
            v = A * omega * (Math.sin(omega * (moveDuration - moveTime)));

            positionSetter(x);

            timerId = requestAnimationFrame(loop);

            if (isReInit) {
                /**
                 * If the position has been forced, we run the animation again.
                 */
                initMotion(reInitPosition, x);
                isReInit = false;
                startedAt = timestamp;
            }
        } else {
            // Stop the animation
            startedAt = null;

            v = 0;
            positionSetter(x2);
            cancelAnimationFrame(timerId);

            if (isReInit) {
                isReInit = false;
            }
        }
    };

    /**
     * The moveDuration of animation. It can be less than animationTime in case of high speed.
     */
    var moveDuration;

    /**
     * Motion parameters. See the loop formulas.
     */
    var A, omega;

    /**
     * Flag fired when the final position has been changed during running amination.
     */
    var isReInit = false;

    /**
     * New value for final position (that has been changed during running amination).
     */
    var reInitPosition;

    /**
     * Calculate parameters A and omega for the position given by formula
     *
     * x(t) = x0 + A * (Math.cos(omega * (t - t0)) - 1);
     *
     * @param newPosition
     * @param oldPosition
     */
    function initMotion(newPosition, oldPosition) {
        var k;
        x2 = newPosition;
        x1 = oldPosition;

        if (Math.abs(v) < 0.00001) {
            // Rest
            k = Math.PI;
            moveDuration = animationTime;
        } else {
            // Motion

            var alpha = (x2 - x1) / v / animationTime; // Motion parameter

            /**
             * Instead of solving non-linear equation alpha * k = tan(k/2)
             * we use approximation 0.5/a = 1 - (k/pi)^2
             */
            if (alpha < 0 || alpha > 0.5) {
                k = Math.PI * Math.sqrt(1 - 0.5 / alpha);
            } else {
                k = 0.1;
            }

            /**
             * After approximate value of k is determined, we redefine alpha
             * since its value affects the animation. It means that the total
             * animation duration (moveDuration) differs from animationTime.
             * However, the difference does not impact the user experience.
             */
            var alpha1 = (1 - Math.cos(k)) / k / Math.sin(k);
            moveDuration = (x2 - x1) / alpha1 / v;
        }

        omega = k / moveDuration;
        A = (x2 - x1) / (1 - Math.cos(k));
    }

    /**
     * Public control method
     *
     * @param nextPos
     */
    this.setPos = function(nextPos) {
        isReInit = (startedAt !== null);
        if (!isReInit) {
            x = positionGetter();
            initMotion(nextPos, x);
            timerId = requestAnimationFrame(loop);
        } else {
            reInitPosition = nextPos;
        }
    };

    this.stop = function() {
        startedAt = null;
        v = 0;
        cancelAnimationFrame(timerId);
        isReInit = false;
    };
},

escapeRegExp: function(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
},

/**
 *
 * @constructor
 */
ImagePreloader: function() {
    var data = {},
        uniqueIndex = 0;
    var document;

    function loadImage(url, prefix) {
        return new Promise(function (resolve, reject) {
            let request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.s2Url = url;
            request.prefix = prefix; // pass prefix to the request
            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    resolve(request.responseText)
                } else {
                    reject({
                        status: request.status,
                        statusText: xhr.statusText
                    });
                }
            };
            request.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            request.send();
        });
    }

    this.onLoad = async function(url, callback, prefix, doc) {
        document = doc;
        if (!data[url]) {
            var svg = await loadImage(url, prefix);            
            data[url] = {
                svg: svg,
                baseline: null,
                request: null,
                callback: callback
            };
            setImage(url, svg, prefix)            
        } else if (data[url].svg !== null) {
            callback(url, data[url].svg, data[url].baseline, prefix)
        }
        // In case of duplicate pictures we skip duplicates (when data[url].svg === null)
    };

    /**
     * Make ids in svg unique across the html code by adding a prefix.
     *
     * @param svg
     * @returns {*}
     */
    function makeSvgIdsUnique(svg) {
        var m = svg.match(/id=["']([^"']*)["']/g);

        if (!m) {
            return svg;
        }

        var i = m.length,
            id, newId, curStr;

        for (; i--;) {
            curStr = m[i];
            id = curStr.match(/id=["']([^"']*)["']/)[1];
            newId = 's' + uniqueIndex + id;
            var regex = /curStr/g;
            var regex2 = /#id/g;
            svg = svg.replace(regex, 'id="' + newId + '"')
                  .replace(regex2, '#' + newId);
        }

        uniqueIndex++;

        return svg;
    }

    /**
     * Stores sizes, source and removes the xhr object.
     * @param url
     * @param svg
     */
    var setImage = function(url, svg, prefix) {
        var urlData = data[url];
        if (!urlData) {
            return;
        }

        svg = makeSvgIdsUnique(svg);

        var m = svg.match(/postMessage\((?:&quot;|")([\d\|\.\-eE]*)(?:&quot;|")/); // ["&quot;2.15299|31.42377|11.65223|&quot;", "2.15299|31.42377|11.65223|"]

        if (m) {
            var baselineShift = m && m[1] ? m[1].split('|').shift() : 0; // 2.15299
        } else {
            // svg can be empty like "<svg xmlns="http://www.w3.org/2000/svg"/>"
            // Mark as something is wrong.
            baselineShift = null;
        }

        urlData.callback(url, svg, baselineShift, prefix);

        urlData.svg = svg; // we save the SVG
        urlData.baseline = baselineShift;
        urlData.request = null; // as we have SVG do not need the request any more
        urlData.callback = null;
    };

    /**
     * External API
     *
     * @param url
     * @returns {null}
     */
    this.getImageDataFromUrl = async function(url) {
        var urlData = data[url];
        return urlData ? urlData : null;
    };
},

/**
 *
 * @param preloader
 * @param protocol  Needed for support the "file:" protocol.
 * loaderid -- is a prefix to disting different image loaders
 * @constructor
 */
ImageLoader: function(preloader, protocol, loaderid) {
    var curItems = [], // current formula content
        prevItems = [], // previous formula content
        map = {}, // maps formula content to index
        n = 0, // current formula number

        placeholderTimer = null,
        placeholderIndex = null,
        placeholderUrl = null,
        blockcount = 1;
    var document;

    this.loaderid = loaderid;

    function buildMap() {
        map = {};
        for (var i = n; i--;) {
            var url = curItems[i];

            if (typeof map[url] === 'undefined') {
                map[url] = [i]
            } else {
                map[url].push(i);
                map[url].sort(function(a, b) {
                    return b - a
                });
            }
        }
    }

    /**
     * Start parsing process.
     */
    this.reset = function() {
        curItems = [];
        n = 0;
        blockcount = 1;
    };

    /**
     * Insert SVG images.
     *
     * @param url
     * @param svg
     * @param baselineShift
     */
    var callback = function(url, svg, baselineShift, prefix, document) {
        var indexes = map[url],
            i;
        if (indexes && (i = indexes.length)) {
            for (; i--;) {
                var index = indexes[i];

                var block = insertPicture(index, svg, baselineShift, index === placeholderIndex ? 'fade-in' : 'replace', prefix, document);
                if (block) {
                    blockcount += 1;
                }

                if (index === placeholderIndex) {
                    // Clear the fade out timer if the new image has just bee
                    clearTimeout(placeholderTimer);
                    placeholderIndex = null;
                    placeholderUrl = null;
                }
            }
        }
    };

    /**
     * Mark formula as loading.
     * Use previous image but transparent.
     *
     * @param index
     * @param svg
     * @param baselineShift
     * @param mode One of 'replace', 'fade-in', 'fade-out'
     */
    function insertPicture(index, svg, baselineShift, mode, prefix) {
        var id = prefix + 's2tex_' + index,
            oldSvgNode = document.getElementById(id),
            parentNode = oldSvgNode.parentNode,
            startOpacity = '1', // mode == 'fade-in' ? '0.5' : '1', // sometimes images opacity can be '1' yet. How can one track it?
            finalOpacity = mode == 'fade-out' ? '0.5' : '1',
            newSvgAttrs = '<svg class="svg-preview" id="' + id + '" ';

        /* Numbering equlation
        /* check the parent is block or not 
         *   this is a hack at the moment: just check the parent have text-align: center style
         */
        var block = false;
        // if ( parentNode.style.textAlign === 'center' && parentNode.id === "" ) {
        if (parentNode.style.textAlign === 'center') {
            // if labeled we add number otherwise not 
            var labeled = parentNode.id.match(/eq\:.*$/);
            if (labeled && parentNode.childElementCount == 1) {
                block = true
                    // add printable number
                var labelNode = document.createElement('em');
                labelNode.innerHTML = "(" + blockcount + ")";
                var spanNode = document.createElement('span');
                // parentNode.insertBefore(spanNode, oldSvgNode);
                parentNode.insertBefore(labelNode, oldSvgNode);
                parentNode.appendChild(spanNode);
                //parentNode.appendChild(labelNode);            
            }
        }
        var lheight = svg.match(/ height="[\.\d]+" /g)[0].trim().split("=")[1].replace(/"/g, '')
        if (baselineShift === null) {
            // svg has been loaded but something went wrong.
            newSvgAttrs += 'width="13px" height="13px" ';
        } else {
            newSvgAttrs += 'style="--latex_align: ' + (-baselineShift) + 'pt; --latex_height: ' + lheight + 'px; vertical-align:' + (-baselineShift) + 'pt; opacity: ' + startOpacity + '" ';
        }

        // Polyfill for outerHTML
        var divNode = document.createElement('div');
        divNode.innerHTML = svg.replace('<svg ', newSvgAttrs);

        var newSvgNode = divNode.firstElementChild; // there can be comments before <svg>
        divNode.removeChild(newSvgNode);

        parentNode.insertBefore(newSvgNode, oldSvgNode);
        parentNode.removeChild(oldSvgNode);

        if (finalOpacity != startOpacity) {
            placeholderTimer = setTimeout(function() {
                document.getElementById(id).style.opacity = finalOpacity;
            }, 0);
        }
        return block;
    }

    /**
     * Generate the picture HTML code while parsing and store the state.
     *
     * @param formula
     * @returns {string}
     */
    this.getHtmlStub = function(formula) {
        curItems[n] = protocol + '//mur2.co.uk/math/svg/' + encodeURIComponent(formula);

        var html = '<span id="' + this.loaderid + 's2tex_' + n + '"></span>';

        n++;

        return html;
    };

    /**
     * Finish the parsing process.
     */
    this.fixDom = async function(doc) {
        document = doc;
        buildMap();
        for (var i = 0; i < n; i++) {
            await preloader.onLoad(curItems[i], callback, this.loaderid, document);
        }

        if (placeholderIndex !== null) {
            var data = await preloader.getImageDataFromUrl(placeholderUrl);
            if (data !== null && data.callback === null) {
                var block = insertPicture(placeholderIndex, data.svg, data.baseline, 'fade-out', this.loaderid);
                if (block) {
                    blockcount += 1;
                }
            }
        }

        prevItems = curItems.slice(0);
    };
},

/**
 * Access to the map between blocks in sync scroll.
 *
 * @param mapBuilder
 * @constructor
 */
ScrollMap: function (mapBuilder) {
    var map = null;

    this.reset = function() {
        map = [null, null];
    };

    this.getPosition = function(eBlockNode, fromIndex, toIndex) {
        var offsetHeight = eBlockNode.offsetHeight;
        var scrollTop = eBlockNode.scrollTop;

        if (scrollTop == 0) {
            return 0;
        }

        if (map[fromIndex] === null) {
            map = mapBuilder();
        }

        var maxMapIndex = map[fromIndex].length - 1;
        if (map[fromIndex][maxMapIndex] <= scrollTop + offsetHeight) {
            return map[toIndex][maxMapIndex] - offsetHeight
        }

        var scrollShift = offsetHeight / 2,
            scrollLevel = scrollTop + scrollShift,
            blockIndex = findBisect(scrollLevel, map[fromIndex]),
            srcScrollLevel = parseFloat(map[toIndex][blockIndex.val] * (1 - blockIndex.part));

        if (map[toIndex][blockIndex.val + 1]) {
            srcScrollLevel += parseFloat(map[toIndex][blockIndex.val + 1] * blockIndex.part);
        }

        return srcScrollLevel - scrollShift;
    }
}, 

/**
 * Controls sync scroll of the source and preview blocks
 *
 * @param scrollMap
 * @param animatorSrc
 * @param animatorResult
 * @param eSrc
 * @param eResult
 * @param eContainer
 * @constructor
 */
SyncScroll: function(scrollMap, animatorSrc, animatorResult, eSrc, eResult, eContainer) {
    // Synchronize scroll position from source to result
    var syncResultScroll = function() {
        animatorResult.setPos(scrollMap.getPosition(eSrc, 0, 1));
    };

    // Synchronize scroll position from result to source
    var syncSrcScroll = function() {
        animatorSrc.setPos(scrollMap.getPosition(eResult, 1, 0));
    };

    this.switchScrollToSrc = function() {
        eResult.removeEventListener('scroll', syncSrcScroll);
        eSrc.removeEventListener('scroll', syncResultScroll);
        eSrc.addEventListener('scroll', syncResultScroll);
        eContainer.id = 'container-block-source';
        // animatorSrc.stop();
    };

    this.switchScrollToResult = function() {
        eSrc.removeEventListener('scroll', syncResultScroll);
        eResult.removeEventListener('scroll', syncSrcScroll);
        eResult.addEventListener('scroll', syncSrcScroll);
        eContainer.id = 'container-block-result';
        // animatorResult.stop();
    }
},

debounce: function(func, wait, options) {
    var args,
        maxTimeoutId,
        result,
        stamp,
        thisArg,
        timeoutId,
        trailingCall,
        lastCalled = 0,
        leading = false,
        maxWait = false,
        trailing = true;

    if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = wait < 0 ? 0 : (+wait || 0);
    if (typeof options === 'object') {
        leading = !!options.leading;
        maxWait = 'maxWait' in options && Math.max(+options.maxWait || 0, wait);
        trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function cancel() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
        }
        lastCalled = 0;
        maxTimeoutId = timeoutId = trailingCall = undefined;
    }

    function complete(isCalled, id) {
        if (id) {
            clearTimeout(id);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
                args = thisArg = undefined;
            }
        }
    }

    function delayed() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0 || remaining > wait) {
            complete(trailingCall, maxTimeoutId);
        } else {
            timeoutId = setTimeout(delayed, remaining);
        }
    }

    function maxDelayed() {
        complete(trailing, timeoutId);
    }

    function debounced() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
            var leadingCall = leading && !timeoutId;
        } else {
            if (!maxTimeoutId && !leading) {
                lastCalled = stamp;
            }
            var remaining = maxWait - (stamp - lastCalled),
                isCalled = remaining <= 0 || remaining > maxWait;

            if (isCalled) {
                if (maxTimeoutId) {
                    maxTimeoutId = clearTimeout(maxTimeoutId);
                }
                lastCalled = stamp;
                result = func.apply(thisArg, args);
            } else if (!maxTimeoutId) {
                maxTimeoutId = setTimeout(maxDelayed, remaining);
            }
        }
        if (isCalled && timeoutId) {
            timeoutId = clearTimeout(timeoutId);
        } else if (!timeoutId && wait !== maxWait) {
            timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
            isCalled = true;
            result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
            args = thisArg = undefined;
        }
        return result;
    }
    debounced.cancel = cancel;
    return debounced;
}
};