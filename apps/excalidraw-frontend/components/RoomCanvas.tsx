"use client";

import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";
import { NavBar } from "./NavBar";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function connectWebSocket() {
            try {
                // Check session using API route (server-side)
                const sessionResponse = await fetch('/api/auth/get-session', {
                    credentials: 'include'
                });
                
                if (!sessionResponse.ok) {
                    setError("Not authenticated. Redirecting to sign in...");
                    setTimeout(() => router.push("/signin"), 1500);
                    return;
                }
                
                const sessionData = await sessionResponse.json();
                if (!sessionData.user) {
                    setError("Not authenticated. Redirecting to sign in...");
                    setTimeout(() => router.push("/signin"), 1500);
                    return;
                }

                // Get session token for WebSocket
                const tokenResponse = await fetch('/api/auth/ws-token', {
                    credentials: 'include'
                });

                if (!tokenResponse.ok) {
                    setError("Failed to get authentication token");
                    return;
                }
                const { token } = await tokenResponse.json();
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
            } catch (err) {
                setError("Authentication failed");
            }
        }

        connectWebSocket();
    }, [roomId, router]);

    if (error) {
        return (
            <div className="min-h-screen bg-black">
                <NavBar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="text-white text-center">
                        <p className="text-red-400">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!socket) {
        return (
            <div className="min-h-screen bg-black">
                <NavBar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="text-white">Connecting to server...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <NavBar />
            <Canvas roomId={Number(roomId)} socket={socket}></Canvas>
        </div>
    );
}
