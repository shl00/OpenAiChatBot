import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
function App() {
  const [prompts, addPrompt] = useState([]);        //store prompt objects used by OpenAi api
  const [currentInput, setInput] = useState("");    //store Input of TextField
  const [inputHeight,changeHeight] = useState("30px");  //store Height of textField
  const [dots,setDots] = useState("");                //for dot Animation when waiting for response
  const ref = useRef(null);                           //ref for empty div on bottom of chatHistory to scroll down once a new message is posted
  
  //controll input of textfield
  const inputHandler = (e) => {
    const input = e.target.value;
   
    let height = 1;
    for(let a of input){    //increase height of textfield for every new Line
      if(a === "\n"){
        height++;
      }
    }
    height*=30;
    if(height > 90){        //height limit is 130px
     changeHeight(`${130}px`)
    }
    else{
      changeHeight(`${height}px`)
    }
    setInput(e.target.value);
  }

  useEffect(() => {
    const url = window.location.search;           // get UserId parameter for server
    const params = new URLSearchParams(url);

    console.log(params.get("User"));  
    fetch(`http://localhost:3000/${params.get("User")}`)      //get Messages for current user stored on server
      .then(res => res.json().then(data => addPrompt(data)));

  }, [])
  
  useEffect(() => {
    const url = window.location.search;
    const params = new URLSearchParams(url);   // get UserId parameter for server
    ref.current?.scrollIntoView({behavior: 'smooth'})  //scroll to newest message
    if (prompts.length > 0 && prompts[prompts.length - 1].role === "user") {  //cannot submit empty message, user has to wait for awnser to submit a new message

      setInput("");   //delete current text in textfield when message is submitted by user
      try {
        fetch(`http://localhost:3000/${params.get("User")}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prompts[prompts.length - 1]),
        })
          .then(res => {
            if (res.ok) {
              
              console.log(dots)
              res.json().then(data =>
                
                addPrompt([...prompts].concat(data)));        //add message object of AI 
              
            }
          
          })
      } catch (error) {
        console.log(error)
      }
    }
  }, [prompts])
  const sendPrompt = (e) => {
    
    e.preventDefault();
    if (currentInput.length > 0) {
      addPrompt([...prompts].concat(                  //add  use message object
        { role: "user", content: currentInput },        
      
      ));
      setDots(".");                                 //starts dots animation
     
    }

  }
  useEffect(() =>{
    if(dots.length > 0){            
     
      setTimeout(() => {
      
          if(dots.length < 5){              //add dot every 500ms until 3 dots then start over again
            setDots(dots +" ." )
          }
          else{
            setDots(".");
          }
        
      },500);
    
    }
  })
  const latestPrompt = () =>{                       //get latest promt
    const latest = prompts[prompts.length -1];
    if(latest === undefined){
      return "";
    }
    else{
      return latest.role;
    }
  }
  return (
<div className="App">
      
      

        <div id="chatHistory" key="chatHistory" className="jumbotron">
          {prompts.map(prompt =>
            prompt.role ==="user" ?                         //render every prompt stored in prompt array, different css classe for user and assistant 
            (<div className={prompt.role}>                  
               <label>User</label>
              <div>{prompt.content}</div>
             
            </div>)
            :
            (<div className={prompt.role}>
              <label>Bot</label>
              <div>{prompt.content}</div>
              
            </div>)
            
          )}
          
          {//dots only displayed when waiting for AI answer
           latestPrompt() === "user" ? <div  className="assistant">      
            <label>Bot</label>
             <div id ="dots">{dots}</div>
            </div>
            :
            null
          }
         <div  ref = {ref}></div>
        </div>

        <form class="form-inline" key="inputPrompt">
          <div className="container">
            {parseInt(inputHeight.substring(0,inputHeight.length-1)) < 90 ?
            (
            <textarea style = {{height: inputHeight}}
            className="form-control"  id  = "textInput" placeholder='Your Message' onChange={inputHandler} key="prompt" value={currentInput} />
            ):
            (       <textarea style = {{height: inputHeight}}
              className="form-control"  id  = "textInputScroll" placeholder='Your Message' onChange={inputHandler} key="prompt" value={currentInput} />)}
            
            <button className="btn btn-warning" type="button" onClick={sendPrompt} key="submitButton">send</button>
          </div>

        </form>

      </div>
    
  );
}

export default App;
