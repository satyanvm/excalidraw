 "use client"

import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}){

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(()  => {
        const ws = new WebSocket('ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNWI5NzE5Yy1lZjA3LTQ4MGMtYTQwMi01YWJlNTBiYzI5N2UiLCJpYXQiOjE3NTA3NjM3NDR9.nSCuytzovpoE5ZNP5S9Zl7EyqYCE5BzhVA1Jx7GM65I')

        ws.onopen = () => {
            setSocket(ws)
            ws.send(JSON.stringify({
                type: "join_room",
                roomId: Number(roomId)
            }))  
        }
    }, []) 

    if(!socket){
        return <div>
            Connecting to server...
        </div> 
    }

    return <div>
        <Canvas roomId = {Number(roomId)} socket = {socket}></Canvas>
      </div> 
 }
    