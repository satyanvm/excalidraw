"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Better-auth endpoints use slashes: /sign-in/email
            // With route at /api/auth/[...all] and basePath "/api/auth"
            // Full endpoint is: /api/auth/sign-in/email
            const endpoint = isSignin 
                ? "/api/auth/sign-in/email" 
                : "/api/auth/sign-up/email";
            const body = isSignin 
                ? { email, password }
                : { email, password, name };

            console.log("Calling endpoint:", endpoint);
            
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(body),
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                let errorMsg = "Something went wrong";
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error?.message || errorData.error || errorMsg;
                } catch (e) {
                    const text = await response.text();
                    console.error("Response body (not JSON):", text);
                    errorMsg = `Request failed: ${response.status} ${response.statusText}`;
                }
                setError(errorMsg);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log("Response data:", data);

            if (!data.user) {
                const errorMsg = data.error?.message || data.error || (isSignin ? "Invalid email or password" : "Failed to sign up");
                setError(errorMsg);
                setLoading(false);
                return;
            }

            // Success - redirect to room
            router.push("/room");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-black">
            <div className="p-8 bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md border border-zinc-800">
                <h1 className="text-2xl font-bold text-white text-center mb-6">
                    {isSignin ? "Sign In" : "Sign Up"}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isSignin && (
                        <div>
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-semibold rounded-lg border border-zinc-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Loading..." : isSignin ? "Sign In" : "Sign Up"}
                    </button>
                </form>

                <p className="text-zinc-400 text-center mt-6">
                    {isSignin ? "Don't have an account? " : "Already have an account? "}
                    <a
                        href={isSignin ? "/signup" : "/signin"}
                        className="text-white hover:text-zinc-300 hover:underline font-medium"
                    >
                        {isSignin ? "Sign Up" : "Sign In"}
                    </a>
                </p>
            </div>
        </div>
    );
}