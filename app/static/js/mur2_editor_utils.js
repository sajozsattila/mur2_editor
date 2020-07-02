/**
 * 
 * (c) Sajó, Zsolt Attila 2020
 * 
 */

/**
 * DOMContentLoaded polyfill
 *
 * @param fn
 */
function documentReady(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function upload_source() {
    var eNode = document.getElementById('fileElem');
    // Fire click on file input
    (eNode.onclick || eNode.click || function() {}).call(eNode);
};


async function download_result(blobs) {
    var result = "";
    for (var b = blobs.length; b--;) {
        var bodytext = blobs[b].getDisplayedResult();
        result += "\n\n" + bodytext;
    }

    // get what is the current preview format
    var outputformat = g_view;

    // merge title, abstract and text
    if (outputformat === 'html' || outputformat === 'htmltex' || outputformat === 'habr' || outputformat === 'src') {
        var blob = new Blob([result], {
            type: 'text/html; charset=UTF-8'
        });
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = outputformat + ".html";
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click(); //this is probably the key - simulating a click on a download link
        delete a;
    } else {
        var blob = new Blob([result], {
            type: 'text/markdown; charset=UTF-8'
        });
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = outputformat + ".md";
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click(); //this is probably the key - simulating a click on a download link
        delete a;
    }
};

function editorToolbarAction(action) {
    if (g_selectedTextarea !== null) {
        console.log(g_selectedTextarea);
        var field = document.getElementById(g_selectedTextarea);
        var start = field.selectionStart;
        var end = field.selectionEnd;
        // if there is selection
        var text = field.value.substring(start, end);

        // is there whitespace in the begining or end
        var leftWhitespace = text.slice(0, 1).trim() === '' ? ' ' : '';
        var rightWhitespace = text.slice(-1).trim() === '' ? ' ' : '';

        var wrap = null;
        if (action === "italic") {
            wrap = "*";
            wrap2 = wrap;
        } else if (action === "strong") {
            wrap = "**";
            wrap2 = wrap;
        } else if (action === "heading") {
            wrap = "# ";
            wrap2 = "\n";
        } else if (action === "code") {
            wrap = "\n```\n";
            wrap2 = wrap;
        } else if (action === "table") {
            wrap = "\n|  |  |\n|--|--|\n|  |  |\n";
        } else if (action === "latex") {
            wrap = "$$ "
            wrap2 = " $$"
        } else if (action === "link") {
            var userinput = prompt("Please enter URL for the link", "");
            if (userinput != null) {
                if (text) {
                    wrap = "[" + text + "](" + userinput + ")";
                } else {
                    wrap = "[link](" + userinput + ")";
                }
            }
        } else if (action === "picture") {
            var userinput = prompt("Please enter URL for picture", "");
            if (userinput != null) {
                if (text) {
                    wrap = "![" + text + "](" + userinput + ")";
                } else {
                    wrap = "![kep](" + userinput + ")";
                }
            }
        } else if (action === "list") {
            re = /\n/g;
            wrap = "- " + text.replace(re, "\n\- ")
        } else if (action === "numbered_list") {
            re = /\n/g;
            wrap = "1. " + text.replace(re, "\n1\. ")
        } else if (action === "footnote") {
            wrap = '^[' + text + '] '
        }

        // update the area
        if (wrap !== null) {

            if (action === "italic" || action === "strong" || action === "code" || action === "latex" || action === "heading") {
                console.log(action, wrap, wrap2);
                field.value =
                    field.value.substring(0, start) +
                    leftWhitespace + wrap + text.trim() + wrap2 + rightWhitespace +
                    field.value.substring(end);
            } else {
                console.log(action, wrap);
                // new areas
                field.value =
                    field.value.substring(0, start) +
                    leftWhitespace + wrap + rightWhitespace +
                    field.value.substring(end);
            }
        }
    } else {
        alert("no field selected");
    }
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// print alarms
async function alarming(xhr, sucessmsg) {
    /* check return value */
    var msgbox = document.getElementById("msg")
    xhr.onload = function() {
        if (xhr.status != 200) { // analyze HTTP status of the response
            msgbox.style.color = "red";
            msgbox.innerHTML = "Error: " + xhr.statusText + " - " + xhr.response;
        } else { // show the result   
            msgbox.style.color = "green";
            msgbox.innerHTML = sucessmsg;
            // if new article we redirect to the new page
            var mur2answer = JSON.parse(xhr.response);
            if (mur2answer.hasOwnProperty('id')) {
                window.location.replace("/edit/" + mur2answer.id);
            }
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

function keywordlist() {
    var keywords = [];
    var keywords_dom = document.getElementById("keywords").getElementsByClassName("multi-search-item");
    for ( var i = keywords_dom.length; i--; ) {
        keywords.push(keywords_dom[i].firstChild.firstChild.data);
    }
    return keywords;
}
function categorylist() {
    var categories = [];
    var category_dom = document.getElementById("categories").getElementsByClassName("multi-search-item");
    for ( var i = category_dom.length; i--; ) {
        categories.push(category_dom[i].firstChild.firstChild.data);
    }
    if (categories.length === 0) {
        categories.push("Uncategorized")
    }
    return categories;
}
    


/* save Article content */
async function save_article(blobs) {
    // the markdonw article body text
    var markupdata = new Blob([document.getElementById('main-source').value], {
        type: 'text/html; charset=UTF-8'
    });

    var htmldatatext = document.getElementById('article_main').innerHTML;
    var htmldata = new Blob([htmldatatext], {
        type: 'text/html; charset=UTF-8'
    });
    var abstractdatatext = document.getElementById('article_abstract').innerHTML;
    var titledatatext = document.getElementById('article_title').innerHTML;
    
    // type of the text
    var texttype = document.querySelector('meta[name="texttype"]').content.trim()
    // transform the Blob to Form as this easier to process for the 
    var fd = new FormData();
    // add data to the form, so the Flask server able to receive them		// 
    // if Article 
    if (texttype == 'article') {
        // values just for Article type
        // the article id
        var article_id = document.querySelector('meta[name="article_id"]').content
        // the article abstract and title, later this need to change as they need to be editable
        var article_title = document.getElementById("title-source").value
        var article_abstract = document.getElementById("abstact-source").value
        var featuredImagesSrc = "";
        var featuredimages = document.getElementsByClassName("feature_image")[0];
        if ( featuredimages.src != featuredimages.baseURI ) {
            featuredImagesSrc = featuredimages.src;
        }
        var keywords = keywordlist();
        var categories = categorylist();
        // url
        var canonicalUrlText = document.getElementById('canonicalUrlText').value
        if ( canonicalUrlText.trim().length === 0 ) {
            canonicalUrlText = "http://mur2.co.uk/reader/"+article_id;
        }
        console.log(canonicalUrlText);


        fd.append("file", markupdata);
        fd.append("htmlfile", htmldata, "article_text.html");
        fd.append("article_title_html", titledatatext);
        fd.append("article_abstract_html", abstractdatatext);
        fd.append('article_id', article_id);
        fd.append('article_title', article_title);
        fd.append('article_abstract', article_abstract);
        fd.append('featuredimages', featuredImagesSrc);
        fd.append('keywords', keywords.toString());
        fd.append('categories', categories.toString());
        fd.append('article_url', canonicalUrlText);
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

async function medium_connect() {
    var access_token = prompt("Please set the Integration tokens", "");
    setCookie("mur2_medium_accesstoken", access_token, 365);
    window.location.reload();
}

async function  medium_on_fly(titleCollection, abstractCollection, mainCollection) {
    var msgbox = document.getElementById("msg")
    var access_token = getCookie("mur2_medium_accesstoken");
    var htmltext = mainCollection.getHtmlImg();
    var article_title = titleCollection.getHtmlImg().split("\n")[1].slice(3,-4);
    var article_abstract = abstractCollection.getHtmlImg();
    var article_id = document.querySelector('meta[name="article_id"]').content
    var keywords = keywordlist();
    console.log(keywords);
    
    var fd = new FormData();
    fd.append('acceskey', access_token);
    fd.append('article_id', article_id);
    fd.append('article_title', article_title);
    fd.append('article_content', article_abstract + "<hr>" + htmltext);
    fd.append("destination", "medium");
    fd.append("keywords", keywords.toString());
    
    var xhr = new XMLHttpRequest();
    /* need to receive file back */
    xhr.open('post', '/export_data', true);
    xhr.send(fd);
    xhr.onload = function() {
            if (xhr.status != 200) { // analyze HTTP status of the response
                msgbox.style.color = "red";
                msgbox.innerHTML = "Error: " + xhr.statusText + " - " + xhr.response;
            } else {
                var mur2answer = JSON.parse(xhr.response);
                msgbox.style.color = "green";
                msgbox.innerHTML = "Published on " + mur2answer.link;
            }
    };

}

/* commit in Wordpress.com by cokkies */
async function wordpress2(link, id) {
    // save the wordpressid if it is not an anonimus article    
    fd = new FormData();
    var article_id = document.querySelector('meta[name="article_id"]').content
    fd.append('article_id', article_id);
    fd.append("destination", "wp");
    fd.append("wpcom_id", id);
    fd.append("wpcom_address", link);
    xhr = new XMLHttpRequest();
    xhr.open('post', '/export_data', true);
    xhr.send(fd);
    alarming(xhr, "Published on " + link);
}

async function wordpress_on_fly(titleCollection, abstractCollection, mainCollection) {
    var msgbox = document.getElementById("msg")

    var texttype = document.querySelector('meta[name="texttype"]').content;
    if (texttype.trim() == 'article') {
        // get cookies
        var access_token = getCookie("mur2_wpc_accesstoken");
        var address = getCookie("mur2_wpc_sideid");
        if (access_token === "") {
            msgbox.style.color = "red";
            msgbox.innerHTML = "Error: You do not loged in in Wordpress.com";
        };

        // if it is not a new article get the id
        var article_id = document.querySelector('meta[name="article_id"]').content
        // ???        
        
        var htmltext = mainCollection.getHtmlImg();
        var article_title = titleCollection.getHtmlImg();
        var article_abstract = abstractCollection.getHtmlImg();
        var featuredimages = document.getElementsByClassName("feature_image")[0];
        
        // tags        
        var keywords = keywordlist();       
        var keywordsId = [];
        // get tags            
        for ( var i = keywords.length; i--; ) {
            let response = await new Promise(resolve => {
                let fd = new FormData();
                let xhrtt = new XMLHttpRequest();
                console.log(keywords[i]);
                fd.append('name', keywords[i]);
                xhrtt.open('post', 'https://public-api.wordpress.com/wp/v2/sites/' + address + '/tags', true);
                xhrtt.setRequestHeader('Authorization', 'Bearer ' + decodeURIComponent(access_token));
                
                xhrtt.onload = function() {
                    resolve(xhrtt.response);
                }                
                xhrtt.send(fd);
            });
            var result = JSON.parse(response);
            if ('id' in result) {
                keywordsId.push(result.id);
            } else if ('data' in result) {
                if ('term_id' in result.data) {
                    keywordsId.push(result.data.term_id);
                }
            }
        }

        // publish in Wordpress.com
        var fd = new FormData();
        fd.append('title', article_title);
        fd.append('status', 'private');
        fd.append('content', article_abstract + "<hr>" + htmltext);
        fd.append('excerpt', article_abstract);
        fd.append('format', 'standard');
        fd.append("tags", keywordsId);

        var xhr = new XMLHttpRequest();
        xhr.open('post', 'https://public-api.wordpress.com/wp/v2/sites/' + address + '/posts', true);        
        xhr.setRequestHeader('Authorization', 'Bearer ' + decodeURIComponent(access_token));
        xhr.send(fd);
        xhr.onload = function() {
            if (xhr.status != 201) { // analyze HTTP status of the response
                msgbox.style.color = "red";
                msgbox.innerHTML = "Error: " + xhr.statusText + " - " + xhr.response;
            } else {
                var wc2answer = JSON.parse(xhr.response);
                msgbox.style.color = "green";
                msgbox.innerHTML = "Published on " + wc2answer.link;

                wordpress2(wc2answer.link, wc2answer.id);
            }
        };

        // clear msg
        if (xhr.status != 200) {
            await sleep(5000);
        } else {
            await sleep(2000);
        }
        msgbox.innerHTML = "";
    }
}

async function generate_from_md(destination, mainCollection) {
    var article_title = document.getElementById('title-source').value;
    var article_abstract = document.getElementById('abstact-source').value;
    var mddata = new Blob([mainCollection.getSource()], {
        type: 'text/markdown;charset=utf-8'
    });
    var endnotetext = document.querySelector('meta[name="endnotetext"]').content
    var language = document.querySelector('meta[name="mur2language"]').content
    var fd = new FormData();

    var msgbox = document.getElementById("msg")
    msgbox.innerHTML = "Working";
    msgbox.style.color = "green";
    
    // author
    var author = document.querySelector('meta[name="author"]').content

    fd.append("destination", destination);
    fd.append("mdfile", mddata, "article_text.md");
    fd.append('article_title', article_title);
    fd.append('article_abstract', article_abstract);
    fd.append('endnotetext', endnotetext);
    fd.append('language', language);
    fd.append('author', author);
    var xhr = new XMLHttpRequest();
    /* need to receive file back */
    xhr.responseType = 'blob';
    xhr.open('post', '/export_data', true);
    xhr.send(fd)

    xhr.onload = function() {
        if (xhr.status != 200) { // analyze HTTP status of the response

            msgbox.style.color = "red";
            msgbox.innerHTML = "Error: " + xhr.statusText + " - " + xhr.response;

        } else { // save the result   
            var blob = this.response;
            window.URL = window.URL || window.webkitURL;
            var fileURL = window.URL.createObjectURL(blob);
            if (destination === "latex" || destination === "epub" ) {
                var a = document.createElement('a');
                a.href = window.URL.createObjectURL(blob);
                if (destination === "latex" ) {                    
                    a.download = "mur2.tex";
                } else {
                    a.download = "mur2.epub";
                }
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click(); //this is probably the key - simulating a click on a download link
                delete a;
            } else {
                if (navigator.userAgent.indexOf("iPad") != -1 || navigator.userAgent.indexOf("Macintosh") != -1) {
                    // on iPad we open in same window
                    window.location.href = fileURL;
                } else {
                    window.open(fileURL);
                }
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

/* keywords from https://stackoverflow.com/questions/59636362/how-to-make-a-text-input-field-take-in-keywords */
function multiSearchKeyup(inputElement) {
    if(event.keyCode === 13) {
        inputElement.parentNode
            .insertBefore(createFilterItem(inputElement.value), inputElement)
            ;
        inputElement.value = "";
    }
    function createFilterItem(text) {
        const item = document.createElement("div");
        item.setAttribute("class", "multi-search-item");
        const span = `<span>${text}</span>`;
        const close = `<div class="fa fa-close" onclick="this.parentNode.remove()"></div>`;
        item.innerHTML = span+close;
        return item;
    }
}