// AuthPage.js FINAL avec affichage image non-abonné + message + zoom + footer cliquable

import React, { useState, useEffect } from "react";
import axios from "axios";

const backendUrl = "https://streamxvideo-backend-production.up.railway.app";
const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const videosPerPage = 20;
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(videos.length / videosPerPage);

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

    const saved = localStorage.getItem("userSession");
    if (saved) {
      const session = JSON.parse(saved);
      if (Date.now() < session.expiresAt) {
        setUser(session.user);
        setEmail(session.user.email);
      } else {
        localStorage.removeItem("userSession");
      }
    }
  }, []);

  useEffect(() => {
    if (message && message.toLowerCase().includes("réussie")) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth`, { email, password });
      if (data.user) {
        setUser(data.user);
        setMessage(isLogin ? "Connexion réussie !" : "Inscription réussie !");
        const sessionData = {
          user: data.user,
          expiresAt: Date.now() + SESSION_DURATION,
        };
        localStorage.setItem("userSession", JSON.stringify(sessionData));
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
      const link = document.createElement("a");
      link.href = filePath;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
      alert("❌ Erreur de téléchargement");
    }
  };

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
            <input type="email" placeholder="Email" className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Mot de passe" className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-zinc-900 text-white px-4 py-8 flex flex-col justify-between">
      <div>
        <h2 className="text-4xl font-bold mb-6 text-center text-yellow-400">🎬 Vidéos Premium</h2>

        {!user.isSubscribed && (
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <button onClick={handlePayPalPayment} className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl shadow-lg transition">
              🔐 Débloquer toutes les vidéos – 5€
            </button>
            <a href="https://t.me/streamxsupport1" target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition">
              📱 Payer via Mobile Money (Telegram)
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentVideos.map((video) => (
            <div key={video.id} className="bg-zinc-800 rounded-2xl overflow-hidden shadow-xl transition transform hover:scale-105">
              {user.isSubscribed ? (
                <video
                  className="w-full h-48 object-cover"
                  muted
                  playsInline
                  controls
                >
                  <source src={video.file_path} type="video/mp4" />
                </video>
              ) : (
                <div
                  className="w-full h-48 bg-black relative cursor-pointer overflow-hidden group"
                  onClick={handlePayPalPayment}
                >
                  <video
                    src={video.file_path}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center px-4 text-center">
                    <span className="text-yellow-400 font-bold text-sm sm:text-base">🔒 Aperçu</span>
                    <span className="text-yellow-100 text-xs sm:text-sm mt-1">Clique pour débloquer le contenu complet</span>
                  </div>
                </div>
              )}

              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-yellow-300">{video.title}</h3>
                {!user.isSubscribed ? (
                  <button onClick={handlePayPalPayment} className="w-full bg-yellow-500 text-black font-bold py-2 rounded-xl hover:bg-yellow-600">
                    🔒 Abonnement requis
                  </button>
                ) : (
                  <button onClick={() => handleDownload(video.file_path)} className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700">
                    📥 Télécharger
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 mt-8">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40">
            ◀ Précédent
          </button>
          <span className="font-semibold text-yellow-400">Page {currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40">
            Suivant ▶
          </button>
        </div>

        {message && <p className="text-red-500 text-center mt-6 text-lg font-semibold">{message}</p>}
      </div>

      <footer className="mt-12 bg-zinc-950 border-t border-zinc-700 pt-6 pb-4 text-center text-sm text-zinc-400">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <p>&copy; {new Date().getFullYear()} StreamX Video. Tous droits réservés.</p>
          <div className="flex items-center gap-2">
            <span>Moyens de paiement :</span>
            <button
              onClick={handlePayPalPayment}
              title="Payer avec PayPal"
              className="focus:outline-none"
            >
              <img
                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg"
                alt="PayPal"
                className="h-6 hover:scale-110 transition duration-200 cursor-pointer"
              />
            </button>
            <a
              href="https://t.me/streamxsupport1"
              target="_blank"
              rel="noreferrer"
              title="Mobile Money"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                alt="Telegram"
                className="h-6 hover:scale-110 hover:drop-shadow-[0_0_10px_#facc15] transition duration-200"
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
