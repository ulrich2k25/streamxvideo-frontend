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
  const [teaserVideo, setTeaserVideo] = useState(null);

  useEffect(() => {
    axios.get(`${backendUrl}/api/videos`)
      .then(res => {
        setVideos(res.data);
        const random = res.data[Math.floor(Math.random() * res.data.length)];
        setTeaserVideo(random);
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
        setShowLanding(false);
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

  const handleVideoClick = () => {
    if (!user?.isSubscribed) {
      handlePayPalPayment();
    }
  };

  if (showLanding) {
    return (
      <div
        className="min-h-screen bg-cover bg-center text-white flex flex-col items-center justify-center p-6"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1521213388447-56c0d48f16d2')`,
        }}
      >
        {teaserVideo && (
          <video
            src={teaserVideo.file_path}
            autoPlay
            muted
            loop
            playsInline
            className="w-[340px] md:w-[480px] rounded-xl shadow-lg mb-6"
          />
        )}
        <h1 className="text-4xl font-bold mb-3">Bienvenue sur StreamX Video</h1>
        <p className="max-w-xl text-center mb-4 text-lg">
          Découvrez un univers exclusif pour adultes. Abonnez-vous pour accéder à tous les contenus privés.
        </p>

        <button
          onClick={() => document.getElementById("auth-form").scrollIntoView({ behavior: "smooth" })}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded text-lg mb-6"
        >
          Entrer sur le site
        </button>

        <div id="auth-form" className="bg-black bg-opacity-70 p-6 rounded-lg shadow max-w-sm w-full text-white">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 rounded bg-gray-800 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full px-4 py-2 rounded bg-gray-800 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="w-full bg-blue-600 py-2 rounded text-white">
              {isLogin ? "Se connecter" : "Créer un compte"}
            </button>
          </form>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-2 text-sm underline"
          >
            {isLogin ? "Créer un compte" : "Déjà inscrit ? Connexion"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-800 to-black text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-6">🎥 Vidéos Disponibles</h2>

      {videos.length === 0 ? (
        <p className="text-center">Aucune vidéo disponible.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={handleVideoClick}
              className={`relative rounded overflow-hidden shadow-lg border ${
                user?.isSubscribed ? "" : "cursor-pointer group"
              }`}
            >
              <video
                className="w-full h-[240px] object-cover"
                muted
                playsInline
                loop
              >
                <source src={video.file_path} type="video/mp4" />
              </video>

              {!user?.isSubscribed && (
                <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur flex items-center justify-center">
                  <span className="text-white font-semibold">🔐 Abonnement requis</span>
                </div>
              )}

              <div className="p-3 bg-zinc-900 text-white">
                <h3 className="text-sm font-bold truncate">{video.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && !user.isSubscribed && (
        <div className="text-center mt-8">
          <p className="mb-2 text-lg font-semibold">Débloquez l'accès pour seulement 5€ / mois</p>
          <button
            onClick={handlePayPalPayment}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded font-bold"
          >
            Payer avec PayPal
          </button>
        </div>
      )}
    </div>
  );
}
