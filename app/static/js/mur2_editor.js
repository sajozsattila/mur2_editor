/**
 * Markdown and LaTeX Editor
 * (c) Sajó, Zsolt Attila 2020
 * Based on code by Roman Parpalak, 2016-2018 https://github.com/parpalak/upmath.me
 * 
 */

// what is the actuall preview type 
var g_view = 'html';
// focusmode on?   
var g_focusmode_switch = false;
// preview show?
var g_preview_on = true;
// which textareai is selected
var g_selectedTextarea = null;
// editor changes show 
var g_echange_on = false;

//////////
// set a DOM content, with highlighting or not 
//     if 'lang' === 'none' it is setting just the innerHTML
//////////
function g_domSetHighlightedContent(idName, content, lang) {
    var eNode = document.getElementById(idName);
    var result = null;
    // for source without any formating

    if (lang === 'none') {
        eNode.innerHTML = content;
    } else if (window.hljs) {
        // highlighing 
        result = window.hljs.highlight(lang, content)
        eNode.innerHTML = result.value;
    } else {
        eNode.textContent = content;
    }
    return result;
}

/**
 * Searches start position for text blocks
 */
function g_domFindScrollMarks() {
    var resElements = document.querySelectorAll('#article_main .line'),
        resElementHeight = [],
        line,
        mapSrc = [0],
        mapResult = [0],
        i = 0,
        len = resElements.length;

    for (; i < len; i++) {
        line = parseInt(resElements[i].getAttribute('data-line'));
        if (line) {
            resElementHeight[line] = Math.round(resElements[i].offsetTop);
        }
    }

    var srcElements = document.querySelectorAll('.ldt-pre .block-start');

    len = srcElements.length;
    line = 0;

    for (i = 0; i < len; i++) {
        var lineDelta = parseInt(srcElements[i].getAttribute('data-line'));
        if (lineDelta) {
            line += lineDelta;

            // We track only lines in both containers
            if (typeof resElementHeight[line] !== 'undefined') {
                mapSrc.push(srcElements[i].offsetTop);
                mapResult.push(resElementHeight[line]);
            }
        }
    }
    var srcScrollHeight = document.querySelector('.ldt-pre').scrollHeight,
        lastSrcElemPos = mapSrc[mapSrc.length - 1],
        allowedHeight = 5; // workaround for automatic textarea scrolling on entering new source lines

    mapSrc.push(srcScrollHeight - allowedHeight > lastSrcElemPos ? srcScrollHeight - allowedHeight : lastSrcElemPos);
    mapResult.push(document.querySelector('#article_main').scrollHeight);

    return [mapSrc, mapResult];
}



