/**
 * 
 * (c) Sajó, Zsolt Attila 2021
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

function upload_picture() {
    var eNode = document.getElementById('pictureElem');
    // Fire click on file input
    (eNode.onclick || eNode.click || function() {}).call(eNode);
};

function upload_bib() {
    var eNode = document.getElementById('bibliography_file');
    // Fire click on file input
    (eNode.onclick || eNode.click || function() {}).call(eNode);
};
            
async function msgclear(status){
    var msgbox = document.getElementById("msg")
    if (status != 200) {
        await sleep(5000);
    } else {
        await sleep(2000);
    }

    // clear msg
    msgbox.innerHTML = "";
}
async function download_result(blobs) {
    var result = "";
    var title = document.getElementById('title-source').value.replace(/\s/g, '_').toLowerCase();
    
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
        a.download = title + ".html";
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
        a.download = title + ".md";
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click(); //this is probably the key - simulating a click on a download link
        delete a;
    }
};

function editorToolbarAction(action, kwarg) {
    if (g_selectedTextarea !== null) {
        var field = document.getElementById(g_selectedTextarea);
        var start = field.selectionStart;
        var end = field.selectionEnd;
        // if there is selection
        var text = field.value.substring(start, end);
        

        // is there whitespace in the begining or end
        var leftWhitespace = '', 
            rightWhitespace= '';
        if ( start !== end ){
            var leftWhitespace = text.slice(0, 1).trim() === '' ? ' ' : '';
            var rightWhitespace = text.slice(-1).trim() === '' ? ' ' : '';
        }

        var wrap = null;
        if (action === "italic") {
            wrap = "*";
            wrap2 = wrap;
        } else if (action === "strong") {
            wrap = "**";
            wrap2 = wrap;
        } else if (action === "heading") {
            wrap = "\n# ";
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
            var userinput = prompt(_("Please enter a URL for the link."), "");
            if (userinput != null) {
                if (text) {
                    wrap = "[" + text + "](" + userinput + ")";
                } else {
                    wrap = "[link](" + userinput + ")";
                }
            }
        } else if (action === "picture") {            
            if (text) {
                wrap = "![" + text + "](" + kwarg + ")";
            } else {
                wrap = "![kep](" + kwarg + ")";
            }
        } else if (action === "list") {
            re = /\n/g;
            wrap = "\n- " + text.replace(re, "\n\- ")            
        } else if (action === "numbered_list") {
            re = /\n/g;
            wrap = "\n1. " + text.replace(re, "\n1\. ")
        } else if (action === "footnote") {
            wrap = '^[' + text + '] '
        }

        // update the area
        if (wrap !== null) {
            var offset = 0;
            if (action === "italic" || action === "strong" || action === "code" || action === "latex" || action === "heading") {
                field.value =
                    field.value.substring(0, start) +
                    leftWhitespace + wrap + text.trim() + wrap2 + rightWhitespace +
                    field.value.substring(end);
                
                if ( start !== end ){
                    offset = (wrap+wrap2).length;
                } else {
                    offset = (wrap).length;
                }
            } else {
                // new areas
                field.value =
                    field.value.substring(0, start) +
                    leftWhitespace + wrap + rightWhitespace +
                    field.value.substring(end);
                offset = wrap.length-text.length;    
            }
            field.focus();
            field.select();
            if ( start !== end ){
                field.selectionStart = start;
            } else {
                field.selectionStart = start+offset;
            }
            if ( action === "footnote" && start === end ) {
                field.selectionEnd = end+offset-2;
            } else {
                field.selectionEnd = end+offset;
            }
        }
    } else {
        swal(_("No field selected!"));
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
            swal( _("Error: ") + xhr.statusText + " - " + xhr.response ); 
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
        try {
            categories.push(category_dom[i].firstChild.firstChild.data);
        } catch(err) {
            ;
        }
    }
    if (categories.length === 0) {
        categories.push("Uncategorized")
    }
    return categories;
}
    


/* save Article content */
async function save_article(blobs) {
    // the markdown article body text
    var markupdata = new Blob([document.getElementById('main-source').value], {
        type: 'text/html; charset=UTF-8'
    });
    // bibtex data
    var bibdata = document.getElementById('bib-source').value;

    try {
        var htmldatatext = document.getElementById('article_main').innerHTML;
        var htmldata = new Blob([htmldatatext], {
            type: 'text/html; charset=UTF-8'
        });
        var abstractdatatext = document.getElementById('article_abstract').innerHTML;
        var titledatatext = document.getElementById('article_title').innerHTML;
    } catch(err) {
        swal(_("You can only save in Preview mode!"));
        return;
    }
    
    // type of the text
    // var texttype = document.querySelector('meta[name="texttype"]').content.trim()
    var texttype = document.getElementById('textype').value
    if ( texttype.length === 0 ) {
        // the default value
        texttype = "Article";
    }
    // if review 
    if (texttype === 'Review' ) {
        reviewed = document.getElementById('reviewdArticle')
        if ( reviewed.value.length == 0 ||  isNaN(reviewed.value) ) {
            swal(_("Choose the Article which you are reviewing!"));
            return;
        }
        standby = document.getElementById('reviewStandby')
        if ( standby.value.length == 0 || isNaN(standby.value) ) {
            swal(_("Need to set the Standby!"));
            return;
        }
        if ( standby.value < -100 ||  standby.value > 100 ) {
            swal(_("Standby should be between +100 and -100!"));
            return;
        }
        
        rebel = document.getElementById('reviewRebel').checked
    }
    
    
    // transform the Blob to Form as this easier to process for the 
    var fd = new FormData();
    // add data to the form, so the Flask server able to receive them		// 
    // values just for Article type
    // the article id
    var article_id = document.querySelector('meta[name="article_id"]').content
    // article language
    var language = document.querySelector('meta[name="mur2textlanguage"]').content
    // the article abstract and title, later this need to change as they need to be editable
    var article_title = document.getElementById("title-source").value.replace(/[\n\r]/g, '')
    if ( !article_title || article_title.replace(/\s/g,'').length === 0 ) {
        swal(_("The document title should not be empty! You can add in the 'Documents settings' (5th icon in the tollbar from left)."));
        return;
    }

    var article_abstract = document.getElementById("abstact-source").value
    var featuredImagesSrc = "";
    var featuredimages = document.getElementsByClassName("feature_image")[0];
    const pageurl = new URL(featuredimages.baseURI);
    const featureurl = new URL(featuredimages.src);
    if ( featureurl.pathname != pageurl.pathname ) {
        featuredImagesSrc = featuredimages.src;
    }
    var keywords = keywordlist();
    var categories = categorylist();
    // url
    var canonicalUrlText = document.getElementById('canonicalUrlText').value
    if ( canonicalUrlText.trim().length === 0 ) {
        canonicalUrlText = "https://mur2.co.uk/reader/"+article_id;
    }
    var bibsyle = document.getElementById("bibstyle_select").value;
    if (bibsyle === "") {bibsyle='apa' };

    fd.append("file", markupdata);
    fd.append("bib", bibdata);
    fd.append("bibstyle", bibsyle);
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
    fd.append('article_textype', texttype);
    fd.append('language', language);
    if (texttype === 'Review' ) {
        fd.append('reviewed', reviewed.value);
        fd.append('standby', standby.value);
        fd.append('rebel', rebel);
    }
    // send data
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/markdownsave', true);        
    xhr.send(fd);

    alarming(xhr, _("Saved!"));
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
                swal(  _("Error: ") + xhr.statusText + " - " + xhr.response );
            } else {
                var mur2answer = JSON.parse(xhr.response);
                msgbox.style.color = "green";
                msgbox.innerHTML = _("Published on ") + mur2answer.link;
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
    alarming(xhr, _("Published on ") + link);
}

