"use client";

import { useState } from "react";

import api from "@/lib/api";

export default function Home() {
  const [message, setMessage] = useState(
    "Frontend is ready.",
  );

  const testBackend = async () => {
    try {
      const response = await api.get("/parkings");

      console.log(response.data);

      setMessage(
        "Backend connection successful.",
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Backend request failed. Check the browser console.",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">
          Parking Management System
        </h1>

        <p className="mb-8 text-zinc-400">
          {message}
        </p>

        <button
          type="button"
          onClick={testBackend}
          className="rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
        >
          Test Backend
        </button>
      </div>
    </main>
  );
}