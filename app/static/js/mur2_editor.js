/* hide and show div of the result */
function hide_result() {
    var y = document.getElementsByClassName("source_side");
    var x = document.getElementsByClassName("result_side");
    var i;
    for (i = 0; i < x.length; i++) {
        if (x[i].classList.contains('hideitem')) {
            x[i].classList.remove('hideitem');
            x[i].classList.add('displayitem');
            x[i].classList.add('halfsize');
            y[i].classList.remove('fullsize');
            y[i].classList.add('halfsize');
        } else {
            x[i].classList.add('hideitem');
            x[i].classList.remove('displayitem');
            y[i].classList.add('fullsize');
            y[i].classList.remove('halfsize');
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
        wrap = '^['+text+'] '
    }



    // update the area
    if (action === "italic" || action === "strong" || action === "code" || action === "latex" || action === "heading") {
        window.selectedTextarea.value =
            field.value.substring(0, start) +
            wrap1 + text.trim() + wrap2 +
            field.value.substring(end);
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
// used in the Abstract and the Title
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
    var msgbox = document.getElementById("msg")
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
    
async function wordpress2(link, id) {
    // save the wordpressid if it is not an anonimus article    
        fd = new FormData();    
        var article_id = document.querySelector('meta[name="article_id"]').content
        fd.append('article_id', article_id);
        fd.append("destination", "wp");
        fd.append("wpcom_id", id)
        xhr = new XMLHttpRequest();
        xhr.open('post', '/export_data', true);
        xhr.send(fd);
        alarming(xhr, "Published on "+link);
}

/* commit in Wordpress.com by cokkies */
async function wordpress_on_fly() {
    var msgbox = document.getElementById("msg")
    
    var texttype = document.querySelector('meta[name="texttype"]').content;
    if (texttype.trim() == 'article') {
        // get cookies
        var access_token = getCookie("mur2_wpc_accesstoken");
        var address = getCookie("mur2_wpc_sideid");
        if ( access_token === "" ) {
            msgbox.style.color = "red";
            msgbox.innerHTML = "Error: You do not loged in in Wordpress.com";
        };
        
        // if it is not a new article get the id
        var article_id = document.querySelector('meta[name="article_id"]').content
        // ???
        
        
    
        // get the Article data
        var htmldata = new Blob([parserCollection.getDisplayedResult()], {
            type: 'text/html;charset=utf-8'
        });
        var htmltext = await htmldata.text();    
        var article_title = document.getElementById('title-source').value;
        var article_abstract = document.getElementById('abstact-source').value;   
    
        // publish in Wordpress.com
        var fd = new FormData();
        fd.append('title', article_title  );
        fd.append('status', 'private');
        fd.append('content',  htmltext );
        fd.append('excerpt', article_abstract);
        fd.append('format', 'standard');
        console.log(htmldata);
                
        var xhr = new XMLHttpRequest();
        xhr.open('post', 'https://public-api.wordpress.com/wp/v2/sites/'+address+'/posts', true);      
        xhr.setRequestHeader('Authorization', 'Bearer ' + decodeURIComponent( access_token ) )
        xhr.send(fd);
        xhr.onload = function() {
            if (xhr.status != 201) { // analyze HTTP status of the response
                msgbox.style.color = "red";
                msgbox.innerHTML = "Error: " + xhr.statusText + " - " + xhr.response  ;
            } else { 
                var wc2answer = JSON.parse(xhr.response);
                msgbox.style.color = "green";
                msgbox.innerHTML = "Published on " + wc2answer.link  ; 
                
                wordpress2(wc2answer.link, wc2answer.id);
            }
        };  
        
        // clear msg
        if (xhr.status != 200) {
            await sleep(5000);
        } else  {
            await sleep(2000);
        }
        msgbox.innerHTML = "";
    }
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


async function generate_from_md(destination) {
    var article_title = document.getElementById('title-source').value;
    var article_abstract = document.getElementById('abstact-source').value;
    var mddata = new Blob([parserCollection.getSource()], {type: 'text/markdown;charset=utf-8'});
    var endnotetext = document.querySelector('meta[name="endnotetext"]').content
    var language = document.querySelector('meta[name="mur2language"]').content
    var fd = new FormData();
    
    var msgbox = document.getElementById("msg")
    msgbox.innerHTML = "Working";
    msgbox.style.color = "green";
    
    fd.append("destination", destination);
    fd.append("mdfile", mddata, "article_text.md");
    fd.append('article_title', article_title);
    fd.append('article_abstract', article_abstract);
    fd.append('endnotetext', endnotetext);
    fd.append('language', language);
    var xhr = new XMLHttpRequest();
    /* need to receive file back */
    xhr.responseType = 'blob';
    xhr.open('post', '/export_data', true);
    xhr.send(fd)
    
    xhr.onload = function() {
        if (xhr.status != 200) { // analyze HTTP status of the response
            
            msgbox.style.color = "red";
            msgbox.innerHTML = "Error: " + xhr.statusText + " - " + xhr.response  ;
            
        } else { // save the result   
            var blob = this.response;
            var contentDispo = this.getResponseHeader('Content-Disposition');
            if ( destination === "latex" ) {
                saveAs(blob, 'mur2.tex');                       
            } else {                
                saveAs(blob, 'mur2.pdf');                
            }
        }
        
    };
    
    if (xhr.status != 200) {
        await sleep(5000);
        // clear msg
        msgbox.innerHTML = "";
    } else {
        msgbox.innerHTML = "";
    }
    
    
}
