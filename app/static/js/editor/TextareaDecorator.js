/**
 * TextareaDecorator.js
 * written by Colin Kuebler 2012
 * Updated by Roman Parpalak, 2015.
 * Part of LDT, dual licensed under GPLv3 and MIT
 * Builds and maintains a styled output layer under a textarea input layer
 * Updated by Sajó, Zsolt Attila, 2020 for mur2 editor
 */
function TextareaDecorator(textarea, parser) {
    /* INIT */
    var api = this,
        output;

    if (textarea.className !== 'ldt-textarea') {
        // construct editor DOM
        var parent = document.createElement("div");
        output = document.createElement("pre");
        output.className = 'ldt-pre';
        parent.appendChild(output);

        var label = document.createElement("label");
        label.className = 'ldt-label';

        parent.appendChild(label);

        // replace the textarea with RTA DOM and reattach on label
        textarea.parentNode.replaceChild(parent, textarea);
        label.appendChild(textarea);

        // transfer the CSS styles to our editor
        parent.className = 'ldt ' + textarea.className;
        textarea.className = 'ldt-textarea';
    } else {
        output = textarea.parentNode.previousSibling;
    }

    /**
     * Composes token class.
     *
     * Tokens are grouped into blocks.
     * Also a token have its own type.
     *
     * @param blockClass  token block type
     * @param inlineClass token type
     * @returns {string}
     */
    function getClass(blockClass, inlineClass) {
        return blockClass + ' ' + inlineClass;
    }

    /**
     * Detect changes between a token and its DOM representation.
     *
     * @param newToken hash object
     * @param oldNode  DOM node converted from old hash object
     *
     * @returns {boolean}
     */
    function compareTokens(newToken, oldNode) {
        if (newToken.token !== oldNode.textContent) {
            return false;
        }

        var className = oldNode.className,
            oldBlock = className.slice(0, className.indexOf(' '));

        if (oldBlock !== newToken.block) {
            return false;
        }

        var line = oldNode.getAttribute('data-line');

        if (line && line != newToken.line) {
            return false;
        }

        return true;
    }

    /**
     * Updates a DOM node by a token
     *
     * @param node
     * @param token
     * @param inlineClass
     */
    function fillTokenNode(node, token, inlineClass) {
        node.textContent = node.innerText =  token.token ;

        var c = getClass(token.block, inlineClass);

        if (token.line) {
            node.className = c + ' block-start';
            node.setAttribute('data-line', token.line);
            
        } else {
            node.className = c ;
        }
    }

    // coloring algorithm
    var color = function(input, output, parser) {
        var lastChar = input !== '' && input.substring(input.length - 1) || '';
        if (lastChar == "\r" || lastChar == "\n") {
            // Hack for the case when the last line in textarea is empty
            input += ' ';
        }

        var nodes = output.childNodes,
            tokens = parser.tokenize(input),
            firstDiff, lastDiffNew, lastDiffOld;

        // find the first difference
        for (firstDiff = 0; firstDiff < tokens.length && firstDiff < nodes.length; firstDiff++) {
            if (!compareTokens(tokens[firstDiff], nodes[firstDiff])) {
                break;
            }
        }

        // trim the length of output nodes to the size of the input
        while (tokens.length < nodes.length) {
            output.removeChild(nodes[firstDiff]);
        }

        // find the last difference
        for (lastDiffNew = tokens.length - 1, lastDiffOld = nodes.length - 1; firstDiff < lastDiffOld; lastDiffNew--, lastDiffOld--) {
            if (!compareTokens(tokens[lastDiffNew], nodes[lastDiffOld])) {
                break;
            }
        }

        // update modified nodes
        for (; firstDiff <= lastDiffOld; firstDiff++) {
            var token = tokens[firstDiff];
            fillTokenNode(nodes[firstDiff], token, parser.identifyInline(token));
        }

        // add in modified nodes
        for (var insertionPt = nodes[firstDiff] || null; firstDiff <= lastDiffNew; firstDiff++) {
            var span = document.createElement("span");
            token = tokens[firstDiff];
            fillTokenNode(span, token, parser.identifyInline(token));
            output.insertBefore(span, insertionPt);
        }
        
        return [firstDiff, lastDiffNew]
    };

    api.input = textarea;
    api.output = output;
    api.recalcHeight = function() {
        api.input.style.height = Math.max(api.output.offsetHeight, 100) + 'px';
    };
    api.update = function() {
        var focusmode_switch = g_focusmode_switch;
        var input = textarea.value;
        if (input) {          
            if ( focusmode_switch ) {                   
                // remove all children
                 while (output.firstChild) {
                     output.removeChild(output.lastChild);
                 }
                // get the current position of the cousor      
                var field = document.getElementById("main-source");
                var coursurpos = field.selectionStart;
                // search for separators before the cursore possition
                var a = field.value.substring(0, coursurpos);              
                var b = field.value.substring(coursurpos);
                var separators = [".", "!","!", "?", "\n", '。' ];
                var firstSeparator = 10000000;
                var lastSeparator = -1;
                for ( var i = separators.length; i--; ) {
                    var first = b.indexOf(separators[i]) ;                    
                    if ( first !== -1 && first < firstSeparator ) {
                        firstSeparator = first;
                    }
                    var last = a.lastIndexOf(separators[i]) ;
                    if ( last > lastSeparator ) {
                        lastSeparator = last;
                    }                    
                }
                lastSeparator += 1;
                firstSeparator += 1;
                // the text before the last sentence
                var notfocused1 = document.createElement("span");
                notfocused1.textContent = notfocused1.innerText  = a.slice(0, lastSeparator);
                notfocused1.className = "notfocused";
                output.appendChild(notfocused1);
                // the focused sentence before the cursor
                var focused = document.createElement("span");
                focused.className = "focused"
                focused.textContent = focused.innerText  =  a.slice(lastSeparator, a.length) + b.slice(0, firstSeparator);
                output.appendChild(focused);
                
                // the text after the focuse
                var notfocused2 = document.createElement("span");
                notfocused2.className = "notfocused"
                notfocused2.textContent = notfocused2.innerText  = b.slice(firstSeparator, b.length);
                output.appendChild(notfocused2);      
            } else {
                var differnces = color(input, output, parser);
                api.recalcHeight();          
            }
        } else {
            // clear the display change becasue of possible memory leek
            while (output.firstChild) {
                output.removeChild(output.lastChild);
            }
        }
    };

    // detect all changes to the textarea,
    // including keyboard input, cut/copy/paste, drag & drop, etc
    if (textarea.addEventListener) {
        // standards browsers: oninput event
        textarea.addEventListener("input", api.update, false);
    } else {
        // MSIE: detect changes to the 'value' property
        textarea.attachEvent("onpropertychange",
            function(e) {
                if (e.propertyName.toLowerCase() === 'value') {
                    api.update();
                }
            }
        );
    }
    // initial highlighting
    api.update();

    return api;
}