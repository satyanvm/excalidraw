 "use client"

import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}){

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(()  => {
        const ws = new WebSocket('ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZjZhZTg0ZS02NzlhLTQxNGQtYmUwNC00MTA3Zjg1NjhmOGEiLCJpYXQiOjE3NDkwNDU3MzF9.5GXTXz3buFRCstmSaTrSTPvZbcbX-T9VVPaWW8uNcfU')

        ws.onopen = () => {
            setSocket(ws)
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            })) 
        }
    }, [])

    if(!socket){
        return <div>
            Connecting to server...
        </div>
    }

    return <div>
        <Canvas roomId = {roomId} socket = {socket}></Canvas>
      </div>
 }