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
  ArrowLeft, Send, Bell, Volume2, VolumeX, Share2,
  MoreHorizontal, Search, X, Camera, Star, ShieldCheck,
  LogOut, Headphones, Sparkles, Globe, Lock, Smile, Palette,
  Medal, Copy, Image, Music, Gem, UserPlus, Radio, Diamond,
  Flame, Award, Clock, Check, Phone, Eye
} from "lucide-react";

const GOLD = "#f5ce78";

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Cinzel:wght@600;700;800&display=swap');

*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;background:#100700}
body{font-family:'DM Sans',Arial,sans-serif;color:#fff}
button,input,textarea,select{font:inherit}
button{cursor:pointer;-webkit-tap-highlight-color:transparent}
button:focus-visible,input:focus-visible{outline:2px solid #ffe5a2;outline-offset:2px}

.app{
 max-width:620px;min-height:100dvh;margin:auto;position:relative;
 overflow:hidden;padding-bottom:90px;
 background:
 radial-gradient(ellipse at 50% 0%,#75451d 0%,#321707 36%,#100700 82%);
}
.goldtext{color:#ffe19a}
.top{
 height:66px;display:flex;align-items:center;justify-content:space-between;
 padding:0 14px;position:sticky;top:0;z-index:10;
 background:linear-gradient(90deg,#160800f5,#59300ff5,#160800f5);
 border-bottom:1px solid #c18b42;
 box-shadow:0 3px 17px #000b;
}
.brand{
 font-family:Cinzel,serif;font-size:23px;font-weight:900;
 letter-spacing:3px;color:#ffe5a8;
 text-shadow:0 0 12px #e2a33d;
}
.brand small{display:block;font:8px 'DM Sans';letter-spacing:3px;text-align:center;color:#d6b477}
.page{padding:14px 13px 30px}
.heading{
 font-family:Cinzel,serif;font-size:22px;font-weight:800;
 color:#ffe0a0;text-align:center;margin:12px 0 18px;
 text-shadow:0 2px 10px #b76c1c;
}
.sub{font-size:11px;color:#cbb18a}
.row{display:flex;align-items:center;gap:9px}
.between{display:flex;align-items:center;justify-content:space-between;gap:9px}
.goldpanel{
 position:relative;padding:15px;margin:12px 0;border-radius:17px;
 border:1px solid #d09b4e;
 background:linear-gradient(145deg,#65330e,#301504 60%,#170900);
 box-shadow:inset 0 0 0 2px #58300f,0 5px 17px #0009;
}
.goldpanel:before{
 content:"✦";position:absolute;top:5px;left:8px;color:#f5d18a;font-size:12px;
}
.goldpanel:after{
 content:"";position:absolute;inset:5px;border:1px solid #a87535;
 border-radius:12px;pointer-events:none;opacity:.65;
}
.btn{
 border:1px solid #ffe3a3;border-radius:30px;padding:11px 17px;
 background:linear-gradient(110deg,#ffe9a8,#d59a3d,#995018);
 color:#291304;font-weight:900;font-size:12px;
 box-shadow:0 0 13px #d9953655;
}
.btn2{
 border:1px solid #bd8743;border-radius:25px;padding:9px 13px;
 background:linear-gradient(120deg,#54290d,#1d0b03);
 color:#ffe2a0;font-size:11px;
}
.round{
 width:38px;height:38px;border-radius:50%;border:1px solid #d4a45c;
 background:radial-gradient(#77431b,#1a0b03);
 color:#ffe5a8;display:grid;place-items:center;flex-shrink:0;
 box-shadow:0 0 9px #d39b4c33;
}
.input{
 width:100%;padding:12px;border:1px solid #a9793e;border-radius:10px;
 background:#1c0c04;color:white;margin:6px 0 13px;outline:none;
}
.input:focus{border-color:#ffe3a3}
.avatar{
 width:46px;height:46px;border-radius:50%;border:2px solid #f0ca7b;
 background:linear-gradient(135deg,#f6dfaa,#754016);
 display:grid;place-items:center;overflow:hidden;flex-shrink:0;
 color:#281204;font-weight:900;box-shadow:0 0 12px #d9a34c55;
}
.avatar img{width:100%;height:100%;object-fit:cover}
.tabs{display:flex;gap:22px;overflow:auto;padding:8px 2px 13px}
.tabs button{border:0;background:none;color:#d0b184;font-weight:700;padding:7px 2px;white-space:nowrap}
.tabs button.active{color:#ffe28b;border-bottom:3px solid #ffdc79}
.banner{
 min-height:108px;border:2px solid #e5bb6b;border-radius:15px;
 background:radial-gradient(circle at 25%,#8d43a6,#36134a 58%,#19091e);
 display:flex;align-items:center;justify-content:space-around;
 margin:12px 0;color:#ffe7aa;font-family:Cinzel,serif;
 font-size:20px;font-weight:900;text-shadow:0 2px 8px #000;
 box-shadow:inset 0 0 0 3px #603b69,0 0 14px #a16bc355;
}
.tilegrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
.tile{
 min-height:100px;border:1px solid #d5a75f;border-radius:16px;
 background:linear-gradient(145deg,#a96825,#4a2109 60%,#1b0b03);
 display:flex;flex-direction:column;align-items:center;justify-content:center;
 gap:7px;color:#ffe29b;box-shadow:inset 0 0 0 3px #59300f,0 4px 10px #0008;
}
.tile svg{width:31px;height:31px;filter:drop-shadow(0 0 5px #eab75a)}
.tile span{font-size:11px;font-weight:800}
.roomgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
.roomcard{
 border:1px solid #d4a35b;border-radius:14px;padding:7px;
 background:linear-gradient(145deg,#63300e,#1c0b03);
 box-shadow:inset 0 0 0 2px #54290e,0 4px 12px #0009;min-width:0;
}
.cover{
 height:105px;border-radius:9px;background:radial-gradient(circle,#a56a2c,#351605);
 display:grid;place-items:center;overflow:hidden;color:#ffe3a3;
}
.cover img{width:100%;height:100%;object-fit:cover}
.roompage{
 padding:12px 12px 105px;min-height:calc(100dvh - 66px);
 background:radial-gradient(ellipse at top,#633812,#291306 48%,#100700);
}
.roomhead{display:flex;align-items:center;justify-content:space-between;gap:7px;margin-bottom:15px}
.roomidentity{display:flex;align-items:center;gap:10px;margin:12px 0}
.roomname{font-weight:900;font-size:15px;color:#ffe3a0}
.roomid{font-size:10px;color:#d8b987;margin-top:4px}
.seats{
 display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:19px 3px;
 padding:18px 5px;border:1px solid #c28d48;border-radius:16px;
 background:linear-gradient(140deg,#4b260eaa,#180b04ee);
 box-shadow:inset 0 0 22px #0009;
}
.seat{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}
.seatcircle{
 width:49px;height:49px;border-radius:50%;border:2px solid #f0ca7b;
 background:radial-gradient(#8a511f,#1c0c04);display:grid;place-items:center;
 color:#f8d58f;overflow:hidden;box-shadow:0 0 11px #d9994266;
}
.seatcircle .avatar{width:100%;height:100%;border:0}
.seat small{font-size:8px;color:#f1d7aa;max-width:66px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.welcome{padding:12px;background:#170a04d9;border-left:3px solid #e0a344;color:#ffda79;margin:13px 0;font-size:12px}
.chatpreview{padding:11px;border:1px solid #93602f;border-radius:11px;background:#170a04;margin:13px 0;max-height:110px;overflow:hidden}
.chatline{font-size:10px;margin:6px 0;color:#f2d7aa;overflow-wrap:anywhere}
.bottom-action{
 position:fixed;z-index:21;bottom:0;left:50%;transform:translateX(-50%);
 width:min(620px,100%);height:78px;padding-bottom:env(safe-area-inset-bottom);
 display:grid;grid-template-columns:repeat(7,1fr);align-items:center;
 background:linear-gradient(90deg,#1a0b04f8,#65330ff8,#1a0b04f8);
 border-top:1px solid #d3a05a;
}
.bottom-action button{border:0;background:none;color:#ffe1a2;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:8px}
.bottom-action svg{width:21px;height:21px}
.bottom-action .micmain{width:45px;height:45px;border-radius:50%;background:linear-gradient(#ffe5a4,#b36a20);color:#281204}
.nav{
 position:fixed;bottom:0;left:50%;transform:translateX(-50%);z-index:20;
 width:min(620px,100%);height:78px;padding-bottom:env(safe-area-inset-bottom);
 display:flex;justify-content:space-around;align-items:center;
 background:linear-gradient(90deg,#1b0b04f7,#63300ff7,#1b0b04f7);
 border:1px solid #b27a3b;border-radius:20px 20px 0 0;
 box-shadow:0 -5px 18px #0009;
}
.nav button{border:0;background:none;color:#c7a66c;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:9px}
.nav button.active{color:#ffe48c}
.nav svg{width:22px;height:22px}
.listitem{
 width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;
 padding:14px;margin:7px 0;border:1px solid #a9793e;border-radius:12px;
 background:linear-gradient(100deg,#4c260e,#1b0c04);color:white;text-align:left;
}
.statgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
.stat{padding:13px 4px;text-align:center;border:1px solid #a87940;border-radius:12px;background:#321707}
.stat b{display:block;color:#ffdc8c;font-size:20px}
.stat span{font-size:9px;color:#d6b98c}
.overlay{position:fixed;inset:0;z-index:40;background:#000c;display:flex;align-items:flex-end;justify-content:center}
.sheet{
 width:min(620px,100%);max-height:85dvh;overflow:auto;
 padding:17px 16px calc(24px + env(safe-area-inset-bottom));
 border:1px solid #d1a05a;border-radius:22px 22px 0 0;
 background:linear-gradient(145deg,#51270e,#1c0d05 70%);box-shadow:0 -8px 30px #000;
}
.sheethead{display:flex;justify-content:space-between;align-items:center;color:#ffe0a0;font-family:Cinzel,serif;font-weight:900;margin-bottom:14px}
.chatbox{height:40dvh;overflow:auto;padding:10px;border:1px solid #8c5b2d;border-radius:12px;background:#140902}
.msg{padding:9px;margin:7px 0;border-radius:9px;background:#3a1b0b;font-size:11px;overflow-wrap:anywhere}
.footer{display:flex;gap:7px;align-items:center}
.footer .input{flex:1;min-width:0;margin:7px 0}
.toast{position:fixed;z-index:60;top:74px;left:50%;transform:translateX(-50%);max-width:90%;padding:11px 15px;border:1px solid #e5b86c;border-radius:10px;background:#3c1d0a;color:white;font-size:11px}
@media(max-width:370px){.seatcircle{width:42px;height:42px}.seats{gap:14px 1px}.tile{min-height:88px}}
`;

function numericId(value) {
 let h=0;
 for(let i=0;i<String(value||"").length;i++) h=(h*31+String(value).charCodeAt(i))>>>0;
 return String(100000+(h%900000));
}

function Avatar({name="U",url="",size=46}) {
 return <div className="avatar" style={{width:size,height:size}}>
  {url?<img src={url} alt="Profile"/>:String(name).slice(0,1).toUpperCase()}
 </div>;
}

export default function App() {
 const user=auth.currentUser;
 const [tab,setTab]=useState("Room");
 const [screen,setScreen]=useState("");
 const [rooms,setRooms]=useState([]);
 const [members,setMembers]=useState([]);
 const [messages,setMessages]=useState([]);
 const [activeRoom,setActiveRoom]=useState(null);
 const [profile,setProfile]=useState({
  name:user?.displayName||user?.email?.split("@")[0]||"Member",
  bio:"Welcome to ELVORA",country:"India",photoURL:user?.photoURL||""
 });
 const [profileEdit,setProfileEdit]=useState({});
 const [roomEdit,setRoomEdit]=useState({});
 const [roomName,setRoomName]=useState("");
 const [capacity,setCapacity]=useState("20");
 const [privacy,setPrivacy]=useState("public");
 const [search,setSearch]=useState("");
 const [chatText,setChatText]=useState("");
 const [sheet,setSheet]=useState("");
 const [notice,setNotice]=useState("");
 const [micOn,setMicOn]=useState(false);
 const [speakerOn,setSpeakerOn]=useState(true);
 const [listTab,setListTab]=useState("Hot");
 const [rankTab,setRankTab]=useState("Weekly List");
 const [decorationTab,setDecorationTab]=useState("Frames");
 const [levelTab,setLevelTab]=useState("Wealth");

 const uid=numericId(user?.uid);
 const filteredRooms=useMemo(()=>rooms.filter(r=>
  (r.privacy||"public")==="public"&&
  (r.name||"").toLowerCase().includes(search.toLowerCase())
 ),[rooms,search]);

 const notify=message=>{
  setNotice(message);
  window.setTimeout(()=>setNotice(""),3000);
 };

 useEffect(()=>{
  if(!user)return;
  const q=query(collection(db,"rooms"),orderBy("createdAt","desc"),limit(60));
  return onSnapshot(q,s=>setRooms(s.docs.map(d=>({id:d.id,...d.data()}))),e=>notify(e.message));
 },[user]);

 useEffect(()=>{
  if(!user)return;
  return onSnapshot(doc(db,"users",user.uid),s=>{
   if(s.exists()){
    const d=s.data();
    setProfile(p=>({...p,name:d.displayName||p.name,bio:d.bio||p.bio,country:d.country||p.country,photoURL:d.photoURL||p.photoURL}));
   }
  });
 },[user]);

 useEffect(()=>{
  if(!activeRoom||!user)return;
  const base=`rooms/${activeRoom.id}`;
  const stopMembers=onSnapshot(collection(db,base,"members"),s=>setMembers(s.docs.map(d=>d.data())));
  const q=query(collection(db,base,"messages"),orderBy("createdAt","asc"),limit(100));
  const stopMessages=onSnapshot(q,s=>setMessages(s.docs.map(d=>d.data())));
  return ()=>{stopMembers();stopMessages();};
 },[activeRoom,user]);

 const joinRoom=async room=>{
  try{
   if(room.privacy==="private"&&room.ownerId!==user.uid){notify("Private room ke liye owner invitation chahiye.");return;}
   await runTransaction(db,async tx=>{
    const rr=doc(db,"rooms",room.id);
    const rs=await tx.get(rr);
    if(!rs.exists())throw new Error("Room nahi mila.");
    const mr=doc(db,"rooms",room.id,"members",user.uid);
    const ms=await tx.get(mr);
    if(ms.exists())return;
    const cap=Number(rs.data().capacity)||20;
    const refs=Array.from({length:cap},(_,i)=>doc(db,"rooms",room.id,"seats",String(i+1)));
    const snaps=await Promise.all(refs.map(r=>tx.get(r)));
    const index=snaps.findIndex(s=>!s.exists());
    if(index<0)throw new Error("Room full hai.");
    tx.set(mr,{uid:user.uid,name:profile.name,photoURL:profile.photoURL||"",seat:index+1,joinedAt:serverTimestamp()});
    tx.set(refs[index],{uid:user.uid,name:profile.name});
   });
   setActiveRoom(room);setScreen("LiveRoom");setTab("Room");
  }catch(e){notify(e.message);}
 };

 const createRoom=async()=>{
  if(!roomName.trim())return notify("Room ka naam likho.");
  try{
   const ref=await addDoc(collection(db,"rooms"),{
    name:roomName.trim(),roomCode:"ELV-"+String(Math.floor(100000+Math.random()*900000)),
    category:"Global",capacity:Number(capacity),ownerId:user.uid,
    ownerName:profile.name,privacy,coverURL:"",backgroundURL:"",
    createdAt:serverTimestamp()
   });
   const newRoom={id:ref.id,name:roomName.trim(),capacity:Number(capacity),ownerId:user.uid,ownerName:profile.name,privacy};
   setRoomName("");
   await joinRoom(newRoom);
   notify("Room create ho gaya.");
  }catch(e){notify("Room create nahi hua: "+e.message);}
 };

 const leaveRoom=async()=>{
  if(!activeRoom)return;
  try{
   await runTransaction(db,async tx=>{
    const mr=doc(db,"rooms",activeRoom.id,"members",user.uid);
    const s=await tx.get(mr);
    if(s.exists()){
     tx.delete(mr);
     tx.delete(doc(db,"rooms",activeRoom.id,"seats",String(s.data().seat)));
    }
   });
  }catch(e){notify(e.message);}
  setActiveRoom(null);setMembers([]);setMessages([]);setScreen("");setMicOn(false);
 };

 const sendMessage=async()=>{
  if(!chatText.trim()||!activeRoom)return;
  try{
   await addDoc(collection(db,"rooms",activeRoom.id,"messages"),{
    text:chatText.trim(),senderId:user.uid,senderName:profile.name,createdAt:serverTimestamp()
   });
   setChatText("");
  }catch(e){notify("Message send nahi hua: "+e.message);}
 };

 const saveProfile=async()=>{
  if(!profileEdit.name?.trim())return notify("Username likho.");
  try{
   const next={...profileEdit,name:profileEdit.name.trim()};
   await setDoc(doc(db,"users",user.uid),{
    displayName:next.name,bio:next.bio||"",country:next.country||"India",
    photoURL:(next.photoURL||"").trim(),updatedAt:serverTimestamp()
   },{merge:true});
   setProfile(next);setSheet("");notify("Profile save ho gayi.");
  }catch(e){notify(e.message);}
 };

 const openProfileEdit=()=>{
  setProfileEdit({name:profile.name,bio:profile.bio,country:profile.country,photoURL:profile.photoURL});
  setSheet("Edit Profile");
 };
 const openRoomEdit=()=>{
  setRoomEdit({name:activeRoom?.name||"",coverURL:activeRoom?.coverURL||"",backgroundURL:activeRoom?.backgroundURL||"",capacity:String(activeRoom?.capacity||20)});
  setSheet("Room Settings");
 };
 const saveRoom=async()=>{
  if(activeRoom?.ownerId!==user.uid)return notify("Sirf owner settings badal sakta hai.");
  if(!roomEdit.name?.trim())return notify("Room name likho.");
  try{
   await updateDoc(doc(db,"rooms",activeRoom.id),{
    name:roomEdit.name.trim(),coverURL:(roomEdit.coverURL||"").trim(),
    backgroundURL:(roomEdit.backgroundURL||"").trim(),updatedAt:serverTimestamp()
   });
   setActiveRoom(r=>({...r,...roomEdit}));
   setSheet("");notify("Room settings save ho gayi.");
  }catch(e){notify("Settings save nahi hui: "+e.message);}
 };

 const Header=({title,back=false})=><header className="top">
  {back?<button className="round" onClick={()=>setScreen("")}><ArrowLeft/></button>:<div className="brand">ELVORA<small>VOICE COMMUNITY</small></div>}
  <b style={{color:"#ffe1a0",fontFamily:"Cinzel,serif"}}>{title}</b>
  <button className="round" onClick={()=>notify("Notifications section abhi demo hai.")}><Bell size={17}/></button>
 </header>;

 const HomePage=()=><main className="page">
  <div className="tabs">
   {["Mine","Hot","Following"].map(t=><button key={t} className={listTab===t?"active":""} onClick={()=>setListTab(t)}>{t}</button>)}
   <button onClick={()=>setScreen("Search")}><Search size={18}/></button>
  </div>
  <div className="banner" onClick={()=>setScreen("Wallet")}>
   <Gem size={54}/><span>Recharge<br/>Rewards</span><Sparkles size={30}/>
  </div>
  <div className="tilegrid">
   <button className="tile" onClick={()=>setScreen("Rank")}><Trophy/><span>Rank</span></button>
   <button className="tile" onClick={()=>setScreen("Family")}><Users/><span>Family</span></button>
   <button className="tile" onClick={()=>setScreen("CP Space")}><Heart/><span>CP Space</span></button>
  </div>
  <div className="between" style={{margin:"18px 0 12px"}}>
   <b className="goldtext">ELVORA Voice Rooms</b>
   <button className="btn2" onClick={()=>setScreen("Create Room")}><Plus size={14}/> Create</button>
  </div>
  <div className="input row"><Search size={16}/><input style={{flex:1,minWidth:0,border:0,background:"transparent",color:"white",outline:0}} placeholder="Search rooms..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
  {filteredRooms.length===0?<div className="goldpanel" style={{textAlign:"center",padding:28}}><Headphones size={38} color={GOLD}/><p className="sub">Abhi public room nahi hai. Pehla room create karo.</p></div>:
   <div className="roomgrid">{filteredRooms.map(r=><article className="roomcard" key={r.id}>
    <div className="cover">{r.coverURL?<img src={r.coverURL} alt="Room cover"/>:<Crown size={38}/>}</div>
    <b style={{display:"block",margin:"8px 3px 3px",fontSize:12}}>{r.name}</b>
    <div className="sub" style={{margin:"0 3px 8px"}}>ID: {r.roomCode||numericId(r.id)} · {r.capacity||20} seats</div>
    <button className="btn" style={{width:"100%",padding:8}} onClick={()=>joinRoom(r)}>Join Room</button>
   </article>)}</div>}
  <div className="goldpanel"><div className="between"><b className="goldtext">ELVORA Community</b><Globe color={GOLD}/></div><p className="sub">Meet people, join rooms and enjoy conversations.</p></div>
 </main>;

 const LiveRoom=()=><main className="roompage" style={activeRoom?.backgroundURL?{backgroundImage:`linear-gradient(#1a0b04bb,#160902dd),url("${activeRoom.backgroundURL}")`,backgroundSize:"cover",backgroundPosition:"center"}:{}}>
  <div className="roomhead">
   <button className="round" onClick={leaveRoom}><ArrowLeft/></button>
   <span className="goldtext" style={{fontSize:10,fontWeight:900}}>● LIVE ROOM</span>
   <div className="row">
    <button className="round" onClick={()=>notify("Room sharing abhi demo hai.")}><Share2 size={16}/></button>
    <button className="round" onClick={()=>setSpeakerOn(v=>!v)}>{speakerOn?<Volume2 size={16}/>:<VolumeX size={16}/>}</button>
    <button className="round" onClick={()=>setSheet("More")}><MoreHorizontal/></button>
   </div>
  </div>
  <div className="roomidentity">
   <Avatar name={activeRoom?.name} url={activeRoom?.coverURL} size={52}/>
   <div style={{flex:1,minWidth:0}}><div className="roomname">{activeRoom?.name}</div><div className="roomid">ID: {activeRoom?.roomCode||numericId(activeRoom?.id)}</div></div>
   {activeRoom?.ownerId===user.uid&&<button className="round" onClick={openRoomEdit}><Settings/></button>}
  </div>
  <div className="between goldpanel" style={{padding:12}}>
   <span className="goldtext"><Trophy size={15}/> 0</span>
   <span className="sub"><Users size={14}/> {members.length}/{activeRoom?.capacity||20}</span>
  </div>
  <div className="welcome">✨ Welcome to {activeRoom?.name}! Let's chat and enjoy together.</div>
  <div className="between" style={{margin:"16px 3px 11px"}}><b className="goldtext">Microphone Seats</b><span className="sub">Room Stage</span></div>
  <div className="seats">{Array.from({length:Number(activeRoom?.capacity)||20},(_,i)=>{
   const m=members.find(x=>Number(x.seat)===i+1);
   return <div className="seat" key={i}>
    <div className="seatcircle">{m?<Avatar name={m.name} url={m.photoURL} size={45}/>:<Mic size={19}/>}</div>
    <small>{m?m.name:`No.${i+1}`}</small>
   </div>;
  })}</div>
  <div className="between" style={{margin:"12px 2px"}}><span className="sub"><Users size={14}/> {members.length} members</span><button className="btn2" onClick={()=>setSheet("Members")}>Members</button></div>
  <div className="chatpreview" onClick={()=>setSheet("Chat")}><b className="goldtext" style={{fontSize:11}}>Room Chat · Tap to open</b>
   {messages.slice(-3).map((m,i)=><div className="chatline" key={i}><b>{m.senderName}:</b> {m.text}</div>)}
   {!messages.length&&<div className="chatline">Welcome everyone! Say hello.</div>}
  </div>
  <div className="sub" style={{textAlign:"center"}}>Live audio service abhi connect nahi hai. Mic button demo control hai.</div>
 </main>;

 const ProfilePage=()=><main className="page">
  <div className="heading">My Profile</div>
  <div className="goldpanel" style={{textAlign:"center",padding:22}}>
   <Avatar name={profile.name} url={profile.photoURL} size={94}/>
   <h2 className="goldtext" style={{fontFamily:"Cinzel,serif",margin:"12px 0 4px"}}>{profile.name}</h2>
   <div className="row" style={{justifyContent:"center"}}><span className="sub">UID: {uid}</span><button className="btn2" onClick={()=>{navigator.clipboard?.writeText(uid);notify("UID copied.")}}><Copy size={13}/></button></div>
   <p className="sub">{profile.country} · {profile.bio}</p>
   <button className="btn" onClick={openProfileEdit}><Camera size={15}/> Edit Profile</button>
  </div>
  <div className="statgrid">{["Visitors","Following","Followers"].map(t=><div className="stat" key={t}><b>0</b><span>{t}</span></div>)}</div>
  <div className="tilegrid">
   <button className="tile" onClick={()=>setScreen("Wealth")}><Medal/><span>Wealth</span></button>
   <button className="tile" onClick={()=>setScreen("Decoration")}><Crown/><span>Decoration</span></button>
   <button className="tile" onClick={()=>setScreen("Settings")}><Settings/><span>Settings</span></button>
  </div>
  {[[Wallet,"Wallet"],[Crown,"VIP Membership"],[Users,"Family"],[Trophy,"Rank"],[Heart,"CP Space"],[ShieldCheck,"Safety & Privacy"]].map(([Icon,name])=><button className="listitem" key={name} onClick={()=>setScreen(name)}><span className="row"><Icon color={GOLD}/>{name}</span><ChevronRight color={GOLD}/></button>)}
 </main>;

 const WalletPage=()=><main className="page">
  <div className="heading">Wallet</div>
  <div className="goldpanel" style={{textAlign:"center",padding:27}}>
   <Gem size={48} color={GOLD}/><div className="goldtext">Gold Coins Balance</div>
   <div style={{fontSize:39,fontWeight:900,color:"#ffe19a"}}>0</div>
   <div className="sub">Demo wallet · No purchases enabled</div>
  </div>
  {["Daily Activity","Gift History","Coin History","Rewards"].map(t=><div className="listitem" key={t}><span>{t}</span><span className="sub">Demo</span></div>)}
 </main>;

 const FamilyPage=()=><main className="page">
  <div className="heading">Family</div>
  <div className="tabs">{["Weekly List","Monthly List"].map(t=><button key={t} className={rankTab===t?"active":""} onClick={()=>setRankTab(t)}>{t}</button>)}</div>
  <div className="goldpanel" style={{textAlign:"center",padding:28}}><Crown size={45} color={GOLD}/><h3 className="goldtext">ELVORA Family</h3><p className="sub">Family groups and rankings preview.</p></div>
  {["Create Family","Join Family","My Family Members"].map(t=><button className="listitem" key={t} onClick={()=>notify("Family backend abhi connect nahi hai.")}>{t}<ChevronRight/></button>)}
 </main>;

 const RoomSettingsPage=()=><main className="page">
  <div className="heading">Room Settings</div>
  <div className="goldpanel row"><Avatar name={activeRoom?.name||"R"} url={activeRoom?.coverURL} size={55}/><div><b>{activeRoom?.name||"Your Room"}</b><div className="sub">ID: {activeRoom?.roomCode||numericId(activeRoom?.id)}</div></div></div>
  {["Edit Room Info","Room Theme","Room Cover","Seat Capacity","Seat Layout","Room Background","Moderator Management"].map((t,i)=><button className="listitem" key={t} onClick={()=>{if(t==="Moderator Management")notify("Moderator backend abhi ready nahi hai.");else openRoomEdit()}}><span><b>{t}</b><div className="sub">{["Name and description","Gold royal theme","Change room DP","20 seats","5-column stage","Background image","Manage moderators"][i]}</div></span><ChevronRight color={GOLD}/></button>)}
  <button className="btn" style={{width:"100%",marginTop:15}} onClick={openRoomEdit}>Customize Room</button>
 </main>;

 const DecorationPage=()=><main className="page">
  <div className="heading">Decoration</div>
  <div className="tabs">{["Frames","VIP","Vehicles","Chat Bubble","Theme"].map(t=><button key={t} className={decorationTab===t?"active":""} onClick={()=>setDecorationTab(t)}>{t}</button>)}</div>
  <div className="tilegrid">{["Gold Frame","Royal Frame","Blue Frame","Purple Frame"].map((t,i)=><div className="tile" key={t}><Crown size={38}/><span>{t}</span><small className="sub">Preview</small></div>)}</div>
  <p className="sub" style={{textAlign:"center"}}>Frame previews only. VIP purchases are not enabled.</p>
 </main>;

 const WealthPage=()=><main className="page">
  <div className="tabs">{["Wealth","Charm","Game"].map(t=><button key={t} className={levelTab===t?"active":""} onClick={()=>setLevelTab(t)}>{t}</button>)}</div>
  <div className="goldpanel" style={{textAlign:"center",padding:28}}>
   <Avatar name={profile.name} url={profile.photoURL} size={90}/>
   <h2 className="goldtext">Level 1</h2>
   <div style={{height:9,background:"#351708",borderRadius:20,margin:"20px 0"}}><div style={{width:"18%",height:"100%",background:"linear-gradient(90deg,#ffe59b,#b66c20)",borderRadius:20}}/></div>
   <b>0 EXP</b><p className="sub">Demo level display</p>
  </div>
  <div className="tilegrid">{["Lv1-20","Lv21-40","Lv41-60","Lv61-80"].map(t=><div className="tile" key={t}><Medal/><span>{t}</span></div>)}</div>
 </main>;

 const CPSpace=()=><main className="page">
  <div className="heading">CP Space</div>
  <div className="goldpanel" style={{textAlign:"center",padding:25}}>
   <Heart size={42} color={GOLD}/><h3 className="goldtext">Connection Space</h3>
   <div className="row" style={{justifyContent:"space-around",margin:20}}><Avatar name={profile.name} url={profile.photoURL} size={75}/><Heart size={35} color={GOLD}/><Avatar name="?" size={75}/></div>
   <p className="sub">Friendship and profile connection preview.</p>
  </div>
  <button className="btn" style={{width:"100%"}} onClick={()=>notify("Connection feature abhi available nahi hai.")}>Create Connection</button>
 </main>;

 const MessagesPage=()=><main className="page">
  <div className="heading">Message</div>
  <div className="goldpanel row"><Bell color={GOLD}/><div><b>Notifications</b><div className="sub">Notifications yahan dikhenge jab backend connect hoga.</div></div></div>
  <div className="goldpanel row"><Avatar name="E"/><div><b>ELVORA Community</b><div className="sub">Welcome to ELVORA!</div></div></div>
  <div className="goldpanel"><b className="goldtext">Private Messages</b><p className="sub">Private chat backend abhi connect nahi hai.</p></div>
 </main>;

 const SettingsPage=()=><main className="page">
  <div className="heading">Setting</div>
  <div className="goldpanel row"><Avatar name={profile.name} url={profile.photoURL} size={62}/><div><b>{profile.name}</b><div className="sub">UID: {uid}</div></div></div>
  {["Language","Account Security","Setting","Feedback","About Us"].map(t=><button className="listitem" key={t} onClick={()=>notify(t+" section abhi demo hai.")}>{t}<ChevronRight/></button>)}
  <button className="btn" style={{width:"100%",marginTop:22}} onClick={()=>signOut(auth)}><LogOut size={16}/> LogOut</button>
 </main>;

 const CreateRoomPage=()=><main className="page">
  <div className="heading">Create Room</div>
  <div className="goldpanel">
   <label className="sub">ROOM NAME</label><input className="input" value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="ELVORA Music Room"/>
   <label className="sub">PRIVACY</label><select className="input" value={privacy} onChange={e=>setPrivacy(e.target.value)}><option value="public">Public</option><option value="private">Private</option></select>
   <label className="sub">SEAT CAPACITY</label><select className="input" value={capacity} onChange={e=>setCapacity(e.target.value)}>{[2,10,15,20].map(n=><option value={n} key={n}>{n} Seats</option>)}</select>
   <button className="btn" style={{width:"100%"}} onClick={createRoom}><Plus size={16}/> Create Room</button>
  </div>
 </main>;

 const Placeholder=({title})=><main className="page"><div className="heading">{title}</div><div className="goldpanel"><p className="sub">Is feature ka secure backend agle development step mein banega.</p></div></main>;

 let content;
 if(screen==="LiveRoom")content=activeRoom?<LiveRoom/>:<HomePage/>;
 else if(screen==="Create Room")content=<CreateRoomPage/>;
 else if(screen==="Profile")content=<ProfilePage/>;
 else if(screen==="Messages")content=<MessagesPage/>;
 else if(screen==="Wallet")content=<WalletPage/>;
 else if(screen==="Family")content=<FamilyPage/>;
 else if(screen==="Room Settings")content=<RoomSettingsPage/>;
 else if(screen==="Decoration")content=<DecorationPage/>;
 else if(screen==="Wealth"||screen==="Rank")content=<WealthPage/>;
 else if(screen==="CP Space")content=<CPSpace/>;
 else if(screen==="Settings")content=<SettingsPage/>;
 else if(screen==="Search")content=<HomePage/>;
 else if(screen)content=<Placeholder title={screen}/>;
 else if(tab==="Room")content=<HomePage/>;
 else if(tab==="Moment")content=<Placeholder title="Moment"/>;
 else if(tab==="Message")content=<MessagesPage/>;
 else content=<ProfilePage/>;

 return <div className="app">
  <style>{css}</style>
  {screen!=="LiveRoom"&&<Header title={screen||tab} back={!!screen}/>}
  {notice&&<div className="toast" onClick={()=>setNotice("")}>{notice}　×</div>}
  {content}

  {screen==="LiveRoom"&&activeRoom&&<div className="bottom-action">
   <button onClick={()=>setSheet("Chat")}><MessageCircle/><small>Chat</small></button>
   <button onClick={()=>setSheet("Emoji")}><Smile/><small>Emoji</small></button>
   <button onClick={()=>setSpeakerOn(v=>!v)}>{speakerOn?<Volume2/>:<VolumeX/>}<small>Sound</small></button>
   <button className="micmain" onClick={()=>setMicOn(v=>!v)}>{micOn?<Mic/>:<MicOff/>}</button>
   <button onClick={()=>setSheet("Members")}><Users/><small>Members</small></button>
   <button onClick={()=>setSheet("Inbox")}><Bell/><small>Inbox</small></button>
   <button onClick={()=>setSheet("Gifts")}><Gift/><small>Gift</small></button>
  </div>}

  {!screen&&<nav className="nav">
   {[[Home,"Room"],[Users,"Moment"],[MessageCircle,"Message"],[UserRound,"Me"]].map(([Icon,label])=><button key={label} className={tab===label?"active":""} onClick={()=>{setTab(label);setScreen("")}}><Icon/><span>{label}</span></button>)}
  </nav>}

  {sheet&&<div className="overlay" onClick={()=>setSheet("")}>
   <section className="sheet" onClick={e=>e.stopPropagation()}>
    <div className="sheethead"><span>{sheet}</span><button className="round" onClick={()=>setSheet("")}><X/></button></div>

    {sheet==="Chat"&&<>
     <div className="chatbox">{messages.map((m,i)=><div className="msg" key={i}><b className="goldtext">{m.senderName}</b><div>{m.text}</div></div>)}{!messages.length&&<p className="sub">Abhi koi message nahi hai.</p>}</div>
     <div className="footer"><input className="input" placeholder="Write a message..." value={chatText} onChange={e=>setChatText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}/><button className="btn" onClick={sendMessage}><Send/></button></div>
    </>}

    {sheet==="Edit Profile"&&<>
     <label className="sub">USERNAME</label><input className="input" value={profileEdit.name||""} onChange={e=>setProfileEdit({...profileEdit,name:e.target.value})}/>
     <label className="sub">BIO</label><textarea className="input" rows="3" value={profileEdit.bio||""} onChange={e=>setProfileEdit({...profileEdit,bio:e.target.value})}/>
     <label className="sub">COUNTRY</label><select className="input" value={profileEdit.country||"India"} onChange={e=>setProfileEdit({...profileEdit,country:e.target.value})}><option>India</option><option>Bangladesh</option><option>Nepal</option><option>Other</option></select>
     <label className="sub">PROFILE PHOTO URL</label><input className="input" placeholder="Paste image URL" value={profileEdit.photoURL||""} onChange={e=>setProfileEdit({...profileEdit,photoURL:e.target.value})}/>
     <button className="btn" style={{width:"100%"}} onClick={saveProfile}>Save Profile</button>
    </>}

    {sheet==="Room Settings"&&<>
     <label className="sub">ROOM NAME</label><input className="input" value={roomEdit.name||""} onChange={e=>setRoomEdit({...roomEdit,name:e.target.value})}/>
     <label className="sub">ROOM COVER URL</label><input className="input" value={roomEdit.coverURL||""} onChange={e=>setRoomEdit({...roomEdit,coverURL:e.target.value})}/>
     <label className="sub">ROOM BACKGROUND URL</label><input className="input" value={roomEdit.backgroundURL||""} onChange={e=>setRoomEdit({...roomEdit,backgroundURL:e.target.value})}/>
     <button className="btn" style={{width:"100%"}} onClick={saveRoom}>Save Room Settings</button>
    </>}

    {sheet==="Members"&&members.map(m=><div className="row" style={{padding:9,borderBottom:"1px solid #8a5c30"}} key={m.uid}><Avatar name={m.name} url={m.photoURL}/><div><b>{m.name}</b><div className="sub">Seat {m.seat}</div></div></div>)}

    {sheet==="Emoji"&&<div className="tilegrid">{["😀","😂","😍","🥳","❤️","🔥","👏","🎉","🌹","⭐","🎵","🙌"].map(e=><button className="tile" key={e} onClick={()=>{setChatText(v=>v+e);setSheet("Chat")}}>{e}</button>)}</div>}

    {sheet==="Gifts"&&<div className="goldpanel"><Gift color={GOLD}/><p className="sub">Gift catalogue preview. Coins aur payments enabled nahi hain.</p></div>}
    {sheet==="Inbox"&&<div className="goldpanel"><Bell color={GOLD}/><p className="sub">Room invitations aur inbox backend abhi connect nahi hai.</p></div>}
    {sheet==="More"&&<>
     {activeRoom?.ownerId===user.uid&&<button className="listitem" onClick={openRoomEdit}>Room Settings <Settings/></button>}
     <button className="listitem" onClick={()=>notify("Share feature abhi demo hai.")}>Share Room <Share2/></button>
     <button className="listitem" onClick={leaveRoom}>Leave Room <LogOut/></button>
    </>}
   </section>
  </div>}
 </div>;
}

