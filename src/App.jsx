import React, { useEffect, useMemo, useState } from "react";
import {
  collection, doc, addDoc, setDoc, updateDoc, onSnapshot,
  query, orderBy, serverTimestamp, runTransaction, limit
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import {
  Home, Users, MessageCircle, UserRound, Mic, MicOff, Plus,
  Settings, Wallet, Crown, Gift, Trophy, Heart, ChevronRight,
  ArrowLeft, Send, Bell, Volume2, Share2, MoreHorizontal,
  Search, X, Camera, Star, ShieldCheck, LogOut, Headphones,
  Sparkles, Globe, Lock, Smile, Palette, Medal, Copy, Image,
  Music, Gem, Clock, UserPlus
} from "lucide-react";

const GOLD = "#f3c66e";

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Cinzel:wght@600;700;800&display=swap');
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;background:#100802}
body{font-family:'DM Sans',Arial,sans-serif;color:#fff}
button,input,textarea,select{font:inherit}
button{cursor:pointer}
.app{max-width:620px;min-height:100dvh;margin:auto;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 0%,#704019 0%,#2c1609 34%,#100802 80%);padding-bottom:90px}
.goldtext{color:#ffdc91}
.top{height:66px;display:flex;align-items:center;justify-content:space-between;padding:0 15px;position:sticky;top:0;z-index:10;background:linear-gradient(90deg,#160a04f5,#3b1d09f5,#160a04f5);border-bottom:1px solid #9b672e;box-shadow:0 3px 16px #0008}
.brand{font-family:Cinzel,serif;font-weight:800;font-size:23px;letter-spacing:3px;color:#ffe3a0;text-shadow:0 1px 10px #d38b28}
.brand small{display:block;font:8px 'DM Sans';letter-spacing:3px;text-align:center;color:#d4aa69}
.page{padding:15px 14px 30px}
.heading{font-family:Cinzel,serif;font-size:22px;font-weight:800;color:#ffdf9a;text-align:center;margin:10px 0 18px;text-shadow:0 2px 8px #a75d16}
.sub{font-size:11px;color:#c6a77b}
.row{display:flex;align-items:center;gap:10px}
.between{display:flex;align-items:center;justify-content:space-between;gap:10px}
.goldpanel{border:1px solid #b17b3e;border-radius:17px;background:linear-gradient(145deg,#63300f,#291306 65%,#160a04);box-shadow:inset 0 0 0 2px #5c3518,0 5px 15px #0008;padding:15px;margin:12px 0;position:relative}
.goldpanel:after{content:"";position:absolute;inset:4px;border:1px solid #98632d;border-radius:12px;pointer-events:none;opacity:.55}
.btn{border:1px solid #ffe0a0;border-radius:30px;padding:11px 17px;background:linear-gradient(110deg,#ffe18b,#a85c19);color:#281204;font-weight:800;font-size:12px;box-shadow:0 2px 10px #d88d2d55}
.btn2{border:1px solid #9d6a34;border-radius:22px;padding:9px 13px;background:linear-gradient(120deg,#48230d,#1b0d05);color:#f7d99c;font-size:11px}
.round{width:38px;height:38px;border-radius:50%;border:1px solid #c3914d;background:radial-gradient(#6b3a16,#1b0d05);color:#ffe1a1;display:grid;place-items:center;flex-shrink:0}
.input{width:100%;padding:12px;border:1px solid #9b6b37;border-radius:10px;background:#1b0d05;color:#fff;margin:6px 0 13px;outline:none}
.input:focus{border-color:#ffe0a0}
.avatar{width:46px;height:46px;border-radius:50%;border:2px solid #e2b76e;background:linear-gradient(135deg,#f5d99c,#6a3611);display:grid;place-items:center;overflow:hidden;flex-shrink:0;color:#281204;font-weight:900}
.avatar img{width:100%;height:100%;object-fit:cover}
.tabs{display:flex;gap:23px;overflow:auto;padding:7px 0 13px}
.tabs button{border:0;background:none;color:#c5a77b;font-weight:700;padding:7px 2px;white-space:nowrap}
.tabs button.active{color:#ffe18a;border-bottom:3px solid #ffdb77}
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);z-index:20;width:min(620px,100%);height:78px;padding-bottom:env(safe-area-inset-bottom);display:flex;justify-content:space-around;align-items:center;background:linear-gradient(90deg,#1b0b04f7,#63300ff7,#1b0b04f7);border:1px solid #b27a3b;border-radius:20px 20px 0 0;box-shadow:0 -5px 18px #0009}
.nav button{border:0;background:none;color:#c7a66c;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:9px}
.nav button.active{color:#ffe48c}
.nav svg{width:22px;height:22px}
.banner{height:118px;border:2px solid #d7a34e;border-radius:15px;background:radial-gradient(circle at 25%,#a35dca,#301047 55%,#16091c);display:flex;align-items:center;justify-content:space-around;margin:13px 0;color:#ffe6a5;font-family:Cinzel,serif;font-size:20px;font-weight:800;text-shadow:0 2px 8px #000}
.tilegrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
.tile{min-height:100px;border:1px solid #d2a35e;border-radius:18px;background:linear-gradient(145deg,#9a5b20,#351707 65%,#180b04);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#ffe28f;box-shadow:inset 0 0 0 3px #613414}
.tile span{font-size:11px;font-weight:700}
.tile svg{width:32px;height:32px}
.roomgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.roomcard{border:1px solid #c28a43;border-radius:14px;padding:7px;background:linear-gradient(145deg,#5d2b0c,#1c0d04);min-width:0}
.cover{height:100px;border-radius:9px;background:radial-gradient(circle,#a96b2a,#321606);display:grid;place-items:center;overflow:hidden;color:#ffe3a3}
.cover img{width:100%;height:100%;object-fit:cover}
.roompage{padding:12px 12px 100px;min-height:calc(100dvh - 66px);background:radial-gradient(ellipse at top,#633712,#291306 45%,#100802)}
.roomhead{display:flex;align-items:center;justify-content:space-between;gap:7px;margin-bottom:15px}
.roomidentity{display:flex;align-items:center;gap:10px;margin:10px 0}
.roomname{font-weight:800;font-size:15px;color:#ffe2a0}
.roomid{font-size:10px;color:#d6b786;margin-top:4px}
.seats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:19px 3px;padding:17px 5px;border:1px solid #b17a3b;border-radius:16px;background:linear-gradient(140deg,#4b260eaa,#180b04dd);box-shadow:inset 0 0 20px #0008}
.seat{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}
.seatcircle{width:49px;height:49px;border-radius:50%;border:2px solid #e6bd76;background:radial-gradient(#8a511f,#1c0c04);display:grid;place-items:center;color:#f8d58f;overflow:hidden;box-shadow:0 0 9px #d9994255}
.seatcircle .avatar{width:100%;height:100%;border:0}
.seat small{font-size:8px;color:#f1d7aa;max-width:66px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.welcome{padding:12px;background:#170a04b8;border-left:3px solid #d99b3c;color:#ffcf61;margin:13px 0;font-size:12px}
.chatpreview{padding:11px;border:1px solid #79502b;border-radius:11px;background:#170a04;margin:13px 0;max-height:110px;overflow:hidden}
.chatline{font-size:10px;margin:6px 0;color:#f2d7aa;overflow-wrap:anywhere}
.bottom-action{position:fixed;z-index:21;bottom:0;left:50%;transform:translateX(-50%);width:min(620px,100%);height:79px;padding-bottom:env(safe-area-inset-bottom);display:grid;grid-template-columns:repeat(7,1fr);align-items:center;background:linear-gradient(90deg,#1a0b04f7,#65330ff7,#1a0b04f7);border-top:1px solid #c18c4b}
.bottom-action button{border:0;background:none;color:#ffe1a2;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:8px}
.bottom-action svg{width:21px;height:21px}
.bottom-action .micmain{width:43px;height:43px;border-radius:50%;background:linear-gradient(#ffe5a4,#b36a20);color:#281204}
.overlay{position:fixed;inset:0;z-index:40;background:#000b;display:flex;align-items:flex-end;justify-content:center}
.sheet{width:min(620px,100%);max-height:85dvh;overflow:auto;padding:17px 16px calc(24px + env(safe-area-inset-bottom));border:1px solid #d1a05a;border-radius:22px 22px 0 0;background:linear-gradient(145deg,#51270e,#1c0d05 70%);box-shadow:0 -8px 30px #000}
.sheethead{display:flex;justify-content:space-between;align-items:center;color:#ffe0a0;font-family:Cinzel,serif;font-weight:800;margin-bottom:14px}
.chatbox{height:40dvh;overflow:auto;padding:10px;border:1px solid #8c5b2d;border-radius:12px;background:#140902}
.msg{padding:9px;margin:7px 0;border-radius:9px;background:#3a1b0b;font-size:11px;overflow-wrap:anywhere}
.footer{display:flex;gap:7px;align-items:center}
.footer .input{flex:1;min-width:0;margin:7px 0}
.listitem{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;margin:7px 0;border:1px solid #9b6a37;border-radius:12px;background:linear-gradient(100deg,#4c260e,#1b0c04);color:#fff;text-align:left}
.statgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
.stat{padding:13px 4px;text-align:center;border:1px solid #a87940;border-radius:12px;background:#321707}
.stat b{display:block;color:#ffdc8c;font-size:20px}
.stat span{font-size:9px;color:#d6b98c}
.toast{position:fixed;z-index:60;top:74px;left:50%;transform:translateX(-50%);max-width:90%;padding:11px 15px;border:1px solid #e5b86c;border-radius:10px;background:#3c1d0a;color:white;font-size:11px}
@media(max-width:370px){.seatcircle{width:42px;height:42px}.seats{gap:14px 1px}.tile{min-height:88px}}
`;

function numericId(value) {
  let h = 0;
  for (let i = 0; i < String(value || "").length; i++) {
    h = (h * 31 + String(value).charCodeAt(i)) >>> 0;
  }
  return String(100000 + (h % 900000));
}

function Avatar({ name = "U", url = "", size = 45 }) {
  return (
    <div className="avatar" style={{ width: size, height: size }}>
      {url ? <img src={url} alt="Profile" /> : String(name).slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function App() {
  const user = auth.currentUser;
  const [tab, setTab] = useState("Room");
  const [screen, setScreen] = useState("");
  const [rooms, setRooms] = useState([]);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [profile, setProfile] = useState({
    name: user?.displayName || user?.email?.split("@")[0] || "Member",
    bio: "Welcome to ELVORA",
    country: "India",
    photoURL: user?.photoURL || ""
  });
  const [profileEdit, setProfileEdit] = useState({});
  const [roomEdit, setRoomEdit] = useState({});
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
  const [rankTab, setRankTab] = useState("Weekly List");
  const [decorationTab, setDecorationTab] = useState("Frames");
  const [levelTab, setLevelTab] = useState("Wealth");

  const uid = numericId(user?.uid);
  const filteredRooms = useMemo(() => rooms.filter(r =>
    (r.privacy || "public") === "public" &&
    (r.name || "").toLowerCase().includes(search.toLowerCase())
  ), [rooms, search]);

  const notify = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"), limit(60));
    return onSnapshot(q, s => setRooms(s.docs.map(d => ({ id: d.id, ...d.data() }))),
      e => notify(e.message));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), s => {
      if (s.exists()) {
        const d = s.data();
        setProfile(p => ({
          ...p,
          name: d.displayName || p.name,
          bio: d.bio || p.bio,
          country: d.country || p.country,
          photoURL: d.photoURL || p.photoURL
        }));
      }
    });
  }, [user]);

  useEffect(() => {
    if (!activeRoom || !user) return;
    const base = `rooms/${activeRoom.id}`;
    const stopMembers = onSnapshot(collection(db, base, "members"),
      s => setMembers(s.docs.map(d => d.data())));
    const q = query(collection(db, base, "messages"), orderBy("createdAt", "asc"), limit(100));
    const stopMessages = onSnapshot(q, s => setMessages(s.docs.map(d => d.data())));
    return () => { stopMembers(); stopMessages(); };
  }, [activeRoom, user]);

  const joinRoom = async room => {
    try {
      if (room.privacy === "private" && room.ownerId !== user.uid) {
        notify("Private room mein owner ki permission chahiye.");
        return;
      }
      await runTransaction(db, async tx => {
        const roomRef = doc(db, "rooms", room.id);
        const roomSnap = await tx.get(roomRef);
        if (!roomSnap.exists()) throw new Error("Room nahi mila.");
        const memberRef = doc(db, "rooms", room.id, "members", user.uid);
        const memberSnap = await tx.get(memberRef);
        if (memberSnap.exists()) return;
        const cap = Number(roomSnap.data().capacity) || 20;
        const seatRefs = Array.from({ length: cap }, (_, i) =>
          doc(db, "rooms", room.id, "seats", String(i + 1)));
        const seatSnaps = await Promise.all(seatRefs.map(ref => tx.get(ref)));
        const seatIndex = seatSnaps.findIndex(s => !s.exists());
        if (seatIndex < 0) throw new Error("Room full hai.");
        tx.set(memberRef, {
          uid: user.uid, name: profile.name, photoURL: profile.photoURL || "",
          seat: seatIndex + 1, joinedAt: serverTimestamp()
        });
        tx.set(seatRefs[seatIndex], { uid: user.uid, name: profile.name });
      });
      setActiveRoom(room);
      setScreen("LiveRoom");
    } catch (e) { notify(e.message); }
  };

  const createRoom = async () => {
    if (!roomName.trim()) return notify("Room ka naam likho.");
    try {
      const ref = await addDoc(collection(db, "rooms"), {
        name: roomName.trim(),
        roomCode: String(Math.floor(100000 + Math.random() * 900000)),
        category: "Global",
        capacity: Number(capacity),
        ownerId: user.uid,
        ownerName: profile.name,
        privacy,
        coverURL: "",
        backgroundURL: "",
        createdAt: serverTimestamp()
      });
      const newRoom = {
        id: ref.id, name: roomName.trim(), capacity: Number(capacity),
        ownerId: user.uid, ownerName: profile.name, privacy,
        roomCode: "ELV-" + numericId(ref.id)
      };
      setRoomName("");
      await joinRoom(newRoom);
      notify("Room create ho gaya.");
    } catch (e) { notify("Room create nahi hua: " + e.message); }
  };

  const leaveRoom = async () => {
    if (!activeRoom) return;
    try {
      await runTransaction(db, async tx => {
        const memberRef = doc(db, "rooms", activeRoom.id, "members", user.uid);
        const snap = await tx.get(memberRef);
        if (snap.exists()) {
          tx.delete(memberRef);
          tx.delete(doc(db, "rooms", activeRoom.id, "seats", String(snap.data().seat)));
        }
      });
    } catch (e) { notify(e.message); }
    setActiveRoom(null);
    setMembers([]);
    setMessages([]);
    setScreen("");
    setMicOn(false);
  };

  const sendMessage = async () => {
    if (!chatText.trim() || !activeRoom) return;
    try {
      await addDoc(collection(db, "rooms", activeRoom.id, "messages"), {
        text: chatText.trim(), senderId: user.uid,
        senderName: profile.name, createdAt: serverTimestamp()
      });
      setChatText("");
    } catch (e) { notify("Message send nahi hua: " + e.message); }
  };

  const saveProfile = async () => {
    if (!profileEdit.name?.trim()) return notify("Username likho.");
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName: profileEdit.name.trim(),
        bio: profileEdit.bio || "",
        country: profileEdit.country || "India",
        photoURL: (profileEdit.photoURL || "").trim(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      setProfile({ ...profileEdit, name: profileEdit.name.trim() });
      setSheet("");
      notify("Profile update ho gayi.");
    } catch (e) { notify(e.message); }
  };

  const saveRoom = async () => {
    if (activeRoom?.ownerId !== user.uid) return notify("Sirf room owner settings badal sakta hai.");
    if (!roomEdit.name?.trim()) return notify("Room name khaali nahi ho sakta.");
    try {
      await updateDoc(doc(db, "rooms", activeRoom.id), {
        name: roomEdit.name.trim(),
        coverURL: (roomEdit.coverURL || "").trim(),
        backgroundURL: (roomEdit.backgroundURL || "").trim(),
        capacity: Number(roomEdit.capacity || activeRoom.capacity || 20),
        updatedAt: serverTimestamp()
      });
      setActiveRoom(r => ({ ...r, ...roomEdit }));
      setSheet("");
      notify("Room settings save ho gayi.");
    } catch (e) {
      notify("Settings save nahi hui. Firestore Rules mein room capacity update allow karna hoga.");
    }
  };

  const Header = ({ title, back = false }) => (
    <header className="top">
      {back
        ? <button className="round" onClick={() => setScreen("")}><ArrowLeft size={18} /></button>
        : <div className="brand">ELVORA<small>VOICE COMMUNITY</small></div>}
      <b style={{ color: "#ffe1a0", fontFamily: "Cinzel,serif" }}>{title}</b>
      <button className="round" onClick={() => notify("Notifications yahan add honge.")}><Bell size={17} /></button>
    </header>
  );

  const openProfileEdit = () => {
    setProfileEdit({
      name: profile.name, bio: profile.bio, country: profile.country,
      photoURL: profile.photoURL
    });
    setSheet("Edit Profile");
  };

  const openRoomEdit = () => {
    setRoomEdit({
      name: activeRoom?.name || "",
      coverURL: activeRoom?.coverURL || "",
      backgroundURL: activeRoom?.backgroundURL || "",
      capacity: String(activeRoom?.capacity || 20)
    });
    setSheet("Room Settings");
  };

  const HomePage = () => (
    <main className="page">
      <div className="tabs">
        {["Mine", "Hot", "Following"].map(t =>
          <button key={t} className={listTab === t ? "active" : ""} onClick={() => setListTab(t)}>{t}</button>
        )}
        <button onClick={() => setScreen("Search") }><Search size={18} /></button>
      </div>
      <div className="banner" onClick={() => setScreen("Wallet")}>
        <Gem size={58} color="#f2c5ff" />
        <span>Recharge<br />Rewards</span>
        <Sparkles size={30} />
      </div>
      <div className="tilegrid">
        <button className="tile" onClick={() => setScreen("Rank")}><Trophy /><span>Rank</span></button>
        <button className="tile" onClick={() => setScreen("Family")}><Users /><span>Family</span></button>
        <button className="tile" onClick={() => setScreen("CP Space")}><Heart /><span>CP Space</span></button>
      </div>
      <div className="between" style={{ margin: "18px 0 12px" }}>
        <b className="goldtext">ELVORA Voice Rooms</b>
        <button className="btn2" onClick={() => setScreen("Create Room")}><Plus size={14} /> Create</button>
      </div>
      <div className="row" style={{ marginBottom: 12 }}>
        <div className="input" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
          <Search size={16} /><input style={{ flex: 1, minWidth: 0, border: 0, background: "transparent", color: "white", outline: 0 }} placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {filteredRooms.length === 0
        ? <div className="goldpanel" style={{ textAlign: "center", padding: 27 }}>
            <Headphones size={35} color={GOLD} /><p className="sub">Abhi koi public room nahi hai. Apna pehla room create karo.</p>
          </div>
        : <div className="roomgrid">
            {filteredRooms.map(r => (
              <article className="roomcard" key={r.id}>
                <div className="cover">{r.coverURL ? <img src={r.coverURL} alt="Room cover" /> : <Crown size={36} />}</div>
                <b style={{ display: "block", margin: "8px 3px 3px", fontSize: 12 }}>{r.name}</b>
                <div className="sub" style={{ margin: "0 3px 8px" }}>ID: {r.roomCode || numericId(r.id)} · {r.capacity || 20} seats</div>
                <button className="btn" style={{ width: "100%", padding: 8 }} onClick={() => joinRoom(r)}>Join Room</button>
              </article>
            ))}
          </div>}
      <div className="goldpanel">
        <div className="between"><b className="goldtext">ELVORA Community</b><Globe color={GOLD} /></div>
        <p className="sub">Meet people, join voice rooms and enjoy conversations.</p>
      </div>
    </main>
  );

  const LiveRoom = () => (
    <main className="roompage" style={activeRoom?.backgroundURL ? {
      backgroundImage: `linear-gradient(#1a0b04bb,#160902dd),url("${activeRoom.backgroundURL}")`,
      backgroundSize: "cover", backgroundPosition: "center"
    } : {}}>
      <div className="roomhead">
        <button className="round" onClick={leaveRoom}><ArrowLeft size={18} /></button>
        <span className="goldtext" style={{ fontSize: 10, fontWeight: 800 }}>● LIVE ROOM</span>
        <div className="row">
          <button className="round" onClick={() => notify("Room sharing baad mein connect hoga.")}><Share2 size={16} /></button>
          <button className="round" onClick={() => setSpeakerOn(v => !v)}><Volume2 size={16} /></button>
          <button className="round" onClick={() => setSheet("More")}><MoreHorizontal size={17} /></button>
        </div>
      </div>
      <div className="roomidentity">
        <Avatar name={activeRoom?.name} url={activeRoom?.coverURL} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="roomname">{activeRoom?.name}</div>
          <div className="roomid">ID: {activeRoom?.roomCode || numericId(activeRoom?.id)}</div>
        </div>
        {activeRoom?.ownerId === user.uid &&
          <button className="round" onClick={openRoomEdit}><Settings size={17} /></button>}
      </div>
      <div className="between goldpanel" style={{ padding: 11 }}>
        <span className="goldtext"><Trophy size={15} /> 0</span>
        <span className="sub"><Users size={14} /> {members.length}/{activeRoom?.capacity || 20}</span>
      </div>
      <div className="welcome">Welcome to {activeRoom?.name}! Let's chat and enjoy together.</div>
      <div className="between" style={{ margin: "16px 3px 11px" }}>
        <b className="goldtext">Microphone Seats</b><span className="sub">Room Stage</span>
      </div>
      <div className="seats">
        {Array.from({ length: Number(activeRoom?.capacity) || 20 }, (_, i) => {
          const m = members.find(x => Number(x.seat) === i + 1);
          return (
            <div className="seat" key={i}>
              <div className="seatcircle">{m ? <Avatar name={m.name} url={m.photoURL} size={45} /> : <Mic size={19} />}</div>
              <small>{m ? m.name : `No.${i + 1}`}</small>
            </div>
          );
        })}
      </div>
      <div className="chatpreview" onClick={() => setSheet("Chat")}>
        <b className="goldtext" style={{ fontSize: 11 }}>Room Chat · Tap to open</b>
        {messages.slice(-3).map((m, i) =>
          <div className="chatline" key={i}><b>{m.senderName}:</b> {m.text}</div>
        )}
        {!messages.length && <div className="chatline">Welcome everyone! Say hello.</div>}
      </div>
      <div className="sub" style={{ textAlign: "center" }}>Voice service abhi connect nahi hai. Mic icon filhaal demo control hai.</div>
    </main>
  );

  const ProfilePage = () => (
    <main className="page">
      <div className="heading">My Profile</div>
      <div className="goldpanel" style={{ textAlign: "center", padding: 22 }}>
        <Avatar name={profile.name} url={profile.photoURL} size={94} />
        <h2 className="goldtext" style={{ margin: "12px 0 4px", fontFamily: "Cinzel,serif" }}>{profile.name}</h2>
        <div className="row" style={{ justifyContent: "center" }}>
          <span className="sub">UID: {uid}</span>
          <button className="btn2" onClick={() => { navigator.clipboard?.writeText(uid); notify("User ID copied."); }}><Copy size={13} /></button>
        </div>
        <p className="sub">{profile.country} · {profile.bio}</p>
        <button className="btn" onClick={openProfileEdit}><Camera size={15} /> Edit Profile / Change DP</button>
      </div>
      <div className="row" style={{ justifyContent: "space-around" }}>
        {["Visitors", "Following", "Followers"].map((t, i) =>
          <div className="stat" style={{ flex: 1 }} key={t}><b>{i === 0 ? "0" : "0"}</b><span>{t}</span></div>
        )}
      </div>
      <div className="tilegrid">
        <button className="tile" onClick={() => setScreen("Wealth")}><Medal /><span>Wealth</span></button>
        <button className="tile" onClick={() => setScreen("Decoration")}><Crown /><span>Decoration</span></button>
        <button className="tile" onClick={() => setScreen("Settings")}><Settings /><span>Settings</span></button>
      </div>
      {[
        [Wallet, "Wallet"], [Crown, "VIP Membership"], [Users, "Family"],
        [Trophy, "Rank"], [Heart, "CP Space"], [ShieldCheck, "Safety & Privacy"]
      ].map(([Icon, name]) =>
        <button className="listitem" key={name} onClick={() => setScreen(name)}>
          <span className="row"><Icon color={GOLD} /> {name}</span><ChevronRight color={GOLD} />
        </button>
      )}
    </main>
  );

  const MessagesPage = () => (
    <main className="page">
      <div className="tabs">
        <button className="active">Message</button>
        <button onClick={() => notify("Friends list backend next step mein banayenge.")}>Friends</button>
      </div>
      <div className="goldpanel row"><Bell color={GOLD} /><div><b>Notification</b><div className="sub">ELVORA notifications yahan dikhenge.</div></div></div>
      <div className="goldpanel row"><Avatar name="E" /><div><b>ELVORA Community</b><div className="sub">Welcome to ELVORA!</div></div></div>
      <div className="goldpanel"><b className="goldtext">Private Messages</b><p className="sub">Private chat ko secure backend ke saath agle step mein connect karenge.</p></div>
    </main>
  );

  const WalletPage = () => (
    <main className="page">
      <div className="heading">Wallet</div>
      <div className="goldpanel" style={{ textAlign: "center", padding: 27 }}>
        <Gem size={44} color={GOLD} />
        <div className="goldtext">Gold Coins Balance</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: "#ffe19a" }}>0</div>
        <div className="sub">Demo wallet · No purchases enabled</div>
      </div>
      {[["Daily activity", "Demo reward"], ["Gift history", "No gifts yet"], ["Coin history", "No transactions"]].map(([a, b]) =>
        <div className="listitem" key={a}><span>{a}</span><span className="sub">{b}</span></div>
      )}
    </main>
  );

  const FamilyPage = () => (
    <main className="page">
      <div className="heading">Family</div>
      <div className="tabs">
        {["Weekly List", "Monthly List"].map(t =>
          <button className={rankTab === t ? "active" : ""} key={t} onClick={() => setRankTab(t)}>{t}</button>
        )}
      </div>
      <div className="goldpanel" style={{ textAlign: "center", padding: 28 }}>
        <Crown size={45} color={GOLD} /><h3 className="goldtext">ELVORA Family</h3>
        <p className="sub">Family groups and rankings will appear here.</p>
      </div>
      {["Create Family", "Join Family", "My Family Members"].map(t =>
        <button className="listitem" key={t} onClick={() => notify("Family feature backend next step mein connect hoga.")}>{t}<ChevronRight /></button>
      )}
    </main>
  );

  const RoomSettingsPage = () => (
    <main className="page">
      <div className="heading">Room Settings</div>
      <div className="goldpanel row">
        <Avatar name={activeRoom?.name || "R"} url={activeRoom?.coverURL} size={55} />
        <div><b>{activeRoom?.name || "Your Room"}</b><div className="sub">ID: {activeRoom?.roomCode || numericId(activeRoom?.id)}</div></div>
      </div>
      {[
        ["Edit Room Info", "Room name and description"],
        ["Room Theme", "Choose gold room theme"],
        ["Room Cover", "Change room DP"],
        ["Seat Capacity", `${activeRoom?.capacity || 20} Seats`],
        ["Seat Layout", "5-column stage"],
        ["Room Background", "Change background"],
        ["Moderator Management", "Manage moderators"]
      ].map(([a, b]) =>
        <button className="listitem" key={a} onClick={() => {
          if (a === "Moderator Management") notify("Moderator permissions next step mein add karenge.");
          else openRoomEdit();
        }}>
          <span><b>{a}</b><div className="sub">{b}</div></span><ChevronRight color={GOLD} />
        </button>
      )}
      <button className="btn" style={{ width: "100%", marginTop: 15 }} onClick={openRoomEdit}>Customize Room</button>
    </main>
  );

  const DecorationPage = () => (
    <main className="page">
      <div className="heading">Decoration</div>
      <div className="tabs">
        {["Frames", "VIP", "Vehicles", "Chat Bubble", "Theme"].map(t =>
          <button className={decorationTab === t ? "active" : ""} key={t} onClick={() => setDecorationTab(t)}>{t}</button>
        )}
      </div>
      <div className="tilegrid">
        {["Gold Frame", "Royal Frame", "Blue Frame", "Purple Frame"].map((t, i) =>
          <div className="tile" key={t}><Crown size={38} /><span>{t}</span><small className="sub">Preview</small></div>
        )}
      </div>
      <p className="sub" style={{ textAlign: "center" }}>Decoration previews only. Unlocking and purchases are not enabled.</p>
    </main>
  );

  const WealthPage = () => (
    <main className="page">
      <div className="tabs">
        {["Wealth", "Charm", "Game"].map(t =>
          <button className={levelTab === t ? "active" : ""} key={t} onClick={() => setLevelTab(t)}>{t}</button>
        )}
      </div>
      <div className="goldpanel" style={{ textAlign: "center", padding: 28 }}>
        <Avatar name={profile.name} url={profile.photoURL} size={90} />
        <h2 className="goldtext">Level 1</h2>
        <div style={{ height: 9, background: "#351708", borderRadius: 20, margin: "20px 0" }}>
          <div style={{ width: "18%", height: "100%", background: "linear-gradient(90deg,#ffe59b,#b66c20)", borderRadius: 20 }} />
        </div>
        <b>0 EXP</b><p className="sub">Demo level display</p>
      </div>
      <div className="tilegrid">
        {["Lv1-20", "Lv21-40", "Lv41-60", "Lv61-80"].map(t =>
          <div className="tile" key={t}><Medal /><span>{t}</span></div>
        )}
      </div>
    </main>
  );

  const CPSpace = () => (
    <main className="page">
      <div className="heading">CP Space</div>
      <div className="goldpanel" style={{ textAlign: "center", padding: 25 }}>
        <Heart size={42} color={GOLD} />
        <h3 className="goldtext">Connection Space</h3>
        <div className="row" style={{ justifyContent: "space-around", margin: 20 }}>
          <Avatar name={profile.name} url={profile.photoURL} size={75} />
          <Heart size={35} color={GOLD} />
          <Avatar name="?" size={75} />
        </div>
        <p className="sub">Friendship and profile connection preview.</p>
      </div>
      <button className="btn" style={{ width: "100%" }} onClick={() => notify("Connection feature abhi available nahi hai.")}>Create Connection</button>
    </main>
  );

  const SettingsPage = () => (
    <main className="page">
      <div className="heading">Setting</div>
      <div className="goldpanel row">
        <Avatar name={profile.name} url={profile.photoURL} size={62} />
        <div><b>{profile.name}</b><div className="sub">UID: {uid}</div></div>
      </div>
      {["Language", "Account Security", "Setting", "Feedback", "About Us"].map(t =>
        <button className="listitem" key={t} onClick={() => notify(t + " section next step mein add hoga.")}>{t}<ChevronRight /></button>
      )}
      <button className="btn" style={{ width: "100%", marginTop: 22 }} onClick={() => signOut(auth)}><LogOut size={16} /> LogOut</button>
    </main>
  );

  const CreateRoomPage = () => (
    <main className="page">
      <div className="heading">Create Room</div>
      <div className="goldpanel">
        <label className="sub">ROOM NAME</label>
        <input className="input" value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="ELVORA Music Room" />
        <label className="sub">PRIVACY</label>
        <select className="input" value={privacy} onChange={e => setPrivacy(e.target.value)}>
          <option value="public">Public</option><option value="private">Private</option>
        </select>
        <label className="sub">SEAT CAPACITY</label>
        <select className="input" value={capacity} onChange={e => setCapacity(e.target.value)}>
          {[2, 10, 15, 20].map(n => <option value={n} key={n}>{n} Seats</option>)}
        </select>
        <button className="btn" style={{ width: "100%" }} onClick={createRoom}><Plus size={16} /> Create Room</button>
      </div>
    </main>
  );

  const Placeholder = ({ title }) => (
    <main className="page">
      <div className="heading">{title}</div>
      <div className="goldpanel"><p className="sub">Is section ka complete backend aur controls agle steps mein add karenge.</p></div>
    </main>
  );

  let content;
  if (screen === "LiveRoom") content = activeRoom ? <LiveRoom /> : <HomePage />;
  else if (screen === "Create Room") content = <CreateRoomPage />;
  else if (screen === "Profile") content = <ProfilePage />;
  else if (screen === "Messages") content = <MessagesPage />;
  else if (screen === "Wallet") content = <WalletPage />;
  else if (screen === "Family") content = <FamilyPage />;
  else if (screen === "Room Settings") content = <RoomSettingsPage />;
  else if (screen === "Decoration") content = <DecorationPage />;
  else if (screen === "Wealth" || screen === "Rank") content = <WealthPage />;
  else if (screen === "CP Space") content = <CPSpace />;
  else if (screen === "Settings") content = <SettingsPage />;
  else if (screen === "Search") content = <HomePage />;
  else if (screen) content = <Placeholder title={screen} />;
  else if (tab === "Room") content = <HomePage />;
  else if (tab === "Moment") content = <Placeholder title="Moment" />;
  else if (tab === "Message") content = <MessagesPage />;
  else content = <ProfilePage />;

  return (
    <div className="app">
      <style>{css}</style>
      {screen !== "LiveRoom" && <Header title={screen || tab} back={!!screen} />}
      {notice && <div className="toast" onClick={() => setNotice("")}>{notice}　×</div>}
      {content}

      {screen === "LiveRoom" && activeRoom && (
        <div className="bottom-action">
          <button onClick={() => setSheet("Chat")}><MessageCircle /><small>Chat</small></button>
          <button onClick={() => setSheet("Emoji")}><Smile /><small>Emoji</small></button>
          <button onClick={() => setSpeakerOn(v => !v)}><Volume2 /><small>Sound</small></button>
          <button className="micmain" onClick={() => setMicOn(v => !v)}>{micOn ? <Mic /> : <MicOff />}</button>
          <button onClick={() => setSheet("Members")}><Users /><small>Members</small></button>
          <button onClick={() => setSheet("Inbox")}><Bell /><small>Inbox</small></button>
          <button onClick={() => setSheet("Gifts")}><Gift /><small>Gift</small></button>
        </div>
      )}

      {!screen && (
        <nav className="nav">
          {[[Home, "Room"], [Users, "Moment"], [MessageCircle, "Message"], [UserRound, "Me"]].map(([Icon, label]) => (
            <button key={label} className={tab === label ? "active" : ""} onClick={() => { setTab(label); setScreen(""); }}>
              <Icon /><span>{label}</span>
            </button>
          ))}
        </nav>
      )}

      {sheet && (
        <div className="overlay" onClick={() => setSheet("")}>
          <section className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheethead"><span>{sheet}</span><button className="round" onClick={() => setSheet("")}><X size={17} /></button></div>

            {sheet === "Chat" && <>
              <div className="chatbox">
                {messages.map((m, i) => <div className="msg" key={i}><b className="goldtext">{m.senderName}</b><div>{m.text}</div></div>)}
                {!messages.length && <p className="sub">Abhi koi message nahi hai.</p>}
              </div>
              <div className="footer">
                <input className="input" placeholder="Write a message..." value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
                <button className="btn" onClick={sendMessage}><Send size={17} /></button>
              </div>
            </>}

            {sheet === "Edit Profile" && <>
              <label className="sub">USERNAME</label>
              <input className="input" value={profileEdit.name || ""} onChange={e => setProfileEdit({ ...profileEdit, name: e.target.value })} />
              <label className="sub">BIO</label>
              <textarea className="input" rows="3" value={profileEdit.bio || ""} onChange={e => setProfileEdit({ ...profileEdit, bio: e.target.value })} />
              <label className="sub">COUNTRY</label>
              <select className="input" value={profileEdit.country || "India"} onChange={e => setProfileEdit({ ...profileEdit, country: e.target.value })}>
                <option>India</option><option>Bangladesh</option><option>Nepal</option><option>Other</option>
              </select>
              <label className="sub">PROFILE PHOTO URL</label>
              <input className="input" placeholder="Paste image URL here" value={profileEdit.photoURL || ""} onChange={e => setProfileEdit({ ...profileEdit, photoURL: e.target.value })} />
              <button className="btn" style={{ width: "100%" }} onClick={saveProfile}>Save Profile</button>
            </>}

            {sheet === "Room Settings" && <>
              <label className="sub">ROOM NAME</label>
              <input className="input" value={roomEdit.name || ""} onChange={e => setRoomEdit({ ...roomEdit, name: e.target.value })} />
              <label className="sub">ROOM COVER / DP URL</label>
              <input className="input" placeholder="Paste image URL" value={roomEdit.coverURL || ""} onChange={e => setRoomEdit({ ...roomEdit, coverURL: e.target.value })} />
              <label className="sub">ROOM BACKGROUND URL</label>
              <input className="input" placeholder="Paste background image URL" value={roomEdit.backgroundURL || ""} onChange={e => setRoomEdit({ ...roomEdit, backgroundURL: e.target.value })} />
              <label className="sub">SEAT CAPACITY</label>
              <select className="input" value={roomEdit.capacity || "20"} onChange={e => setRoomEdit({ ...roomEdit, capacity: e.target.value })}>
                {[2, 10, 15, 20].map(n => <option value={n} key={n}>{n} Seats</option>)}
              </select>
              <button className="btn" style={{ width: "100%" }} onClick={saveRoom}>Save Room Settings</button>
            </>}

            {sheet === "Members" && members.map(m => (
              <div className="row" style={{ padding: 9, borderBottom: "1px solid #8a5c30" }} key={m.uid}>
                <Avatar name={m.name} url={m.photoURL} />
                <div><b style={{ fontSize: 12 }}>{m.name}</b><div className="sub">Seat {m.seat}</div></div>
              </div>
            ))}

            {sheet === "Emoji" && <div className="tilegrid">
              {["😀", "😂", "😍", "🥳", "❤️", "🔥", "👏", "🎉", "🌹", "⭐", "🎵", "🙌"].map(e =>
                <button className="tile" key={e} onClick={() => { setChatText(v => v + e); setSheet("Chat"); }}>{e}</button>
              )}
            </div>}

            {sheet === "Gifts" && <div className="goldpanel"><Gift color={GOLD} /><p className="sub">Gift catalogue demo. Coins aur payments abhi enabled nahi hain.</p></div>}
            {sheet === "Inbox" && <div className="goldpanel"><Bell color={GOLD} /><p className="sub">Room inbox aur invitations ka backend agle step mein add hoga.</p></div>}
            {sheet === "More" && <>
              {activeRoom?.ownerId === user.uid && <button className="listitem" onClick={() => { setSheet("Room Settings"); openRoomEdit(); }}>Room Settings <Settings /></button>}
              <button className="listitem" onClick={() => notify("Share feature next step mein add hoga.")}>Share Room <Share2 /></button>
              <button className="listitem" onClick={leaveRoom}>Leave Room <LogOut /></button>
            </>}
          </section>
        </div>
      )}
    </div>
  );
}

