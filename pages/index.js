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
  const [mainVideo, setMainVideo] = useState(null);

  useEffect(() => {
    axios.get(`${backendUrl}/api/videos`)
      .then(res => {
        setVideos(res.data);
        const randomIndex = Math.floor(Math.random() * res.data.length);
        setMainVideo(res.data[randomIndex]);
      })
      .catch(() => setMessage("Erreur lors du chargement des vidéos."));

    const params = new URLSearchParams(window.location.search);
    const msg = params.get("message");
    if (msg) setMessage(decodeURIComponent(msg));
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

  if (showLanding) {
    return (
      <div className="relative min-h-screen bg-black text-white text-center">
        {mainVideo && (
          <video
            src={mainVideo.file_path}
            autoPlay
            muted
            className="w-full h-screen object-cover absolute top-0 left-0 opacity-40 blur-sm"
          />
        )}
        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen backdrop-blur-md bg-black/40">
          <h1 className="text-5xl font-bold mb-6">Bienvenue sur StreamX Video</h1>
          <p className="text-lg max-w-2xl mb-6">
            Découvrez un univers exclusif pour adultes. Abonnez-vous pour accéder à tous les contenus privés.
          </p>
          <button
            onClick={() => setShowLanding(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
          >
            Entrer sur le site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">🔥 Site de Contenu Adulte 🔥</h1>
      {message && <p className="mb-4 text-red-600 font-semibold">{message}</p>}

      <form onSubmit={handleSubmit} className="flex flex-wrap justify-center gap-2 mb-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-2 border rounded w-60"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-3 py-2 border rounded w-60"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {isLogin ? "Se connecter" : "S'inscrire"}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="text-blue-700 underline text-sm mb-6"
      >
        {isLogin ? "Pas encore inscrit ? Créez un compte" : "Déjà inscrit ? Connectez-vous"}
      </button>

      <h2 className="text-xl font-semibold mb-4">🎥 Vidéos Disponibles</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map((video) => {
          const isLocked = !user?.isSubscribed;
          const isMain = mainVideo?.id === video.id;
          return (
            <div
              key={video.id}
              className={`relative overflow-hidden rounded-lg shadow-lg transition transform hover:scale-105 ${
                isLocked && !isMain ? "blur-sm brightness-50 hover:blur-none hover:brightness-100" : ""
              }`}
              onClick={() => {
                if (isLocked && !isMain) {
                  alert("🔐 Abonnement requis pour voir cette vidéo.");
                }
              }}
            >
              <video
                controls={!isLocked || isMain}
                autoPlay={isMain}
                muted
                loop
                className="w-full h-auto object-cover"
              >
                <source src={video.file_path} type="video/mp4" />
              </video>
              <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white p-2 text-sm font-medium">
                {video.title}
              </div>
              {!isLocked || isMain ? (
                <button
                  onClick={() => handleDownload(video.file_path)}
                  className="absolute top-2 right-2 bg-green-600 text-white text-xs px-3 py-1 rounded"
                >
                  📥 Télécharger
                </button>
              ) : (
                <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                  🔐 Abonnement requis
                </span>
              )}
            </div>
          );
        })}
      </div>

      {user && !user.isSubscribed && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">💳 Choisissez un mode de paiement :</h3>
          <button
            onClick={handlePayPalPayment}
            className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-500"
          >
            Payer avec PayPal
          </button>
        </div>
      )}
    </div>
  );
}

