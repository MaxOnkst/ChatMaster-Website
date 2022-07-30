var http = require('http')
var express = require('express')
var app = express()
var server = http.createServer(app)
var xssfilter = require("xss");
const port = process.env.PORT || 8080
server.listen(port);
console.log(`Express HTTP Server is listening at port ${port}`)
app.use(express.static('public'))
app.get('/', (request, response) => {
  console.log("Got an HTTP request")  
  response.sendFile(__dirname+'/index.html')
  })
  var io = require('socket.io');
  var Userlist = []; //stores usernames in an array 
  var socketio = io.listen(server);
  console.log("Socket.IO is listening at port: " + port);
  socketio.on("connection", function (socketclient){
      console.log("A new Socket.IO client is connected. ID= " + socketclient.id);   
      console.log("Connected Clients: ");//out puts in debug the connected clients
          var sockets = socketio.sockets.sockets;
          for(var socketId in sockets){
              var socketclient = sockets[socketId];
              console.log(socketclient.id);
          }
          socketclient.on("login", async (username,password) => {
            console.log("Debug>Got username="+ username + ";password="+ password);
            var exist=false;
            for(i=0;i<Userlist.length-1;i++){
                    if (Userlist[i].username==username){
                        exist=true;
                        i=Userlist.length-1;
                    }
                }
            if(exist==true){
                socketclient.authenticated=false;
                var invalidlgMessage = "Warning, invalid login.";
                console.log(invalidlgMessage);
                socketclient.emit("InvalidLogin", invalidlgMessage);
            }
            else{
            var checklogin = await DataLayer.checklogin(username,password)
            if(checklogin){
                socketclient.authenticated=true;
                socketclient.emit("authenticated");
                socketclient.username=username;
                var welcomeMessage= username + " has joined the chat system";
                console.log(welcomeMessage);
                SendToAuthenticatedClients(socketclient, "Welcome", welcomeMessage);

                //public chat history
                var chat_history = await messengerdb.loadChatHistory(username);
               
                if(chat_history && chat_history.length > 0){
                    chat_history = chat_history.reverse()
                    //reverse the order as we get the latest first
                    socketclient.emit("chat_history",chat_history)
                }

                //private chat history
                var private_chat_history = await messengerdb.loadPrivateChatHistory(username);

                if(private_chat_history && private_chat_history.length > 0){
                    private_chat_history = private_chat_history.reverse();
                    socketclient.emit("private_chat_history", private_chat_history);
                }

                //Group chat 1 history
                var group1_history = await messengerdb.loadGroup1History(username);

                if(group1_history && group1_history.length > 0){
                    group1_history = group1_history.reverse();
                    socketclient.emit("group1_chat_history", group1_history);
                }

                //Group chat 2 history
                var group2_history = await messengerdb.loadGroup2History(username);

                if(group2_history && group2_history.length > 0){
                    group2_history = group2_history.reverse();
                    socketclient.emit("group2_chat_history", group2_history);
                }

                //Group chat 3 history
                var group3_history = await messengerdb.loadGroup3History(username);

                if(group3_history && group3_history.length > 0){
                    group3_history = group3_history.reverse();
                    socketclient.emit("group3_chat_history", group3_history);
                }

                Userlist.push(username);
                socketio.sockets.emit("UpdateUserList", Userlist);
                //socketio.emit("welcome", welcomeMessage);


                }

            else{
                socketclient.authenticated=false;
                var invalidlgMessage = "Warning, invalid login.";
                console.log(invalidlgMessage);
                socketclient.emit("InvalidLogin", invalidlgMessage);
                }
            }
            });
       /* socketclient.on("login", (username)=>{
     console.log("Debug>Got username="+ username);
     if (DataLayer.checklogin(username)){
        socketclient.authenticated=true;
        socketclient.emit("authenticated")
        socketclient.username=username;
        var welcomemessage= username+ " has joint the chat system!";
        console.log(welcomemessage);
        //socketio.sockets.emit("welcome",welcomemessage);
        SendToAuthenticatedClient(socketclient,"welcome",welcomemessage);
         }
            
      });
      */
      //this will have to be updated to account for new username in database
      socketclient.on("getuserinfo", (not=1)=> {
        console.log(socketclient.username);
        username=socketclient.username;
        console.log(username)
        var user_info = DataLayer.getUserInfo(username);
        console.log(JSON.stringify(user_info))
        if (!user_info.username){
            socketclient.emit("defaultuserinfo", user_info);
        }
        else{
            socketclient.emit("returneduserinfo", user_info);
        }
      })


      socketclient.on("changeUsername", (username, newUsername) => {
          /*var originalName = socketclient.username;
          socketclient.username = newUsername;
          var welcomemessage = originalName + " has changed their name to " + newUsername;
          console.log(welcomemessage);
          socketio.sockets.emit("welcome", welcomemessage);*/
          var newusername_result = DataLayer.changeUsername(username,newUsername);
          if(newusername_result=="username updated"){
            socketclient.username = newUsername;
            socketclient.emit("username updated",newusername_result);
          }
          //create a new java function on server side?
          else if(newusername_result=="existing username"){
              socketclient.emit("existing username",newusername_result);
          }
          else{
            socketclient.emit("Error",newusername_result);
          }
         
                 
      });
      socketclient.on("register",async (username,email,password,passwordsec)=> {
        //input check conditions
        base_result="";
        if(password!=passwordsec){
            
            console.log("different password");
            socketclient.emit("badpassreenter", base);
        }
        else if(username==null || username.length<=4){
            console.log("bad username");
            socketclient.emit("badusername", base_result);
        }
        
        else if(email==null){
            console.log("bad email");
            socketclient.emit("bademail", base_result);
        }
        //Call the Data Layer to register
        else{
            const registration_result = await
            DataLayer.addUser(username,password,email);
            socketclient.emit("registration",registration_result);
            }
        })
      socketclient.on("chat", (message) => {
          var chatmessage = socketclient.username + " says: " + message;
          console.log(chatmessage);
          //socketio.sockets.emit("chat", chatmessage);
          SendToAuthenticatedClients(undefined, "chat", chatmessage);
      });
      socketclient.on("friend", (friendmessage) => {
        var friendText= friendmessage + " has become your friend";
        console.log(friendText);
        socketio.sockets.emit("friend", friendText);
    });
    socketclient.on("removefriend", (friendmessage) => {
        var removefriendText= friendmessage + " has removed from your friend list";
        console.log(removefriendText);
        socketio.sockets.emit("removefriend", removefriendText);
    });
      socketclient.on("chatroom1", (openchat1message) => {
        var chatroom1message = socketclient.username + " says: " + openchat1message;
        console.log(chatroom1message);
        socketio.sockets.emit("chatroom1", chatroom1message);
        for(var socketId in sockets){
            var client = sockets[socketId];
            messengerdb.storeGroup1(client.username,chatroom1message);
        }        
    });
    socketclient.on("chatroom2", (openchat2message) => {
        var chatroom2message = socketclient.username + " says: " + openchat2message;
        console.log(chatroom2message);
        socketio.sockets.emit("chatroom2", chatroom2message);
        for(var socketId in sockets){
            var client = sockets[socketId];
            messengerdb.storeGroup2(client.username,chatroom2message);
        }
    });
    socketclient.on("chatroom3", (openchat3message) => {
        var chatroom3message = socketclient.username + " says: " + openchat3message;
        console.log(chatroom3message);
        socketio.sockets.emit("chatroom3", chatroom3message);
        for(var socketId in sockets){
            var client = sockets[socketId];
            messengerdb.storeGroup3(client.username,chatroom3message);
        }
    });
    
      socketclient.on("pm", (pmTo, message) => {          
          var chatmessage = socketclient.username + " says to " + pmTo +": " + message;
          console.log("Receiver: " + pmTo);
          console.log("Message sent privately: " + chatmessage);
          var sockets = socketio.sockets.sockets;
          for(var socketId in sockets){
              if(sockets[socketId].username == pmTo){
                  tf = true;
                  console.log("receiver found");
                  console.log("Emitting to " + sockets[socketId].username);     
                  socketclient.emit("pchat", pmTo, chatmessage);             
                  sockets[socketId].emit("pchat", pmTo, chatmessage);
                  messengerdb.storePrivateChat(sockets[socketId].username, chatmessage);
              }
          }

        
          //socketio.sockets.emit("pchat", pmTo, chatmessage);
      });
      //this function will need to be adjusted to access the database and change a username
      socketclient.on("editUsername", (newUsername) => {
          socketclient.newUsername = newUsername;
          var welcomemessage = username + " has changed their name to " + newUsername;
          console.log(welcomemessage);
          socketio.sockets.emit("welcome", welcomemessage);
      });
      socketclient.on("<TYPING>",function(){
         if((socketclient.username==null||socketclient.username==undefined)){return;}
         var msg=socketclient.username;
         socketio.sockets.emit("<TYPING>",msg);
         console.log("[<TYPING>,"+ msg +"] is sent to all clients");
     });
     socketclient.on("quit", (username) => {
         var logout = socketclient.username + " has logged out.";
         console.log(logout);
         Userlist = Userlist.filter(v => v !== username);
         //socketio.sockets.emit("logout", logout);
         socketio.sockets.emit("chat", logout);
         socketio.sockets.emit("UpdateUserList", Userlist);
     });
    });
     var messengerdb=require("./messengerdb")
     var DataLayer= {
         info:'Data Layer Implementation for Messenger',
         async checklogin(username,password){
            var checklogin_result = await messengerdb.checklogin(username,password)
            console.log("Debug>DataLayer.checklogin->result="+checklogin_result)
            return checklogin_result
            }
        ,
        async addUser(username,password,email){
            const result = await messengerdb.addUser(username,password,email);
            return result;
            }
            ,
        async changeUsername(username, newusername){
            const result =await messengerdb.changeUsername(username, newusername);
            console.log("Debug>DataLayer.changeUsername->result="+result)
            return result;
        }
        ,
        async getUserInfo(username){
            const result=await messengerdb.getUserInfo(username);
            console.log("Debug>DataLayer.getUserInfo->result="+result)
            return result;
        }
            


             
     }
     function SendToAuthenticatedClients(sendersocket,type,data){
         var sockets= socketio.sockets.sockets;
         for(var socketId in sockets){
             var socketclient = sockets[socketId];
             if(socketclient.authenticated){
                var data = xssfilter(data);
                 socketclient.emit(type,data);
                 var logmsg="Debug>sent to"+
                 socketclient.username + "with ID"+ socketId;
                 console.log(logmsg);
                 if(type==="chat"){ //New use case: store the chat message
                    messengerdb.storePublicChat(socketclient.username, data);
                }
             }
         }
     }
