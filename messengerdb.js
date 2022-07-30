const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://durhamj4:YXEp2Tfox99BrqN1@users.et496.mongodb.net/cps490-team04?retryWrites=true&w=majority";
const mongodbclient = new MongoClient(uri,{useNewUrlParser: true, useUnifiedTopology: true });
let db = null;
mongodbclient.connect( (err,connection) => {
    if(err) throw err;
    console.log("Connected to the MongoDB cluster!");
    db = connection.db();
    })

    
const dbIsReady = ()=>{
    return db != null;
};
const getDb = () =>{
    if(!dbIsReady())
        throw Error("No database connection");
    return db;
}
    
// other code
const checklogin = async (username,password)=>{
    var users =getDb().collection("users");
    var user= await users.findOne({username:username, password:password});
    if(user!=null && user.username==username){
        console.log("Debug>messengerdb.checklogin-> user found:\n" +JSON.stringify(user))
        return true;
    }

    return false
}

const addUser = async (username,password,email)=>{
    var users = getDb().collection("users");
    var user = await users.findOne({username:username});
    if(user!=null && user.username==username){
        console.log(`Debug>messengerdb.addUser: Username '${username}' exists!`);
        return "UserExist";
            }
    /*if(email!=null && user.email==email){
        console.log(`Debug>messengerdb.addUser: Email '${email}' already registered`);
        return "EmailExist";
    }*/
    let timestamp = Date.now();    
    const newUser = {"username": username,"password" : password, "email": email, "pfp": "https://i.stack.imgur.com/l60Hf.png", "description": "Nothing here yet", timestamp: timestamp}
    try{
        const result = await users.insertOne(newUser);
        if(result!=null){
            console.log("Debug>messengerdb.addUser: a new user added: \n", result);
            return "Success";
                }   
    }catch{
            console.log("Debug>messengerdb.addUser: error for adding '" + username +"':\n", err);
            return "Error";
            }
    }










    
const creategroupchat= async()=>{
    //TODO
    //create a new database/storage number that is checked here in messenger. 
    //set the creator as an admin
    //When creating the chat, allow the user(the admin) to add people through a prompt
    //Using the same code as in private chat, "alert" a (specific socket)user if they have been invited to a chat,
    //if user accepts, call an accept invite function that adds the user to the database
    

    //allow the user to name chat and give the chat an id, 
        //check if id/name is already taken.

}

const addprofilepicture = async (username, image)=>{
    try{
        users.updateOne(Filters.eq("users",username), Updates.set(image,image));
        return "profile picture updated";        

    }catch{
        console.log("Debug>messengerdb.addUser: error for changing '" + username +"to"+ newusername+"':\n", err);
        return "Error";
    }
}

const getprofilepicture = async (username, image)=>
{}



const checkChatMember= async (username, chatID)=> {
    var users = getDb().collection("users");
    //above code default, subject to change depending on db implementation
    var user= await users.findOne({username:username, chatId:chatID});

    //TODO
    //user attempts to access a current group chat, or some other code
    //check if username has chat ID stored in database and is a member/admin.
    if(user!=null && user.chatID==chatID){
        console.log('Debug>messengerdb checkChatMember: User is a member');
        return true;
    }
    //Example:show allow access if true, else through an alert in front end that says they are not allowed.
    console.log('Debug>messengerdb checkChatMember: User NOT is a member. Access denied');
    return false;
}

const deleteGroupChat=async (chatID, adminKey)=> {
    //TODO
    //in backend:
        //check if user is an admin of a given groupchat
        //prompt user for password before deleting chat (in small private chat like window)
        //give user ability to abort deletion prompt
        //if correct password is input, remove all memebers and delete the chat from display
    //frontend:
        //find all users with a given chat ID
        //update all users to remove their id from a chat id
    try{
        var users = getDb().collection("users");
        //note at some point, id must be an added variable into a mongodb database
        var members= await users.find({chatID:chatID});
        users.updateOne(Filters.eq("users",username), Updates.set(username,newusername));
        return "chat has been removed";
    }catch{
        console.log("Debug>messengerdb.addUser: error for deleting chat #"+id+":\n", err);
        return "fail"
    }
    
}

const changeUsername=async(username, newusername)=>{
    var users = getDb().collection("users");
    var user = await users.findOne({username:username});
    if(user.username==newusername){
        console.log('Debug>messengerdb checkChatMember: This username is taken');
        return "existing username";
    }
    try{
        console.log("starting change")
        users.updateOne({_id:user._id},{$set:{"username":newusername}});
        console.log("username changed to "+newusername);
        return "username updated";        

    }catch{
        console.log("Debug>messengerdb.addUser: error for changing '" + username +" to "+ newusername+"':\n");
        return "Error";
    }
}

