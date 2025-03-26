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

  const handleStripePayment = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/payments/stripe`, { email });
      if (data.url) window.location.href = data.url;
    } catch {
      setMessage("❌ Paiement Stripe échoué.");
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenue sur StreamX Video</h1>
        <p className="max-w-xl mb-6 text-lg">Une plateforme exclusive pour adultes. Abonnez-vous pour télécharger du contenu privé et sécurisé hébergé sur AWS S3.</p>
        <button
          onClick={() => setShowLanding(false)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded text-lg"
        >
          Entrer sur le site
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">🔥 Site de Contenu Adulte 🔥</h1>

      {message && <p className="mb-4 text-red-600 font-semibold">{message}</p>}

      <form onSubmit={handleSubmit} className="space-x-2 mb-2">
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

      <h2 className="text-xl font-semibold mb-2">🎪 Liste des Vidéos</h2>

     {videos.length === 0 ? (
  <p>Aucune vidéo disponible.</p>
) : (
  <div className="space-y-4">
    {videos.map((video) => (
      <div key={video.id} className="border p-3 rounded shadow">
        <h3 className="font-bold mb-2">{video.title}</h3>

        <video
  controls
  className="mx-auto mb-2 max-w-full w-[360px] rounded shadow-md"
>
  <source
    src={video.file_path.startsWith("http") ? video.file_path : `${backendUrl}${video.file_path}`}
    type="video/mp4"
  />
</video>


        <button
          onClick={() => handleDownload(video.file_path)}
          className="bg-green-600 text-white px-3 py-1 rounded"
          disabled={!user?.isSubscribed}
        >
          {user?.isSubscribed ? "📥 Télécharger" : "🔐 Abonnement requis"}
        </button>
      </div>
    ))}
  </div>
)}


      {user && !user.isSubscribed && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">💳 Choisissez un mode de paiement :</h3>
          <div className="space-x-2">
            <button onClick={handleStripePayment} className="bg-purple-600 text-white px-3 py-1 rounded">
              Payer avec Stripe
            </button>
            <button onClick={handlePayPalPayment} className="bg-yellow-500 text-black px-3 py-1 rounded">
              Payer avec PayPal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
