import React, { useEffect, useMemo, useState } from "react";
import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, runTransaction, limit
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import {
  connectToLiveKitRoom, disconnectFromLiveKitRoom,
  enableRoomMicrophone, disableRoomMicrophone
} from "./livekit";
import {
  Home, Users, MessageCircle, UserRound, Mic, MicOff, Plus,
  Settings, Wallet, Crown, Trophy, Heart, ChevronRight,
  ArrowLeft, Send, Bell, Volume2, VolumeX, Share2,
  MoreHorizontal, Search, X, ShieldCheck, LogOut,
  Headphones, Sparkles, Globe, Smile, Copy, Gem, Radio,
  Check, XCircle, Pencil, UserCheck, UserX, Lock
} from "lucide-react";

const GOLD = "#f5ce78";
const CAPACITIES = [2, 10, 15, 20];

const css = `
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;background:#100700}
body{font-family:Arial,sans-serif;color:#fff}
button,input,textarea,select{font:inherit}
button{cursor:pointer}
.app{max-width:620px;min-height:100dvh;margin:auto;position:relative;overflow:hidden;padding-bottom:90px;background:radial-gradient(ellipse at 50% 0%,#75451d,#321707 36%,#100700 82%)}
.goldtext{color:#ffe19a}
.top{height:66px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;position:sticky;top:0;z-index:10;background:linear-gradient(90deg,#160800f5,#59300ff5,#160800f5);border-bottom:1px solid #c18b42}
.brand{font-size:23px;font-weight:900;letter-spacing:3px;color:#ffe5a8}
.brand small{display:block;font-size:8px;letter-spacing:3px;text-align:center;color:#d6b477}
.page{padding:14px 13px 30px}
.heading{text-align:center;font-size:22px;color:#ffe0a0;margin:12px 0 18px}
.sub{font-size:11px;color:#cbb18a}
.row{display:flex;align-items:center;gap:9px}
.between{display:flex;align-items:center;justify-content:space-between;gap:9px}
.goldpanel{padding:15px;margin:12px 0;border-radius:17px;border:1px solid #d09b4e;background:linear-gradient(145deg,#65330e,#301504 60%,#170900);box-shadow:inset 0 0 0 2px #58300f,0 5px 17px #0009}
.btn{border:1px solid #ffe3a3;border-radius:30px;padding:11px 17px;background:linear-gradient(110deg,#ffe9a8,#d59a3d,#995018);color:#291304;font-weight:900;font-size:12px}
.btn2{border:1px solid #bd8743;border-radius:25px;padding:9px 13px;background:linear-gradient(120deg,#54290d,#1d0b03);color:#ffe2a0;font-size:11px}
.round{width:38px;height:38px;border-radius:50%;border:1px solid #d4a45c;background:radial-gradient(#77431b,#1a0b03);color:#ffe5a8;display:grid;place-items:center;flex-shrink:0}
.input{width:100%;padding:12px;border:1px solid #a9793e;border-radius:10px;background:#1c0c04;color:white;margin:6px 0 13px;outline:none}
.avatar{width:46px;height:46px;border-radius:50%;border:2px solid #f0ca7b;background:linear-gradient(135deg,#f6dfaa,#754016);display:grid;place-items:center;overflow:hidden;flex-shrink:0;color:#281204;font-weight:900}
.avatar img{width:100%;height:100%;object-fit:cover}
.tabs{display:flex;gap:22px;overflow:auto;padding:8px 2px 13px}
.tabs button{border:0;background:none;color:#d0b184;font-weight:700;padding:7px 2px;white-space:nowrap}
.tabs button.active{color:#ffe28b;border-bottom:3px solid #ffdc79}
.banner{min-height:108px;border:2px solid #e5bb6b;border-radius:15px;background:radial-gradient(circle at 25%,#8d43a6,#36134a 58%,#19091e);display:flex;align-items:center;justify-content:space-around;margin:12px 0;color:#ffe7aa;font-size:20px;font-weight:900}
.tilegrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
.tile{min-height:85px;border:1px solid #d5a75f;border-radius:16px;background:linear-gradient(145deg,#a96825,#4a2109 60%,#1b0b03);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;color:#ffe29b}
.tile span{font-size:11px;font-weight:800}
.roomgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
.roomcard{border:1px solid #d4a35b;border-radius:14px;padding:7px;background:linear-gradient(145deg,#63300e,#1c0b03);min-width:0}
.cover{height:100px;border-radius:9px;background:radial-gradient(circle,#a56a2c,#351605);display:grid;place-items:center;overflow:hidden;color:#ffe3a3}
.cover img{width:100%;height:100%;object-fit:cover}
.roompage{padding:12px 12px 105px;min-height:calc(100dvh - 66px);background:radial-gradient(ellipse at top,#633812,#291306 48%,#100700)}
.roomhead{display:flex;align-items:center;justify-content:space-between;gap:7px;margin-bottom:15px}
.roomidentity{display:flex;align-items:center;gap:10px;margin:12px 0}
.roomname{font-weight:900;font-size:15px;color:#ffe3a0}
.seats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:19px 3px;padding:18px 5px;border:1px solid #c28d48;border-radius:16px;background:linear-gradient(140deg,#4b260eaa,#180b04ee)}
.seat{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}
.seatcircle{width:49px;height:49px;border-radius:50%;border:2px solid #f0ca7b;background:radial-gradient(#8a511f,#1c0c04);display:grid;place-items:center;color:#f8d58f;overflow:hidden}
.seat small{font-size:8px;color:#f1d7aa;max-width:66px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.welcome{padding:12px;background:#170a04d9;border-left:3px solid #e0a344;color:#ffda79;margin:13px 0;font-size:12px}
.chatpreview{padding:11px;border:1px solid #93602f;border-radius:11px;background:#170a04;margin:13px 0;max-height:110px;overflow:hidden}
.chatline{font-size:10px;margin:6px 0;color:#f2d7aa;overflow-wrap:anywhere}
.bottom-action{position:fixed;z-index:21;bottom:0;left:50%;transform:translateX(-50%);width:min(620px,100%);height:78px;padding-bottom:env(safe-area-inset-bottom);display:grid;grid-template-columns:repeat(6,1fr);align-items:center;background:linear-gradient(90deg,#1a0b04f8,#65330ff8,#1a0b04f8);border-top:1px solid #d3a05a}
.bottom-action button{border:0;background:none;color:#ffe1a2;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:8px}
.bottom-action svg{width:21px;height:21px}
.bottom-action .micmain{width:45px;height:45px;border-radius:50%;background:linear-gradient(#ffe5a4,#b36a20);color:#281204}
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);z-index:20;width:min(620px,100%);height:78px;padding-bottom:env(safe-area-inset-bottom);display:flex;justify-content:space-around;align-items:center;background:linear-gradient(90deg,#1b0b04f7,#63300ff7,#1b0b04f7);border:1px solid #b27a3b;border-radius:20px 20px 0 0}
.nav button{border:0;background:none;color:#c7a66c;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:9px}
.nav button.active{color:#ffe48c}
.listitem{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px;margin:7px 0;border:1px solid #a9793e;border-radius:12px;background:linear-gradient(100deg,#4c260e,#1b0c04);color:white;text-align:left}
.statgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
.stat{padding:13px 4px;text-align:center;border:1px solid #a87940;border-radius:12px;background:#321707}
.stat b{display:block;color:#ffdc8c;font-size:20px}
.stat span{font-size:9px;color:#d6b98c}
.overlay{position:fixed;inset:0;z-index:40;background:#000c;display:flex;align-items:flex-end;justify-content:center}
.sheet{width:min(620px,100%);max-height:85dvh;overflow:auto;padding:17px 16px calc(24px + env(safe-area-inset-bottom));border:1px solid #d1a05a;border-radius:22px 22px 0 0;background:linear-gradient(145deg,#51270e,#1c0d05 70%)}
.sheethead{display:flex;justify-content:space-between;align-items:center;color:#ffe0a0;font-weight:900;margin-bottom:14px}
.chatbox{height:40dvh;overflow:auto;padding:10px;border:1px solid #8c5b2d;border-radius:12px;background:#140902}
.msg{padding:9px;margin:7px 0;border-radius:9px;background:#3a1b0b;font-size:11px;overflow-wrap:anywhere}
.footer{display:flex;gap:7px;align-items:center}
.footer .input{flex:1;min-width:0;margin:7px 0}
.toast{position:fixed;z-index:60;top:74px;left:50%;transform:translateX(-50%);max-width:90%;padding:11px 15px;border:1px solid #e5b86c;border-radius:10px;background:#3c1d0a;color:white;font-size:11px}
.empty{text-align:center;padding:30px 12px;color:#d9bd91}
@media(max-width:370px){.seatcircle{width:42px;height:42px}.seats{gap:14px 1px}}
`;

