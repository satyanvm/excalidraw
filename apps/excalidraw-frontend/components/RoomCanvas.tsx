"use client";

import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Get token inside useEffect to ensure we're on client
        const token = localStorage.getItem("token");

        if (!token) {
            setError("No token found. Redirecting to sign in...");
            setTimeout(() => router.push("/signin"), 1500);
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

        ws.onerror = (err) => {
            setError("Failed to connect to server");
        };

        ws.onclose = () => {
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [roomId, router]);

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-center">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!socket) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Connecting to server...</div>
            </div>
        );
    }

    return (
        <div>
            <Canvas roomId={Number(roomId)} socket={socket}></Canvas>
        </div>
    );
}
