
import OpenAi from "openai"
import { createRequire } from "module";
import 'dotenv/config'
const require = createRequire(import.meta.url)
const openai = new OpenAi({
    apiKey: process.env.AI_KEY
});
const express = require("express");
const cors = require("cors");
console.log(process.env.AI_KEY)
const app = express();
const users = []                            //store Users and all Messages in current Session
app.use(cors())                 
app.use(express.json());
app.use(express.urlencoded({extended :true}))

function getUser(userName){                         //get stored User
    for(let i = 0; i < users.length; i++){
        if(users[i].name === userName){
            return users[i];
        }
    }
    return null;
}
app.post('/:userId',(req,res) => {
    console.log(req.params.userId)
    console.log(req.body)
    let user = getUser(req.params.userId);                          //check if User exists
    if(user != null){
        console.log(`User ${req.params.userId} exists`);  
    }
    else{
        user = {name:req.params.userId ,messages :[]};                   // create  and add new User if user doesnt exist
        users.push(user);
        console.log(`New user ${req.params.userId} created`);
    }
    user.messages.push(req.body)
   openai.chat.completions.create({                                 // get answer from OpenAi
   
       messages:user.messages,
       model: "gpt-3.5-turbo",
   }).then(answer =>{ console.log(answer.choices[0].message.content);
       res.json(answer.choices[0].message);                     //send message object to client
       user.messages.push(answer.choices[0].message);
   });
   return;
})
app.get('/:userId',(req,res) => {
    
    for(let i = 0; i < users.length;i++){                   // send stored messages of the user
        let user = users[i];
       if(user.name === req.params.userId){
           res.json(users[i].messages);
       return;
       }
      }
})
app.listen(3000, () => console.log("Listening on Port 3000"));