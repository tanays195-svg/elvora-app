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
  const [method, setMethod] = useState("email");
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  async function handleEmail(e) {
    e.preventDefault();
    setError("");
    setMessage("");
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
          ? "Enter a valid email address."
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

  function handleGoogle() {
    setError("");
    setMessage(
      "Google native login setup is pending. Please complete Android configuration."
    );
  }

  function handlePhone() {
    setError("");
    setMessage(
      "Phone OTP native verification setup is pending. Please complete Android configuration."
    );
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

        <h2 style={styles.heading}>Welcome to ELVORA</h2>
        <p style={styles.description}>
          Choose how you want to continue
        </p>

        <button
          style={styles.googleButton}
          onClick={handleGoogle}
          disabled={busy}
        >
          <span style={styles.googleIcon}>G</span>
          Continue with Google
        </button>

        <button
          style={styles.optionButton}
          onClick={() => {
            setMethod("email");
            setError("");
            setMessage("");
          }}
        >
          ✉ Continue with Email
        </button>

        <button
          style={styles.optionButton}
          onClick={() => {
            setMethod("phone");
            setError("");
            setMessage("");
          }}
        >
          ☎ Continue with Phone
        </button>

        {method === "email" && (
          <>
            <h3 style={styles.sectionTitle}>
              {signup ? "Create Account" : "Email Login"}
            </h3>

            <form onSubmit={handleEmail}>
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

              <button
                style={styles.mainButton}
                type="submit"
                disabled={busy}
              >
                {busy
                  ? "Please wait..."
                  : signup
                  ? "Create Account"
                  : "Login with Email"}
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
                  setMessage("");
                }}
              >
                {signup ? " Login" : " Sign Up"}
              </button>
            </p>
          </>
        )}

        {method === "phone" && (
          <>
            <h3 style={styles.sectionTitle}>Phone Verification</h3>
            <input
              style={styles.input}
              type="tel"
              placeholder="+91 Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              style={styles.mainButton}
              onClick={handlePhone}
            >
              Send OTP
            </button>
            <input
              style={styles.input}
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
            />
            <button
              style={styles.mainButton}
              onClick={handlePhone}
            >
              Verify OTP
            </button>
          </>
        )}

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.footer}>
          By continuing, you agree to ELVORA's Terms and Privacy Policy.
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
    marginBottom: "25px"
  },
  heading: {
    fontSize: "22px",
    marginBottom: "5px"
  },
  description: {
    color: "#b8a9d5",
    fontSize: "13px",
    marginBottom: "20px"
  },
  sectionTitle: {
    fontSize: "17px",
    marginTop: "25px"
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
  googleButton: {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    border: "1px solid #71618c",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#252033",
    fontSize: "15px",
    fontWeight: "bold"
  },
  googleIcon: {
    fontWeight: "bold",
    color: "#4285F4",
    marginRight: "12px"
  },
  optionButton: {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    border: "1px solid #71549b",
    borderRadius: "12px",
    background: "#251b3d",
    color: "white",
    fontSize: "15px",
    fontWeight: "bold"
  },
  mainButton: {
    width: "100%",
    padding: "15px",
    marginTop: "8px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(90deg, #9333ea, #6d28d9)",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold"
  },
  switchText: {
    color: "#b8a9d5",
    fontSize: "14px",
    marginTop: "20px"
  },
  switchButton: {
    background: "none",
    border: "none",
    color: "#c084fc",
    fontWeight: "bold",
    fontSize: "14px"
  },
  error: {
    color: "#ff8585",
    fontSize: "13px",
    marginTop: "15px"
  },
  message: {
    color: "#ffd27d",
    fontSize: "13px",
    marginTop: "15px"
  },
  footer: {
    color: "#8f83a8",
    fontSize: "11px",
    marginTop: "25px",
    lineHeight: 1.5
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
