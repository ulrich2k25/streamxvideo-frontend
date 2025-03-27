

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
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    axios.get(`${backendUrl}/api/videos`)
      .then(res => setVideos(res.data))
      .catch(() => setMessage("Erreur lors du chargement des vidéos."));

    const params = new URLSearchParams(window.location.search);
    const msg = params.get("message");
    const email = params.get("email");
    if (msg) setMessage(decodeURIComponent(msg));
    if (email) setEmail(email);
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

  // ✅ Lancement : teaser + grille floutée
  if (showLanding) {
    const teaser = videos[Math.floor(Math.random() * videos.length)];
    const grid = videos.filter(v => v.id !== teaser?.id).slice(0, 6);

    return (
      <div className="min-h-screen bg-black text-white p-4 relative overflow-hidden">
        {teaser && (
          <video
            autoPlay
            muted
            playsInline
            className="w-full max-w-md mx-auto rounded-lg shadow-lg mb-6"
          >
            <source src={teaser.file_path} type="video/mp4" />
          </video>
        )}

        <h1 className="text-4xl font-bold text-center mb-2">Bienvenue sur StreamX Video</h1>
        <p className="text-center mb-4">Découvrez un univers exclusif pour adultes. Abonnez-vous pour accéder à tous les contenus privés.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 blur-sm opacity-70 max-w-4xl mx-auto mb-4">
          {grid.map((vid) => (
            <div key={vid.id}>
              <video className="rounded w-full h-auto" muted>
                <source src={vid.file_path} type="video/mp4" />
              </video>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setShowLanding(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded text-lg"
          >
            Entrer sur le site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">🔥 Site de Contenu Adulte 🔥</h1>

      {message && <p className="mb-4 text-red-600 font-semibold">{message}</p>}

      <form onSubmit={handleSubmit} className="space-x-2 mb-4">
        <input
          className="border px-2 py-1"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border px-2 py-1"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">
          {isLogin ? "Se connecter" : "S'inscrire"}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="mb-4 text-sm underline text-blue-700"
      >
        {isLogin ? "Pas encore inscrit ? Créez un compte" : "Déjà inscrit ? Connectez-vous"}
      </button>

      <h2 className="text-xl font-semibold mb-4">🎥 Vidéos Disponibles</h2>

      {videos.length === 0 ? (
        <p>Aucune vidéo disponible.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded shadow p-3 dark:bg-zinc-900">
              <h3 className="font-semibold text-md mb-2">{video.title}</h3>
              <div className={`relative ${!user?.isSubscribed ? "blur-sm brightness-50" : ""}`}>
                <video controls className="w-full h-auto rounded shadow">
                  <source
                    src={
                      video.file_path.startsWith("http")
                        ? video.file_path
                        : `${backendUrl}${video.file_path}`
                    }
                    type="video/mp4"
                  />
                </video>
              </div>
              <button
                onClick={() => {
                  if (!user?.isSubscribed) return handlePayPalPayment();
                  handleDownload(video.file_path);
                }}
                className={`mt-2 px-3 py-1 rounded w-full ${
                  user?.isSubscribed
                    ? "bg-green-600 text-white"
                    : "bg-yellow-500 text-black"
                }`}
              >
                {user?.isSubscribed ? "📥 Télécharger" : "🔐 Abonnement requis (5€)"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
