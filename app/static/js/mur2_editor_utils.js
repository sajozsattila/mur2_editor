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
	}
	else {
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
        var body = new Blob([blobs[b].getDisplayedResult()], {
            type: 'text/html;charset=utf-8'
        });
        var bodytext = await body.text();
        console.log(bodytext);
        result += "\n\n" + bodytext;
    }

    // get what is the current preview format
    var outputformat = g_view;

    // merge title, abstract and text
    if (outputformat === 'html' || outputformat === 'htmltex' || outputformat === 'habr' || outputformat === 'src') {
        var blob = new Blob([result], {
            type: 'text/html; charset=UTF-8'
        });
        saveAs(blob, outputformat + ".html");
    } else {
        var blob = new Blob([result], {
            type: 'text/markdown; charset=UTF-8'
        });
        saveAs(blob, outputformat + ".md");
    }


};

function editorToolbarAction(action) {
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



/* save Article content */
async function save_article(blobs ) {
    // the markdonw article body text
    var markupdata = new Blob([document.getElementById('main-source').value],
                               {type: 'text/html; charset=UTF-8'
        });
    
    // merge the data of the tilte, abstract and main
    var htmldatatext = "";
    for (var b = blobs.length; b--;) {
            var body = new Blob([blobs[b].getHtmlImg()], {
                type: 'text/html;charset=utf-8'
            });
            var bodytext = await body.text();
            console.log(bodytext);
            htmldatatext += "\n\n" + bodytext;
    }
    var htmldata = new Blob([result], {
            type: 'text/html; charset=UTF-8'
        });
    
    // type of the text
    var texttype = document.querySelector('meta[name="texttype"]').content.trim()
    // transform the Blob to Form as this easier to process for the 
    var fd = new FormData();
    // add data to the form, so the Flask server able to receive them		// 
    // if Article 
    if (texttype == 'article') {
        
        // the article id
        var article_id = document.querySelector('meta[name="article_id"]').content
        // the article abstract and title, later this need to change as they need to be editable
        var article_title = document.getElementById("title-source").value
        var article_abstract = document.getElementById("abstact-source").value
        fd.append("file", markupdata);
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
async function wordpress_on_fly(titleCollection, abstractCollection,  mainCollection) {
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

        var body = new Blob([mainCollection.getHtmlImg()], {
                type: 'text/html;charset=utf-8'
            });
        var htmltext = await body.text();
        var title = new Blob([titleCollection.getHtmlImg()], {
                type: 'text/html;charset=utf-8'
            });
        var article_title = await title.text();
        var abstract = new Blob([abstractCollection.getHtmlImg()], {
                type: 'text/html;charset=utf-8'
            });
        var article_abstract = await abstract.text();        

        // publish in Wordpress.com
        var fd = new FormData();
        fd.append('title', article_title);
        fd.append('status', 'private');
        fd.append('content', article_abstract+"<hr>"+htmltext);
        fd.append('excerpt', article_abstract);
        fd.append('format', 'standard');

        var xhr = new XMLHttpRequest();
        xhr.open('post', 'https://public-api.wordpress.com/wp/v2/sites/' + address + '/posts', true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + decodeURIComponent(access_token))
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
            msgbox.innerHTML = "Error: " + xhr.statusText + " - " + xhr.response;

        } else { // save the result   
            var blob = this.response;            
            // var contentDispo = this.getResponseHeader('Content-Disposition');
            if (destination === "latex") {
                // saveAs(blob, 'mur2.tex');                
                // var bb = new BlobBuilder();
                console.log(blob);
            } else {               
                var fileURL = URL.createObjectURL(blob);
                /*
                let newWindow = window.open(fileURL);
                newWindow.onload = () => {
                    var blobHtmlElement;
                    blobHtmlElement = document.createElement('object');
                    blobHtmlElement.style.position = 'fixed';
                    blobHtmlElement.style.top = '0';
                    blobHtmlElement.style.left = '0';
                    blobHtmlElement.style.bottom = '0';
                    blobHtmlElement.style.right = '0';
                    blobHtmlElement.style.width = '100%';
                    blobHtmlElement.style.height = '100%';
                    blobHtmlElement.setAttribute('type', 'application/pdf'); 
                    blobHtmlElement.setAttribute('data', blob);
                    newWindow.document.title = 'Mur2 document';
                    newWindow.document.body.appendChild(blobHtmlElement);
                };
                */
                if(navigator.userAgent.indexOf("iPad") != -1){
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