// 📁 frontend/LandingPage.js

import React from "react";
import translations from "./translations";

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
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      <video
        src="https://myvideobucket2k25.s3.eu-north-1.amazonaws.com/videos/teaser1.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute w-full h-full object-cover blur-sm opacity-60 z-0"
      />
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>

      <div className="z-10 max-w-xl mx-auto text-center px-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-6">{t.landing_title}</h1>
        <p className="text-lg text-zinc-200 mb-8">{t.landing_subtitle}</p>
        <a
          href="https://t.me/discussionsexe"
          target="_blank"
          rel="noreferrer"
          className="inline-block px-6 py-3 bg-yellow-500 text-black font-bold text-lg rounded-xl shadow-lg hover:bg-yellow-600 transition"
        >
          👉 {t.join_now}
        </a>
      </div>
    </div>
  );
}
