"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

function Room() {
    const [slug, setSlug] = useState("");
    const [slugCreate, setSlugCreate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleEnterRoom() {
        if (!slug) {
            setError("Please enter a room slug");
            return; 
        }
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`http://localhost:3001/room/${slug}`);
            console.log ("response is", response);
            console.log("Response: is", response.data);
            const roomId = response.data.id;

            if (!roomId) {
                setError("Room not found - slug '" + slug + "' does not exist");
                return;
            }

            // Navigate to the canvas after getting the room slug
            router.push(`/canvas/${roomId}`);
        } catch (err: any) {
            console.error("Error:", err);
            setError(err.response?.data?.error || "Room not found or server error");
        } finally {
            setLoading(false);
        } 
    }

    async function handleCreateRoom(){
              if (!slugCreate) {    
            setError("Please enter a room slug");
            return;
        }
        console.log("slugCreate check is passed, slugCreate is", slugCreate);
        setLoading(true);
        setError("");
        // get token from localStorage and decode it for userId, will create a middleware for this in future
        const token = localStorage.getItem("token");
        if(!token){
            console.log("no token found");
            setError("Please login to create a room");
            setLoading(false);
            return;
        }
        console.log("token check is passed, token is", token);
        // Decode JWT token to get userId (verification happens on backend)
        // Note: jwt.decode() doesn't verify the signature - that's done on the server
        const decoded = jwtDecode<{ userId?: string }>(token);
        if (!decoded || !decoded.userId) {
            setError("Invalid token. Please login again.");
            setLoading(false);
            return;
        }
        const userId = decoded.userId;
        console.log("userId is", userId);
        try { 
            const response = await axios.post(`http://localhost:3001/createroom/${slugCreate}`, {
                adminId: userId,
            }) 
            console.log("Response:", response.data);
            const roomId = response.data.roomId;

            // Navigate to the canvas after getting the room slug
            router.push(`/canvas/${roomId}`);
        } catch (err: any) {
            console.error("Error:", err);
            setError(err.response?.data?.error || "Room not found or server error");
        } finally {
            setLoading(false);
        } 
    }

    return (
        <div className="min-h-screen items-center justify-center ml-115 mt-40">
            <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Join a Room</h1>

                <input
                    type="text"
                    placeholder="Enter a room name"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none mb-4"
                />

                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <button 
                    onClick={handleEnterRoom}
                    disabled={loading}
                    className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-semibold rounded-lg border border-zinc-700 transition-colors disabled:opacity-50"
                >
                    {loading ? "Joining..." : "Enter Room"}
                </button>
            </div>
        <br/>
                        <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Create a Room</h1>

                <input
                    type="text"
                    placeholder="Enter a room name"
                    value={slugCreate}
                    onChange={(e) => setSlugCreate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none mb-4"
                />

                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <button
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-semibold rounded-lg border border-zinc-700 transition-colors disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Room"}
                </button>
            </div>
        </div>

        
    );
}

export default Room;