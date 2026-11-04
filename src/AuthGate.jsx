import React, { useEffect, useState } from "react";
import App from "./App.jsx";
import { auth } from "./firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

const styles = `
*{box-sizing:border-box}
body{margin:0;background:#0c0912;color:white;font-family:Arial,sans-serif}
.auth{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:22px;background:radial-gradient(ellipse at top,#49304b,#171020 55%,#0c0912)}
.card{width:100%;max-width:400px;padding:28px 23px;border:1px solid #57415e;border-radius:23px;background:linear-gradient(145deg,#281d30,#17121f);box-shadow:0 20px 60px #0008}
.logo{width:66px;height:66px;margin:auto;display:grid;place-items:center;border-radius:21px;background:linear-gradient(135deg,#f3dba8,#a97842);color:#24160b;font-size:35px;font-weight:900}
.brand{text-align:center;font-size:27px;letter-spacing:4px;margin:15px 0 5px;color:#f1d39a;font-weight:900}
.tag{text-align:center;color:#b8a8bf;font-size:11px;margin-bottom:30px}
h2{text-align:center;font-size:21px;margin-bottom:20px}
.field{width:100%;padding:14px;margin:7px 0;border:1px solid #55435c;border-radius:11px;background:#120e19;color:white;outline:none;font-size:13px}
.field:focus{border-color:#e4c58d}
.primary,.google{width:100%;height:48px;margin-top:12px;border:0;border-radius:12px;font-weight:800;font-size:13px}
.primary{background:linear-gradient(120deg,#f1d9a5,#b88648);color:#21150c}
.google{background:#fff;color:#25212a}
.google:disabled,.primary:disabled{opacity:.6}
.divider{display:flex;align-items:center;gap:10px;color:#9d91a5;font-size:10px;margin:17px 0}
.divider:before,.divider:after{content:"";height:1px;background:#514157;flex:1}
.switch{text-align:center;color:#b8a8bf;font-size:12px;margin-top:23px}
.switch button{border:0;background:none;color:#f0cf91;font-weight:800}
.error{padding:10px;border-radius:9px;background:#542b36;color:#ffd0d5;font-size:11px;overflow-wrap:anywhere}
.note{text-align:center;color:#93879b;font-size:9px;line-height:1.5;margin-top:18px}
`;

export default function AuthGate() {
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);
  const [signup,setSignup] = useState(false);
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");

  useEffect(()=>{
    return onAuthStateChanged(auth,currentUser=>{
      setUser(currentUser);
      setLoading(false);
    });
  },[]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if(signup) {
        const result=await createUserWithEmailAndPassword(
          auth,email.trim(),password
        );
        await updateProfile(result.user,{
          displayName:name.trim()
        });
      } else {
        await signInWithEmailAndPassword(
          auth,email.trim(),password
        );
      }
    } catch(err) {
      setError(
        err.code==="auth/email-already-in-use"?"This email is already registered.":
        err.code==="auth/invalid-email"?"Enter a valid email address.":
        err.code==="auth/weak-password"?"Password must be at least 6 characters.":
        err.code==="auth/invalid-credential"?"Email or password is incorrect.":
        err.message
      );
    } finally {
      setBusy(false);
    }
  }

  async function googleLogin() {
    setError("");
    setBusy(true);
    try {
      const result=await FirebaseAuthentication.signInWithGoogle();
      const idToken=result.credential?.idToken;
      if(!idToken) {
        throw new Error("Google ID token missing. Check Firebase OAuth configuration.");
      }
      const credential=GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth,credential);
    } catch(err) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  if(loading) {
    return <div className="auth"><div className="card" style={{textAlign:"center"}}><div className="logo">E</div><h2>ELVORA</h2><p>Loading your account...</p></div></div>;
  }

  if(user) return <App/>;

  return (
    <>
      <style>{styles}</style>
      <main className="auth">
        <section className="card">
          <div className="logo">E</div>
          <div className="brand">ELVORA</div>
          <div className="tag">YOUR VOICE. YOUR COMMUNITY.</div>

          <h2>{signup?"Create your account":"Welcome back"}</h2>

          <form onSubmit={handleSubmit}>
            {signup&&<input className="field" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} required/>}
            <input className="field" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required/>
            <input className="field" type="password" placeholder="Password (minimum 6 characters)" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required/>
            {error&&<p className="error">{error}</p>}
            <button className="primary" type="submit" disabled={busy}>
              {busy?"Please wait...":signup?"Create Account":"Login"}
            </button>
          </form>

          <div className="divider">OR CONTINUE WITH</div>
          <button className="google" onClick={googleLogin} disabled={busy}>
            G  Continue with Google
          </button>

          <div className="switch">
            {signup?"Already have an account?":"New to ELVORA?"}
            <button onClick={()=>{
              setSignup(v=>!v);
              setError("");
            }}>{signup?" Login":" Sign Up"}</button>
          </div>

          <p className="note">
            By continuing, you agree to use ELVORA respectfully and follow community safety rules.
          </p>
        </section>
      </main>
    </>
  );
}
