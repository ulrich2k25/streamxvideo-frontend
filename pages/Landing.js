// 📁 frontend/LandingPage.js

import React, { useEffect, useState } from "react";
import translations from "../translations";

// Détection automatique de la langue
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
  const videoList = [
    "video10.mp4",
    "Video44.mp4",
    "Video60.mp4",
    "Video66.mp4",
  ];

  const [videoCount, setVideoCount] = useState(4);

  // Détection de la taille de l’écran (mobile < 768px)
  useEffect(() => {
    const updateCount = () => {
      setVideoCount(window.innerWidth < 768 ? 2 : 4);
    };

    updateCount(); // au chargement
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* 🔁 Affichage de vidéos floutées en arrière-plan */}
      {videoList.slice(0, videoCount).map((filename, i) => (
        <video
          key={i}
          ref={(el) => {
            if (el) {
              el.onTimeUpdate = () => {
                if (el.currentTime >= 5) {
                  el.style.transition = "opacity 2s ease-out";
                  el.style.opacity = 0;
                  el.pause();
                }
              };
            }
          }}
          src={`https://myvideobucket2k25.s3.eu-north-1.amazonaws.com/videos/${filename}`}
          autoPlay
          muted
          playsInline
          loop={false}
          className="absolute w-full h-full object-cover blur-sm opacity-40 z-0"
        />
      ))}

      {/* Overlay sombre au-dessus des vidéos */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

      {/* Contenu principal */}
      <div className="z-10 max-w-xl mx-auto text-center px-6 py-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-6">
          {t.landing_title}
        </h1>
        <p className="text-lg sm:text-xl text-zinc-200 mb-8">
          {t.landing_subtitle}
        </p>

        {/* Boutons d’action */}
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

      {/* Pied de page */}
      <div className="absolute bottom-0 w-full py-4 bg-black text-center text-zinc-400">
        <p>StreamX Video | Exclusivité pour adultes 🔥</p>
      </div>
    </div>
  );
}
