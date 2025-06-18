import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./Icons";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "@/draw/Game";

type Shape = "circle" | "rect" | "pencil";
 
let activated = "";

export function Canvas({  
    roomId,               
    socket     
}: { 
    roomId: Number, 
    socket: WebSocket
}){
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [selectedTool, setSelectedTool] = useState<Shape>("circle") 
        const [game, setGame] = useState<Game>();

        useEffect(() => {
            console.log("inside useEffect")
            if(!game){
                console.log("no game object available here")
                return;
            }
        game.setTool(selectedTool);
            }, [selectedTool, game]);

        useEffect(() => {

        if(canvasRef.current){
                
            const g = new Game(canvasRef.current, roomId, socket)
            setGame(g);

            return () => {
                g.destroy()
            }
  
        }   

    }, [canvasRef]); 

    return <div className="h-screen overflow-hidden bg-white">
        <canvas ref={canvasRef}></canvas>
        <TopBar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>

}   

export function TopBar({
    selectedTool,
    setSelectedTool
}: {
    selectedTool: Shape,
    setSelectedTool: (tool: Shape) => void
}) {
    if(selectedTool === "circle"){
        activated = "circle"
    } else if(selectedTool === "rect"){
        activated = "rect"
    } else if(selectedTool === "pencil"){
        activated = "pencil"
    } else{ 
        console.log("selectedTool is none of those")
    } 
 
    return <div style = {{ 
        position: "fixed",
        overflow: "hidden",
        top:10,
        left:10,
        backgroundColor: "gray" 
    }}>
        <IconButton selectedTool={selectedTool} setSelectedTool={setSelectedTool} icon={<RectangleHorizontalIcon/>} onClick={() => { 
            setSelectedTool("rect")
          
        }} activated={activated === "rect"}/> 
        <IconButton selectedTool={selectedTool} setSelectedTool={setSelectedTool} icon={<Circle/>} onClick={() => {
            setSelectedTool("circle")
   
        }} activated={activated === "circle"}/> 
        <IconButton selectedTool={selectedTool} setSelectedTool={setSelectedTool} icon={<Pencil/>} onClick={() => {
            setSelectedTool("pencil")
       
            console.log("i have done window.selectedTool to be pencil")
                   }} activated={activated  === "pencil"}/>  
    </div>
}
