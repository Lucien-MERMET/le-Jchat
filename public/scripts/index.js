const socket = io();

const messageFeed = document.getElementById("message-feed");
const nameI = prompt("Veuillez entrer votre NOM: ")
function addMessage(content, time, isMine){
    const messageElement = document.createElement('div');
    messageElement.setAttribute('class',isMine ? 'message message-me' : 'message');

    const messageTime = document.createElement('p');
    messageTime.setAttribute('class', 'message-time');
    messageTime.innerText = time;

    const messageContent = document.createElement('p');
    messageContent.setAttribute('class', 'content');
    messageContent.innerText = content;

    messageElement.appendChild(messageTime);
    messageElement.appendChild(messageContent);

    messageFeed.appendChild(messageElement);
    messageFeed.scrollTo(0, messageFeed.scrollHeight);
}

addMessage("yoyoyo", '23h59', true)
addMessage("ftg et dors", '00h00', false)

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const msg = messageInput.value;
    if (msg != ""){
        
        socket.emit('message', msg);
        messageInput.value = ''

    }
})

socket.on("message", (msg)=>{
    if (msg.isMine){
        msg.author = nameI
        addMessage(msg.content,msg.author + `${msg.time}` , msg.isMine)
    }
    else{
        addMessage(msg.content, msg.author + msg.time , msg.isMine)
    }
    })
