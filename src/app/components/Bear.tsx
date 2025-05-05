// src/app/components/Bear.tsx
"use client";
import Image from "next/image";
import { useState } from "react";

export default function Bear() {
  const [mood, setMood] = useState("neutral");

  const handleMoodChange = (newMood: string) => {
    setMood(newMood);
    setTimeout(() => setMood("neutral"), 3000);
  };

  const moodMap: Record<string, string> = {
    happy: "😋",
    relaxed: "😌",
    fresh: "🧼",
    neutral: "🐻",
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-[100px]">{moodMap[mood]}</div>

      <div className="flex gap-4 mt-4">
        <button onClick={() => handleMoodChange("happy")} className="btn bg-green-500">
          🍯 Feed
        </button>
        <button onClick={() => handleMoodChange("relaxed")} className="btn bg-purple-500">
          🛁 Spa
        </button>
        <button onClick={() => handleMoodChange("fresh")} className="btn bg-blue-500">
          🧼 Clean
        </button>
      </div>
    </div>
  );
}
