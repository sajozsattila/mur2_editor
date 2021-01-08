
function collaborative(cjwt, title, article_id) {
            // just saved article can be shared
            if ( parseInt(article_id) > 0 ){                        
                var domainUrl = "https://mur2.co.uk:9000/api/realtime/convergence/default";
            
                // 1. Connect to the domain anonymously.
                Convergence.connectWithJwt(domainUrl, cjwt)
                    .then(initApp)
                    // .then(chat) # commented out as there is a bug in Convergence
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
                
                /* connect ot chat */
                // Create chat
                function chat(domain) {    
                    this.domain = domain;
                    
                    var identityService = domain.identity();
                    var user = identityService.session().user();
                    console.log(user);
                            
                    
                    const chatService = domain.chat();                    
                    // Create a room 
                    chatService.create({
                        // a unique ID for the chat room
                        id: 'articles' + article_id,
                        // either "room" or "channel"
                        type: "channel",
                        name: 'articles' + article_id,
                        topic: 'Chat about Article' + article_id,
                        // Either "public" or "private".  Room chats must be public
                        membership: "public", 
                        // by default, if a room with this ID already exists, an Error is thrown.  Setting
                        // this flag to true avoids this error.                          
                        ignoreExistsError: true
                    }).then(chatId => {
                        // Join the room
                        return chatService.join(chatId);
                    }).then(room => {
                        this.channel = room;
                        
                        // Listen for incoming messages
                        room.on("Message", evt => {
                            displaychatmsg({
                                msg:  evt.message.split(":").slice(1).join(':'),
                                user: evt.message.split(":")[0]
                            });
                        });
                        
                        /* get history */
                        /* this have a bug in so at the moment the chat is not active */
                        room.getHistory({
                            startEvent: 0,
                            limit: 10,
                            forward: true
                        }).then(response => {
                            console.log(response);
                            if ( response.length > 0 ) {
                                response.data.forEach(event => {
                                    console.log(event);
                                });
                            }
                        }).catch(error => {
                            console.log("No history: " + error);
                        });
                        

                        // Send a message
                        room.send(this.domain.session().user().displayName+": OMG no. So much text: I'm dreaming in Markdown");

                    }).catch(e => {
                        console.log(e);
                    });
                    
                };                                           
                
                // monitor chat input filed
                function chatinput(event) {
                    if (event.keyCode === 13) {
                        try {
                           this.channel.send(
                               this.domain.session().user().displayName+":"+document.getElementById("chatinput").value
                           );
                        } catch (e) {
                            // handle errors.  say, the user isn't currently connected
                            console.log(e);
                        }
                   
                        // clear value
                        document.getElementById("chatinput").value = "";
                    }
                };                              
            }   
}