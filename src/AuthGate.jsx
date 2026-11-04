import React, { useEffect, useState } from "react";
import App from "./App.jsx";
import { auth } from "./firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

export default function AuthGate() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (signup) {
        const result = await createUserWithEmailAndPassword(
          auth, email.trim(), password
        );

        await updateProfile(result.user, {
          displayName: name.trim()
        });
      } else {
        await signInWithEmailAndPassword(
          auth, email.trim(), password
        );
      }
    } catch (err) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "This email is already registered."
          : err.code === "auth/invalid-email"
          ? "Please enter a valid email."
          : err.code === "auth/weak-password"
          ? "Password must be at least 6 characters."
          : err.code === "auth/invalid-credential"
          ? "Email or password is incorrect."
          : err.message
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <h2>ELVORA</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) return <App />;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>E</div>
        <h1 style={styles.title}>ELVORA</h1>
        <p style={styles.subtitle}>
          Your voice. Your community.
        </p>

        <h2 style={styles.heading}>
          {signup ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit}>
          {signup && (
            <input
              style={styles.input}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            style={styles.input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password (minimum 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            style={styles.button}
            type="submit"
            disabled={busy}
          >
            {busy
              ? "Please wait..."
              : signup
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        <p style={styles.switchText}>
          {signup
            ? "Already have an account?"
            : "New to ELVORA?"}
          <button
            style={styles.switchButton}
            onClick={() => {
              setSignup(!signup);
              setError("");
            }}
          >
            {signup ? " Login" : " Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #090817, #17102d, #090817)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "22px",
    boxSizing: "border-box",
    color: "white",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    width: "100%",
    maxWidth: "390px",
    background: "rgba(30, 24, 53, 0.95)",
    border: "1px solid #49366d",
    borderRadius: "22px",
    padding: "28px 22px",
    boxSizing: "border-box",
    textAlign: "center"
  },
  logo: {
    width: "62px",
    height: "62px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #a855f7, #6d28d9)",
    display: "grid",
    placeItems: "center",
    margin: "0 auto",
    fontSize: "34px",
    fontWeight: "bold"
  },
  title: {
    fontSize: "30px",
    letterSpacing: "5px",
    margin: "15px 0 5px"
  },
  subtitle: {
    color: "#b8a9d5",
    fontSize: "13px",
    marginBottom: "32px"
  },
  heading: {
    fontSize: "22px",
    marginBottom: "22px"
  },
  input: {
    width: "100%",
    padding: "15px",
    marginBottom: "14px",
    borderRadius: "12px",
    border: "1px solid #554477",
    background: "#171329",
    color: "white",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none"
  },
  button: {
    width: "100%",
    padding: "15px",
    marginTop: "8px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(90deg, #9333ea, #6d28d9)",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  error: {
    color: "#ff8585",
    fontSize: "13px",
    textAlign: "left"
  },
  switchText: {
    color: "#b8a9d5",
    fontSize: "14px",
    marginTop: "24px"
  },
  switchButton: {
    background: "none",
    border: "none",
    color: "#c084fc",
    fontWeight: "bold",
    fontSize: "14px"
  },
  loading: {
    minHeight: "100vh",
    background: "#090817",
    color: "white",
    display: "grid",
    placeContent: "center",
    textAlign: "center"
  }
};