const storePublicChat = (receiver,message)=>{
    console.log("DEBUG>> Storing Private message to MongoDB");
    //TODO: validate the data
    let timestamp = Date.now();
    let chat = {receiver: receiver, message:message, timestamp:timestamp};
    try{
        const inserted = getDb().collection("public_chat").insertOne(chat);
        if(inserted!=null){
            console.log("Debug>messengerdb.storePublicChat: a new chat message added: \n", JSON.stringify(chat));
        }
    }catch{
        console.log("Debug>messengerdb.storePubli: error for adding '" +
        JSON.stringify(chat) +"'\n");
        }
    }

    const storePrivateChat = (receiver, message)=>{
        console.log("DEBUG>> Storing Private message to MongoDB");
        let timestamp = Date.now();
        let chat = {receiver: receiver, message:message, timestamp:timestamp};
    try{
        const inserted = getDb().collection("private_chat").insertOne(chat);
        if(inserted!=null){
            console.log("Debug>messengerdb.storePrivateChat: a new chat message added: \n", JSON.stringify(chat));
        }
    }catch{
        console.log("Debug>messengerdb.storerivateChat: error for adding '" +
        JSON.stringify(chat) +"'\n");
        }
    }
  
    const storeGroup1 = (receiver,message)=>{
        console.log("DEBUG>> Storing Groupchat 1 message to MongoDB");
        let timestamp = Date.now();
        let chat = {receiver, receiver, message:message, timestamp:timestamp};
        try{
            const inserted = getDb().collection("group_chat_1").insertOne(chat);
            if(inserted!=null){
                console.log("Debug>messengerdb.storeGroupChat1: a new chat message added: \n", JSON.stringify(chat));
            }
        }catch{
            console.log("Debug>messengerdb.storeGroupChat1:'" +
            JSON.stringify(chat) +"'\n");
            
        }
    }

    const storeGroup2 = (receiver,message)=>{
        console.log("DEBUG>> Storing Groupchat 2 message to MongoDB");
        let timestamp = Date.now();
        let chat = {receiver, receiver, message:message, timestamp:timestamp};
        try{
            const inserted = getDb().collection("group_chat_2").insertOne(chat);
            if(inserted!=null){
                console.log("Debug>messengerdb.storeGroupChat2: a new chat message added: \n", JSON.stringify(chat));
            }
        }catch{
            console.log("Debug>messengerdb.storeGroupChat2:'" +
            JSON.stringify(chat) +"'\n");
            
        }
    }

    const storeGroup3 = (receiver,message)=>{
        console.log("DEBUG>> Storing Groupchat 3 message to MongoDB");
        let timestamp = Date.now();
        let chat = {receiver, receiver, message:message, timestamp:timestamp};
        try{
            const inserted = getDb().collection("group_chat_3").insertOne(chat);
            if(inserted!=null){
                console.log("Debug>messengerdb.storeGroupChat3: a new chat message added: \n", JSON.stringify(chat));
            }
        }catch{
            console.log("Debug>messengerdb.storeGroupChat3:'" +
            JSON.stringify(chat) +"'\n");
            
        }
    }    

    const loadChatHistory = async (receiver, limits=100)=> {
    var chat_history = await getDb().collection("public_chat").find(
        {receiver:receiver}).sort({timestamp:-1}).limit(limits).toArray();
        //print debug info e.g., using JSON.stringify(chat_history)
        if (chat_history && chat_history.length > 0) return chat_history
        }
    
    const loadPrivateChatHistory = async (receiver, limits=100) =>{
        var private_chat_history = await getDb().collection("private_chat").find({receiver:receiver}).sort({timestamp:-1}).limit(limits).toArray();
        if(private_chat_history && private_chat_history.length > 0){
            return private_chat_history;
        }
    }
    const loadGroup1History = async (receiver, limits=100) =>{
        var history = await getDb().collection("group_chat_1").find({receiver:receiver}).sort({timestamp:-1}).limit(limits).toArray();
        if(history && history.length > 0){
            return history;
        }
    }
    const loadGroup2History = async (receiver, limits=100) =>{
        var history = await getDb().collection("group_chat_2").find({receiver:receiver}).sort({timestamp:-1}).limit(limits).toArray();
        if(history && history.length > 0){
            return history;
        }
    }
    const loadGroup3History = async (receiver, limits=100) =>{
        var history = await getDb().collection("group_chat_3").find({receiver:receiver}).sort({timestamp:-1}).limit(limits).toArray();
        if(history && history.length > 0){
            return history;
        }
    }
    
    const getUserInfo= async (username, limits=1) => {
        var user_info = await getDb().collection("users").find(
            {username:username}).sort({timestamp:-1}).limit(limits).toArray();
        console.log(user_info)
        if(user_info){
            console.log("True")
        }
        else{
            console.log("false")
        }
        if (user_info && user_info.length > 0) return user_info 
    }
module.exports = {checklogin,addUser,storePublicChat,loadChatHistory,storePrivateChat,loadPrivateChatHistory, storeGroup1,loadGroup1History,storeGroup2,loadGroup2History,storeGroup3,loadGroup3History,checkChatMember,changeUsername,getUserInfo};