async function wordpress_on_fly(titleCollection, abstractCollection, mainCollection) {
    var msgbox = document.getElementById("msg")

    var texttype = document.querySelector('meta[name="texttype"]').content;
    if (texttype.trim() == 'Article') {
        // get cookies
        var access_token = getCookie("mur2_wpc_accesstoken");
        var address = getCookie("mur2_wpc_sideid");
        if (access_token === "") {
            swal(  _("Error: You are not logged into Wordpress.com") );
        };

        // if it is not a new article get the id
        var article_id = document.querySelector('meta[name="article_id"]').content     
        
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
                swal( _("Error: ") + xhr.statusText + " - " + xhr.response );
            } else {
                var wc2answer = JSON.parse(xhr.response);
                msgbox.style.color = "green";
                msgbox.innerHTML = _("Published on ") + wc2answer.link;

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

// render Markdown on the server
async function render_on_server() {
    // get what is the selected style
    var bibsyle = document.getElementById("bibstyle_select").value;
    // default style
    if (bibsyle === "") {bibsyle='apa' };
    // get bibilography
    var bib = document.getElementById("bib-source").value;
    // language
    var language = document.querySelector('meta[name="mur2textlanguage"]').content
    // get the data deppending what filed we are edditing
    var field = document.getElementById(g_selectedTextarea).value;
    // what is the local of the footnote
    var languageFootnote = document.querySelector('meta[name="endnotetext"]').content
    // send to the server
    var fd = new FormData();
    fd.append('bib', bib);
    fd.append("md", field);
    fd.append("bibsyle", bibsyle);
    fd.append("language", language);
    fd.append("footnote", languageFootnote);
    var xhr = new XMLHttpRequest();
    // need to receive file back
    xhr.responseType = 'blob';
    xhr.open('post', '/processmarkdown', true);
    xhr.send(fd)
    // receive the response
    xhr.onload = function() {
        var myReader = new FileReader(); 
        var blob = this.response;
        if (xhr.status != 200) { // analyze HTTP status of the response
            // we expecting a blob even if the returned error is                        
            myReader.addEventListener("loadend", function(e){
                swal(  _("Error: ") + JSON.parse(e.srcElement.result).Error );
            });            
        } else { // save the result               
            // update the preview 
            var viewside = 'article_' + g_selectedTextarea.split("-")[0] ;
            if (viewside === 'article_abstact' ) {
                viewside = 'article_abstract_text';
            }
            myReader.addEventListener("loadend", function(e){
                g_domSetHighlightedContent(viewside,  e.srcElement.result, 'none')
            });            
        }
        myReader.readAsText(blob);
    }
}

async function make_export(destination, mainCollection) {
    var article_title = document.getElementById('title-source').value.replace(/[\n\r]/g, '');
    if ( !article_title || article_title.length === 0 ) {
        swal(_("The document title should not be empty! You can add in the 'Documents settings' (5th icon in the tollbar from left)."));
        return;
    }
    var mddata;
    var article_abstract;
    if (destination === "epub") {
        mddata = new Blob([document.getElementById('article_main').innerHTML], {
            type: 'text/html; charset=UTF-8'
        });
        article_abstract = document.getElementById('article_abstract').innerHTML;
    } else {
        mddata = new Blob([mainCollection.getMdBackend()], {
                type: 'text/markdown;charset=utf-8'
        });
        article_abstract = document.getElementById('abstact-source').value;
    }
    var endnotetext = document.querySelector('meta[name="endnotetext"]').content
    var language = document.querySelector('meta[name="mur2textlanguage"]').content
    // bibtex data
    var bibdata = document.getElementById('bib-source').value;
    // get what is the selected style
    var bibsyle = document.getElementById("bibstyle_select").value;
    // default style
    if (bibsyle === "") {bibsyle='apa-6th-edition' };
    var msgbox = document.getElementById("msg")
    msgbox.innerHTML = _("Working...");
    msgbox.style.color = "green";
    
    // author
    var author = document.querySelector('meta[name="author"]').content

    var fd = new FormData();
    fd.append("destination", destination);
    fd.append("mdfile", mddata, "article_text.md");
    fd.append('article_title', article_title);
    fd.append('article_abstract', article_abstract);
    fd.append('endnotetext', endnotetext);
    fd.append('language', language);
    fd.append('author', author);
    fd.append('bib', bibdata);
    fd.append('bibsyle', bibsyle);
    var xhr = new XMLHttpRequest();
    /* need to receive file back */
    xhr.responseType = 'blob';
    xhr.open('post', '/export_data', true);
    xhr.send(fd)   
    
    xhr.onload = function() {
        var blob = this.response;
        if (xhr.status != 200) { // analyze HTTP status of the response
            // as we expect blob as response we need to handle like this this json error
            var myReader = new FileReader();
            myReader.addEventListener("loadend", function(e){
                swal(  _("Error: ") + JSON.parse(e.srcElement.result).Error );
            });
            myReader.readAsText(blob);
        } else { // save the result
            window.URL = window.URL || window.webkitURL;
            if (destination === "latex" || destination === "epub" || destination === "msw" ) {
                var a = document.createElement('a');
                a.href = window.URL.createObjectURL(blob);
                
                // replece white spaces in title for use as file name
                article_title = article_title.replace(/\s/g, "_");
                
                if (destination === "latex" ) {                    
                    a.download = article_title+".tex";
                } else if ( destination === "msw" ) {
                    a.download = article_title+".doc";
                } else {
                    a.download = article_title+".epub";
                }
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click(); //this is probably the key - simulating a click on a download link
                delete a;
            } else {
                var fileURL = window.URL.createObjectURL(blob);
                // ipad pdf need to open different way
                if (navigator.userAgent.indexOf("iPad") != -1 ) {
                    // on iPad we open in same window
                    window.location.href = fileURL;
                } else if (navigator.userAgent.indexOf("Macintosh") != -1) {
                    window.open(fileURL, article_title+".pdf");
                    setTimeout(function() {
                        newTab.document.title = blob.name;
                    }, 10);
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

async function generate_from_md(destination, mainCollection) {
    /* Switch out msw generation, the Adobe doing better from pdf->word */
    if ( destination === "msw" ) {
        var result = swal( 
            {
                text: _("We recommend downloading the PDF version and transform it with the Adobe online PDF->World tool. This will give you the best result if you use a lot of mathematical formula or complicated tables. However, we still happy to generate ourselves also, if you wish."),
                buttons: {
                    here: {text:_('Generate here'), value: 'here'}, 
                    there: {text: _('I will do on Adobe'), value: 'there'}
                }
            }               
       ).then((result) => {   
           switch  (result) {
               case "there":
                   window.open("https://www.adobe.com/uk/acrobat/online/pdf-to-word.html");
                   break;
               case "here":
                   make_export(destination, mainCollection);
                   break;
           }
           return;
       });       
    } else {
        make_export(destination, mainCollection);
    }
}

/* keywords from https://stackoverflow.com/questions/59636362/how-to-make-a-text-input-field-take-in-keywords */
function multiSearchKeyup(inputElement) {
    var newcat = false
    var remove = false
    if ( inputElement.classList.contains('fa-close') ) {
        remove = true;
    } else if ( event.keyCode === 13 ) {
        newcat = true;
    } else if ( inputElement.value.slice(-2) == '\\n' ) {
        newcat = true;
    }
    
    // we add a newcat
    if(newcat) {                
        var newstring = inputElement.value;
        if ( inputElement.value.slice(-2) == '\\n' ) {
            newstring = inputElement.value.slice(0,-2);
        }
        inputElement.parentNode
            .insertBefore(createFilterItem(newstring), inputElement)
            ;
        inputElement.value = "";
        
        // check how many keyword is defined already
        childrenNumber = inputElement.parentNode.getElementsByClassName("multi-search-item") 
        // max 10 keywords are allowed
        if ( childrenNumber.length >= 10 ) {
            inputElement.parentNode.getElementsByTagName("input")[0].style.display = 'none'; 
        }
    } else if ( remove ) {
        // we not add a new element so we remove one        
        // remove item
        inputElement.parentNode.remove()
    }
    function createFilterItem(text) {
        const item = document.createElement("div");
        item.setAttribute("class", "multi-search-item");
        const span = `<span>${text}</span>`;
        const close = `<div class="fa fa-close" onclick="multiSearchKeyup(this)"></div>`;
        item.innerHTML = span+close;
        return item;
    }
}

// make the modal for the Review to select the Article
function selectReviewedID() {
    var modal = document.getElementById("reviewModal");
    // Get the <span> element that closes the modal
    var span = document.getElementById("modalCloseReview");
        
    var body = modal.getElementsByClassName("modal-body")[0];
    body.innerHTML = '<iframe id="editor_iframe" allowTransparency="true" frameborder="0" scrolling="yes"  src="/search" type= "text/javascript"></iframe>';
    modal.style.display = "block";
    
    // When the user clicks on <span> (x), close the model
    span.onclick = function() {
        // the the chosed Article
        var iframe = document.getElementById("editor_iframe");                       
        var elmnt = iframe.contentWindow.document.getElementById("selected");
        // set the value 
        reviewdArticle = document.getElementById("reviewdArticle");
        reviewdArticle.value = elmnt.innerHTML;
        // hide modal
        modal.style.display = "none";
    }    
    
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

// select new author for user
function addNewAuthor(action, id) {
    var msgbox = document.getElementById("msg")
    var newauthor ;
    if ( action === "remove" ) {
        newauthor = id;
    } else {
        // the new author id
        newauthor= document.getElementById('newauthor').value;
    }
    // the article id
    var articleid = document.querySelector('meta[name="article_id"]').content
    
    // check workshare add up 
    workshares = document.getElementsByClassName("workshare");
    // the users who workshare changed
    let allworkshare = 0
    var changeworkshare = {};
    for (var i = 0; i<workshares.length; i++) {
        if ( workshares[i].value !== "" ) {
            if ( action === "remove" ) {
                // do not count the users which we removing
                if ( workshares[i].getAttribute("userid") !== id  ) {
                    allworkshare += parseInt(workshares[i].value);
                    // check workshare changed
                    if ( parseInt(workshares[i].getAttribute("original")) !== parseInt(workshares[i].value) ) {
                        changeworkshare[workshares[i].getAttribute("userid")] = parseInt(workshares[i].value) ;
                    }
                }
            } else {
                allworkshare += parseInt(workshares[i].value);
                if ( parseInt(workshares[i].getAttribute("original")) !== parseInt(workshares[i].value) ) {
                    changeworkshare[workshares[i].getAttribute("userid")] = parseInt(workshares[i].value) ;
                }
            }
        }    
    }
    if ( allworkshare !== 100 ) {
        swal( _("Error: The sum of the workshare is not 100!") );
    } else {
        // send data to frontend
        var fd = new FormData();
        fd.append("newauthor", newauthor);
        fd.append("articleid", articleid);
        fd.append("action", action);
        fd.append("workshare", JSON.stringify(changeworkshare));
        var xhr = new XMLHttpRequest();
        xhr.open('post', '/addauthor', true);
        xhr.send(fd);
    
        xhr.onload = function() {
            if (xhr.status != 200) { // analyze HTTP status of the response
                swal( _("Error: ") + xhr.statusText + " - " + xhr.response );
            } else {
                // update the page
                location.reload();
            }
        };        
    }
}

// get version from the fronend DB
function getArticleversion() {
    var msgbox = document.getElementById("msg")
    // get the selected version
    var e = document.getElementById("id_rollback_article_list");
    var value = e.options[e.selectedIndex].value;
    value = value.split("_");
    var fd = new FormData();
    fd.append("version", value[0]);
    fd.append("article", value[1]);    
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/getarticleversions', true);
    xhr.send(fd);
    xhr.onload = function() {
            if (xhr.status != 200) { // analyze HTTP status of the response
                swal( _("Error: ") + xhr.statusText + " - " + xhr.response );
            } else {
                var versiondata = JSON.parse(xhr.response);
                document.getElementById('title-source').value = versiondata.title;
                document.getElementById('abstact-source').value = versiondata.abstract;
                document.getElementById('main-source').value = versiondata.main;
                var mainSource = document.getElementById('main-source');
                var decorator = new TextareaDecorator(mainSource, mdParser);
                decorator.update();
                mainSource.dispatchEvent(new Event('input', { bubbles: true }));
            }
    }
}


