import React, { useEffect, useState } from "react";
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
  Shield, Volume2, VolumeX, Smile, Star, LogOut, X,
  UserPlus, Camera, Coins, Handshake, Share2, MoreHorizontal,
  Lock, Image, Edit3, Headphones
} from "lucide-react";

const gold = "#e8bd70";

const css = `
*{box-sizing:border-box}
body{margin:0;background:#100a13;font-family:Arial,sans-serif;color:#fff}
button,input,textarea,select{font:inherit}
button{cursor:pointer}
.app{min-height:100vh;max-width:620px;margin:auto;background:radial-gradient(ellipse at top,#48230e,#1c0d0b 42%,#100a13);position:relative;padding-bottom:85px;overflow-x:hidden}
.top{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid #8e6335;background:linear-gradient(90deg,#21100b,#593015,#21100b);position:sticky;top:0;z-index:15}
.brand{font-size:21px;font-weight:900;letter-spacing:2px;color:#ffdc9b}
.page{padding:14px}
.heading{font-size:21px;font-weight:800;color:#ffdfaa;margin:8px 0 15px}
.sub{color:#b9a28a;font-size:12px}
.panel{background:linear-gradient(145deg,#4b2815,#1c0e0a 70%);border:1px solid #b9874b;border-radius:16px;padding:14px;margin-bottom:12px}
.btn{border:1px solid #e6bd75;border-radius:25px;padding:11px 16px;background:linear-gradient(100deg,#f4d38c,#986024);color:#271307;font-weight:800}
.darkbtn,.smallbtn{background:#24140d;color:#f3d29a;border:1px solid #9a7045;border-radius:20px;padding:8px 11px}
.row{display:flex;align-items:center;gap:10px}
.between{display:flex;align-items:center;justify-content:space-between;gap:9px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.input{width:100%;padding:12px;border:1px solid #9a7045;border-radius:11px;background:#170d0b;color:white;margin:7px 0;outline:none}
.avatar{width:45px;height:45px;border-radius:50%;background:linear-gradient(140deg,#f3d18b,#6f3c18);border:2px solid #e8bd70;display:grid;place-items:center;color:#271408;font-weight:bold;flex-shrink:0;overflow:hidden}
.avatar img{width:100%;height:100%;object-fit:cover}
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:min(620px,100%);height:72px;background:linear-gradient(90deg,#160c09,#4a2815,#160c09);border-top:1px solid #c18c4c;display:flex;justify-content:space-around;align-items:center;z-index:20}
.nav button{border:0;background:none;color:#bda078;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px}
.nav button.active{color:#ffda87}
.nav svg{width:21px;height:21px}
.roomcard{border:1px solid #9d713e;border-radius:14px;padding:12px;background:linear-gradient(120deg,#492713,#1c100b);margin:10px 0}
.stat{background:#25130d;border:1px solid #8c6337;border-radius:12px;padding:12px;text-align:center}
.stat b{display:block;color:#ffdb91;font-size:20px}
.badge{font-size:9px;background:#9d5d19;color:#ffe3a9;border-radius:10px;padding:4px 7px}
.room-screen{position:relative;min-height:calc(100vh - 136px);padding:10px 12px 90px;background-size:cover;background-position:center}
.room-screen:before{content:"";position:absolute;inset:0;background:#100a13d9;pointer-events:none}
.room-screen>*{position:relative}
.room-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.room-toolbar button{width:36px;height:36px;border-radius:50%;background:#21150edc;border:1px solid #9a7045;color:#ffdfaa;display:grid;place-items:center}
.room-identity{display:flex;align-items:center;gap:10px;min-width:0}
.room-identity .avatar{width:47px;height:47px}
.room-title{font-size:15px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.room-id{font-size:10px;color:#d1b58c;margin-top:4px}
.room-info{display:flex;justify-content:space-between;align-items:center;margin:10px 0;padding:8px 10px;background:#24150dc9;border:1px solid #8e6335;border-radius:10px}
.welcome{padding:9px 11px;border-radius:10px;background:#633e20c9;color:#ffe1a8;font-size:11px;margin:10px 0}
.stage-title{display:flex;justify-content:space-between;align-items:center;margin:14px 2px 10px}
.stage-title b{color:#ffdfaa;font-size:14px}
.seats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px 3px;padding:13px 5px;background:#24150dbd;border:1px solid #9b713d;border-radius:15px}
.seat{display:flex;align-items:center;flex-direction:column;gap:5px;min-width:0}
.seat-circle{width:49px;height:49px;border-radius:50%;border:2px solid #d7a85c;background:radial-gradient(circle,#75431e,#160d09);display:grid;place-items:center;color:#f4d18d;position:relative}
.seat-circle .avatar{width:45px;height:45px}
.seat small{color:#e5d1b8;font-size:9px;overflow:hidden;max-width:65px;text-overflow:ellipsis;white-space:nowrap}
.seat .badge{font-size:8px}
.listeners{display:flex;align-items:center;gap:8px;color:#d1b58c;font-size:10px;padding:12px 2px}
.room-chat-preview{height:85px;overflow:hidden;background:#160c0bcc;border:1px solid #8a6338;border-radius:11px;padding:8px;margin:8px 0}
.chat-line{font-size:10px;color:#e7d7c1;margin:5px 0;overflow-wrap:anywhere}
.chat-line b{color:#f2cb83;margin-right:5px}
.room-dock{position:fixed;z-index:25;bottom:0;left:50%;transform:translateX(-50%);width:min(620px,100%);height:76px;background:linear-gradient(90deg,#160c09,#4a2815,#160c09);border-top:1px solid #c18c4c;display:grid;grid-template-columns:repeat(7,1fr);align-items:center;padding:4px 3px}
.room-dock button{border:0;background:none;color:#f0d5a2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-width:0}
.room-dock button small{font-size:8px}
.room-dock button svg{width:21px;height:21px}
.room-dock .mic-main{width:48px;height:48px;margin:auto;border-radius:50%;background:linear-gradient(130deg,#f5d994,#a56c2a);color:#241307;border:2px solid #ffe4a6}
.chatbox{max-height:55vh;overflow:auto;background:#160c0b;border:1px solid #8a6338;border-radius:12px;padding:10px}
.msg{padding:8px 10px;margin:7px 0;background:#432516;border-radius:10px;max-width:90%;overflow-wrap:anywhere;font-size:12px}
.footerInput{display:flex;gap:7px;margin-top:8px}
.footerInput input{flex:1;min-width:0}
.overlay{position:fixed;inset:0;z-index:40;background:#000b;display:flex;align-items:flex-end;justify-content:center}
.sheet{width:min(620px,100%);max-height:80vh;overflow:auto;background:#21130d;border:1px solid #b9874b;border-radius:20px 20px 0 0;padding:17px}
.sheet-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.sheet-head b{color:#ffdfaa;font-size:17px}
.toast{position:fixed;z-index:60;top:75px;left:50%;transform:translateX(-50%);background:#4b2815;border:1px solid #d3a15a;border-radius:10px;padding:10px 14px;color:#fff0d1;font-size:12px;max-width:90%}
.menuitem{width:100%;padding:13px;text-align:left;color:#fff0d1;background:#2b190f;border:1px solid #76502e;border-radius:10px;margin:5px 0}
@media(max-width:370px){.seat-circle{width:43px;height:43px}.seat-circle .avatar{width:39px;height:39px}.seats{gap:13px 1px}.room-dock button small{font-size:7px}}
`;

