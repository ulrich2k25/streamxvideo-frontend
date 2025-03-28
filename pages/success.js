// frontend/pages/success.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const backendUrl = "https://streamxvideo-backend-production.up.railway.app";

export default function SuccessPage() {
  const router = useRouter();
  const { token, email } = router.query;
  const [message, setMessage] = useState("⏳ Vérification du paiement...");

  useEffect(() => {
    if (!token || !email) return;

    axios.get(`${backendUrl}/api/payments/success?token=${token}&email=${email}`)
      .then(() => {
        setMessage("✅ Paiement confirmé ! Redirection...");
        setTimeout(() => {
          router.push(`/?message=Abonnement%20activé&email=${encodeURIComponent(email)}`);
        }, 2500);
      })
      .catch(() => {
        setMessage("❌ Erreur lors de la confirmation du paiement.");
      });
  }, [token, email]);

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-900 text-white text-xl">
      {message}
    </div>
  );
}
