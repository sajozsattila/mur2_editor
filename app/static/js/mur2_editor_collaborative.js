
var collaboratidomain;
var collaboratchannel;

function collaborative(cjwt, title, article_id) {
            // just saved article can be shared
            if ( parseInt(article_id) > 0 ){                        
                var domainUrl = "https://mur2.co.uk:9000/api/realtime/convergence/default";
            
                // 1. Connect to the domain anonymously.
                Convergence.connectWithJwt(domainUrl, cjwt)
                    .then(initApp)
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
                        // Either "public" or "private".  Room chats must be public
                        membership: "private", 
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
                        if ( history.data.length > 0 ) {
                            history.data.slice().reverse().forEach(evt => {
                                displaychatmsg({
                                    msg: evt.message.split(":").slice(1).join(':'),
                                    user: evt.user.username
                                });
                            });
                        }                       
                        
                        collaboratchannel = this.channel;
                        collaboratidomain = this.domain;
                    });
                };                                                                                                        
            }   
}

// monitor chat input filed
function handleMessageSubmission(event) {
    if (event.keyCode === 13) {
        try {
            collaboratchannel.send(
                collaboratidomain.session().user().displayName+":"+document.getElementById("chatinput").value
            );
        } catch (e) {
            // handle errors.  say, the user isn't currently connected
            console.log(e);
        }
                   
        // clear value
        document.getElementById("chatinput").value = "";
    }
}; 