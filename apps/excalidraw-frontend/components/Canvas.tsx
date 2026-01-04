import { initDraw } from "@/draw";
import { IconButton } from "./Icons";
import { Circle, Pencil, RectangleHorizontalIcon, Hand, Eraser } from "lucide-react";
import { Game } from "@/draw/Game";
import { getExistingShapes } from "@/draw/http";
import { all } from "axios";
import { useGame } from "@/draw/newcalls";

type Shape = "circle" | "rect" | "pencil" | "hand" | "eraser";

let activated = "";

export function Canvas({
  roomId,
  socket
}: {
  roomId: Number;
  socket: WebSocket;
}) {
  //@ts-ignore
  const { canvasRef, selectedTool, setSelectedTool } = useGame(roomId, socket);

  return (
    <div className="h-screen overflow-hidden bg-white">
      <canvas ref={canvasRef}></canvas>
      <TopBar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
  );
}

export function TopBar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Shape;
  setSelectedTool: (tool: Shape) => void;
}) {
  if (selectedTool === "circle") {
    activated = "circle";
  } else if (selectedTool === "rect") {
    activated = "rect";
  } else if (selectedTool === "pencil") {
    activated = "pencil";
  } else if (selectedTool === "hand") {
    activated = "hand";
  } else if (selectedTool === "eraser") {
    activated = "eraser";
  } else {
    console.log("selectedTool is none of those");
  }

  return (
    <div
      style={{
        position: "fixed",
        overflow: "hidden",
        top: 10,
        left: 10,
        backgroundColor: "gray",
      }}
    >
      <IconButton
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        icon={<RectangleHorizontalIcon />}
        onClick={() => {
          setSelectedTool("rect");
        }}
        activated={activated === "rect"}
      />
      <IconButton
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        icon={<Circle />}
        onClick={() => {
          setSelectedTool("circle");
        }}
        activated={activated === "circle"}
      />

      <IconButton
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        icon={<Pencil />}
        onClick={() => {
          setSelectedTool("pencil");

          console.log("i have done window.selectedTool to be pencil");
        }}
        activated={activated === "pencil"}
      />

      <IconButton
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        icon={<Hand />}
        onClick={() => {
          console.log("selected hand");
          setSelectedTool("hand");
        }}
        activated={activated === "hand"}
      />

      <IconButton
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        icon={<Eraser />}
        onClick={() => {
          setSelectedTool("eraser");
        }}
        activated={activated === "eraser"}
      />
    </div>
  );
}
