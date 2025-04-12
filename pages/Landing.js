import React, { useEffect, useState, useRef } from "react";
import translations from "../translations";

// Détection de la langue
const userLang = typeof navigator !== "undefined" ? navigator.language : "fr";
const lang = userLang.startsWith("de")
  ? "de"
  : userLang.startsWith("en")
  ? "en"
  : userLang.startsWith("es")
  ? "es"
  : userLang.startsWith("it")
  ? "it"
  : "fr";

const t = translations[lang];

export default function LandingPage() {
  const videoSources = [
    "video10.mp4",
    "Video44.mp4",
    "Video60.mp4",
    "Video66.mp4",
  ];

  const [positions, setPositions] = useState([0, 1, 2, 3]);

  // 🔁 Change les positions toutes les 5s
  useEffect(() => {
    const interval = setInterval(() => {
      const shuffled = [...positions].sort(() => 0.5 - Math.random());
      setPositions(shuffled);
    }, 5000);

    return () => clearInterval(interval);
  }, [positions]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* 🔁 Grille responsive avec changement aléatoire des positions */}
      <div className="absolute w-full h-full grid grid-cols-1 sm:grid-cols-2 grid-rows-4 sm:grid-rows-2 z-0 transition-all duration-1000">
        {positions.map((pos, index) => (
          <video
            key={index}
            src={`https://myvideobucket2k25.s3.eu-north-1.amazonaws.com/videos/${videoSources[pos]}`}
            autoPlay
            muted
            playsInline
            loop
            className="w-full h-full object-cover blur-sm opacity-60 brightness-125 transition-all duration-1000"
             />
        ))}
      </div>

      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

      {/* Texte + boutons */}
      <div className="z-10 max-w-xl mx-auto text-center px-6 py-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-6">
          {t.landing_title}
        </h1>
        <p className="text-lg sm:text-xl text-zinc-200 mb-8">
          {t.landing_subtitle}
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <a
            href="https://t.me/discussionsexe"
            target="_blank"
            rel="noreferrer"
            className="inline-block px-6 py-3 bg-yellow-500 text-black font-bold text-lg rounded-xl shadow-lg hover:bg-yellow-600 transition"
          >
            👉 {t.join_now}
          </a>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-blue-600 transition"
          >
            🌐 {t.visitSite}
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full py-4 bg-black text-center text-zinc-400">
        <p>StreamX Video | Exclusivité pour adultes 🔥</p>
      </div>
    </div>
  );
}
