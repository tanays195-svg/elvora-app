import React, { useEffect, useMemo, useState } from "react";
import {
  collection, doc, addDoc, setDoc, updateDoc, onSnapshot,
  query, orderBy, serverTimestamp, runTransaction, limit
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import {
  Home, Compass, MessageCircle, UserRound, Users, Mic,
  MicOff, Plus, Settings, Wallet, Crown, Gift, Trophy,
  Heart, ChevronRight, ArrowLeft, Send, Globe, Bell,
  Volume2, VolumeX, Smile, Star, LogOut, X,
  Search, Share2, MoreHorizontal, Lock, Headphones,
  Radio, ShieldCheck, Sparkles, UserPlus
} from "lucide-react";

const GOLD = "#e8bd70";

const css = `
*{box-sizing:border-box}
body{margin:0;background:#0c0912;color:#fff;font-family:DM Sans,Arial,sans-serif}
button,input,textarea,select{font:inherit}
button{cursor:pointer}
.app{max-width:620px;min-height:100vh;margin:auto;background:radial-gradient(ellipse at 50% -10%,#392347,#120e19 48%,#0c0912);padding-bottom:85px;overflow:hidden}
.top{height:68px;position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 17px;background:#120e19ed;border-bottom:1px solid #35283e;backdrop-filter:blur(16px)}
.brand{font-size:21px;font-weight:900;letter-spacing:3px;color:#f1d39a}
.brand small{display:block;font-size:8px;letter-spacing:2px;color:#a99ab8;font-weight:500}
.page{padding:17px 15px 28px}
.heading{font-size:23px;font-weight:800;margin:7px 0;color:#f5e7d2}
.sub{font-size:11px;color:#a99caf}
.row{display:flex;align-items:center;gap:10px}
.between{display:flex;align-items:center;justify-content:space-between;gap:10px}
.panel{padding:15px;border:1px solid #3b2e45;border-radius:17px;background:linear-gradient(145deg,#241a2d,#17121e);margin:12px 0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:11px 16px;border:0;border-radius:12px;background:linear-gradient(120deg,#f1d9a5,#b88648);color:#21150c;font-weight:800;font-size:12px}
.secondary{padding:10px 13px;border:1px solid #59445f;border-radius:11px;background:#211929;color:#ead9f1;font-size:11px}
.input{width:100%;padding:13px;border:1px solid #49394f;border-radius:11px;background:#120e19;color:white;margin:7px 0;outline:none}
.input:focus{border-color:#d4b17a}
.avatar{width:44px;height:44px;flex-shrink:0;display:grid;place-items:center;overflow:hidden;border-radius:50%;background:linear-gradient(135deg,#f1d69c,#76502e);border:2px solid #d6ae70;color:#21150c;font-weight:900}
.avatar img{width:100%;height:100%;object-fit:cover}
.nav{position:fixed;z-index:20;bottom:0;left:50%;transform:translateX(-50%);width:min(620px,100%);height:73px;padding-bottom:env(safe-area-inset-bottom);display:flex;align-items:center;justify-content:space-around;background:#17111ff5;border-top:1px solid #49364e;backdrop-filter:blur(16px)}
.nav button{border:0;background:none;color:#95869d;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:9px;min-width:55px}
.nav button.active{color:#f0cf91}
.nav svg{width:21px;height:21px}
.search{display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid #403247;border-radius:12px;background:#191321;margin:15px 0}
.search input{height:44px;flex:1;min-width:0;border:0;outline:0;background:transparent;color:white;font-size:12px}
.filters{display:flex;gap:8px;overflow-x:auto;padding:2px 0 8px}
.filters button{white-space:nowrap;border:1px solid #49394f;border-radius:25px;padding:8px 13px;background:#1d1725;color:#c5b5ca;font-size:10px}
.filters button.selected{background:#e8c88e;color:#21150c;border-color:#e8c88e;font-weight:800}
.roomcard{padding:13px;border:1px solid #49364d;border-radius:16px;background:linear-gradient(135deg,#2b1e31,#17121e);margin:11px 0}
.roomcover{height:92px;border-radius:11px;margin-bottom:12px;background:linear-gradient(120deg,#6d466b,#2b2039,#805e40);display:flex;align-items:center;justify-content:center;font-size:30px;overflow:hidden}
.roomcover img{width:100%;height:100%;object-fit:cover}
.pill{font-size:8px;padding:5px 8px;border-radius:20px;background:#543b36;color:#f5d4a0;letter-spacing:.5px}
.statgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}
.stat{padding:13px 5px;text-align:center;border:1px solid #403247;border-radius:12px;background:#1b1523}
.stat b{display:block;color:#f0cf91;font-size:19px}
.stat span{font-size:9px;color:#a99caf}
.bottom-action{position:fixed;z-index:21;bottom:0;left:50%;transform:translateX(-50%);width:min(620px,100%);height:76px;display:grid;grid-template-columns:repeat(7,1fr);align-items:center;background:#17111ff7;border-top:1px solid #49364e}
.bottom-action button{border:0;background:none;color:#e5d4bd;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:8px}
.bottom-action svg{width:20px;height:20px}
.bottom-action .mainmic{width:47px;height:47px;border-radius:50%;background:linear-gradient(135deg,#f3dda9,#b9874d);color:#21150c}
.roompage{min-height:calc(100vh - 68px);padding:12px 12px 100px;background:radial-gradient(ellipse at top,#49304b,#1a1422 55%,#100d17)}
.roomhead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:17px}
.round{width:37px;height:37px;border:1px solid #624b61;border-radius:50%;background:#241a2c;color:#f2d7a3;display:grid;place-items:center}
.roomidentity{display:flex;align-items:center;gap:10px;min-width:0}
.roomidentity .avatar{width:49px;height:49px}
.roomname{font-weight:800;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.roomid{font-size:9px;color:#b8a5bd;margin-top:4px}
.roominfo{display:flex;justify-content:space-between;padding:11px;border:1px solid #574258;border-radius:11px;background:#211827;margin:13px 0;color:#e9d3b1;font-size:10px}
.welcome{padding:11px;border-radius:10px;background:#493047;color:#f2d9b5;font-size:10px;margin:12px 0}
.seats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px 3px;padding:17px 5px;border:1px solid #59435c;border-radius:15px;background:#211927}
.seat{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0}
.seatcircle{width:48px;height:48px;border:2px solid #cba46e;border-radius:50%;display:grid;place-items:center;background:#38263c;color:#e8c98d;overflow:hidden}
.seatcircle .avatar{width:100%;height:100%;border:0}
.seat small{max-width:65px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px;color:#e0cfbd}
.seat em{font-size:7px;color:#e7c27e;font-style:normal}
.chatpreview{margin:13px 0;padding:12px;border:1px solid #49394f;border-radius:12px;background:#191420;max-height:115px;overflow:hidden}
.chatline{font-size:10px;color:#d8c9d9;margin:5px 0;overflow-wrap:anywhere}
.chatline b{color:#f0cf91}
.overlay{position:fixed;z-index:40;inset:0;background:#000b;display:flex;align-items:flex-end;justify-content:center}
.sheet{width:min(620px,100%);max-height:82vh;overflow:auto;padding:17px;border:1px solid #71546b;border-radius:21px 21px 0 0;background:#1b1421;padding-bottom:calc(22px + env(safe-area-inset-bottom))}
.sheethead{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;color:#f2d8aa;font-weight:800}
.chatbox{max-height:42vh;overflow:auto;padding:10px;border:1px solid #49394f;border-radius:12px;background:#110e17}
.msg{padding:9px;margin:7px 0;border-radius:10px;background:#302239;font-size:11px;overflow-wrap:anywhere}
.footer{display:flex;gap:7px;margin-top:9px}
.footer input{flex:1;min-width:0}
.toast{position:fixed;z-index:60;top:75px;left:50%;transform:translateX(-50%);max-width:90%;padding:11px 15px;border:1px solid #b38b59;border-radius:10px;background:#39283b;color:#fff;font-size:11px}
.menuitem{width:100%;padding:13px;margin:4px 0;text-align:left;border:1px solid #49394f;border-radius:10px;background:#261c2d;color:#f2e5d5}
@media(max-width:370px){.seats{gap:14px 1px}.seatcircle{width:42px;height:42px}.bottom-action button{font-size:7px}}
`;

function Avatar({name="U",url="",size=44}) {
  return <div className="avatar" style={{width:size,height:size}}>
    {url ? <img src={url} alt="Profile"/> : String(name).slice(0,1).toUpperCase()}
  </div>;
}

export default function App() {
  const user = auth.currentUser;
  const [tab,setTab] = useState("Home");
  const [screen,setScreen] = useState("");
  const [rooms,setRooms] = useState([]);
  const [members,setMembers] = useState([]);
  const [messages,setMessages] = useState([]);
  const [activeRoom,setActiveRoom] = useState(null);
  const [profile,setProfile] = useState({
    name:user?.displayName || user?.email?.split("@")[0] || "Member",
    bio:"Welcome to ELVORA",
    country:"India",
    photoURL:user?.photoURL || ""
  });
  const [profileEdit,setProfileEdit] = useState({name:"",bio:"",country:"India",photoURL:""});
  const [roomName,setRoomName] = useState("");
  const [capacity,setCapacity] = useState("20");
  const [privacy,setPrivacy] = useState("public");
  const [search,setSearch] = useState("");
  const [category,setCategory] = useState("All");
  const [chatText,setChatText] = useState("");
  const [roomEdit,setRoomEdit] = useState({name:"",coverURL:"",backgroundURL:""});
  const [sheet,setSheet] = useState("");
  const [notice,setNotice] = useState("");
  const [micOn,setMicOn] = useState(false);
  const [speakerOn,setSpeakerOn] = useState(true);

  useEffect(()=>{
    if(!user) return;
    const q=query(collection(db,"rooms"),orderBy("createdAt","desc"),limit(60));
    return onSnapshot(q,s=>setRooms(s.docs.map(d=>({id:d.id,...d.data()}))),e=>setNotice(e.message));
  },[user]);

  useEffect(()=>{
    if(!user) return;
    return onSnapshot(doc(db,"users",user.uid),s=>{
      if(s.exists()){
        const d=s.data();
        setProfile(p=>({...p,name:d.displayName||p.name,bio:d.bio||p.bio,country:d.country||p.country,photoURL:d.photoURL||p.photoURL}));
      }
    });
  },[user]);

  useEffect(()=>{
    if(!activeRoom || !user) return;
    const path=`rooms/${activeRoom.id}`;
    const a=onSnapshot(collection(db,path,"members"),s=>setMembers(s.docs.map(d=>d.data())));
    const q=query(collection(db,path,"messages"),orderBy("createdAt","asc"),limit(100));
    const b=onSnapshot(q,s=>setMessages(s.docs.map(d=>d.data())));
    return ()=>{a();b();};
  },[activeRoom,user]);

  const filteredRooms=useMemo(()=>rooms.filter(r=>{
    const matches=(r.name||"").toLowerCase().includes(search.toLowerCase());
    const publicRoom=(r.privacy||"public")==="public";
    const matchesCategory=category==="All" || (r.category||"Global")===category;
    return matches && publicRoom && matchesCategory;
  }),[rooms,search,category]);

  const notify=msg=>{
    setNotice(msg);
    setTimeout(()=>setNotice(""),3500);
  };

  const joinRoom=async room=>{
    try{
      if(room.privacy==="private" && room.ownerId!==user.uid){
        notify("Private room ke liye owner invitation zaroori hai.");
        return;
      }
      await runTransaction(db,async tx=>{
        const rr=doc(db,"rooms",room.id);
        const rs=await tx.get(rr);
        if(!rs.exists()) throw new Error("Room nahi mila.");
        const mr=doc(db,"rooms",room.id,"members",user.uid);
        const ms=await tx.get(mr);
        if(ms.exists()) return;
        const cap=Number(rs.data().capacity)||20;
        const refs=Array.from({length:cap},(_,i)=>doc(db,"rooms",room.id,"seats",String(i+1)));
        const snaps=await Promise.all(refs.map(r=>tx.get(r)));
        const index=snaps.findIndex(s=>!s.exists());
        if(index<0) throw new Error("Room full hai.");
        tx.set(mr,{uid:user.uid,name:profile.name,seat:index+1,joinedAt:serverTimestamp()});
        tx.set(refs[index],{uid:user.uid,name:profile.name});
      });
      setActiveRoom(room);
      setTab("Home");
      setScreen("LiveRoom");
    }catch(e){notify(e.message);}
  };

  const createRoom=async()=>{
    if(!roomName.trim()) return notify("Room ka naam likho.");
    try{
      const data={
        name:roomName.trim(),category:"Global",capacity:Number(capacity),
        ownerId:user.uid,ownerName:profile.name,privacy,
        coverURL:"",backgroundURL:"",createdAt:serverTimestamp()
      };
      const ref=await addDoc(collection(db,"rooms"),data);
      setRoomName("");
      setScreen("");
      await joinRoom({id:ref.id,...data,createdAt:null});
      notify("Room create ho gaya.");
    }catch(e){notify("Room create nahi hua: "+e.message);}
  };

  const leaveRoom=async()=>{
    if(!activeRoom) return;
    try{
      await runTransaction(db,async tx=>{
        const mr=doc(db,"rooms",activeRoom.id,"members",user.uid);
        const snap=await tx.get(mr);
        if(snap.exists()){
          tx.delete(mr);
          tx.delete(doc(db,"rooms",activeRoom.id,"seats",String(snap.data().seat)));
        }
      });
    }catch(e){notify(e.message);}
    setActiveRoom(null);
    setMembers([]);
    setMessages([]);
    setScreen("");
    setSheet("");
    setMicOn(false);
  };

  const sendMessage=async()=>{
    if(!chatText.trim() || !activeRoom) return;
    try{
      await addDoc(collection(db,"rooms",activeRoom.id,"messages"),{
        text:chatText.trim(),senderId:user.uid,senderName:profile.name,
        createdAt:serverTimestamp()
      });
      setChatText("");
    }catch(e){notify("Message send nahi hua: "+e.message);}
  };

  const saveProfile=async()=>{
    if(!profileEdit.name.trim()) return notify("Username likho.");
    try{
      await setDoc(doc(db,"users",user.uid),{
        displayName:profileEdit.name.trim(),bio:profileEdit.bio,
        country:profileEdit.country,photoURL:profileEdit.photoURL.trim(),
        updatedAt:serverTimestamp()
      },{merge:true});
      setProfile({...profileEdit,name:profileEdit.name.trim()});
      setSheet("");
      notify("Profile save ho gayi.");
    }catch(e){notify(e.message);}
  };

  const saveRoom=async()=>{
    if(activeRoom?.ownerId!==user.uid) return notify("Sirf owner settings badal sakta hai.");
    if(!roomEdit.name.trim()) return notify("Room name khaali nahi ho sakta.");
    try{
      await updateDoc(doc(db,"rooms",activeRoom.id),{
        name:roomEdit.name.trim(),coverURL:roomEdit.coverURL.trim(),
        backgroundURL:roomEdit.backgroundURL.trim(),updatedAt:serverTimestamp()
      });
      setActiveRoom(r=>({...r,...roomEdit}));
      setSheet("");
      notify("Room settings save ho gayi.");
    }catch(e){notify(e.message);}
  };

  const Header=({title,back=true})=><header className="top">
    {back?<button className="secondary" onClick={()=>setScreen("")}><ArrowLeft size={17}/></button>:
      <div className="brand">ELVORA<small>VOICE COMMUNITY</small></div>}
    <b style={{fontSize:14,color:"#f0d6ad"}}>{title}</b>
    <button className="round" onClick={()=>notify("Notifications section abhi connect nahi hai.")}><Bell size={17}/></button>
  </header>;

  const RoomList=()=><main className="page">
    <div className="between">
      <div><div className="sub">WELCOME TO ELVORA</div><div className="heading">Find your room</div><div className="sub">Meet people. Share your voice.</div></div>
      <button className="btn" onClick={()=>setScreen("Create Room")}><Plus size={15}/> Create</button>
    </div>
    <div className="search"><Search size={17}/><input placeholder="Search public rooms..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
    <div className="filters">
      {["All","Global","Music","Gaming","Friends"].map(c=><button key={c} className={category===c?"selected":""} onClick={()=>setCategory(c)}>{c}</button>)}
    </div>
    <div className="statgrid">
      <div className="stat"><b>{rooms.length}</b><span>ROOMS</span></div>
      <div className="stat"><b>{rooms.filter(r=>r.privacy==="public"||!r.privacy).length}</b><span>PUBLIC</span></div>
      <div className="stat"><b>🌍</b><span>GLOBAL</span></div>
    </div>
    <div className="between"><b style={{fontSize:16}}>Popular Rooms</b><span className="sub">Latest first</span></div>
    {filteredRooms.length===0?<div className="panel" style={{textAlign:"center",padding:28}}><Radio size={30} color={GOLD}/><p className="sub">No public rooms found. Create the first room!</p></div>:
      filteredRooms.map(r=><article className="roomcard" key={r.id}>
        <div className="roomcover">{r.coverURL?<img src={r.coverURL} alt="Room cover"/>:<Headphones size={32} color="#f2d4a0"/>}</div>
        <div className="between">
          <div className="row" style={{minWidth:0}}>
            <Avatar name={r.ownerName||"H"} url={r.coverURL}/>
            <div style={{minWidth:0}}><b style={{fontSize:13}}>{r.name}</b><div className="sub">{r.ownerName||"Host"} · {r.capacity||20} seats</div></div>
          </div>
          <span className="pill">● PUBLIC</span>
        </div>
        <div className="between" style={{marginTop:13}}>
          <span className="sub"><Users size={13}/> {r.category||"Global"}</span>
          <button className="btn" onClick={()=>joinRoom(r)}>Join Room <ChevronRight size={14}/></button>
        </div>
      </article>)
    }
  </main>;

  const LiveRoom=()=> <main className="roompage" style={activeRoom?.backgroundURL?{backgroundImage:`linear-gradient(#171020dd,#171020ee),url("${activeRoom.backgroundURL}")`,backgroundSize:"cover"}:{}}>
    <div className="roomhead">
      <button className="round" onClick={leaveRoom}><ArrowLeft size={17}/></button>
      <span className="pill">● LIVE ROOM</span>
      <div className="row">
        <button className="round" onClick={()=>notify("Room sharing abhi available nahi hai.")}><Share2 size={16}/></button>
        <button className="round" onClick={()=>setSpeakerOn(v=>!v)}>{speakerOn?<Volume2 size={16}/>:<VolumeX size={16}/>}</button>
        <button className="round" onClick={()=>setSheet("More")}><MoreHorizontal size={17}/></button>
      </div>
    </div>
    <div className="roomidentity">
      <Avatar name={activeRoom?.name||"E"} url={activeRoom?.coverURL} size={49}/>
      <div style={{flex:1,minWidth:0}}>
        <div className="roomname">{activeRoom?.name}</div>
        <div className="roomid">Room ID: {activeRoom?.id}</div>
      </div>
      {activeRoom?.ownerId===user.uid&&<button className="round" onClick={()=>{setRoomEdit({name:activeRoom.name||"",coverURL:activeRoom.coverURL||"",backgroundURL:activeRoom.backgroundURL||""});setSheet("Room Settings");}}><Settings size={16}/></button>}
    </div>
    <div className="roominfo"><span>🎙 Speaker Stage</span><b>{members.length}/{activeRoom?.capacity||20} members</b></div>
    <div className="welcome">✨ Welcome to {activeRoom?.name}. Be kind and respect everyone!</div>
    <div className="between" style={{margin:"18px 2px 11px"}}><b>Microphone Seats</b><span className="sub">5-column stage</span></div>
    <div className="seats">
      {Array.from({length:Number(activeRoom?.capacity)||20},(_,i)=>{
        const m=members.find(x=>Number(x.seat)===i+1);
        return <div className="seat" key={i}>
          <div className="seatcircle">{m?<Avatar name={m.name} size={44}/>:<Mic size={17}/>}</div>
          <small>{m?m.name:`Seat ${i+1}`}</small>
          {m?.uid===activeRoom?.ownerId&&<em>HOST</em>}
        </div>;
      })}
    </div>
    <div className="between" style={{margin:"13px 2px"}}>
      <span className="sub"><Users size={14}/> {members.length} on stage</span>
      <button className="secondary" onClick={()=>setSheet("Members")}>View members</button>
    </div>
    <div className="chatpreview" onClick={()=>setSheet("Chat")}>
      <div className="between"><b style={{fontSize:11}}>Room Chat</b><span className="sub">Tap to open</span></div>
      {messages.slice(-3).map((m,i)=><div className="chatline" key={i}><b>{m.senderName||"Member"}:</b> {m.text}</div>)}
      {messages.length===0&&<div className="chatline">Say hello to the room!</div>}
    </div>
    <p className="sub" style={{textAlign:"center"}}>Mic controls are currently visual only; live audio service is not connected.</p>
  </main>;

  const CreateRoom=()=><main className="page">
    <div className="heading">Create a Room</div>
    <div className="panel">
      <label className="sub">ROOM NAME</label>
      <input className="input" placeholder="Give your room a name" value={roomName} onChange={e=>setRoomName(e.target.value)}/>
      <label className="sub">PRIVACY</label>
      <select className="input" value={privacy} onChange={e=>setPrivacy(e.target.value)}><option value="public">Public</option><option value="private">Private</option></select>
      <label className="sub">SPEAKER SEATS</label>
      <select className="input" value={capacity} onChange={e=>setCapacity(e.target.value)}>{[2,10,15,20].map(n=><option key={n} value={n}>{n} seats</option>)}</select>
      <button className="btn" style={{width:"100%",marginTop:15}} onClick={createRoom}><Plus size={16}/> Create Room</button>
    </div>
  </main>;

  const ProfilePage=()=><main className="page">
    <div className="heading">My Profile</div>
    <div className="panel" style={{textAlign:"center",padding:25}}>
      <Avatar name={profile.name} url={profile.photoURL} size={86}/>
      <h2 style={{color:"#f0d39b",marginBottom:5}}>{profile.name}</h2>
      <div className="sub">{profile.country} · ELVORA Member</div>
      <p className="sub">{profile.bio}</p>
      <button className="btn" onClick={()=>{setProfileEdit({name:profile.name,bio:profile.bio,country:profile.country,photoURL:profile.photoURL});setSheet("Edit Profile");}}>Edit Profile</button>
    </div>
    <div className="statgrid">
      <div className="stat"><b>0</b><span>FRIENDS</span></div>
      <div className="stat"><b>0</b><span>FOLLOWERS</span></div>
      <div className="stat"><b>0</b><span>FOLLOWING</span></div>
    </div>
    {[[Wallet,"Wallet"],[Crown,"VIP Membership"],[Users,"Family & Friends"],[Trophy,"Leaderboard"],[ShieldCheck,"Safety & Privacy"],[Settings,"Settings"]].map(([Icon,label])=><button key={label} className="panel between" style={{width:"100%",color:"white",textAlign:"left"}} onClick={()=>setScreen(label)}><span className="row"><Icon color={GOLD}/><b>{label}</b></span><ChevronRight color={GOLD}/></button>)}
  </main>;

  const MessagesPage=()=><main className="page">
    <div className="heading">Messages</div>
    <div className="panel"><Bell color={GOLD}/><b> Notifications</b><p className="sub">Community notifications will appear here when connected.</p></div>
    <div className="panel"><UserPlus color={GOLD}/><b> Friends</b><p className="sub">Friend requests and friend list need their backend.</p></div>
    <div className="panel"><MessageCircle color={GOLD}/><b> Private Messages</b><p className="sub">Private messaging is not connected yet.</p></div>
  </main>;

  const SettingsPage=()=><main className="page">
    <div className="heading">Settings</div>
    <div className="panel"><b>Signed-in account</b><p className="sub">{user?.email||"ELVORA account"}</p></div>
    <button className="btn" style={{width:"100%"}} onClick={()=>signOut(auth)}><LogOut size={16}/> Log Out</button>
  </main>;

  const Placeholder=({title})=><main className="page"><div className="heading">{title}</div><div className="panel sub">This section needs its own secure backend before it can be enabled.</div></main>;

  let content;
  if(screen==="LiveRoom") content=<LiveRoom/>;
  else if(screen==="Create Room") content=<CreateRoom/>;
  else if(screen==="Profile") content=<ProfilePage/>;
  else if(screen==="Messages") content=<MessagesPage/>;
  else if(screen==="Settings") content=<SettingsPage/>;
  else if(screen) content=<Placeholder title={screen}/>;
  else if(tab==="Home"||tab==="Discover") content=<RoomList/>;
  else if(tab==="Messages") content=<MessagesPage/>;
  else content=<ProfilePage/>;

  return <div className="app">
    <style>{css}</style>
    {!screen&&<Header title={tab} back={false}/>}
    {screen&&screen!=="LiveRoom"&&<Header title={screen}/>}
    {notice&&<div className="toast" onClick={()=>setNotice("")}>{notice}　✕</div>}
    {content}

    {screen==="LiveRoom"&&activeRoom&&<div className="bottom-action">
      <button onClick={()=>setSheet("Chat")}><MessageCircle/><small>Chat</small></button>
      <button onClick={()=>setSheet("Emoji")}><Smile/><small>Emoji</small></button>
      <button onClick={()=>setSpeakerOn(v=>!v)}>{speakerOn?<Volume2/>:<VolumeX/>}<small>Speaker</small></button>
      <button className="mainmic" onClick={()=>setMicOn(v=>!v)}>{micOn?<Mic/>:<MicOff/>}</button>
      <button onClick={()=>setSheet("Members")}><Users/><small>Members</small></button>
      <button onClick={()=>setSheet("Gifts")}><Gift/><small>Gifts</small></button>
      <button onClick={()=>setSheet("More")}><MoreHorizontal/><small>More</small></button>
    </div>}

    {!screen&&<nav className="nav">
      {[[Home,"Home"],[Compass,"Discover"],[MessageCircle,"Messages"],[UserRound,"Me"]].map(([Icon,label])=><button key={label} className={tab===label?"active":""} onClick={()=>{setTab(label);setScreen("");}}><Icon/><span>{label}</span></button>)}
    </nav>}

    {sheet&&<div className="overlay" onClick={()=>setSheet("")}>
      <section className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheethead"><span>{sheet}</span><button className="round" onClick={()=>setSheet("")}><X size={17}/></button></div>

        {sheet==="Chat"&&<>
          <div className="chatbox">
            {messages.map((m,i)=><div className="msg" key={i}><b style={{color:GOLD}}>{m.senderName||"Member"}</b><div>{m.text}</div></div>)}
            {messages.length===0&&<p className="sub">No messages yet.</p>}
          </div>
          <div className="footer"><input className="input" placeholder="Write a message..." value={chatText} onChange={e=>setChatText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}/><button className="btn" onClick={sendMessage}><Send size={17}/></button></div>
        </>}

        {sheet==="Edit Profile"&&<>
          <label className="sub">USERNAME</label><input className="input" value={profileEdit.name} onChange={e=>setProfileEdit({...profileEdit,name:e.target.value})}/>
          <label className="sub">BIO</label><textarea className="input" rows="3" value={profileEdit.bio} onChange={e=>setProfileEdit({...profileEdit,bio:e.target.value})}/>
          <label className="sub">COUNTRY</label><select className="input" value={profileEdit.country} onChange={e=>setProfileEdit({...profileEdit,country:e.target.value})}><option>India</option><option>Bangladesh</option><option>Nepal</option><option>Other</option></select>
          <label className="sub">PROFILE PHOTO URL</label><input className="input" placeholder="https://..." value={profileEdit.photoURL} onChange={e=>setProfileEdit({...profileEdit,photoURL:e.target.value})}/>
          <button className="btn" style={{width:"100%"}} onClick={saveProfile}>Save Profile</button>
        </>}

        {sheet==="Room Settings"&&<>
          <label className="sub">ROOM NAME</label><input className="input" value={roomEdit.name} onChange={e=>setRoomEdit({...roomEdit,name:e.target.value})}/>
          <label className="sub">ROOM COVER URL</label><input className="input" value={roomEdit.coverURL} onChange={e=>setRoomEdit({...roomEdit,coverURL:e.target.value})}/>
          <label className="sub">ROOM BACKGROUND URL</label><input className="input" value={roomEdit.backgroundURL} onChange={e=>setRoomEdit({...roomEdit,backgroundURL:e.target.value})}/>
          <button className="btn" style={{width:"100%"}} onClick={saveRoom}>Save Room Settings</button>
        </>}

        {sheet==="Members"&&members.map(m=><div className="row" style={{padding:9,borderBottom:"1px solid #49394f"}} key={m.uid}><Avatar name={m.name}/><div><b style={{fontSize:12}}>{m.name}</b><div className="sub">Seat {m.seat}</div></div></div>)}

        {sheet==="Emoji"&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>{["😀","😂","😍","🥳","❤️","🔥","👏","🎉","🌹","⭐","🎵","🙌"].map(e=><button className="menuitem" key={e} style={{textAlign:"center",fontSize:23}} onClick={()=>notify("Emoji selected: "+e)}>{e}</button>)}</div>}

        {sheet==="Gifts"&&<div className="panel"><Gift color={GOLD}/><p className="sub">Gift catalogue will be connected after the secure gift backend is ready. No payments are enabled.</p></div>}

        {sheet==="More"&&<>
          {activeRoom?.ownerId===user.uid&&<button className="menuitem" onClick={()=>{setRoomEdit({name:activeRoom.name||"",coverURL:activeRoom.coverURL||"",backgroundURL:activeRoom.backgroundURL||""});setSheet("Room Settings");}}><Settings size={16}/> Room Settings</button>}
          <button className="menuitem" onClick={()=>notify("Share feature is not connected yet.")}><Share2 size={16}/> Share Room</button>
          <button className="menuitem" onClick={leaveRoom}><LogOut size={16}/> Leave Room</button>
        </>}
      </section>
    </div>}
  </div>;
}
