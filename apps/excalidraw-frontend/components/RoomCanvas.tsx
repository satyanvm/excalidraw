 "use client"

import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}){

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(()  => {
        const ws = new WebSocket('ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwODMwY2JkYS02Mjc4LTQ2NTMtYmNjOS05OWNjZTdlMzI5MjgiLCJpYXQiOjE3NDk1NjU0Nzl9.L-n7Uns2r9gwaJUJAuM9r7amLFx_Sq5ZCZzotksSjio')

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
        <Canvas roomId = {roomId} socket = {socket}></Canvas>
      </div>
 }
    