import React, { useState, useEffect } from "react";
import axios from "axios";

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState(""); 
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);

  const backendUrl = "https://streamxvideo-backend-production.up.railway.app"; 

  // 📌 Charger les vidéos depuis MySQL
  useEffect(() => {
    axios.get(`${backendUrl}/api/videos`)
      .then(response => setVideos(response.data))
      .catch(error => console.error("Erreur lors du chargement des vidéos :", error));

    const queryParams = new URLSearchParams(window.location.search);
    const messageFromURL = queryParams.get("message");
    if (messageFromURL) {
      setMessage(decodeURIComponent(messageFromURL));
    }
  }, []);

  // 📌 Gérer l'authentification
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}/api/auth`, { email, password });

      if (response.data.user) {
        setUser(response.data.user);
        setMessage(isLogin ? "Connexion réussie !" : "Inscription réussie !");
      } else {
        setMessage("Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur d'authentification :", error);
      setMessage("Email ou mot de passe incorrect.");
    }
  };

  // 📌 Gérer l'abonnement avec Stripe
  const handleStripePayment = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/payments/stripe`, { email });

      if (response.data.url) {
        window.location.href = response.data.url; 
      } else {
        setMessage("Échec du paiement avec Stripe.");
      }
    } catch (error) {
      console.error("Erreur lors du paiement Stripe :", error);
      setMessage("Échec du paiement avec Stripe.");
    }
  };

  // 📌 Gérer l'abonnement avec PayPal
  const handlePayPalPayment = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/payments/paypal`, { email });

      if (response.data.url) {
        window.location.href = response.data.url; 
      } else {
        setMessage("Échec du paiement avec PayPal.");
      }
    } catch (error) {
      console.error("Erreur lors du paiement PayPal :", error);
      setMessage("Échec du paiement avec PayPal.");
    }
  };

  // 📌 Télécharger une vidéo (uniquement si abonné)
  const handleDownload = async (filePath) => {
    if (!user || !user.isSubscribed) {
      alert("Vous devez être abonné pour télécharger cette vidéo !");
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/api/videos/download?file=${filePath}`, {  
        headers: { "user-email": email },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "video/mp4" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filePath.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error);
      alert("Téléchargement impossible !");
    }
  };

  return (
    <div>
      <h1>🔥 Site de Contenu Adulte 🔥</h1>

      {/* 📌 Afficher le message s'il est présent */}
      {message && <p>{message}</p>}

      {/* 📌 Formulaire d'authentification */}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{isLogin ? "Se connecter" : "S'inscrire"}</button>
      </form>

      {/* 📌 Basculer entre connexion et inscription */}
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Pas encore inscrit ? Créez un compte" : "Déjà inscrit ? Connectez-vous"}
      </button>

      {/* 📌 Affichage des vidéos */}
      <h2>📺 Liste des Vidéos</h2>
      {videos.length === 0 ? <p>Aucune vidéo disponible.</p> : (
        <div>
          {videos.map((video) => (
            <div key={video.id}>
              <h3>{video.title}</h3>
              <video width="320" height="240" controls>
                <source src={video.file_path} type="video/mp4" />
              </video>
              <button onClick={() => handleDownload(video.file_path)} disabled={!user || !user.isSubscribed}>
                {user && user.isSubscribed ? "📥 Télécharger" : "🔒 Abonnez-vous pour télécharger"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 📌 Boutons de paiement */}
      {user && !user.isSubscribed && (
        <div>
          <h3>💳 Choisissez un mode de paiement :</h3>
          <button onClick={handleStripePayment}>🚀 Payer avec Stripe</button>
          <button onClick={handlePayPalPayment}>💸 Payer avec PayPal</button>
        </div>
      )}
    </div>
  );
}

export default AuthPage;