function Avatar({name="U",size=45,url=""}) {
  return <div className="avatar" style={{width:size,height:size}}>
    {url?<img src={url} alt="Profile"/>:String(name).slice(0,1).toUpperCase()}
  </div>;
}

export default function App() {
  const user=auth.currentUser;
  const [tab,setTab]=useState("Room");
  const [screen,setScreen]=useState("");
  const [rooms,setRooms]=useState([]);
  const [activeRoom,setActiveRoom]=useState(null);
  const [members,setMembers]=useState([]);
  const [messages,setMessages]=useState([]);
  const [profile,setProfile]=useState({
    name:user?.displayName||user?.email?.split("@")[0]||"Member",
    bio:"Welcome to ELVORA",
    country:"India",
    photoURL:user?.photoURL||""
  });
  const [roomName,setRoomName]=useState("");
  const [roomType,setRoomType]=useState("Public");
  const [capacity,setCapacity]=useState("20");
  const [chatText,setChatText]=useState("");
  const [search,setSearch]=useState("");
  const [notice,setNotice]=useState("");
  const [sheet,setSheet]=useState("");
  const [micOn,setMicOn]=useState(false);
  const [speakerOn,setSpeakerOn]=useState(true);
  const [roomEdit,setRoomEdit]=useState({name:"",coverURL:"",backgroundURL:""});
  const [profileEdit,setProfileEdit]=useState({name:"",bio:"",country:"",photoURL:""});
  const [roomId,setRoomId]=useState("");

  useEffect(()=>{
    if(!user)return;
    const q=query(collection(db,"rooms"),orderBy("createdAt","desc"),limit(50));
    return onSnapshot(q,s=>setRooms(s.docs.map(d=>({id:d.id,...d.data()}))),e=>setNotice(e.message));
  },[user]);

  useEffect(()=>{
    if(!activeRoom||!user)return;
    const base=`rooms/${activeRoom.id}`;
    const unsub1=onSnapshot(collection(db,base,"members"),s=>setMembers(s.docs.map(d=>d.data())));
    const q=query(collection(db,base,"messages"),orderBy("createdAt","asc"),limit(100));
    const unsub2=onSnapshot(q,s=>setMessages(s.docs.map(d=>d.data())));
    return ()=>{unsub1();unsub2();};
  },[activeRoom,user]);

  useEffect(()=>{
    if(!user)return;
    const ref=doc(db,"users",user.uid);
    return onSnapshot(ref,s=>{
      if(s.exists()){
        const d=s.data();
        setProfile(p=>({...p,name:d.displayName||p.name,bio:d.bio||p.bio,country:d.country||p.country,photoURL:d.photoURL||p.photoURL}));
      }
    });
  },[user]);

  const createRoom=async()=>{
    if(!roomName.trim())return setNotice("Room ka naam likho.");
    try{
      const name=roomName.trim();
      const ref=await addDoc(collection(db,"rooms"),{
        name,category:"Global",capacity:Number(capacity),
        ownerId:user.uid,ownerName:profile.name,
        privacy:roomType.toLowerCase(),
        coverURL:"",backgroundURL:"",
        createdAt:serverTimestamp()
      });
      setRoomName("");
      setScreen("");
      await joinRoom({id:ref.id,name,capacity:Number(capacity),ownerId:user.uid,ownerName:profile.name});
    }catch(e){setNotice("Room create nahi hua: "+e.message);}
  };

  const joinRoom=async(room)=>{
    try{
      if(room.privacy==="private"&&room.ownerId!==user.uid){
        setNotice("Private room access abhi invitation backend se connect nahi hai.");
        return;
      }
      await runTransaction(db,async tx=>{
        const roomRef=doc(db,"rooms",room.id);
        const roomSnap=await tx.get(roomRef);
        if(!roomSnap.exists())throw new Error("Room available nahi hai.");
        const memberRef=doc(db,"rooms",room.id,"members",user.uid);
        const memberSnap=await tx.get(memberRef);
        if(memberSnap.exists())return;
        const cap=Number(roomSnap.data().capacity)||20;
        const seatRefs=Array.from({length:cap},(_,i)=>doc(db,"rooms",room.id,"seats",String(i+1)));
        const seatSnaps=await Promise.all(seatRefs.map(ref=>tx.get(ref)));
        const freeIndex=seatSnaps.findIndex(s=>!s.exists());
        if(freeIndex===-1)throw new Error("Room full hai.");
        const seat=freeIndex+1;
        tx.set(memberRef,{uid:user.uid,name:profile.name,seat,joinedAt:serverTimestamp()});
        tx.set(seatRefs[freeIndex],{uid:user.uid,name:profile.name});
      });
      setActiveRoom(room);
      setTab("Room");
      setScreen("LiveRoom");
    }catch(e){setNotice(e.message);}
  };

  const leaveRoom=async()=>{
    if(!activeRoom)return;
    try{
      await runTransaction(db,async tx=>{
        const memberRef=doc(db,"rooms",activeRoom.id,"members",user.uid);
        const snap=await tx.get(memberRef);
        if(snap.exists()){
          const seat=snap.data().seat;
          tx.delete(memberRef);
          tx.delete(doc(db,"rooms",activeRoom.id,"seats",String(seat)));
        }
      });
    }catch(e){setNotice(e.message);}
    setActiveRoom(null);
    setMembers([]);
    setMessages([]);
    setScreen("");
    setSheet("");
    setMicOn(false);
  };

  const sendMessage=async()=>{
    if(!chatText.trim()||!activeRoom)return;
    try{
      await addDoc(collection(db,"rooms",activeRoom.id,"messages"),{
        text:chatText.trim(),senderId:user.uid,
        senderName:profile.name,createdAt:serverTimestamp()
      });
      setChatText("");
    }catch(e){setNotice("Message send nahi hua: "+e.message);}
  };

  const saveProfile=async()=>{
    try{
      await setDoc(doc(db,"users",user.uid),{
        displayName:profileEdit.name.trim(),
        bio:profileEdit.bio,
        country:profileEdit.country,
        photoURL:profileEdit.photoURL.trim(),
        updatedAt:serverTimestamp()
      },{merge:true});
      setProfile(p=>({...p,...profileEdit,name:profileEdit.name.trim()}));
      setNotice("Profile details save ho gayi.");
      setSheet("");
    }catch(e){setNotice(e.message);}
  };

  const saveRoom=async()=>{
    if(!activeRoom||activeRoom.ownerId!==user.uid)return setNotice("Sirf room owner settings change kar sakta hai.");
    if(!roomEdit.name.trim())return setNotice("Room name khaali nahi ho sakta.");
    try{
      await updateDoc(doc(db,"rooms",activeRoom.id),{
        name:roomEdit.name.trim(),
        coverURL:roomEdit.coverURL.trim(),
        backgroundURL:roomEdit.backgroundURL.trim(),
        updatedAt:serverTimestamp()
      });
      setActiveRoom(r=>({...r,name:roomEdit.name.trim(),coverURL:roomEdit.coverURL.trim(),backgroundURL:roomEdit.backgroundURL.trim()}));
      setNotice("Room settings save ho gayi.");
      setSheet("");
    }catch(e){setNotice("Settings save nahi hui: "+e.message);}
  };

  const go=name=>setScreen(name);
  const filtered=rooms.filter(r=>(r.name||"").toLowerCase().includes(search.toLowerCase())&&(r.privacy||"public")==="public");

  const Header=({title,backButton=true})=><div className="top">
    {backButton?<button className="smallbtn" onClick={()=>setScreen("")}><ArrowLeft size={18}/></button>:<span className="brand">ELVORA</span>}
    <b style={{fontSize:17,color:"#ffe0a8"}}>{title}</b>
    <button className="smallbtn" onClick={()=>setNotice("ELVORA Community")}><Bell size={17}/></button>
  </div>;

  const BottomNav=()=> <div className="nav">
    {[[Home,"Room"],[Compass,"Discover"],[MessageCircle,"Message"],[UserRound,"Me"]].map(([Icon,name])=>
      <button key={name} className={tab===name?"active":""} onClick={()=>{setTab(name);setScreen("");}}>
        <Icon/><span>{name}</span>
      </button>
    )}
  </div>;

  const RoomList=()=> <div className="page">
    <div className="between">
      <div><div className="heading">Discover Rooms</div><div className="sub">Global voice community</div></div>
      <button className="btn" onClick={()=>go("Create Room")}><Plus size={15}/> Create</button>
    </div>
    <input className="input" placeholder="Search rooms..." value={search} onChange={e=>setSearch(e.target.value)}/>
    <div className="grid2">
      <div className="stat"><b>{rooms.length}</b><span className="sub">Rooms</span></div>
      <div className="stat"><b>🌍</b><span className="sub">Global Community</span></div>
    </div>
    <div className="heading" style={{fontSize:17,marginTop:20}}>Public Rooms</div>
    {filtered.length===0?<div className="panel sub">Abhi public rooms nahi hain. Pehla room create karo.</div>:
      filtered.map(r=><div className="roomcard" key={r.id}>
        <div className="between">
          <div className="row">
            <Avatar name={r.ownerName||"H"} url={r.coverURL}/>
            <div style={{minWidth:0}}><b>{r.name}</b><div className="sub">{r.ownerName||"Host"} · {r.capacity||20} seats</div></div>
          </div>
          <span className="badge">LIVE ROOM</span>
        </div>
        <div className="between" style={{marginTop:12}}>
          <span className="sub"><Users size={13}/> {r.privacy||"Public"}</span>
          <button className="darkbtn" onClick={()=>joinRoom(r)}>Join Room</button>
        </div>
      </div>)
    }
  </div>;

  const LiveRoom=()=> {
    const roomBackground=activeRoom?.backgroundURL?{backgroundImage:`url("${activeRoom.backgroundURL}")`}:{};
    return <div className="room-screen" style={roomBackground}>
      <div className="room-toolbar">
        <button onClick={leaveRoom}><ArrowLeft size={18}/></button>
        <span className="badge">● LIVE</span>
        <div className="row">
          <button onClick={()=>setNotice("Share link feature backend mein connect hoga.")}><Share2 size={17}/></button>
          <button onClick={()=>setSpeakerOn(v=>!v)}>{speakerOn?<Volume2 size={17}/>:<VolumeX size={17}/>}</button>
          <button onClick={()=>setSheet("More")}><MoreHorizontal size={18}/></button>
        </div>
      </div>

      <div className="room-identity">
        <Avatar name={activeRoom?.name||"E"} url={activeRoom?.coverURL} size={48}/>
        <div style={{minWidth:0,flex:1}}>
          <div className="room-title">{activeRoom?.name||"ELVORA Room"}</div>
          <div className="room-id">Room ID: {activeRoom?.id}</div>
        </div>
        {activeRoom?.ownerId===user.uid&&<button className="smallbtn" onClick={()=>{
          setRoomEdit({name:activeRoom.name||"",coverURL:activeRoom.coverURL||"",backgroundURL:activeRoom.backgroundURL||""});
          setSheet("Room Settings");
        }}><Settings size={17}/></button>}
      </div>

      <div className="room-info">
        <span className="sub">🎙 Voice Stage</span>
        <b style={{color:"#ffdfaa",fontSize:11}}>{members.length}/{activeRoom?.capacity||20} Members</b>
      </div>

      <div className="welcome">✨ Welcome to {activeRoom?.name}. Respect everyone and enjoy the room!</div>

      <div className="stage-title">
        <b>🎤 Microphone Seats</b>
        <span className="sub">5 columns</span>
      </div>

      <div className="seats">
        {Array.from({length:Number(activeRoom?.capacity)||20},(_,i)=>{
          const m=members.find(x=>Number(x.seat)===i+1);
          return <div className="seat" key={i}>
            <div className="seat-circle">
              {m?<Avatar name={m.name} size={45}/>:<Mic size={19}/>}
            </div>
            <small>{m?m.name:`Seat ${i+1}`}</small>
            {m?.uid===activeRoom?.ownerId&&<span className="badge">HOST</span>}
          </div>;
        })}
      </div>

      <div className="listeners">
        <Users size={16}/>
        <span>{members.length} people on stage</span>
        <button className="smallbtn" onClick={()=>setSheet("Members")}>View</button>
      </div>

      <div className="room-chat-preview" onClick={()=>setSheet("Chat")}>
        {messages.slice(-3).map((m,i)=><div className="chat-line" key={i}><b>{m.senderName||"Member"}:</b>{m.text}</div>)}
        {messages.length===0&&<div className="chat-line">Room chat yahan dikhega. Tap to open.</div>}
      </div>
    </div>;
  };

  const CreateRoom=()=> <div className="page">
    <div className="heading">Create Voice Room</div>
    <div className="panel">
      <label className="sub">Room Name</label>
      <input className="input" value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="Enter room name"/>
      <label className="sub">Room Privacy</label>
      <select className="input" value={roomType} onChange={e=>setRoomType(e.target.value)}>
        <option>Public</option><option>Private</option>
      </select>
      <label className="sub">Speaker Seats</label>
      <select className="input" value={capacity} onChange={e=>setCapacity(e.target.value)}>
        {[2,10,15,20].map(n=><option key={n} value={n}>{n} Seats</option>)}
      </select>
      <button className="btn" style={{width:"100%",marginTop:12}} onClick={createRoom}>Create Room</button>
    </div>
    <p className="sub">Note: Private room invitation and access protection will need a secure backend update.</p>
  </div>;

  const ProfilePage=()=> <div className="page">
    <div className="heading">My Profile</div>
    <div className="panel" style={{textAlign:"center",padding:24}}>
      <Avatar name={profile.name} url={profile.photoURL} size={85}/>
      <h2 style={{color:"#ffdfaa"}}>{profile.name}</h2>
      <div className="sub">{profile.country} · ELVORA Member</div>
      <p className="sub">{profile.bio}</p>
      <button className="btn darkbtn" onClick={()=>{
        setProfileEdit({name:profile.name,bio:profile.bio,country:profile.country,photoURL:profile.photoURL});
        setSheet("Edit Profile");
      }}>Edit Profile</button>
    </div>
    <div className="grid2">
      <div className="stat"><b>0</b><span className="sub">Friends</span></div>
      <div className="stat"><b>0</b><span className="sub">Followers</span></div>
    </div>
    {[[Wallet,"Wallet"],[Crown,"VIP & Membership"],[Users,"Family"],[Handshake,"Brother & Sister"],[Heart,"CP Space"],[Trophy,"Leaderboard"],[Settings,"Settings"]].map(([Icon,name])=>
      <button className="panel" key={name} style={{width:"100%",color:"white",textAlign:"left"}} onClick={()=>go(name)}>
        <div className="between"><div className="row"><Icon color={gold}/><b>{name}</b></div><ChevronRight color={gold}/></div>
      </button>
    )}
  </div>;

  const MessagesPage=()=> <div className="page">
    <div className="heading">Messages & Friends</div>
    <div className="panel"><Bell color={gold}/><b> Notifications</b><p className="sub">Community updates will appear here.</p></div>
    <div className="panel"><Users color={gold}/><b> Friends</b><p className="sub">Friend requests and friend list backend pending.</p></div>
    <div className="panel"><MessageCircle color={gold}/><b> Private Messages</b><p className="sub">Private chat backend pending.</p></div>
  </div>;

  const WalletPage=()=> <div className="page">
    <div className="heading">Wallet</div>
    <div className="panel" style={{textAlign:"center",padding:25}}>
      <Coins size={38} color={gold}/><h1 style={{color:"#ffdfaa"}}>0 Coins</h1>
      <p className="sub">Display only. Coin purchases and transfers are not enabled.</p>
    </div>
  </div>;

  const SettingsPage=()=> <div className="page">
    <div className="heading">Settings</div>
    <div className="panel"><b>Account</b><p className="sub">{user?.email||"Signed in"}</p></div>
    <button className="btn" style={{width:"100%"}} onClick={()=>signOut(auth)}><LogOut size={17}/> Log Out</button>
  </div>;

  const Placeholder=({title})=><div className="page"><div className="heading">{title}</div><div className="panel sub">Is feature ka secure backend abhi connect karna baaki hai.</div></div>;

  let content;
  if(screen==="LiveRoom")content=<LiveRoom/>;
  else if(screen==="Create Room")content=<CreateRoom/>;
  else if(screen==="Profile")content=<ProfilePage/>;
  else if(screen==="Messages")content=<MessagesPage/>;
  else if(screen==="Wallet")content=<WalletPage/>;
  else if(screen==="Settings")content=<SettingsPage/>;
  else if(screen)content=<Placeholder title={screen}/>;
  else if(tab==="Room")content=<RoomList/>;
  else if(tab==="Discover")content=<RoomList/>;
  else if(tab==="Message")content=<MessagesPage/>;
  else content=<ProfilePage/>;

  return <div className="app">
    <style>{css}</style>
    {!screen&&<Header title={tab} backButton={false}/>}
    {screen&&screen!=="LiveRoom"&&<Header title={screen}/>}
    {notice&&<div className="toast" onClick={()=>setNotice("")}>{notice} ✕</div>}
    {content}

    {screen==="LiveRoom"&&activeRoom&&<div className="room-dock">
      <button onClick={()=>setSheet("Chat")}><MessageCircle/><small>Chat</small></button>
      <button onClick={()=>setSheet("Emoji")}><Smile/><small>Emoji</small></button>
      <button onClick={()=>setSpeakerOn(v=>!v)}>{speakerOn?<Volume2/>:<VolumeX/>}<small>Speaker</small></button>
      <button className="mic-main" onClick={()=>setMicOn(v=>!v)}>{micOn?<Mic/>:<MicOff/>}</button>
      <button onClick={()=>setSheet("Members")}><Users/><small>Members</small></button>
      <button onClick={()=>setSheet("Gifts")}><Gift/><small>Gifts</small></button>
      <button onClick={()=>setSheet("More")}><MoreHorizontal/><small>More</small></button>
    </div>}

    {!screen&&<BottomNav/>}

    {sheet&&<div className="overlay" onClick={()=>setSheet("")}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheet-head"><b>{sheet}</b><button className="smallbtn" onClick={()=>setSheet("")}><X size={18}/></button></div>

        {sheet==="Chat"&&<>
          <div className="chatbox">
            {messages.map((m,i)=><div className="msg" key={i}><b style={{color:gold}}>{m.senderName||"Member"}</b><div>{m.text}</div></div>)}
            {messages.length===0&&<p className="sub">Abhi koi message nahi hai.</p>}
          </div>
          <div className="footerInput">
            <input className="input" placeholder="Write a message..." value={chatText} onChange={e=>setChatText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}/>
            <button className="btn" onClick={sendMessage}><Send size={17}/></button>
          </div>
        </>}

        {sheet==="Room Settings"&&<>
          <label className="sub">Room Name</label>
          <input className="input" value={roomEdit.name} onChange={e=>setRoomEdit({...roomEdit,name:e.target.value})}/>
          <label className="sub">Room DP image URL</label>
          <input className="input" placeholder="https://..." value={roomEdit.coverURL} onChange={e=>setRoomEdit({...roomEdit,coverURL:e.target.value})}/>
          <label className="sub">Room Background image URL</label>
          <input className="input" placeholder="https://..." value={roomEdit.backgroundURL} onChange={e=>setRoomEdit({...roomEdit,backgroundURL:e.target.value})}/>
          <button className="btn" style={{width:"100%"}} onClick={saveRoom}>Save Room Settings</button>
          <p className="sub">Image URL use karo. Direct photo upload abhi connected nahi hai.</p>
        </>}

        {sheet==="Edit Profile"&&<>
          <label className="sub">Username</label>
          <input className="input" value={profileEdit.name} onChange={e=>setProfileEdit({...profileEdit,name:e.target.value})}/>
          <label className="sub">Bio</label>
          <textarea className="input" rows="3" value={profileEdit.bio} onChange={e=>setProfileEdit({...profileEdit,bio:e.target.value})}/>
          <label className="sub">Country</label>
          <select className="input" value={profileEdit.country} onChange={e=>setProfileEdit({...profileEdit,country:e.target.value})}>
            <option>India</option><option>Bangladesh</option><option>Nepal</option><option>Other</option>
          </select>
          <label className="sub">Profile photo URL</label>
          <input className="input" placeholder="https://..." value={profileEdit.photoURL} onChange={e=>setProfileEdit({...profileEdit,photoURL:e.target.value})}/>
          <button className="btn" style={{width:"100%"}} onClick={saveProfile}>Save Profile</button>
        </>}

        {sheet==="Members"&&<>
          {members.map(m=><div className="row" style={{padding:8,borderBottom:"1px solid #684322"}} key={m.uid}><Avatar name={m.name}/><div><b>{m.name}</b><div className="sub">Seat {m.seat}</div></div></div>)}
        </>}

        {sheet==="Emoji"&&<div className="grid2">
          {["😀","😂","😍","🥳","❤️","🔥","👏","🎉","🌹","⭐","🎵","🙌"].map(e=><button className="menuitem" key={e} onClick={()=>setNotice("Emoji: "+e)} style={{textAlign:"center",fontSize:22}}>{e}</button>)}
        </div>}

        {sheet==="Gifts"&&<div className="panel"><Gift color={gold}/><p className="sub">Gift catalogue and sending system secure backend ke baad enable hoga. Abhi coin purchase ya payment available nahi hai.</p></div>}

        {sheet==="More"&&<>
          <button className="menuitem" onClick={()=>setNotice("Room share feature backend pending.")}><Share2 size={16}/> Share Room</button>
          {activeRoom?.ownerId===user.uid&&<button className="menuitem" onClick={()=>{setRoomEdit({name:activeRoom.name||"",coverURL:activeRoom.coverURL||"",backgroundURL:activeRoom.backgroundURL||""});setSheet("Room Settings");}}><Settings size={16}/> Room Settings</button>}
          <button className="menuitem" onClick={leaveRoom}><LogOut size={16}/> Leave Room</button>
        </>}
      </div>
    </div>}
  </div>;
}
