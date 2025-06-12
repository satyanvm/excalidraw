import { initDraw } from "@/draw";
import { Button } from "@repo/ui/button";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./Icons";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";

type Shape = "circle" | "rect" | "pencil";
 
let activated = "";

export function Canvas({  
    roomId,               
    socket     
}: { 
    roomId: string, 
    socket: WebSocket
}){ 
        const [theshape, setTheshape ] = useState("rect")
        const [selectedTool, setSelectedTool] = useState<Shape>("circle")

        const canvasRef = useRef<HTMLCanvasElement>(null);
            console.log("before use effect of canvasRef.current");
        useEffect(() => {

        if(canvasRef.current){
            console.log("inside of canvasRef.current");
         initDraw(canvasRef.current, roomId, socket)    
        }   

    }, [canvasRef]); 

    return <div className="flex ">  
        <div>
 <canvas ref = {canvasRef} width = {1300} height = {1300}></canvas>
</div>
<div className="bg-whtie">
<TopBar selectedTool = {selectedTool} setSelectedTool = {setSelectedTool}></TopBar>

</div>
    </div>

} 

function TopBar({
    selectedTool,
    setSelectedTool
}: {
    selectedTool: Shape,
    setSelectedTool: (tool: Shape) => void
}) {
    if(selectedTool == "circle"){
        activated = "circle"
    } else if(selectedTool == "rect"){
        activated = "rect"
    } else if(selectedTool == "pencil"){
        activated = "pencil"
    } else{ 
        console.log("selectedTool is none of those")
    } 
    //@ts-ignore
    window.selectedTool = selectedTool
    return <div style = {{ 
        position: "fixed",
        top:10,
        left:10
    }}>
        <IconButton selectedTool={selectedTool} setSelectedTool={setSelectedTool} icon={<RectangleHorizontalIcon/>} onClick={() => { 
            setSelectedTool("rect")
            //@ts-ignore
            window.selectedTool = "rect"
        }} activated={activated === "rect"}/> 
        <IconButton selectedTool={selectedTool} setSelectedTool={setSelectedTool} icon={<Circle/>} onClick={() => {
            setSelectedTool("circle")
            //@ts-ignore
            window.selectedTool = "circle"
        }} activated={activated === "circle"}/> 
        <IconButton selectedTool={selectedTool} setSelectedTool={setSelectedTool} icon={<Pencil/>} onClick={() => {
            setSelectedTool("pencil")
            //@ts-ignore
            window.selectedTool = "pencil"
        }} activated={activated  === "pencil"}/>  
    </div>
}