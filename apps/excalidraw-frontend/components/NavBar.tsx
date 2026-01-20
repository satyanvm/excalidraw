"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserAction, signOutAction } from "@/app/actions/auth";

export function NavBar() {
    const [user, setUser] = useState<{ 
        id: string; 
        name?: string; 
        email: string;
        username?: string;
        displayUsername?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [signingOut, setSigningOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchUser() {
            try {
                const result = await getCurrentUserAction();
                if (result?.user) {
                    console.log("User object from server:", result.user);
                    console.log("User ID:", result.user.id);
                    console.log("User name:", result.user.name);
                    console.log("User email:", result.user.email);
                    console.log("User username:", (result.user as any).username);
                    console.log("User displayUsername:", (result.user as any).displayUsername);
                    setUser(result.user);
                } else {
                    console.log("No user found in result");
                    setUser(null);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    async function handleSignOut() {
        setSigningOut(true);
        try {
            // Call the better-auth sign-out API route
            // Better-auth endpoint: /api/auth/sign-out
            const response = await fetch('/api/auth/sign-out', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok || response.status === 200) {
                setUser(null);
                router.push('/signin');
            } else {
                console.error("Failed to sign out:", response.status);
                // Still redirect on error
                setUser(null);
                router.push('/signin');
            }
        } catch (error) {
            console.error("Error signing out:", error);
            // Still redirect on error
            setUser(null);
            router.push('/signin');
        } finally {
            setSigningOut(false);
        }
    }

    if (loading) {
        return (
            <nav className="w-full bg-zinc-900 border-b border-zinc-800 px-4 py-3">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-white font-semibold">Excalidraw</div>
                    <div className="text-zinc-400">Loading...</div>
                </div>
            </nav>
        );
    }

    if (!user) {
        return (
            <nav className="w-full bg-zinc-900 border-b border-zinc-800 px-4 py-3">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-white font-semibold">Excalidraw</div>
                    <a 
                        href="/signin" 
                        className="text-white hover:text-zinc-300 transition-colors"
                    >
                        Sign In
                    </a>
                </div>
            </nav>
        );
    }

    return (
        <nav className="w-full bg-zinc-900 border-b border-zinc-800 px-4 py-3">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="text-white font-semibold">Excalidraw</div>
                <div className="flex items-center gap-4">
                    <div className="text-zinc-300">
                        Welcome, <span className="text-white font-medium">
                            {user.name || user.displayUsername || user.username || user.email}
                        </span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {signingOut ? "Signing out..." : "Sign Out"}
                    </button>
                </div>
            </div>
        </nav>
    );
}
