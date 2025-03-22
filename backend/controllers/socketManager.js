import { Server } from "socket.io"

let connections={}
let messages={}
let timeOnline={}
export const connectToSocket = (server) =>{
    const io = new Server(server,{
        cors:{
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders:["*"],
            credentials: true
        }
    });

    io.on("connection",(socket)=>{

        socket.on("join-call",(path)=>{
         if(connections[path] === undefined){
            connections[path]=[]
         }
         connections[path].push(socket.id)
         timeOnline[socket.id]=new Date();

         for(let a=0;a<connections[path].length;a++){
            io.to(connections[path][a]).emit("user-joined",socket.id,connections[path])
         }
      
        if (messages[path] !== undefined) {  // FIXED: Should check if messages exist
            for (let a = 0; a < messages[path].length; ++a) {
                io.to(socket.id).emit("message", {
                    text: messages[path][a]['data'],
                    sender: messages[path][a]['sender'],
                    socketIdSender: messages[path][a]['socket-id-sender']
                });
            }
        }

        })
        socket.on("signals",(toId,message)=>{
            io.to(toId).emit("signals",socket.id,message)
        })
        socket.on("chat-messages",(data,sender)=>{
          const [matchingRoom,found]=Object.entries(connections)
          .reduce(([room,isFound],[roomKey,roomValue])=>{
            if(!isFound && roomValue.includes(socket.id)){
              return [roomKey,true];
          }
               return[room,isFound];
        },['',false]);
        if(found === true){
            if(messages[matchingRoom] === undefined){
                messages[matchingRoom]=[]
            }
            messages[matchingRoom].push({"data":data,"sender":sender,"socket-id-sender":socket.id})
            console.log("messages",Key,":",sender,data)
            
            connections[matchingRoom].forEach((alem)=>{
                io.to(alem).emit("chat-message",data,sender,socket.id)
            })
        }
        })
        socket.on("disconnect",()=>{
           var diffTime = Math.abs(timeOnline[socket.id] - new Date())
           var key;
           for (const[k,v] of JSON.parse(JSON.stringify(Object.entries(connections)))){
            for(let a= 0 ;a<v.length;++a){
              if(v[a] === socket.id){
                key=k;
                for(let a=0;a<connections[key].length;a++){
                    io.to(connections[key][a].emit("user-left",socket.id))
                }
                var index = connections[key].indexOf(socket.id);
                connections[key].splice(index,1)
                if(connections[key] === 0){
                    delete connections[key];
                }
              }
            }
           }
        })
    })
    return io;

}