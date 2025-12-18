"use client";

import { useState } from "react";
import axios from "axios";
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
      if (isSignin) {
        const response = await axios.post("http://localhost:3001/signin", {
          email,
          password,
        });
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          router.push("/");
        } else {
          setError("Invalid response from server");
        }
      } else {
        const response = await axios.post("http://localhost:3001/signup", {
          email,
          password,
          name,
        });
        // Token is now returned directly from signup
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          router.push("/");
        } else {
          setError("Invalid response from server");
        }
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong";
      setError(errorMessage);
    } finally {
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
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : isSignin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          {isSignin ? "Don't have an account? " : "Already have an account? "}
          <a
            href={isSignin ? "/signup" : "/signin"}
            className="text-blue-400 hover:underline"
          >
            {isSignin ? "Sign Up" : "Sign In"}
          </a>
        </p>
      </div>
    </div>
  );
}
