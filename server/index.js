import { networkInterfaces } from 'os';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io'
import { existsSync, readFileSync, writeFileSync } from 'fs';

// Constantes
const port = 3000
const address = networkInterfaces()['en1'][1].address


// Serveurs
const serveurExpress = express();
const httpServeur = createServer(serveurExpress);
const socketServeur = new SocketIOServer(httpServeur)

//
serveurExpress.use(express.static('public'))



function prettyTime(){
    const time = new Date();
    const hours = time.getHours().toString().padStart(2, '0')
    const minutes = time.getMinutes().toString().padStart(2, '0')
    const seconds = time.getSeconds().toString().padStart(2, '0')

    return `${hours}:${minutes}:${seconds}`
}

// Socket

if(!existsSync('./messages.json')){
    writeFileSync('./messages.json', '[]');
}
const messages = JSON.parse(readFileSync('./messages.json'));

function sendMessage(socket, message){
    socket.emit("message",{
        ...message,
        isMine: socket.conn.remoteAddress == message.author
    })
}

async function broadcast(message){
    const sockets = await socketServeur.fetchSockets();
    for(let sock of sockets){
        sendMessage(sock, message)
    }
}

socketServeur.on('connection', (socket) => {
    for (let message of messages){
        sendMessage(socket, message)
    }
    socket.on('message', (msg) => {
        let message = {
            content: msg,
            time: prettyTime(),
            author: socket.conn.remoteAddress,
        }
        messages.push(message)
        broadcast(message)
    })

})

// Demarrer le serveur 
httpServeur.listen(port, ()=> {
    console.log(`Listening on ${address}: ${port}`)
})

process.on('SIGNINT',()=>{
    socketServeur.disconnectSockets();
    socketServeur.close();
    writeFileSync('./messages.json', JSON.stringify(messages));
    process.exit();
});