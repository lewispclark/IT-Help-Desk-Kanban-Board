var messages = [], //
  lastUserMessage = "", //keeps track of the most recent input string from the user
  botMessage = "", //keeps track of what the chatbot is going to say
  botName = 'Chatster' 

function openChatbox(){
    document.getElementById("chatbutton").style.visibility="hidden";
  document.getElementById("bodybox").style.visibility="visible";
}

function closeChatbox(){
    document.getElementById("chatbutton").style.visibility="visible";
  document.getElementById("bodybox").style.visibility="hidden";
}

function chatbotResponse() {

console.log(lastUserMessage);

  if (['hi', 'hello', 'howdy'].includes(lastUserMessage)) {
	  console.log("here");
    return 'Hello!';
  }
  
  if (lastUserMessage == 'What is your name?') {
    return 'My name is ' +botName;
  }	

  if (lastUserMessage == 'I am unable to understand how the ticketing system works') {
    return 'Click on the option that says FAQ and it will help you navigate the system ' + botName;
  }
  
  if (lastUserMessage == 'There is something wrong with my laptop! It will not load my work') {
    return 'Please click on the FAQ option and it will help you solve your problem. If problem persists contact a specialist or email them for support!';
  }
   
  if (lastUserMessage == 'Who do I contact for help?') {
    return 'Contact a specialist by phone or through email for support!';
  }	

if (['bye', 'goodbye', 'thank you'].includes(lastUserMessage)) {
    return 'Thank you and Goodbye!';
  }	
  
  return "I do not understand... Please contact a specialist!";
  
}

function newEntry() {
   if (document.getElementById("chatbox").value != "") {
    //pulls the value from the chatbox ands sets it to lastUserMessage
    lastUserMessage = document.getElementById("chatbox").value;
    //sets the chat box to be clear
    document.getElementById("chatbox").value = "";
	console.log(lastUserMessage);
    messages.push(lastUserMessage);
    //takes the return value from chatbotResponse() and outputs it
    
    messages.push("<b>" + botName + ":</b> " + chatbotResponse())
    for (var i = 1; i < 7; i++) {
      if (messages[messages.length - i])
        document.getElementById("chatlog" + i).innerHTML = messages[messages.length - i];
    }
  }
}
 
document.onkeypress = keyPress;
//if the key pressed is 'enter' runs the function newEntry()
function keyPress(e) {
  var x = e || window.event;
  var key = (x.keyCode || x.which);
  if (key == 13 || key == 3) {
     newEntry();
  }
}