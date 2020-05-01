/* hide and show div of the result */
function hide_result() {
    var y = document.getElementsByClassName("source_side");
    var x = document.getElementsByClassName("result_side");
    var i;
    for (i = 0; i < x.length; i++) {
        if (x[i].style.display === "none") {
            x[i].style.display = "inline-block";
            x[i].style.width = "calc(50% - 3px)";
            y[i].style.width = "calc(50% - 3px)";
            y[i].style.padding = "16px";
        } else {
            x[i].style.display = "none";
            y[i].style.width = "calc(100% - 6px)";
            y[i].style.padding = "16px 25%";
        }
    }
}

/* hide and show div of the result */
function show_side_menu() {
    var y = document.getElementById("side_menu");
    if (y.style.display === "none") {
        y.style.display = "inline-block";
    } else {
        y.style.display = "none";
    }
}

var event = new Event('input');

function editorToolbarAction(action, endnote) {
    field = window.selectedTextarea;
    var start = field.selectionStart;
    var end = field.selectionEnd;
    // if there is selection
    var text = field.value.substring(start, end);

    var wrap = "";
    if (action === "italic") {
        wrap1 = "*";
        wrap2 = wrap1;
    } else if (action === "strong") {
        wrap1 = "**";
        wrap2 = wrap1;
    } else if (action === "heading") {
        wrap1 = "# ";
        wrap2 = "\n";
    } else if (action === "code") {
        wrap1 = "\n```\n";
        wrap2 = wrap1;
    } else if (action === "table") {
        wrap = "\n|  |  |\n|--|--|\n|  |  |\n";        
    } else if (action === "latex") {
        wrap1 = "$$ "
        wrap2 = " $$"
    } else if (action === "link") {
        if (text) {
            wrap = "[" + text + "](" + prompt("Please enter URL for the link", "") + ")";
        } else {
            wrap = "[link](" + prompt("Please enter URL for the link", "") + ")";
        }
    } else if (action === "picture") {
        if (text) {
            wrap = "![" + text + "](" + prompt("Please enter URL for picture", "") + ")";
        } else {
            wrap = "![kep](" + prompt("Please enter URL for picture", "") + ")";
        }
    } else if (action === "list") {
        re = /\n/g;
        wrap = "- " + text.replace(re, "\n\- ")
    } else if (action === "numbered_list") {
        re = /\n/g;
        wrap = "1. " + text.replace(re, "\n1\. ")
    } else if (action === "footnote") {
        // random string to identifile footnode
        let r = Math.random().toString(36).substring(7);

        // replace the selection with footnode
        var alltext = field.value.substring(0, start) +
            "<a href=\"#myfootnotea_" + r + "\" name=\"myfootnotes_" + r + "\"><sup>1</sup></a>" +
            field.value.substring(end) + "\n\n<sup id=\"myfootnotea_" + r + "\">[1](#myfootnotes_" + r + ")</sup> -- " + text + "\n";
        // iterate over the all text and recalculate the footnode numbers
        re = /<a href=\"#myfootnotea_\w+\" name=\"myfootnotes_\w+\"><sup>\d+<\/sup><\/a>/g;
        var jelek = alltext.match(re);
        re2 = /\n\n<sup id=\"myfootnotea_\w+\">\[\d+\]\(\#myfootnotes_\w+\)<\/sup> -- .+\n/g;
        var jegyzetek = alltext.match(re2);
        let ii = 0;
        var found = null;
        console.log("jelek: "+jelek+":"+jegyzetek);
        // iterate over the jelek and recualulate they number
        for (i = 0; i < jelek.length; i++) {
            
            // iterate over the jegyzet and replace they number;
            // the jel id
            re = / href=\"#myfootnotea_\w+\" /g;
            var id = jelek[i].match(re);
            id = id[0].replace(" href=\"#myfootnotea_", "").replace("\"", "").trim();
            // found the matching text
            ii = 0;
            for (; ii < jegyzetek.length; ii++) {
                re = new RegExp("myfootnotea_" + id, "g");
                found = jegyzetek[ii].match(re);
                if (found !== null) {
                    console.log("found")
                    break;
                }

            }
            // halvest the nore in the footnode
            re = /\n\n<sup id=\"myfootnotea_\w+\">\[\d+\]\(\#myfootnotes_\w+\)<\/sup> -- /g
            var jegyzettext = jegyzetek[ii].replace(re, '')
            // replace text in the alltext 
            alltext = alltext.replace(jelek[i], "<a href=\"#myfootnotea_" + id + "\" name=\"myfootnotes_" + id + "\"><sup>" + (i + 1) + "</sup></a>");
            // if first we put there a Footnote text
            if ( i === 0) {
                // delete if there was previously
                alltext = alltext.replace("\n# "+endnote+"\n", '');
                // add new
                alltext = alltext + "\n# "+endnote+"\n"
            }
            alltext = alltext.replace(jegyzetek[ii], '') + "\n\n<sup id=\"myfootnotea_" + id + "\">[" + (i + 1) + "](#myfootnotes_" + id + ")</sup> -- " + jegyzettext;
        }
        wrap = alltext;
    }



    // update the area
    if (action === "italic" || action === "strong" || action === "code" || action === "latex" || action === "heading") {
        window.selectedTextarea.value =
            field.value.substring(0, start) +
            wrap1 + text.trim() + wrap2 +
            field.value.substring(end);
    } else if (action === "footnote") {
        window.selectedTextarea.value = wrap
    } else {
        // new areas
        window.selectedTextarea.value =
            field.value.substring(0, start) +
            wrap +
            field.value.substring(end);
    }
    // fire an update on result filed
    field.dispatchEvent(event);
}

