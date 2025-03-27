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
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-6">
        {teaser && (
          <video
            src={teaser.file_path}
            autoPlay
            muted
            loop={false}
            playsInline
            className="w-[320px] md:w-[480px] rounded shadow mb-6"
          />
        )}

        <div className="bg-zinc-800 p-6 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-2 text-red-500">StreamX Video</h1>
          <p className="text-center text-zinc-300 mb-4">
            Découvrez un univers privé pour adultes. Créez un compte ou connectez-vous.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              className="px-3 py-2 rounded bg-zinc-700 border border-zinc-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="px-3 py-2 rounded bg-zinc-700 border border-zinc-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
              {isLogin ? "Se connecter" : "S'inscrire"}
            </button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-4 text-sm text-zinc-400 underline text-center"
          >
            {isLogin ? "Pas encore inscrit ?" : "Déjà inscrit ?"}
          </button>

          {message && <p className="text-red-500 text-center mt-4">{message}</p>}
        </div>
      </div>
    );
  }

  // ✅ PAGE DES VIDÉOS
  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">🎬 Vidéos Premium</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-zinc-800 rounded overflow-hidden shadow">
            <video
              className={`w-full h-48 object-cover transition duration-300 ${
                user.isSubscribed ? "" : "blur-md grayscale"
              }`}
              muted
              playsInline
              controls={user.isSubscribed}
              onClick={() => {
                if (!user.isSubscribed) handlePayPalPayment();
              }}
            >
              <source src={video.file_path} type="video/mp4" />
            </video>
            <div className="p-3">
              <h3 className="font-semibold text-md mb-2">{video.title}</h3>
              {!user.isSubscribed ? (
                <button
                  onClick={handlePayPalPayment}
                  className="w-full bg-yellow-500 text-black font-bold py-2 rounded hover:bg-yellow-600"
                >
                  🔒 Abonnement requis - 5€
                </button>
              ) : (
                <button
                  onClick={() => handleDownload(video.file_path)}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  📥 Télécharger
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {message && <p className="text-red-500 text-center mt-4">{message}</p>}
    </div>
  );
}
