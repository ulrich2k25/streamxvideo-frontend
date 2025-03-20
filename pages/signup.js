import React, { useState } from "react";
import { useRouter } from "next/router"; // Assure-toi que l'import est là
import { TextField, Button, Typography, Container, Grid } from "@mui/material";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // Fonction d'inscription
  const handleSignUp = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.message) {
        router.push("/login"); // Rediriger vers la page de login après inscription
      } else {
        setErrorMessage("Erreur lors de l'inscription.");
      }
    } catch (error) {
      setErrorMessage("Une erreur est survenue.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" component="h1" gutterBottom>
        Inscription
      </Typography>
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Mot de passe"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" fullWidth onClick={handleSignUp}>
            S'inscrire
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
