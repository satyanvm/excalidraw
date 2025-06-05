"use client"

import React from "react";
import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({messages, id}:  { messages: { id: number; roomId: number; userId: string; message: string }[];
id: Number
} ){ 

const { socket, loading} = useSocket();
const [chats, setChats] = useState(messages);
const [currentMessage, setCurrentMessage] = useState("");

useEffect(() => {
    if(socket && !loading){

        socket.send(JSON.stringify({
            type: "join_room",
            room: id
        }))
        socket.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            if(parsedData.type === "chat"){
setChats(c => [...c, {
  id: parsedData.id,
  roomId: parsedData.roomId,
  userId: parsedData.userId,
  message: parsedData.message.trim()
}]);
            } 
        }

    }
    console.log("the chats right now is " + chats);
}, [socket, loading,id])

return <div>

{chats.map((chat, index) => (
  <p key={chat.id || index}>{chat.message.trim()}</p>
))}

        <input type = "text" value = {currentMessage} onChange={e => {
            setCurrentMessage(e.target.value)
        }}></input> 

        <button onClick={() => {
            socket?.send(JSON.stringify({
                "type": "chat",
                "roomId": id,
                "message":currentMessage
         } ))

         setCurrentMessage("");

        }}>Send Message</button>

        
</div>
}