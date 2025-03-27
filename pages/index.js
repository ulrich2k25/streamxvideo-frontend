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

  // 🔄 Charger vidéos + message dans l'URL
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

  // 🔐 Connexion / inscription
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

  // 💸 Paiement PayPal
  const handlePayPalPayment = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/payments/paypal`, { email });
      if (data.url) window.location.href = data.url;
    } catch {
      setMessage("❌ Paiement PayPal échoué.");
    }
  };

  // 📥 Téléchargement vidéo (si abonné)
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

  // 🎬 Page d’accueil si non connecté
  if (!user) {
    const teaser = videos[teaserIndex];

    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-4">
        {teaser && (
          <video
            src={teaser.file_path}
            autoPlay
            muted
            playsInline
            loop={false}
            className="w-[320px] md:w-[480px] h-auto mb-6 rounded shadow-lg"
            onEnded={() => {}}
          />
        )}
        <h1 className="text-4xl font-bold mb-3">Bienvenue sur <span className="text-red-500">StreamX Video</span></h1>
        <p className="text-md mb-6 text-zinc-300 max-w-xl text-center">
          Découvrez un univers exclusif pour adultes. Abonnez-vous pour accéder à tous les contenus privés.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 mb-3 items-center">
          <input
            className="px-4 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="px-4 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">
            {isLogin ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm underline text-zinc-400 hover:text-white"
        >
          {isLogin ? "Pas encore inscrit ? Créez un compte" : "Déjà inscrit ? Connectez-vous"}
        </button>
        {message && <p className="text-red-500 mt-4">{message}</p>}
      </div>
    );
  }

  // 🎥 Page vidéos
  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">🎬 Vidéos Premium</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="relative group bg-zinc-800 rounded overflow-hidden shadow-lg">
            <video
              className={`w-full h-48 object-cover ${
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
              <h3 className="text-md font-semibold mb-2">{video.title}</h3>
              <button
                onClick={() => handleDownload(video.file_path)}
                className={`w-full py-2 rounded ${
                  user.isSubscribed
                    ? "bg-green-600 text-white"
                    : "bg-zinc-600 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!user.isSubscribed}
              >
                {user.isSubscribed ? "📥 Télécharger" : "🔒 Abonnement requis"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!user.isSubscribed && (
        <div className="text-center mt-8">
          <h4 className="font-semibold mb-2">🔐 Abonnement 1 mois - 5€</h4>
          <button
            onClick={handlePayPalPayment}
            className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded hover:bg-yellow-500"
          >
            Payer avec PayPal
          </button>
        </div>
      )}

      {message && <p className="text-red-500 text-center mt-4">{message}</p>}
    </div>
  );
}
