import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";

export function Canvas({
    roomId,               
    socket     
}: { 
    roomId: string,
    socket: WebSocket
}){ 

        const canvasRef = useRef<HTMLCanvasElement>(null);
            console.log("before use effect of canvasRef.current");
        useEffect(() => {

        if(canvasRef.current){
            console.log("inside of canvasRef.current");
         initDraw(canvasRef.current, roomId, socket)    
        }   

    }, [canvasRef]); 

    return <canvas ref = {canvasRef} width = {1300} height = {1300}></canvas>

} 