function numericId(value) {
  let h = 0;
  for (const c of String(value || "")) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return String(100000 + h % 900000);
}

function Avatar({ name = "U", url = "", size = 46 }) {
  return <div className="avatar" style={{ width: size, height: size }}>
    {url ? <img src={url} alt="Profile" /> : String(name).slice(0, 1).toUpperCase()}
  </div>;
}

export default function App() {
  const user = auth.currentUser;
  const [tab, setTab] = useState("Room");
  const [screen, setScreen] = useState("");
  const [rooms, setRooms] = useState([]);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [liveKitRoom, setLiveKitRoom] = useState(null);
  const [voiceConnecting, setVoiceConnecting] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.displayName || user?.email?.split("@")[0] || "Member",
    bio: "Welcome to ELVORA", country: "India", photoURL: user?.photoURL || ""
  });
  const [profileEdit, setProfileEdit] = useState({});
  const [roomName, setRoomName] = useState("");
  const [capacity, setCapacity] = useState("20");
  const [privacy, setPrivacy] = useState("public");
  const [search, setSearch] = useState("");
  const [chatText, setChatText] = useState("");
  const [sheet, setSheet] = useState("");
  const [notice, setNotice] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [listTab, setListTab] = useState("Hot");
  const [messageEnd, setMessageEnd] = useState(null);

  const uid = numericId(user?.uid);
  const myMember = members.find((m) => m.uid === user?.uid);
  const isOwner = activeRoom?.ownerId === user?.uid;
  const isModerator = isOwner || myMember?.role === "moderator";
  const isSpeaker = myMember?.role === "speaker" || myMember?.role === "owner" || myMember?.role === "moderator";

  const notify = (message) => {
    setNotice(message);
    window.clearTimeout(window.__elvoraToast);
    window.__elvoraToast = window.setTimeout(() => setNotice(""), 3500);
  };

  const filteredRooms = useMemo(() => rooms.filter((r) =>
    r.privacy === "public" && (r.name || "").toLowerCase().includes(search.toLowerCase())
  ), [rooms, search]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(query(collection(db, "rooms"), orderBy("createdAt", "desc"), limit(60)),
      (s) => setRooms(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => notify("Rooms load error: " + e.message));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), (s) => {
      if (s.exists()) {
        const d = s.data();
        setProfile((p) => ({
          ...p, name: d.displayName || p.name, bio: d.bio ?? p.bio,
          country: d.country || p.country, photoURL: d.photoURL ?? p.photoURL
        }));
      }
    });
  }, [user]);

  useEffect(() => {
    if (!activeRoom || !user) return;
    const path = `rooms/${activeRoom.id}`;
    const stopMembers = onSnapshot(collection(db, path, "members"),
      (s) => setMembers(s.docs.map((d) => d.data())),
      (e) => notify("Members error: " + e.message));
    const stopRequests = onSnapshot(collection(db, path, "requests"),
      (s) => setRequests(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => notify("Requests error: " + e.message));
    const stopMessages = onSnapshot(query(collection(db, path, "messages"), orderBy("createdAt", "asc"), limit(100)),
      (s) => setMessages(s.docs.map((d) => d.data())),
      (e) => notify("Chat error: " + e.message));
    return () => { stopMembers(); stopRequests(); stopMessages(); };
  }, [activeRoom, user]);

  useEffect(() => {
    if (!liveKitRoom) return;
    const attached = new Set();
    const onTrack = (track) => {
      if (track.kind !== "audio") return;
      const el = track.attach();
      el.autoplay = true; el.playsInline = true; el.style.display = "none";
      document.body.appendChild(el); attached.add(track);
    };
    const onUntrack = (track) => {
      track.detach().forEach((el) => el.remove()); attached.delete(track);
    };
    liveKitRoom.on("trackSubscribed", onTrack);
    liveKitRoom.on("trackUnsubscribed", onUntrack);
    return () => {
      liveKitRoom.off("trackSubscribed", onTrack);
      liveKitRoom.off("trackUnsubscribed", onUntrack);
      attached.forEach((t) => t.detach().forEach((el) => el.remove()));
    };
  }, [liveKitRoom]);

  const connectVoice = async (room) => {
    if (liveKitRoom || voiceConnecting) return;
    setVoiceConnecting(true);
    try {
      const connection = await connectToLiveKitRoom({
        roomName: `elvora-${room.id}`,
        participantName: profile.name || "ELVORA Member"
      });
      setLiveKitRoom(connection);
      setMicOn(false);
      notify("Voice connected. Microphone OFF hai.");
    } catch (e) {
      notify("Voice connection error: " + (e.message || "Retry karo."));
    } finally { setVoiceConnecting(false); }
  };

  const joinRoom = async (room) => {
    if (!user) return notify("Pehle login karo.");
    if (room.privacy === "private" && room.ownerId !== user.uid)
      return notify("Private room mein invitation zaroori hai; invite feature abhi pending hai.");
    try {
      await runTransaction(db, async (tx) => {
        const rr = doc(db, "rooms", room.id);
        const mr = doc(db, "rooms", room.id, "members", user.uid);
        const rs = await tx.get(rr);
        if (!rs.exists()) throw new Error("Room nahi mila.");
        const ms = await tx.get(mr);
        if (ms.exists()) return;
        tx.set(mr, {
          uid: user.uid, name: profile.name, photoURL: profile.photoURL || "",
          role: rs.data().ownerId === user.uid ? "owner" : "audience",
          seat: null, joinedAt: serverTimestamp()
        });
      });
      setActiveRoom(room);
      setMessages([]);
      setScreen("LiveRoom");
      setTab("Room");
      await connectVoice(room);
    } catch (e) { notify(e.message || "Join nahi hua."); }
  };

  const createRoom = async () => {
    if (!user) return notify("Pehle login karo.");
    if (!roomName.trim()) return notify("Room ka naam likho.");
    try {
      const code = "ELV-" + Math.floor(100000 + Math.random() * 900000);
      const ref = await addDoc(collection(db, "rooms"), {
        name: roomName.trim(), roomCode: code, category: "Global",
        capacity: Number(capacity), ownerId: user.uid, ownerName: profile.name,
        privacy, coverURL: "", backgroundURL: "", createdAt: serverTimestamp()
      });
      setRoomName(""); setScreen("");
      await joinRoom({
        id: ref.id, name: roomName.trim(), roomCode: code,
        capacity: Number(capacity), ownerId: user.uid, ownerName: profile.name,
        privacy, coverURL: ""
      });
      notify("Room create ho gaya.");
    } catch (e) { notify("Room create error: " + e.message); }
  };

  const leaveRoom = async () => {
    if (!activeRoom || !user) return;
    try {
      if (liveKitRoom) await disconnectFromLiveKitRoom(liveKitRoom);
      setLiveKitRoom(null); setMicOn(false);
      const memberRef = doc(db, "rooms", activeRoom.id, "members", user.uid);
      const member = members.find((m) => m.uid === user.uid);
      if (member?.seat) {
        const seatRef = doc(db, "rooms", activeRoom.id, "seats", String(member.seat));
        await deleteDoc(seatRef);
      }
      await deleteDoc(memberRef);
      await deleteDoc(doc(db, "rooms", activeRoom.id, "requests", user.uid));
    } catch (e) { notify("Leave error: " + e.message); }
    setActiveRoom(null); setMembers([]); setRequests([]); setMessages([]); setScreen("");
  };

  const requestToSpeak = async () => {
    if (!activeRoom || !user) return;
    if (isSpeaker) return notify("Tum already stage par ho.");
    try {
      await setDoc(doc(db, "rooms", activeRoom.id, "requests", user.uid), {
        uid: user.uid, name: profile.name, photoURL: profile.photoURL || "",
        status: "pending", createdAt: serverTimestamp()
      });
      notify("Speak request owner ko bhej di.");
    } catch (e) { notify("Request send error: " + e.message); }
  };

  const approveRequest = async (request) => {
    if (!isModerator) return notify("Sirf owner/moderator approve kar sakte hain.");
    try {
      await runTransaction(db, async (tx) => {
        const roomRef = doc(db, "rooms", activeRoom.id);
        const reqRef = doc(db, "rooms", activeRoom.id, "requests", request.uid);
        const memberRef = doc(db, "rooms", activeRoom.id, "members", request.uid);
        const roomSnap = await tx.get(roomRef);
        const reqSnap = await tx.get(reqRef);
        const memberSnap = await tx.get(memberRef);
        if (!roomSnap.exists() || !reqSnap.exists() || !memberSnap.exists())
          throw new Error("Request/member nahi mila.");
        const cap = Number(roomSnap.data().capacity) || 20;
        const seatRefs = Array.from({ length: cap }, (_, i) =>
          doc(db, "rooms", activeRoom.id, "seats", String(i + 1)));
        const seatSnaps = [];
        for (const ref of seatRefs) seatSnaps.push(await tx.get(ref));
        const free = seatSnaps.findIndex((s) => !s.exists());
        if (free < 0) throw new Error("Stage full hai.");
        tx.update(memberRef, { role: "speaker", seat: free + 1 });
        tx.set(seatRefs[free], { uid: request.uid, name: request.name });
        tx.delete(reqRef);
      });
      notify("Request approve ho gayi.");
    } catch (e) { notify("Approve error: " + e.message); }
  };

  const rejectRequest = async (request) => {
    if (!isModerator) return;
    try {
      await deleteDoc(doc(db, "rooms", activeRoom.id, "requests", request.uid));
      notify("Request reject kar di.");
    } catch (e) { notify("Reject error: " + e.message); }
  };

  const removeFromStage = async (member) => {
    if (!isModerator) return;
    if (member.uid === activeRoom.ownerId) return notify("Owner ko stage se remove nahi kar sakte.");
    try {
      if (member.seat) await deleteDoc(doc(db, "rooms", activeRoom.id, "seats", String(member.seat)));
      await updateDoc(doc(db, "rooms", activeRoom.id, "members", member.uid), {
        role: "audience", seat: null
      });
      notify("Member audience mein move ho gaya.");
    } catch (e) { notify("Action error: " + e.message); }
  };

  const makeModerator = async (member) => {
    if (!isOwner || member.uid === user.uid) return;
    try {
      await updateDoc(doc(db, "rooms", activeRoom.id, "members", member.uid), {
        role: member.role === "moderator" ? "audience" : "moderator"
      });
      notify(member.role === "moderator" ? "Moderator role removed." : "Moderator bana diya.");
    } catch (e) { notify("Moderator update error: " + e.message); }
  };

  const toggleMic = async () => {
    if (!liveKitRoom) return notify("Voice connection nahi hai.");
    if (!isSpeaker) return notify("Mic use karne ke liye stage par aao.");
    try {
      if (micOn) { await disableRoomMicrophone(liveKitRoom); setMicOn(false); notify("Mic muted."); }
      else { await enableRoomMicrophone(liveKitRoom); setMicOn(true); notify("Mic ON."); }
    } catch (e) { setMicOn(false); notify("Mic error: " + e.message); }
  };

  const toggleSpeaker = async () => {
    if (!liveKitRoom) return;
    try {
      const next = !speakerOn;
      liveKitRoom.remoteParticipants.forEach((p) => {
        p.trackPublications.forEach((pub) => {
          if (pub.track?.kind === "audio") pub.track.setVolume(next ? 1 : 0);
        });
      });
      setSpeakerOn(next);
    } catch (e) { notify("Audio setting error: " + e.message); }
  };

  const sendMessage = async () => {
    const text = chatText.trim();
    if (!text || !activeRoom || !user) return;
    try {
      await addDoc(collection(db, "rooms", activeRoom.id, "messages"), {
        text, senderId: user.uid, senderName: profile.name,
        createdAt: serverTimestamp()
      });
      setChatText("");
    } catch (e) { notify("Message error: " + e.message); }
  };

  const saveProfile = async () => {
    if (!profileEdit.name?.trim()) return notify("Username likho.");
    try {
      const next = {
        name: profileEdit.name.trim(), bio: (profileEdit.bio || "").trim(),
        country: profileEdit.country || "India", photoURL: (profileEdit.photoURL || "").trim()
      };
      await setDoc(doc(db, "users", user.uid), {
        displayName: next.name, bio: next.bio, country: next.country,
        photoURL: next.photoURL, updatedAt: serverTimestamp()
      }, { merge: true });
      setProfile(next); setSheet(""); notify("Profile save ho gayi.");
    } catch (e) { notify("Profile error: " + e.message); }
  };

  const openProfileEdit = () => {
    setProfileEdit({ name: profile.name, bio: profile.bio, country: profile.country, photoURL: profile.photoURL });
    setSheet("Edit Profile");
  };

  const copyText = async (text, label) => {
    try { await navigator.clipboard.writeText(String(text || "")); notify(label + " copied."); }
    catch { notify("Copy nahi hua: " + text); }
  };

  const Header = ({ title, back = false }) => (
    <header className="top">
      {back ? <button className="round" onClick={() => setScreen("")}><ArrowLeft /></button>
        : <div className="brand">ELVORA<small>VOICE COMMUNITY</small></div>}
      <b className="goldtext">{title}</b>
      <button className="round" onClick={() => setScreen("Notifications")}><Bell size={17} /></button>
    </header>
  );

  const HomePage = () => (
    <main className="page">
      <div className="tabs">
        {["Mine", "Hot", "Following"].map((t) =>
          <button key={t} className={listTab === t ? "active" : ""} onClick={() => setListTab(t)}>{t}</button>)}
        <button onClick={() => setScreen("Search")}><Search size={18} /></button>
      </div>
      <div className="banner" onClick={() => setScreen("Wallet")}><Gem size={44} /><span>ELVORA<br/>COMMUNITY</span><Sparkles size={28}/></div>
      <div className="tilegrid">
        <button className="tile" onClick={() => setScreen("Rank")}><Trophy/><span>Rank</span></button>
        <button className="tile" onClick={() => setScreen("Family")}><Users/><span>Family</span></button>
        <button className="tile" onClick={() => setScreen("CP Space")}><Heart/><span>CP Space</span></button>
      </div>
      <div className="between" style={{margin:"18px 0 12px"}}>
        <b className="goldtext">ELVORA Voice Rooms</b>
        <button className="btn2" onClick={() => setScreen("Create Room")}><Plus size={14}/> Create</button>
      </div>
      <div className="input row"><Search size={16}/>
        <input style={{flex:1,minWidth:0,border:0,background:"transparent",color:"white",outline:0}}
          placeholder="Search rooms..." value={search} onChange={(e)=>setSearch(e.target.value)}/>
      </div>
      {filteredRooms.length === 0
        ? <div className="goldpanel empty"><Headphones size={38} color={GOLD}/><p>No public rooms found. Apna room create karo.</p></div>
        : <div className="roomgrid">{filteredRooms.map((r)=><article className="roomcard" key={r.id}>
          <div className="cover">{r.coverURL?<img src={r.coverURL} alt="Room"/>:<Crown size={38}/>}</div>
          <b style={{display:"block",margin:"8px 3px 3px",fontSize:12}}>{r.name}</b>
          <div className="sub" style={{margin:"0 3px 8px"}}>ID: {r.roomCode || numericId(r.id)} · {r.capacity || 20} seats</div>
          <button className="btn" style={{width:"100%",padding:8}} onClick={()=>joinRoom(r)}>Join Room</button>
        </article>)}</div>}
      <div className="goldpanel"><b className="goldtext">ELVORA Community</b><p className="sub">Meet people and join voice conversations.</p></div>
    </main>
  );

  const LiveRoom = () => {
    const stageMembers = members.filter((m) => m.seat);
    return <main className="roompage">
      <div className="roomhead">
        <button className="round" onClick={leaveRoom}><ArrowLeft/></button>
        <span className="goldtext" style={{fontSize:10,fontWeight:900}}>
          {liveKitRoom ? "● VOICE CONNECTED" : voiceConnecting ? "CONNECTING..." : "● VOICE OFFLINE"}
        </span>
        <div className="row">
          <button className="round" onClick={()=>copyText(activeRoom?.roomCode || activeRoom?.id,"Room ID")}><Share2 size={16}/></button>
          <button className="round" onClick={toggleSpeaker}>{speakerOn?<Volume2 size={16}/>:<VolumeX size={16}/>}</button>
          <button className="round" onClick={()=>setSheet("More")}><MoreHorizontal/></button>
        </div>
      </div>
      <div className="roomidentity"><Avatar name={activeRoom?.name} url={activeRoom?.coverURL} size={52}/>
        <div style={{flex:1,minWidth:0}}><div className="roomname">{activeRoom?.name}</div>
          <div className="sub">ID: {activeRoom?.roomCode || numericId(activeRoom?.id)}</div></div>
      </div>
      <div className="between goldpanel" style={{padding:12}}>
        <span className="goldtext"><Trophy size={15}/> Stage</span>
        <span className="sub"><Users size={14}/> {members.length} members · {stageMembers.length}/{activeRoom?.capacity || 20} speakers</span>
      </div>
      <div className="welcome">✨ Welcome to {activeRoom?.name}! Respect everyone and enjoy the conversation.</div>
      <div className="between" style={{margin:"16px 3px 11px"}}>
        <b className="goldtext">Microphone Stage</b><span className="sub">Speakers only</span>
      </div>
      <div className="seats">
        {Array.from({length:Number(activeRoom?.capacity)||20},(_,i)=>{
          const m=stageMembers.find((x)=>Number(x.seat)===i+1);
          return <div className="seat" key={i}><div className="seatcircle">
            {m?<Avatar name={m.name} url={m.photoURL} size={45}/>:<Mic size={19}/>}
          </div><small>{m?m.name:`No.${i+1}`}</small></div>;
        })}
      </div>
      <div className="between" style={{margin:"12px 2px"}}>
        <span className="sub"><Users size={14}/> {members.length} members</span>
        <button className="btn2" onClick={()=>setSheet("Members")}>Members & Roles</button>
      </div>
      {!isSpeaker && <button className="btn" style={{width:"100%"}} onClick={requestToSpeak}>
        <Mic size={15}/> Request to Speak
      </button>}
      {isSpeaker && <div className="goldpanel"><b className="goldtext"><UserCheck size={15}/> You are on stage</b>
        <p className="sub">Microphone button se apna mic ON/OFF karo.</p></div>}
      {isModerator && <button className="btn2" style={{width:"100%",marginTop:8}} onClick={()=>setSheet("Requests")}>
        Speak Requests ({requests.length})
      </button>}
      <div className="chatpreview" onClick={()=>setSheet("Chat")}>
        <b className="goldtext" style={{fontSize:11}}>Room Chat · Tap to open</b>
        {messages.slice(-3).map((m,i)=><div className="chatline" key={i}><b>{m.senderName}:</b> {m.text}</div>)}
        {!messages.length && <div className="chatline">Welcome everyone! Say hello.</div>}
      </div>
    </main>;
  };

  const ProfilePage = () => <main className="page">
    <div className="heading">My Profile</div>
    <div className="goldpanel" style={{textAlign:"center",padding:22}}>
      <Avatar name={profile.name} url={profile.photoURL} size={94}/>
      <h2 className="goldtext">{profile.name}</h2>
      <div className="row" style={{justifyContent:"center"}}><span className="sub">UID: {uid}</span>
        <button className="btn2" onClick={()=>copyText(uid,"UID")}><Copy size={13}/></button></div>
      <p className="sub">{profile.country} · {profile.bio}</p>
      <button className="btn" onClick={openProfileEdit}><Pencil size={15}/> Edit Profile</button>
    </div>
    <div className="statgrid">{["Visitors","Following","Followers"].map(t=><div className="stat" key={t}><b>0</b><span>{t}</span></div>)}</div>
    <div className="tilegrid">
      <button className="tile" onClick={()=>setScreen("Wallet")}><Wallet/><span>Wallet</span></button>
      <button className="tile" onClick={()=>setScreen("Rank")}><Trophy/><span>Rank</span></button>
      <button className="tile" onClick={()=>setScreen("Settings")}><Settings/><span>Settings</span></button>
    </div>
    {["Family","CP Space","Decoration","Safety & Privacy"].map(t=><button className="listitem" key={t} onClick={()=>setScreen(t)}>{t}<ChevronRight color={GOLD}/></button>)}
  </main>;

  const CreateRoomPage = () => <main className="page">
    <div className="heading">Create Room</div>
    <div className="goldpanel">
      <label className="sub">ROOM NAME</label>
      <input className="input" maxLength={50} value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="ELVORA Global Room"/>
      <label className="sub">PRIVACY</label>
      <select className="input" value={privacy} onChange={e=>setPrivacy(e.target.value)}>
        <option value="public">Public</option><option value="private">Private</option>
      </select>
      <label className="sub">STAGE CAPACITY</label>
      <select className="input" value={capacity} onChange={e=>setCapacity(e.target.value)}>
        {CAPACITIES.map(n=><option value={n} key={n}>{n} Seats</option>)}
      </select>
      <button className="btn" style={{width:"100%"}} onClick={createRoom}><Plus size={16}/> Create Room</button>
    </div>
  </main>;

  const WalletPage = () => <main className="page"><div className="heading">Wallet</div>
    <div className="goldpanel" style={{textAlign:"center",padding:27}}><Gem size={48} color={GOLD}/>
      <div className="goldtext">Demo Gold Coins</div><div style={{fontSize:39,fontWeight:900,color:"#ffe19a"}}>0</div>
      <div className="sub">Demo only · No purchases enabled</div></div></main>;

  const SettingsPage = () => <main className="page"><div className="heading">Settings</div>
    <div className="goldpanel row"><Avatar name={profile.name} url={profile.photoURL} size={62}/>
      <div><b>{profile.name}</b><div className="sub">UID: {uid}</div></div></div>
    <button className="listitem" onClick={()=>setScreen("Safety & Privacy")}>Safety & Privacy <ShieldCheck/></button>
    <button className="btn" style={{width:"100%",marginTop:22}} onClick={async()=>{
      if(liveKitRoom) await disconnectFromLiveKitRoom(liveKitRoom);
      await signOut(auth);
    }}><LogOut size={16}/> Log Out</button></main>;

  const Placeholder = ({title}) => <main className="page"><div className="heading">{title}</div>
    <div className="goldpanel"><p className="sub">Ye feature abhi development mein hai.</p></div></main>;

  let content;
  if(screen==="LiveRoom") content=activeRoom?<LiveRoom/>:<HomePage/>;
  else if(screen==="Create Room") content=<CreateRoomPage/>;
  else if(screen==="Profile") content=<ProfilePage/>;
  else if(screen==="Wallet") content=<WalletPage/>;
  else if(screen==="Settings") content=<SettingsPage/>;
  else if(screen) content=<Placeholder title={screen}/>;
  else if(tab==="Room") content=<HomePage/>;
  else if(tab==="Moment") content=<Placeholder title="Moment"/>;
  else if(tab==="Message") content=<Placeholder title="Messages"/>;
  else content=<ProfilePage/>;

  return <div className="app">
    <style>{css}</style>
    {screen!=="LiveRoom" && <Header title={screen||tab} back={!!screen}/>}
    {notice && <div className="toast" onClick={()=>setNotice("")}>{notice} ×</div>}
    {content}
    {screen==="LiveRoom" && activeRoom && <div className="bottom-action">
      <button onClick={()=>setSheet("Chat")}><MessageCircle/><small>Chat</small></button>
      <button onClick={()=>setSheet("Emoji")}><Smile/><small>Emoji</small></button>
      <button onClick={toggleSpeaker}>{speakerOn?<Volume2/>:<VolumeX/>}<small>Sound</small></button>
      <button className="micmain" onClick={toggleMic} disabled={voiceConnecting||!isSpeaker}>
        {micOn?<Mic/>:<MicOff/>}<small>{micOn?"Mute":"Mic"}</small></button>
      <button onClick={()=>setSheet("Members")}><Users/><small>Members</small></button>
      <button onClick={()=>setSheet("More")}><MoreHorizontal/><small>More</small></button>
    </div>}
    {!screen && <nav className="nav">
      {[[Home,"Room"],[Users,"Moment"],[MessageCircle,"Message"],[UserRound,"Me"]].map(([Icon,label])=>
        <button key={label} className={tab===label?"active":""} onClick={()=>{setTab(label);setScreen("");}}>
          <Icon/><span>{label}</span></button>)}
    </nav>}
    {sheet && <div className="overlay" onClick={()=>setSheet("")}>
      <section className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheethead"><span>{sheet}</span><button className="round" onClick={()=>setSheet("")}><X/></button></div>

        {sheet==="Chat" && <>
          <div className="chatbox">{messages.map((m,i)=><div className="msg" key={i}>
            <b className="goldtext">{m.senderName}</b><div>{m.text}</div></div>)}
            {!messages.length&&<p className="sub">Abhi koi message nahi hai.</p>}
            <div ref={setMessageEnd}/></div>
          <div className="footer"><input className="input" maxLength={1000} placeholder="Write a message..."
            value={chatText} onChange={e=>setChatText(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&sendMessage()}/>
            <button className="btn" onClick={sendMessage}><Send/></button></div>
        </>}

        {sheet==="Edit Profile" && <>
          <label className="sub">USERNAME</label>
          <input className="input" maxLength={30} value={profileEdit.name||""} onChange={e=>setProfileEdit({...profileEdit,name:e.target.value})}/>
          <label className="sub">BIO</label>
          <textarea className="input" rows="3" maxLength={160} value={profileEdit.bio||""} onChange={e=>setProfileEdit({...profileEdit,bio:e.target.value})}/>
          <label className="sub">COUNTRY</label>
          <select className="input" value={profileEdit.country||"India"} onChange={e=>setProfileEdit({...profileEdit,country:e.target.value})}>
            <option>India</option><option>Bangladesh</option><option>Nepal</option><option>Other</option></select>
          <label className="sub">PROFILE PHOTO URL</label>
          <input className="input" placeholder="Paste image URL" value={profileEdit.photoURL||""} onChange={e=>setProfileEdit({...profileEdit,photoURL:e.target.value})}/>
          <button className="btn" style={{width:"100%"}} onClick={saveProfile}>Save Profile</button>
        </>}

        {sheet==="Members" && <>
          {members.map(m=><div className="row" style={{padding:9,borderBottom:"1px solid #8a5c30"}} key={m.uid}>
            <Avatar name={m.name} url={m.photoURL}/>
            <div style={{flex:1}}><b>{m.name}</b><div className="sub">{m.role==="owner"?"Owner":m.role==="moderator"?"Moderator":m.role==="speaker"?"Speaker":"Audience"}{m.seat?` · Seat ${m.seat}`:""}</div></div>
            {isOwner && m.uid!==user.uid && <button className="btn2" onClick={()=>makeModerator(m)}>
              {m.role==="moderator"?"Remove Mod":"Make Mod"}</button>}
            {isModerator && m.seat && m.uid!==activeRoom?.ownerId && <button className="btn2" onClick={()=>removeFromStage(m)}>Move to audience</button>}
          </div>)}
          {!members.length&&<p className="sub">No members found.</p>}
        </>}

        {sheet==="Requests" && <>
          {!isModerator&&<p className="sub">Only moderators can view requests.</p>}
          {requests.map(r=><div className="row" style={{padding:9,borderBottom:"1px solid #8a5c30"}} key={r.uid}>
            <Avatar name={r.name} url={r.photoURL}/>
            <div style={{flex:1}}><b>{r.name}</b><div className="sub">Wants to speak</div></div>
            <button className="round" onClick={()=>approveRequest(r)}><Check/></button>
            <button className="round" onClick={()=>rejectRequest(r)}><XCircle/></button>
          </div>)}
          {!requests.length&&<p className="sub">No pending requests.</p>}
        </>}

        {sheet==="Emoji" && <div className="tilegrid">
          {["😀","😂","😍","🥳","❤️","🔥","👏","🎉","🌹","⭐","🎵","🙌"].map(em=>
            <button className="tile" key={em} onClick={()=>{setChatText(v=>v+em);setSheet("Chat");}}>{em}</button>)}
        </div>}

        {sheet==="More" && <>
          <button className="listitem" onClick={()=>copyText(activeRoom?.roomCode||activeRoom?.id,"Room ID")}>Copy Room ID <Copy/></button>
          {isModerator&&<button className="listitem" onClick={()=>setSheet("Requests")}>Manage Speak Requests <Mic/></button>}
          <button className="listitem" onClick={leaveRoom}>Leave Room <LogOut/></button>
        </>}
      </section>
    </div>}
  </div>;
}
