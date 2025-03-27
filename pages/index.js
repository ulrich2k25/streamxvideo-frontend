
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

  const handleVideoClick = (video) => {
    if (!user?.isSubscribed) {
      handlePayPalPayment();
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
      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          {videos[teaserIndex] && (
            <video
              autoPlay
              muted
              loop
              className="w-full h-full object-cover opacity-30"
            >
              <source src={videos[teaserIndex].file_path} type="video/mp4" />
            </video>
          )}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 backdrop-blur-md">
          <h1 className="text-5xl font-extrabold mb-6">Bienvenue sur <span className="text-red-500">StreamX Video</span></h1>
          <p className="text-lg mb-6 max-w-xl text-center">
            Découvrez un univers exclusif pour adultes. Abonnez-vous pour accéder à tous les contenus privés.
          </p>
          <button
            onClick={() => setShowLanding(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded text-lg mb-4"
          >
            Entrer sur le site
          </button>
          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-2">
            <input
              type="email"
              placeholder="Email"
              className="px-3 py-2 rounded bg-white text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="px-3 py-2 rounded bg-white text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              {isLogin ? "Se connecter" : "S'inscrire"}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-300 underline"
            >
              {isLogin ? "Pas encore inscrit ?" : "Déjà inscrit ? Connectez-vous"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center p-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">🔥 Contenu Exclusif 🔥</h1>

      {message && <p className="mb-4 text-center text-red-400">{message}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg"
            onClick={() => handleVideoClick(video)}
          >
            <video
              className={`w-full h-48 object-cover transition duration-300 ${
                !user?.isSubscribed ? "blur-md group-hover:blur-none" : ""
              }`}
              muted
              loop
              playsInline
              autoPlay
            >
              <source src={video.file_path} type="video/mp4" />
            </video>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm font-semibold truncate">
              {video.title}
            </div>
            {!user?.isSubscribed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white font-bold">
                🔐 Abonnement requis
              </div>
            )}
          </div>
        ))}
      </div>

      {user && !user.isSubscribed && (
        <div className="text-center mt-10">
          <h3 className="text-lg font-semibold mb-4">Accès limité. Abonnez-vous pour tout voir :</h3>
          <button
            onClick={handlePayPalPayment}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded"
          >
            Payer 5€ avec PayPal
          </button>
        </div>
      )}
    </div>
  );
}
