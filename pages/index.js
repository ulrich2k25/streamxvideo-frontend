// ✅ VERSION FONCTIONNELLE ET LUXUEUSE
import '../styles/globals.css';
import React, { useState, useEffect } from "react";
import axios from "axios";



const backendUrl = "https://streamxvideo-backend-production.up.railway.app";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [teaserIndex, setTeaserIndex] = useState(0);

  useEffect(() => {
    axios.get(`${backendUrl}/api/videos`)
      .then(res => {
        setVideos(res.data);
        setTeaserIndex(Math.floor(Math.random() * res.data.length));
      })
      .catch(() => setMessage("Erreur lors du chargement des vidéos."));

    const params = new URLSearchParams(window.location.search);
    const msg = params.get("message");
    const emailParam = params.get("email");

    if (msg) setMessage(decodeURIComponent(msg));
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth`, { email, password });
      if (data.user) {
        setUser(data.user);
        setMessage(isLogin ? "Connexion réussie !" : "Inscription réussie !");
      } else {
        setMessage("Erreur inconnue");
      }
    } catch {
      setMessage("Email ou mot de passe incorrect.");
    }
  };

  const handlePayPalPayment = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/payments/paypal`, { email });
      if (data.url) window.location.href = data.url;
    } catch {
      setMessage("❌ Paiement PayPal échoué.");
    }
  };

  const handleDownload = async (filePath) => {
    if (!user?.isSubscribed) return alert("Vous devez être abonné pour télécharger.");
    try {
      const res = await axios.get(`${backendUrl}/api/videos/download?file=${filePath}`, {
        headers: { "user-email": email },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "video/mp4" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filePath.split("/").pop();
      link.click();
    } catch {
      alert("❌ Erreur de téléchargement");
    }
  };

  // 🔒 PAGE D'ACCUEIL
  if (!user) {
    const teaser = videos[teaserIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-zinc-900 text-white flex flex-col items-center justify-center px-4 py-10 relative">
        {teaser && (
          <video
            src={teaser.file_path}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30 z-0"
          />
        )}

        <div className="z-10 bg-zinc-900 bg-opacity-80 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-yellow-500">
          <h1 className="text-3xl font-bold text-center mb-2 text-yellow-400">StreamX Video</h1>
          <p className="text-center text-zinc-300 mb-4">Espace exclusif pour adultes. Connecte-toi ou inscris-toi.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-xl">
              {isLogin ? "Se connecter" : "S'inscrire"}
            </button>
          </form>

          <button onClick={() => setIsLogin(!isLogin)} className="mt-4 text-sm text-zinc-400 underline text-center">
            {isLogin ? "Pas encore inscrit ?" : "Déjà inscrit ?"}
          </button>

          {message && <p className="text-red-500 text-center mt-4 font-semibold">{message}</p>}
        </div>
      </div>
    );
  }

  // ✅ PAGE DES VIDÉOS
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-zinc-900 text-white px-4 py-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-yellow-400">🎬 Vidéos Premium</h2>

      {!user.isSubscribed && (
        <div className="flex justify-center mb-6">
          <button
            onClick={handlePayPalPayment}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl shadow-lg"
          >
            🔐 Débloquer l'accès 1 mois – 5€
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-zinc-800 rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition">
            <video
              className={`w-full h-48 object-cover ${user.isSubscribed ? "" : "blur-md grayscale"}`}
              muted
              playsInline
              controls={user.isSubscribed}
              onClick={() => {
                if (!user.isSubscribed) handlePayPalPayment();
              }}
            >
              <source src={video.file_path} type="video/mp4" />
            </video>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-yellow-300">{video.title}</h3>
              {!user.isSubscribed ? (
                <button
                  onClick={handlePayPalPayment}
                  className="w-full bg-yellow-500 text-black font-bold py-2 rounded-xl hover:bg-yellow-600"
                >
                  🔒 Abonnement requis
                </button>
              ) : (
                <button
                  onClick={() => handleDownload(video.file_path)}
                  className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
                >
                  📥 Télécharger
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {message && <p className="text-red-500 text-center mt-6 text-lg font-semibold">{message}</p>}
    </div>
  );
}


