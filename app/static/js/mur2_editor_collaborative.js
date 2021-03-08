
var collaboratidomain;
var collaboratchannel;
/* where we are with the chat history*/
var chatpossition;

/* load some more history */
function loadhistory() {
    var newpostion = chatpossition-25
    if (newpostion < 1 ) {
        limit = 25+newpostion;
        newpostion = 0;        
    }
    collaboratchannel.getHistory({
        startEvent: newpostion,
        limit: 25,
        eventFilter: ["message"],
        forward: true
    }).then(response => { 
        /* append to the field */
        if ( response.data.length > 0 ) {
            eventnumbers = [];
            // Get the chat window
            var windows = document.getElementById("chatposts");
            response.data.slice().reverse().forEach(evt => {
                /* if it is a new event */
                if ( evt.eventNumber < chatpossition ) {
                    eventnumbers.push(evt.eventNumber);
                    // create new post
                    var post = document.createElement("li");
                    var user = document.createElement("span");
                    user.className += 'chatuser';
                    user.innerText = evt.user.username;
                    post.appendChild(user);
                    var msg = document.createElement("p");
                    msg.innerText  = evt.message.split(":").slice(1).join(':');
                    post.appendChild(msg);
                    windows.insertBefore(post, windows.firstChild);
                }
            });
            if (eventnumbers.length > 0) {
                chatpossition = Math.min.apply(null, eventnumbers);
            }
            if (newpostion === 0 ) {
                // hide history bottom
                document.getElementById("chathistory").style.display = "none";
            }
        }
    });
}

function collaborative(cjwt, title, article_id) {
            // just saved article can be shared
            if ( parseInt(article_id) > 0 ){                        
                var domainUrl = "https://mur2.co.uk:9000/api/realtime/convergence/default";
            
                // 1. Connect to the domain anonymously.
                Convergence.connectWithJwt(domainUrl, cjwt)
                    .catch((error) => {
                        Convergence.connectWithJwt(domainUrl, cjwt)
                    }).then(initApp)
                    .then(chat) 
                    .catch((error) => {
                    console.log("Could not connect: " + error);
                });
            
                // 2. Initializes the application after connecting by opening a model.
                function initApp(domain) {                                                          
                    const modelService = domain.models();
                    modelService.openAutoCreate({
                        collection: title,
                        id: article_id,
                        data: { text: document.getElementById('main-source').value }
                    })
                        .then(initModel)
                        .then(listener)
                        .catch((error) => {
                        console.log("Could not open model: " + error);
                    });
                    
                    return domain
                };

                // 3. Initializes the model once the model is open.
                function initModel(model) {
                    const stringModel = model.elementAt("text");
                    const textArea = document.getElementById("main-source");

                    // Sets the value of the text area and performs a two-way-binding.
                    ConvergenceInputElementBinder.bindTextInput(textArea, stringModel);
                    
                    return model;
                };
            
                function listener(model) {
                    var textArea = document.getElementById("main-source");
                    var convevent = new CustomEvent('conv', { detail: "main-source" });
                    var inputeventl = new Event("input");
                    var article_input_side = document.querySelector('#article_input_side');
                    // listen the changes
                    model.events().subscribe(e => {
                        switch (e.name) {
                            case "version_changed":
                               // update input side
                               textArea.dispatchEvent(inputeventl);
                               // update rendered side
                               article_input_side.dispatchEvent(convevent);
                               break;
                            default:
                        }
                    } );
                };  
                
                function displaychatmsg(inputdata){
                    // create new post
                    var post = document.createElement("li");
                    var user = document.createElement("span");
                    user.className += 'chatuser';
                    user.innerText = inputdata['user'];
                    post.appendChild(user);
                    var msg = document.createElement("p");
                    msg.innerText  = inputdata['msg'];
                    post.appendChild(msg);
                    
                    // Get the chat window
                    var windows = document.getElementById("chatposts");
                    windows.appendChild(post);
                }
                
                async function createandjoinchat(chatService){
                    // Create a room 
                    var room = chatService.create({
                        // a unique ID for the chat room
                        id: 'articles' + article_id,
                        // either "room" or "channel"
                        type: "channel",
                        name: 'articles' + article_id,
                        topic: 'Chat about Article' + article_id,
                        // Either "public" or "private". 
                        membership: "public", 
                        // by default, if a room with this ID already exists, an Error is thrown.  Setting
                        // this flag to true avoids this error.                          
                        ignoreExistsError: true
                    }).then(chatId => {
                        return chatService.join(chatId);
                    }).then(room => {          
                        return room;
                    });
                    return room;
                }
                
                /* connect ot chat */
                // Create chat
                function chat(domain) {    
                    this.domain = domain;
                    
                    const chatService = domain.chat();                 
                    chatService.joined(
                    ).then(chatinfo => {
                          /* check already joined or not */
                           var notfound = true;
                           for(let i = 0; i < chatinfo.length; i++){
                               if ( chatinfo[i].chatId === 'articles' + article_id ) {
                                   notfound = false;
                                   break;
                               }
                           }
                           
                           var channel;
                           if (notfound) {
                               channel = createandjoinchat(chatService).then(room => { return room });
                           } else {
                               channel = chatService.get('articles' + article_id).then(channel => {
                                   return channel;
                               }) ;
                           }
                           return channel;
                    }).catch(e => {
                        channel = createandjoinchat(chatService).then(room => { return room });                    
                        return channel
                    }).then(room => {
                        this.channel = room;
                        // Listen for incoming messages

                        room.on("Message", evt => {
                            displaychatmsg({
                                msg:  evt.message.split(":").slice(1).join(':'),
                                user: evt.message.split(":")[0]
                            });
                        });
                        return room;
                    }).then( room => {
                        
                        var history = room.getHistory({
                            limit: 10,
                            eventFilter: ["message"]
                        }).then(response => { return response });
                        return history;
                    }).then( history => {
                        var eventnumbers = [];
                        if ( history.data.length > 0 ) {
                            history.data.slice().reverse().forEach(evt => {
                                // save eventnumber
                                eventnumbers.push(evt.eventNumber);
                                displaychatmsg({
                                    msg: evt.message.split(":").slice(1).join(':'),
                                    user: evt.user.username
                                });
                            });
                        }     
                        chatpossition = Math.min.apply(null, eventnumbers);
                        collaboratchannel = this.channel;
                        collaboratidomain = this.domain;
                    });
                };                                                                                                        
            }   
}

// monitor chat input filed
function handleMessageSubmission(event, articleid) {
    if (event.keyCode === 13) {
        /* check user is joined */
        const chatService = collaboratidomain.chat()
        chatService.joined(
        ).then(chatinfo => {
            var notfound = true;
            for(let i = 0; i < chatinfo.length; i++){
                if ( chatinfo[i].chatId === 'articles' +  articleid ) {
                    notfound = false;
                    break;
                }
            }
            /* if not joined */
            if (notfound) {
                chatService.join('articles' +  articleid).then();
            }
        }).then( ()=> {
            /* send msg */
            collaboratchannel.send(
                collaboratidomain.session().user().displayName+":"+document.getElementById("chatinput").value
            );
        }).then( () => {                   
            // clear value
            document.getElementById("chatinput").value = "";
        });
    }
}; 