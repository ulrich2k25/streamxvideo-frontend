// AuthPage.js FINAL avec bouton Play amélioré sur mobile, vidéos floutées plus visibles, pagination, promo 1XBET et backend connecté

import React, { useState, useEffect } from "react";
import axios from "axios";

const backendUrl = "https://streamxvideo-backend-production.up.railway.app";
const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes

const isClient = typeof window !== "undefined";
const useSafeQuery = () => {
  if (!isClient) return new URLSearchParams();
  return new URLSearchParams(window.location.search);
};

const updateQueryParam = (page) => {
  if (typeof window !== "undefined") {
    const url = new URL(window.location);
    url.searchParams.set("page", page);
    window.history.pushState({}, "", url);
  }
};

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const query = useSafeQuery();

  const initialPage = parseInt(query.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

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

    const msg = query.get("message");
    const emailParam = query.get("email");
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

  useEffect(() => {
    updateQueryParam(currentPage);
  }, [currentPage]);

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
          <>
            <video
              src={teaser.file_path}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 z-0 brightness-150 contrast-125"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>
          </>
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
    <div className="min-h-screen bg-gradient-to-br from-black to-zinc-900 text-white px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-yellow-400">Bienvenue, {user.email}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="relative rounded-xl overflow-hidden shadow-lg bg-zinc-800">
            {!user.isSubscribed && (
              <>
                <img
                  src={video.thumbnail_path}
                  alt={video.title}
                  className="w-full h-48 object-cover sm:blur-sm sm:opacity-70"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 sm:bg-opacity-40">
                  <button
                    onClick={handlePayPalPayment}
                    className="bg-yellow-400 text-black font-bold px-5 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg"
                  >
                    <span className="text-lg">▶</span> Play
                  </button>
                  <p className="text-xs text-white mt-2">Clique pour débloquer le contenu complet</p>
                </div>
              </>
            )}
            {user.isSubscribed && (
              <video
                src={video.file_path}
                className="w-full h-48 object-cover"
                controls
                playsInline
                muted
              />
            )}
            <div className="p-4">
              <p className="text-yellow-300 font-semibold text-sm mb-1">{video.title}</p>
              {user.isSubscribed ? (
                <button
                  onClick={() => handleDownload(video.file_path)}
                  className="bg-green-600 hover:bg-green-700 w-full py-2 rounded text-white"
                >
                  📥 Télécharger
                </button>
              ) : (
                <button
                  onClick={handlePayPalPayment}
                  className="bg-yellow-500 hover:bg-yellow-600 w-full py-2 rounded text-black font-bold"
                >
                  🔒 Abonnement requis
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

        <div className="text-center text-sm text-white mt-12">
          🎁 <span className="font-bold text-yellow-400 animate-blink">BONUS EXCLUSIF 1XBET 24H</span> 🎁<br />
          👉 Cliquez ici et activez l'accès gratuit avec le code promo: <span className="text-yellow-400 font-bold">Bonnus</span><br />
          <a
            href="https://affpa.top/L?tag=d_451639m_97c_&site=451639&ad=97"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-4 py-2 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-400 transition"
          >
            🎰 S'inscrire maintenant sur 1XBET
          </a>
        </div>
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
