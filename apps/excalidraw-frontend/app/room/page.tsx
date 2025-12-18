"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function Room() {
    const [slug, setSlug] = useState("");
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
            console.log("Response:", response.data);
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

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Join a Room</h1>

                <input
                    type="text"
                    placeholder="Enter room slug"
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
        </div>
    );
}

export default Room;