import {  RoomCanvas } from "@/components/RoomCanvas";
import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";

export default async function CanvasPage({params}: {
    params: {
        roomId: string 
    } 
}){
    const roomId =   (await params).roomId;
    console.log("the roomid in canvas/id is " + roomId);

   return <RoomCanvas roomId = {roomId}></RoomCanvas>
}
 