// render a text to Latex, not highlighting and any other things
function latex_renderer(input_field) {
    // from editor.js
    var defaults = {
        html: true, // Enable HTML tags in source
        xhtmlOut: false, // Use '/' to close single tags (<br />)
        breaks: false, // Convert '\n' in paragraphs into <br>
        langPrefix: 'language-', // CSS language prefix for fenced blocks
        linkify: true, // autoconvert URL-like texts to links
        typographer: true, // Enable smartypants and other sweet transforms
        quotes: '""\'\'',

        // option for tex plugin
        _habr: {
            protocol: ''
        }, // no protocol for habrahabr markup

        // options below are for demo only
        _highlight: true,
        _strict: false
    };
    var markdownit = window.markdownit;

    var _mdPreview = markdownit(defaults)
        .use(markdownitS2Tex)
        .use(markdownitSub)
        .use(markdownitSup);

    console.log(_mdPreview.render(input_field.value));
    return _mdPreview.render(input_field.value);
}

// update abstract
var abstract_text = document.getElementById("abstact-source");
function update_abstract() {
    document.getElementById("article_abstract").innerHTML = latex_renderer(abstract_text) + "<div class=\"separator\"></div>";
};
if (abstract_text.addEventListener) {
    // standards browsers: oninput event
    abstract_text.addEventListener("input", update_abstract());
} else {
    // MSIE: detect changes to the 'value' property
    abstract_text.attachEvent("onpropertychange", update_abstract());
}

// update title
var abstract_title = document.getElementById("title-source");
function update_title() {
    document.getElementById("article_title").innerHTML = latex_renderer(abstract_title);
};
if (abstract_title.addEventListener) {
    // standards browsers: oninput event
    abstract_title.addEventListener("input", update_title());
} else {
    // MSIE: detect changes to the 'value' property
    abstract_title.attachEvent("onpropertychange", update_title());
}

/* hide and show div of the result */
function show_title() {
    var x = document.getElementsByClassName("title_and_abstract");
    var i;
    var show = true;
    for (i = 0; i < x.length; i++) {
        if (x[i].style.display === "none") {
            x[i].style.display = "inline-block";
        } else {
            x[i].style.display = "none";
            show = false;
        }
    } 
    
    if (show) {
        /* set the othe divs size */
            var y = document.getElementsByClassName("editor_title_and_abstract");
            y[0].style.height = "300px";
            /* #source-block, #result-block, .slider */
            y = document.getElementById("slider");
            y.style.height = "calc(100% - 360px)";
            y = document.getElementById("source-block")
            y.style.height = "calc(100% - 360px)";
            y = document.getElementById("result-block")
            y.style.height = "calc(100% - 360px)";
    } else {
                                /* set the othe divs size */
            var y = document.getElementsByClassName("editor_title_and_abstract");
            y[0].style.height = "30px";
            /* #source-block, #result-block, .slider */
            y = document.getElementById("slider");
            y.style.height = "calc(100% - 90px)";
            y = document.getElementById("source-block")
            y.style.height = "calc(100% - 90px)";
            y = document.getElementById("result-block")
            y.style.height = "calc(100% - 90px)";
    }
} 

/* show and hide two type of menus 
 * -- showid -- the ID of the element which we want to show
*/
function show_mainmenus(showid) {
    var mainelements = ["editor_toolbar", "mur2menu", "choicemenu"];
    for (i = 0; i < mainelements.length; i++) {
        var x = document.getElementById(mainelements[i]);
        if ( showid === mainelements[i] ) {
            x.style.display = "flex";
            x.style.display = "-webkit-flex";
        } else {
            x.style.display = "none";
        }
    }
}

