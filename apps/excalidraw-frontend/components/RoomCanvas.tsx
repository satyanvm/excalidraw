"use client";

import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      console.error("No token found. Please sign in first.");
      return;
    }
    const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: Number(roomId),
        }),
      );
    };
  }, []);

  if (!socket) {
    return <div>Connecting to server...</div>;
  }

  return (
    <div>
      <Canvas roomId={Number(roomId)} socket={socket}></Canvas>
    </div>
  );
}