(function(document, window) {
    'use strict';

    // globals to make them local 
    var domFindScrollMarks = g_domFindScrollMarks;

    // get the different element of the data
    var titleSource = document.getElementById('title-source'),
        titleResult = document.getElementById('article_title'),
        abstactSource = document.getElementById('abstact-source'),
        abstactResult = document.getElementById('article_abstract_text'),
        mainSource = document.getElementById('main-source'),
        mainResult = document.getElementById('article_main'),
        article_id = document.querySelector('meta[name="article_id"]').content;

    var recalcHeight = debounce(function() {
        decorator.recalcHeight()
    }, 100);

    var scrollMap = new ScrollMap(domFindScrollMarks);

    var iprem = new ImagePreloader();
    // creat the Math imageLoaders we need them because of the debounce destroy the this. object in the ParserCollection
    var mainImageLoader = new ImageLoader(iprem, location.protocol === 'https:' ? 'https:' : 'http:', 'm_');    
    var mainCollection = new ParserCollection(
        window.markdownit,
        function(source) {
            // reset lines mapping cache on content update
            scrollMap.reset();
            // local save
            try {
                localStorage.setItem("mur2_main_content"+article_id, source);
                localStorage.setItem("mur2_main_content"+article_id+'_time', +new Date);
            } catch (e) {}
        },
        "article_main",
        "article_main_pre",
        function domGetSource() {
            return mainSource.value;
        },
        mainImageLoader
    );
    
    var titleImageLoader = new ImageLoader(new ImagePreloader(), location.protocol === 'https:' ? 'https:' : 'http:', 't_');
    var titleCollection = new ParserCollection(
        window.markdownit,
        function(source) {
            // local save
            try {
                localStorage.setItem("mur2_title_content"+article_id, source.split("\n").slice(2, -3).join("\n"));
                localStorage.setItem("mur2_title_content"+article_id+'_time', +new Date);
            } catch (e) {}
        },
        "article_title",
        "article_title",
        function domGetSource() {
            return '<span id="article_title">\n\n' + titleSource.value.replace(/(?:\r\n|\r|\n)/g, '') + '\n\n</span>\n';
        },
        titleImageLoader
    );
    var abstractImageLoader = new ImageLoader(new ImagePreloader(), location.protocol === 'https:' ? 'https:' : 'http:', 'a_');
    var abstractCollection = new ParserCollection(
        window.markdownit,
        function(source) {
            // local save
            try {
                localStorage.setItem("mur2_abstract_content"+article_id, source.split("\n").slice(2, -3).join("\n"));
                localStorage.setItem("mur2_abstract_content"+article_id+'_time', +new Date);
            } catch (e) {}
        },
        "article_abstract_text",
        "article_abstract_text",
        function domGetSource() {
            return '<span id="article_abstract">\n\n' + abstactSource.value + '\n\n</span>\n';
            
        },
        abstractImageLoader
    );

    // load first everything
    mainCollection.updateResult(mainImageLoader, true);
    abstractCollection.updateResult(abstractImageLoader, true);
    titleCollection.updateResult(titleImageLoader, true);

    collapsible_listener();

    // start the decorator we just decorate the main
    var decorator = new TextareaDecorator(mainSource, mdParser);
    // .source has been changed after TextareaDecorator call
    var eNodeSource = document.getElementsByClassName("ldt")[0];

    var syncScroll = new SyncScroll(
        scrollMap,
        new Animator(function() {
            return eNodeSource.scrollTop;
        }, function(y) {
            eNodeSource.scrollTop = y;
        }),
        new Animator(function() {
            return mainResult.scrollTop;
        }, function(y) {
            mainResult.scrollTop = y;
        }),
        eNodeSource,
        mainResult,
        document.querySelector('[id^="maintext"]')
    );


    // debonced updates for resource managment

    var updateMain = debounce(mainCollection.updateResult, 300, {
        maxWait: 3000
    });
    var updateTitle = debounce(titleCollection.updateResult, 300, {
        maxWait: 3000
    });

    var updateAbstract = debounce(abstractCollection.updateResult, 300, {
        maxWait: 3000
    });

    /* Add event listener */
    // make event delegation for all of the input
    //   basically we have three texfiled: title, abstract, main
    //      we can add three event listener, but better one event listener on 
    //      we can do this by organising them under one parent, and use event delegation
    let article_input_side = document.querySelector('#article_input_side');
    ['input','conv'].forEach( evt => 
        article_input_side.addEventListener(evt, (event) => {
            var target;
            if (event.type == "input") {
                // catch direct user input
                target = event.target.id;
            } else {
                // catch convegent input
                target = event.detail;
            }
            var preview_on = g_preview_on;
            // mark as selected area
            g_selectedTextarea = target;
            // switching depending which textfiled was an input
            switch (target) {
                case 'title-source':
                    // if we do not show preview no point to update
                    if (preview_on) {
                        updateTitle(titleImageLoader, false);
                    }
                    break;
                case 'abstact-source':
                    if (preview_on) {
                        updateAbstract(abstractImageLoader, false);
                    }
                    break;
                case 'main-source':
                    if (preview_on) {
                        updateMain(mainImageLoader, false);
                        
                    }
                    break;
            }
        })
    );

    // action to roll on main 
    mainSource.addEventListener('touchstart', syncScroll.switchScrollToSrc);
    mainSource.addEventListener('mouseover', syncScroll.switchScrollToSrc);
    mainResult.addEventListener('touchstart', syncScroll.switchScrollToResult);
    mainResult.addEventListener('mouseover', syncScroll.switchScrollToResult);

    syncScroll.switchScrollToSrc();

    // slider
    (function() {
        var eSlider = document.querySelector('#slider'),
            dragSlider = new Draggabilly(eSlider, {
                axis: 'x'
            }),
            sourceBlock = document.getElementById('article_input_side'),
            resultBLock = document.getElementById('article_preview_side'),
            windowWidth;

        function setWidth(percent) {
            sourceBlock.style.width = 'calc(' + percent + '% - 3px)';
            resultBLock.style.width = 'calc(' + (100 - percent) + '% - 3px)';

            scrollMap.reset();
            recalcHeight();
        }

        eSlider.addEventListener('dblclick', function() {
            setWidth(50);
        });

        dragSlider.on('dragStart', function(event, pointer, moveVector) {
            windowWidth = window.innerWidth;
        });

        dragSlider.on('dragMove', function(event, pointer, moveVector) {
            setWidth(100.0 * pointer.pageX / windowWidth);
        });
    })();

    // Need to recalculate line positions on window resize
    window.addEventListener('resize', function() {
        scrollMap.reset();
        recalcHeight();
    });

    // listener for the toolbar
    var activaton = ["select", "click"];
    for (var i = activaton.length; i--; ) {
        article_input_side.addEventListener(activaton[i], (event) => {
            // switching depending which textfiled was an input
            let target = event.target;
            if (target.id === 'title-source' || target.id === 'abstact-source' || target.id === 'main-source') {
                g_selectedTextarea = target.id;
                if ( g_focusmode_switch ) {
                    decorator.update();
                }
            }
        });
    }

    // uplad the selected area. used for toolbar
    var inputevent = new Event('input');
    // this is used for the toolbars
    function update() {
        var selectedTextarea = g_selectedTextarea;
        if (selectedTextarea === 'main-source') {
            updateMain(mainImageLoader, false);
            // fire inputevent manualy to update highlighted things also
            mainSource.dispatchEvent(inputevent);
        } else if (selectedTextarea === 'title-source') {
            updateTitle(titleImageLoader, false);
        } else if (selectedTextarea === 'abstact-source') {
            updateAbstract(abstractImageLoader, false);
        }
        
    }

    // file upload event
    document.getElementById('fileElem').addEventListener('change', function() {
        // A file has been chosen
        if (!this.files || !FileReader) {
            return;
        }

        var reader = new FileReader(),
            fileInput = this;

        reader.onload = function() {
            var filecontent = this.result;
            
            var htmlObject = document.createElement('div');
            htmlObject.innerHTML = filecontent;
            var fragment = document.createDocumentFragment(); 
            fragment.appendChild( htmlObject ); 
            var article_title = fragment.getElementById("article_title") ;
            var article_abstract = fragment.getElementById("article_abstract") ;

            abstactSource.value = article_abstract.innerHTML;
            titleSource.value = article_title.innerHTML.replace("\n", "");
            article_title.parentNode.removeChild(article_title);
            article_abstract.parentNode.removeChild(article_abstract);
            
            // upload to the main
            mainSource.value = fragment.textContent.replace(/^\s+/g, '');;
            updateMain(mainImageLoader, true);
            mainSource.dispatchEvent(inputevent);
            decorator.update();
            fileInput.value = fileInput.defaultValue;
            fragment = null;
            // upload title and abstract
            updateTitle(titleImageLoader, true);
            updateAbstract(abstractImageLoader, true);
        };
        reader.readAsText(this.files[0]);
    });
    
    // Featured Image
    document.getElementById('feaImg_add').addEventListener('change', function() {
        // A file has been chosen
        if (!this.files || !FileReader) {
            return;
        }
        var file = document.getElementById('feaImg_add').files[0];
        var reader = new FileReader();
        
        reader.onload = function() {
            var image = document.getElementById("article_abstract_div").firstElementChild;
            // the result image data
            image.src = reader.result;
            image.classList.remove("hide");
            // save the image localy
            localStorage.setItem("mur2_featured_image"+article_id, image.src);
            const datestamp = new window.Date().getUTCDate();
            localStorage.setItem("mur2_featured_image"+article_id+'_time', + datestamp );
        };
        // you have to declare the file loading
        reader.readAsDataURL(file);     
    });        
    let featureImg = document.querySelector('#id_featureImage');
    featureImg.addEventListener('click', function() {
        let target = event.target;
        if (target.id == "feaImg_del") {            
            var image = document.getElementById("article_abstract_div").firstElementChild;
            // the result image data
            image.src = "";
            image.classList.add("hide");
            // save the image localy
            localStorage.setItem("mur2_featured_image"+article_id, image.src);
            localStorage.setItem("mur2_featured_image"+article_id+'_time', +new Date);
        };
    });
    
    // upload image
    document.getElementById('pictureElem').addEventListener('change', function() {
        // A file has been chosen
        if (!this.files || !FileReader) {
            return;
        }

        var reader = new FileReader(),
            fileInput = this;

        reader.onload = function() {
            var msgbox = document.getElementById("msg")
            var status = 200;
            // if filetype not right
            if ( ['jpg', 'jpeg', 'png', 'gif' ].includes(filetype) ) {
                var filecontent = new Blob([this.result], {
                    type: 'imgage/'+filetype
                });
            
                // upload the file in the media directory
                var fd = new FormData();
                fd.append("photo", filecontent, filename);
                fd.append("mediapage", false);
                var xhr = new XMLHttpRequest();
                xhr.open('post', '/media', true);
                xhr.send(fd);
    
                xhr.onload = function() {
                    if (xhr.status != 200) { // analyze HTTP status of the response
                        alert( _("Error: ") + xhr.statusText + " - " + xhr.response );
                        status = xhr.status;
                    } else {
                        var response = JSON.parse(xhr.response);
                        editorToolbarAction("picture", response.url); 
                        update();
                    }
                };        
                // return the new file address
            } else {
                status = 400;
                alert( _("Error: ") + _("Not supported image format!") );
            }
            msgclear(status);
        };
        
        reader.readAsArrayBuffer(this.files[0]);
        var filename = this.files[0].name;
        var filetype = this.files[0].name.split('.').pop().toLowerCase()
         
    });
    
    // add Bibliography 
    document.getElementById('bibliography').addEventListener('change', function() {
        // A file has been chosen
        if (!this.files || !FileReader) {
            return;
        }

        var reader = new FileReader(),
            fileInput = this;

        reader.onload = function() {
            var msgbox = document.getElementById("msg")
            var status = 200;
            // if filetype right
            if ( ['bib' ].includes(filetype) ) {
                var filecontent = new Blob([this.result], {
                    type: 'text/plain'
                });
            
                // upload the file in the media directory
                var fd = new FormData();
                fd.append("bibliography", filecontent, 'bibliography.bib');
                var xhr = new XMLHttpRequest();
                xhr.open('post', '/bibliography', true);
                xhr.send(fd);
    
                xhr.onload = function() {
                    if (xhr.status != 200) { // analyze HTTP status of the response
                        alert( _("Error: ") + xhr.statusText + " - " + xhr.response );
                        status = xhr.status;
                    } else {
                        // the HTML file
                        var response = JSON.parse(xhr.response);
                        console.log(response);
                        var source = document.getElementById('main-source');
                        // append html toe end of the main source
                        source.value = source.value + "\n" + response.bib;
                        update();
                    }
                };        
                // return the new file address
            } else {
                alert( _("Error: ") + _("Not supported file format!" ) );
                status = 400;
            }
            msgclear(status);
        };        
        reader.readAsArrayBuffer(this.files[0]);
        var filetype = this.files[0].name.split('.').pop().toLowerCase()
    });

    // other event delegator for menu and toolbar
    let editor_toolbar = document.querySelector('#menu');
    editor_toolbar.addEventListener('click', (event) => {
        let target = event.target;
        // switching depending which textfiled was an input
        if (target.classList.contains('choice_menu')) {
            var menutarget = target.id.replace("id_", '');
            var menu = document.getElementById('menu');            
            if ( menu.classList.contains(menutarget) ) {
                menu.classList.remove(menutarget);
            } else {
                menu.classList.add(menutarget);
            }
        } else if (target.classList.contains('choice_toolbar')) {
            // the tools
            switch (target.id) {
                case 'id_upload':
                    upload_source();
                    break;
                case 'id_download':
                    download_result([mainCollection, abstractCollection, titleCollection]);
                    break;
                case 'id_save':
                    // fire up an update
                    updateMain(mainImageLoader, true);
                    updateTitle(titleImageLoader, true);
                    updateAbstract(abstractImageLoader, true);
                    save_article([mainCollection, abstractCollection, titleCollection]);
                    break;
                case 'id_syntax_hl':
                    var menubottom = document.getElementById('id_syntax_hl');
                    if (g_focusmode_switch) {
                        menubottom.classList.add('focusmode');
                        g_focusmode_switch = false;
                    } else {
                        menubottom.classList.remove('focusmode');
                        g_focusmode_switch = true;                        
                    };
                    mainSource.dispatchEvent(inputevent);
                    break;
                case 'id_hide_preview':
                    var preview = document.getElementById('article_preview_side');
                    var input = document.getElementById('article_input_side');
                    var menubottom = document.getElementById('id_hide_preview');
                    if (preview.classList.contains('previewoff')) {
                        preview.classList.remove('previewoff');
                        input.classList.remove('previewoff');
                        menubottom.classList.remove('previewoff');
                        g_preview_on = true;
                        // fire up an update
                        updateMain(mainImageLoader, true);
                        updateTitle(titleImageLoader, true);
                        updateAbstract(abstractImageLoader, true);
                    } else {
                        preview.classList.add('previewoff');
                        input.classList.add('previewoff');
                        menubottom.classList.add('previewoff');
                        // switching off update on ParseCollection when it is not showed
                        g_preview_on = false;
                    }
                    break;
                case 'id_hide_input':
                    var preview = document.getElementById('article_preview_side');
                    var input = document.getElementById('article_input_side');
                    var menubottom = document.getElementById('id_hide_input');
                    if (input.classList.contains('inputoff')) {
                        preview.classList.remove('inputoff');
                        input.classList.remove('inputoff');
                        menubottom.classList.remove('inputoff');
                    } else {
                        preview.classList.add('inputoff');
                        input.classList.add('inputoff');
                        menubottom.classList.add('inputoff');
                    }
                    break;
                case 'id_show_title':
                    var sides = document.querySelectorAll("#article_preview_side, #article_input_side");
                    var menubottom = document.getElementById('id_show_title');
                    for (var i = sides.length; i--;) {
                        if (sides[i].classList.contains('titleon')) {
                            sides[i].classList.remove('titleon');
                            menubottom.classList.remove('titleon');
                        } else {
                            sides[i].classList.add('titleon');
                            menubottom.classList.add('titleon');
                        }
                    }
                    break;
                case 'id_proof':
                    // set in the frontend
                    if ( g_selectedTextarea === 'main-source') {
                        var field = document.getElementById(g_selectedTextarea);
                        var start = field.selectionStart;
                        var end = field.selectionEnd;
                        
                        var modal = document.getElementById("editorModal");

                        // Get the <span> element that closes the modal
                        var span = document.getElementById("modalClose");

                        var body = document.getElementsByClassName("modal-body")[0];
                        body.innerHTML = '<iframe id="editor_iframe" allowTransparency="true" frameborder="0" scrolling="yes"  src="/embedding" type= "text/javascript"></iframe>';
                        modal.style.display = "block";

                        // When the user clicks on <span> (x), close the modal
                        span.onclick = function() {
                            // the the chosed Article
                            var iframe = document.getElementById("editor_iframe");                       
                            var elmnt = iframe.contentWindow.document.getElementById("selected");
                        
                            if ( elmnt.innerHTML.length > 0 ) {                            
                                
                                // if there is selection this will be the title
                                var text = field.value.substring(start, end);
                                if ( text.length  === 0 ) {
                                    // set the default tile
                                    text = iframe.contentWindow.document.getElementById("selected_title").innerHTML;
                                }
                                // set relationtype just for information, the real setting happaning in the 
                                var relationtype = iframe.contentWindow.document.getElementById("myList").value;
                                field.value =
                                    field.value.substring(0, start) +
                                    '<button type="button" class="collapsible">'+text+'</button><div class="iframe_wrap"><iframe scrolling="no" relationtype="'+relationtype+'" src="/iframe/'+elmnt.innerHTML +'"></iframe><a href="/reader/'+elmnt.innerHTML +'">'+_("Full text")+'</a></div>' + 
                                field.value.substring(end);                               
                                
                                // set focuse back
                                field.focus();
                                field.select();
                                field.selectionStart = end;
                                field.selectionEnd = end;
                                update();                                
                            }
                            modal.style.display = "none";
                        }                                                
                        
                        // When the user clicks anywhere outside of the modal, close it
                        window.onclick = function(event) {
                            if (event.target == modal) {
                                modal.style.display = "none";
                                // set focuse back
                                field.focus();
                                field.select();
                                field.selectionStart = start;
                                field.selectionEnd = end;
                            }
                        }
                    }


                    break;
                case 'id_echange':
                    if (g_echange_on !== true ) {
                        document.getElementById('editor_changes').disabled = false;
                        g_echange_on = true;
                        // set color of the bottom
                        document.getElementById('id_echange_botton').style.color =  '#c62641';
                    } else {
                        // disable the css file
                        document.getElementById('editor_changes').disabled = true;
                        g_echange_on = false;
                        document.getElementById('id_echange_botton').style.color =  'white';
                    }
                    break;
                case 'id_bib':
                    upload_bib();
                    break;
                case 'id_head':
                    editorToolbarAction("heading");
                    update();
                    break;
                case 'id_italic':
                    editorToolbarAction("italic");
                    update();
                    break;
                case 'id_strong':
                    editorToolbarAction("strong");
                    update();
                    break;
                case 'id_picture':
                    // different handli for free editor and registered users editor  
                    console.log(window.location.pathname);
                    if (window.location.pathname === '/editor') {
                        var userinput = prompt(_("Please enter a URL for image."), "");
                        if (userinput != null) {                            
                            editorToolbarAction("picture", userinput );                            
                            update();
                        }
                    } else {
                        upload_picture();                      
                    }
                    break;
                case 'id_link':
                    editorToolbarAction("link");
                    update();
                    break;
                case 'id_list':
                    editorToolbarAction("list");
                    update();
                    break;
                case 'id_nlist':
                    editorToolbarAction("numbered_list");
                    update();
                    break;
                case 'id_footnote':
                    editorToolbarAction("footnote");
                    update();
                    break;
                case 'id_table':
                    editorToolbarAction("table");
                    update();
                    break;
                case 'id_code':
                    editorToolbarAction("code");
                    update();
                    break;
                case 'id_latex':
                    editorToolbarAction("latex");
                    update();
                    break;
                case 'id_chat':
                    // open chat
                    document.getElementById('id_side_menu').checked = true;
                    document.getElementById('id_ec').checked = true;
                    msgnotice('hide');
                    break;
            }
        }
    });

    
    // catch Ctrl+S as save 
    document.addEventListener('keydown', logKey);
    function logKey(e) {

        var key = undefined;
        var possible = [ e.key, e.keyIdentifier, e.keyCode, e.which ];

        while (key === undefined && possible.length > 0){
            key = possible.pop();
        }

        if (key && (key == '115' || key == '83' ) && (e.ctrlKey || e.metaKey) && !(e.altKey)) {
            e.preventDefault();
            updateMain(mainImageLoader, true);
            updateTitle(titleImageLoader, true);
            updateAbstract(abstractImageLoader, true);
            save_article([mainCollection, abstractCollection, titleCollection]);
            return false;
        }
        return true;
    };     

    // event listener to switch the content
    let side_menu = document.querySelector('#side_menu');
    side_menu.addEventListener('click', (event) => {
        let target = event.target;
        // switching preview 
        if (target.classList.contains('preview-format')) {
            var view = target.id.replace("id_", '');
            var bodyelement = document.body;
            var classlist =  bodyelement.className.split(' ');
            var oldclass = null;
            for (var i = classlist.length; i--; ) {
                if ( /result-as-*/.test(classlist[i]) ) {
                    oldclass = classlist[i];
                }
            }
            bodyelement.classList.remove(oldclass);
            bodyelement.classList.add("result-as-" + view);
            g_view = view;
            updateTitle(titleImageLoader, true);
            updateAbstract(abstractImageLoader, true);
            updateMain(mainImageLoader, true);
        } else if (target.id === "id_wpc_publish") {
            wordpress_on_fly(titleCollection, abstractCollection,  mainCollection);
        } else if (target.id === "id_medium_publish") {
            medium_on_fly(titleCollection, abstractCollection,  mainCollection);
        } else if (target.id === "id_medium_connect") {
            medium_connect();
        } else if (target.id === "id_rollback_article") {
            getArticleversion();
            // fire up an update                        
            updateMain(mainImageLoader, true);            
            updateTitle(titleImageLoader, false);
            updateAbstract(abstractImageLoader, false);
        } else if (target.id === "id_wpc_clear") {
            clear_cookies("wpc");
        }  else if (target.id === "id_medium_clear") {
            clear_cookies("medium");
        } else if (target.id === "id_pdf") {
            generate_from_md('pdf', mainCollection);
        } else if (target.id === "id_latex_export") {
            generate_from_md('latex', mainCollection);
        } else if (target.id === "id_epub") {
            generate_from_md('epub', mainCollection);
        } else if (target.id === "id_msw") {
            generate_from_md('msw', mainCollection);
        } else if (target.id === "id_publish_article") {
            // finishe editing article
            var iframe = document.getElementById('transFrame');
            iframe.addEventListener('load', Handler);
            function Handler() {
                window.location.reload(true); 
            }            
        }

    });
})(document, window);