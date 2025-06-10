"use client"

import React from "react";
import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({messages, id}:  { messages: { type: string; x: Number; y: Number; height: Number, width: Number }[];
id: Number
} ){ 

const { socket, loading} = useSocket();
const [chats, setChats] = useState(messages);
const [currentMessage, setCurrentMessage] = useState("");
console.log("ChatRoomClient rendered");
useEffect(() => {
    console.log("useEffect triggered");
    if(socket && !loading){

        socket.send(JSON.stringify({
            type: "join_room",
            roomId: id
        }))
        socket.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            console.log("inside socket.onmessage and before if chat")
            if(parsedData.type === "chat"){
                console.log("inside the socket.onmessage and if chat statement");
    setChats(c => [...c, parsedData]);

            } 
        }

    }
    return () => {
        socket?.close()
    }

}, [socket, loading,id])

return <div>
{/* 
        {/* {chats.map((chat, index) => (
         <p key={chat.id || index}>{chat.message.trim()}</p>
        ))} */} */

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