/* function to alarming on the editor page */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function alarming(xhr, sucessmsg) {
    /* check return value */
    var msgbox = document.getElementById("editor_msg")
    xhr.onload = function() {
        if (xhr.status != 200) { // analyze HTTP status of the response
            msgbox.style.color = "red";
            msgbox.innerHTML = "Error: " + xhr.statusText + " - " + xhr.response  ;
        } else { // show the result   
            msgbox.style.color = "green";
            msgbox.innerHTML = sucessmsg;
        }
    };
    
    if (xhr.status != 200) {
        await sleep(5000);
    } else {
        await sleep(2000);
    }
    
    // clear msg
    msgbox.innerHTML = "";
}

/* save Article content */
function save_article() {
    // the markdonw article body text
    var markupdata = new Blob([parserCollection.getSource()], {
        type: 'text/markdown;charset=utf-8'
    });
    var htmldata = new Blob([parserCollection.getDisplayedResult()], {
        type: 'text/html;charset=utf-8'
    });
    // type of the text
    var texttype = document.querySelector('meta[name="texttype"]').content
    // transform the Blob to Form as this easier to process for the 
    var fd = new FormData();
    // add data to the form, so the Flask server able to receive them		// 
    // if Article 
    if (texttype.trim() == 'article') {
        // the article id
        var article_id = document.querySelector('meta[name="article_id"]').content
        // the article abstract and title, later this need to change as they need to be editable
        var article_title = document.getElementById('title-source').value
        var article_abstract = document.getElementById('abstact-source').value
        fd.append("file", markupdata, "article_text.md");
        fd.append("htmlfile", htmldata, "article_text.html");
        fd.append('article_id', article_id);
        fd.append('article_title', article_title);
        fd.append('article_abstract', article_abstract);
        // send data
        var xhr = new XMLHttpRequest();
        xhr.open('post', '/markdownsave', true);
    } else { // if review
        var article_id = document.querySelector('meta[name="review_id"]').content
        var result = document.getElementById('review_result').value
        var standby = document.getElementById('review_standby').value
        var rebel = document.getElementById('review_rebel').value
        fd.append("file", markupdata, "article_text.md");
        fd.append("htmlfile", htmldata, "article_text.html");
        fd.append('review_id', article_id);
        fd.append('result', result);
        fd.append('standby', standby);
        fd.append('rebel', rebel);
        // send data
        var xhr = new XMLHttpRequest();
        xhr.open('post', '/reviewsave', true);
    }
    xhr.send(fd);

    alarming(xhr, "Saved!");
};

function download_result() {
    // should be good to set the type more inteligently
    var blob = new Blob([parserCollection.getDisplayedResult()], {
        type: 'text/html;charset=utf-8'
    });
    saveAs(blob, parserCollection.getDisplayedResultFilename());
};

function upload_source() {

    var eNode = document.getElementById('fileElem');
    // Fire click on file input
    (eNode.onclick || eNode.click || function() {}).call(eNode);
};

/* comit in Wordpress.com by cokkies */
function wordpress_on_fly() {
    
    username = checkCookie("wpc_username", "Wordpress.com username");
    password = checkCookie("wpc_password", "Wordpress.com username");
    address = checkCookie("wpc_home", "Wordpress.com sitename");
    
    var texttype = document.querySelector('meta[name="texttype"]').content;
    if (texttype.trim() == 'article') {
        var htmldata = new Blob([parserCollection.getDisplayedResult()], {
            type: 'text/html;charset=utf-8'
        });
        var article_title = document.getElementById('title-source').value;
        var article_abstract = document.getElementById('abstact-source').value;
        var article_id = document.querySelector('meta[name="article_id"]').content
        var fd = new FormData();
        fd.append("htmlfile", htmldata, "article_text.html");
        fd.append("destination", "wp");
        fd.append('article_title', article_title);
        fd.append('article_abstract', article_abstract);
        fd.append('article_id', article_id);
        // Wordpress com settings
        fd.append('wpc_username', username);
        fd.append('wpc_password', password);
        fd.append('wpc_home', address);
        var xhr = new XMLHttpRequest();
        xhr.open('post', '/export_data', true);
        xhr.send(fd);
        
        alarming(xhr, "Published on Wordpress.com!");
    };    
}

/* make focus mode on last sentence   */
var focusmode_switch = 0;
function focusemode_on() {
    if ( focusmode_switch === 0 ) {
        focusmode_switch = 1;
    } else {
        focusmode_switch = 0;
    }
}
