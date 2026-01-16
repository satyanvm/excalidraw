"use client";
import { useEffect, useRef, useState } from "react";
import { getExistingShapes } from "./http";
import { Game } from "./Game";

type Shape = "circle" | "rect" | "pencil" | "hand" | "eraser";

export function useGame(roomId: number, socket: WebSocket) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Shape>("circle");
  const [game, setGame] = useState<Game | null>(null);
  const [existingShapes, setExistingShapes] = useState<any[]>([]);
  const [allShapeXRect, setAllShapeXRect] = useState<number[]>([]);
  const [allShapeYRect, setAllShapeYRect] = useState<number[]>([]);

  useEffect(() => {
    async function fetchShapes() {
      const shapes = await getExistingShapes(roomId);
      setExistingShapes(shapes);

      const allRect: any[] = [];
      const xCoords: number[] = [];
      const yCoords: number[] = [];
      shapes.forEach((shape: any) => {
        let theshape = shape;
        if (typeof shape !== "object") {
          try {
            theshape = JSON.parse(JSON.parse(JSON.parse(shape)));
          } catch (err) {
            console.error("Failed to parse shape:", shape, err);
            return;
          }
        }
        try{
        if (theshape.type === "rect") {
          allRect.push(theshape);

          if (theshape.width > 0) {
            for (let i = theshape.x; i <= theshape.x + theshape.width; i++) {
              xCoords.push(i);
            }
          } else {
            for (let i = theshape.x; i >= theshape.x + theshape.width; i--) {
              xCoords.push(i);
            }
          }

          if (theshape.height > 0) {
            for (let i = theshape.y; i <= theshape.y + theshape.height; i++) {
              yCoords.push(i);
            }
          } else {
            for (let i = theshape.y; i >= theshape.y + theshape.height; i--) {
              yCoords.push(i);
            }
          }
        }
      } catch (error) {
      }
      });

      setAllShapeXRect(xCoords);
      setAllShapeYRect(yCoords);
    }

    fetchShapes();
  }, [roomId]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(
        canvasRef.current,
        roomId,
        socket,
        existingShapes,
        allShapeXRect,
        allShapeYRect,
      );
      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [
    canvasRef.current,
    existingShapes,
    allShapeXRect,
    allShapeYRect,
    roomId,
    socket,
  ]);

  useEffect(() => {
    if (game) {
      game.setTool(selectedTool);
    }
  }, [selectedTool, game]);

  return { canvasRef, selectedTool, setSelectedTool };
}
