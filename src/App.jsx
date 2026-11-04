import React, { useEffect, useState } from "react";
import {
  collection, doc, addDoc, setDoc, onSnapshot,
  query, orderBy, serverTimestamp, runTransaction, limit
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import {
  Home, MessageCircle, UserRound, Users, Mic,
  Plus, Settings, Wallet, Crown, Gift, Trophy, Heart,
  ChevronRight, ArrowLeft, Send, Globe, Bell, Shield,
  Volume2, Smile, Star, LogOut, X, UserPlus,
  Camera, Coins, Handshake
} from "lucide-react";

const gold = "#e8bd70";
const css = `
*{box-sizing:border-box}
body{margin:0;background:#100a13;font-family:Arial,sans-serif;color:#fff}
button,input,textarea,select{font:inherit}
button{cursor:pointer}
.app{min-height:100vh;max-width:600px;margin:auto;background:radial-gradient(ellipse at top,#48230e,#1c0d0b 42%,#100a13);position:relative;padding-bottom:90px;overflow:hidden}
.top{height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #8e6335;background:linear-gradient(90deg,#21100b,#593015,#21100b)}
.brand{font-size:23px;font-weight:900;letter-spacing:2px;color:#ffdc9b}
.page{padding:16px}
.heading{font-size:22px;font-weight:800;color:#ffdfaa;margin:8px 0 16px}
.sub{color:#b9a28a;font-size:13px}
.panel{background:linear-gradient(145deg,#4b2815,#1c0e0a 70%);border:1px solid #b9874b;border-radius:18px;padding:16px;margin-bottom:14px;box-shadow:inset 0 0 15px #b47a2422,0 5px 18px #0008}
.purple{background:linear-gradient(145deg,#4a1d53,#180b23);border-color:#b58bd0}
.btn{border:1px solid #e6bd75;border-radius:30px;padding:12px 18px;background:linear-gradient(100deg,#f4d38c,#986024);color:#271307;font-weight:800}
.btn.dark,.smallbtn{background:#24140d;color:#f3d29a;border:1px solid #9a7045;border-radius:20px;padding:9px 13px}
.row{display:flex;align-items:center;gap:12px}
.between{display:flex;align-items:center;justify-content:space-between;gap:10px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.input{width:100%;padding:13px;border:1px solid #9a7045;border-radius:12px;background:#170d0b;color:white;margin:7px 0;outline:none}
.avatar{border-radius:50%;background:linear-gradient(140deg,#f3d18b,#6f3c18);border:2px solid #e8bd70;display:grid;place-items:center;color:#271408;font-weight:bold;flex-shrink:0}
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:min(600px,100%);height:76px;background:linear-gradient(90deg,#160c09,#4a2815,#160c09);border-top:1px solid #c18c4c;display:flex;justify-content:space-around;align-items:center;z-index:10}
.nav button{border:0;background:none;color:#bda078;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:11px}
.nav button.active{color:#ffda87}
.nav svg{width:22px;height:22px}
.roomcard{border:1px solid #9d713e;border-radius:15px;padding:13px;background:linear-gradient(120deg,#492713,#1c100b);margin:10px 0}
.seats{display:grid;grid-template-columns:repeat(5,1fr);gap:16px 7px;margin:22px 0}
.seat{display:flex;align-items:center;flex-direction:column;gap:5px;min-width:0}
.seatCircle{height:53px;width:53px;border-radius:50%;border:2px solid #d7a85c;background:radial-gradient(circle,#75431e,#160d09);display:grid;place-items:center;color:#f4d18d}
.seat small{color:#d5c5b2;font-size:11px;overflow:hidden;max-width:65px;text-overflow:ellipsis}
.badge{font-size:10px;background:#9d5d19;color:#ffe3a9;border-radius:10px;padding:3px 7px}
.stat{background:#25130d;border:1px solid #8c6337;border-radius:13px;padding:12px;text-align:center}
.stat b{display:block;color:#ffdb91;font-size:20px}
.chatbox{height:35vh;overflow:auto;background:#160c0b;border:1px solid #8a6338;border-radius:14px;padding:10px}
.msg{padding:8px 11px;margin:8px 0;background:#432516;border-radius:12px;max-width:85%;width:max-content;overflow-wrap:anywhere}
.footerInput{display:flex;gap:8px;margin-top:10px}
.footerInput input{flex:1;min-width:0}
.goldline{height:1px;background:linear-gradient(90deg,transparent,#e6bd75,transparent);margin:15px 0}
`;

function Avatar({name="U",size=48}) {
  return <div className="avatar" style={{width:size,height:size}}>
    {String(name).slice(0,1).toUpperCase()}
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
    country:"India"
  });
  const [roomName,setRoomName]=useState("");
  const [roomType,setRoomType]=useState("Public");
  const [capacity,setCapacity]=useState("20");
  const [chatText,setChatText]=useState("");
  const [search,setSearch]=useState("");
  const [notice,setNotice]=useState("");

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

  const createRoom=async()=>{
    if(!roomName.trim())return setNotice("Room ka naam likho.");
    try{
      const name=roomName.trim();
      const ref=await addDoc(collection(db,"rooms"),{
        name,category:"Global",capacity:Number(capacity),
        ownerId:user.uid,ownerName:profile.name,
        privacy:roomType.toLowerCase(),createdAt:serverTimestamp()
      });
      setRoomName("");
      setScreen("");
      await joinRoom({id:ref.id,name,capacity:Number(capacity),ownerId:user.uid,ownerName:profile.name});
    }catch(e){setNotice("Room create nahi hua: "+e.message);}
  };

  const joinRoom=async(room)=>{
    try{
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
        displayName:profile.name,bio:profile.bio,
        country:profile.country,photoURL:user.photoURL||"",
        updatedAt:serverTimestamp()
      },{merge:true});
      setNotice("Profile details save ho gayi.");
      setScreen("");
    }catch(e){setNotice(e.message);}
  };

  const go=name=>setScreen(name);
  const back=()=>setScreen("");
  const filtered=rooms.filter(r=>(r.name||"").toLowerCase().includes(search.toLowerCase()));

  const Header=({title,backButton=true})=><div className="top">
    {backButton?
      <button className="smallbtn" onClick={back}><ArrowLeft size={18}/></button>:
      <span className="brand">ELVORA</span>}
    <b style={{fontSize:18,color:"#ffe0a8"}}>{title}</b>
    <button className="smallbtn" onClick={()=>setNotice("ELVORA Community")}><Bell size={17}/></button>
  </div>;

  const featureCard=(Icon,title,desc)=><button className="panel" style={{textAlign:"left",color:"white",width:"100%"}} onClick={()=>go(title)}>
    <div className="row">
      <Icon color={gold} size={25}/>
      <div style={{flex:1}}><b>{title}</b><div className="sub">{desc}</div></div>
      <ChevronRight color={gold}/>
    </div>
  </button>;

  const BottomNav=()=> <div className="nav">
    {[[Home,"Room"],[Users,"Moment"],[MessageCircle,"Message"],[UserRound,"Me"]].map(([Icon,name])=>
      <button key={name} className={tab===name?"active":""} onClick={()=>{setTab(name);setScreen("");}}>
        <Icon/><span>{name}</span>
      </button>
    )}
  </div>;

  const RoomList=()=> <div className="page">
    <div className="between">
      <div><div className="heading">Discover Rooms</div><div className="sub">Global voice community</div></div>
      <button className="btn" onClick={()=>go("Create Room")}><Plus size={16}/> Create</button>
    </div>
    <input className="input" placeholder="Search rooms..." value={search} onChange={e=>setSearch(e.target.value)}/>
    <div className="grid2">
      <div className="stat"><b>{rooms.length}</b><span className="sub">Rooms</span></div>
      <div className="stat"><b>🌍</b><span className="sub">Global Community</span></div>
    </div>
    <div className="heading" style={{fontSize:18,marginTop:22}}>Live & Public Rooms</div>
    {filtered.length===0?
      <div className="panel sub">Abhi rooms nahi hain. Pehla room create karo.</div>:
      filtered.map(r=><div className="roomcard" key={r.id}>
        <div className="between">
          <div className="row"><Avatar name="🎙"/><div><b>{r.name}</b><div className="sub">{r.ownerName||"Host"} · {r.privacy||"Public"}</div></div></div>
          <span className="badge">ROOM</span>
        </div>
        <div className="between" style={{marginTop:13}}>
          <span className="sub"><Users size={13}/> {r.capacity||20} seats</span>
          <button className="btn dark" onClick={()=>joinRoom(r)}>Join Room</button>
        </div>
      </div>)
    }
  </div>;

  const LiveRoom=()=> <div className="page">
    <div className="between">
      <button className="smallbtn" onClick={leaveRoom}><ArrowLeft size={17}/> Leave</button>
      <span className="badge">● LIVE</span>
      <button className="smallbtn" onClick={()=>setNotice("Audio connection ke liye LiveKit setup baaki hai.")}><Volume2 size={17}/></button>
    </div>
    <div className="panel" style={{textAlign:"center",marginTop:15}}>
      <div style={{fontSize:12,color:gold}}>ELVORA VOICE COMMUNITY</div>
      <h2 style={{color:"#ffe0a8",margin:"9px 0"}}>{activeRoom?.name}</h2>
      <div className="sub">Host: {activeRoom?.ownerName||profile.name}</div>
      <div className="goldline"/>
      <div className="between"><span className="sub">Participants</span><b>{members.length}/{activeRoom?.capacity||20}</b></div>
    </div>
    <div className="seats">
      {Array.from({length:Number(activeRoom?.capacity)||20},(_,i)=>{
        const m=members.find(x=>Number(x.seat)===i+1);
        return <div className="seat" key={i}>
          <div className="seatCircle">{m?<Avatar name={m.name} size={49}/>:<Mic size={20}/>}</div>
          <small>{m?m.name:`No.${i+1}`}</small>
          {m?.uid===activeRoom?.ownerId&&<span className="badge">HOST</span>}
        </div>;
      })}
    </div>
    <div className="panel">
      <div className="row" style={{justifyContent:"space-around",flexWrap:"wrap"}}>
        <button className="smallbtn" onClick={()=>setNotice("Real mic ke liye LiveKit connection baaki hai.")}><Mic size={19}/><div className="sub">Mic</div></button>
        <button className="smallbtn" onClick={()=>setNotice("Emoji panel agle stage mein connect hoga.")}><Smile size={19}/><div className="sub">Emoji</div></button>
        <button className="smallbtn" onClick={()=>setNotice("Gift sending secure wallet backend ke baad enable hoga.")}><Gift size={19}/><div className="sub">Gifts</div></button>
        <button className="smallbtn" onClick={()=>setNotice("Invite feature agle stage mein connect hoga.")}><UserPlus size={19}/><div className="sub">Invite</div></button>
      </div>
    </div>
    <div className="heading" style={{fontSize:17}}>Room Chat</div>
    <div className="chatbox">
      {messages.map((m,i)=><div className="msg" key={i}>
        <b style={{color:gold,fontSize:12}}>{m.senderName||"Member"}</b><div>{m.text}</div>
      </div>)}
    </div>
    <div className="footerInput">
      <input className="input" placeholder="Write a message..." value={chatText} onChange={e=>setChatText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}/>
      <button className="btn" onClick={sendMessage}><Send size={18}/></button>
    </div>
  </div>;

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
  </div>;

  const WalletPage=()=> <div className="page">
    <div className="heading">My Wallet</div>
    <div className="panel" style={{textAlign:"center",padding:28}}>
      <Coins size={38} color={gold}/>
      <div className="sub" style={{marginTop:10}}>ELVORA Coin Balance</div>
      <div style={{fontSize:38,color:"#ffdc92",fontWeight:900}}>0</div>
      <div className="sub">Demo display · No real-money balance</div>
    </div>
    <div className="panel"><b>Coin Store</b><p className="sub">Purchases are not enabled. Secure payment setup is required.</p></div>
    <div className="panel"><b>Transaction History</b><p className="sub">No transactions yet.</p></div>
  </div>;

  const SettingsPage=()=> <div className="page">
    <div className="heading">Settings</div>
    <div className="panel row"><Avatar name={profile.name} size={65}/><div><b>{profile.name}</b><div className="sub">ELVORA Member</div></div></div>
    {[[Globe,"Language","English · Hindi"],[Shield,"Account Security","Account and privacy"],[Settings,"App Settings","Notifications and preferences"],[MessageCircle,"Feedback","Share feedback"],[Star,"About ELVORA","Community voice platform"]].map(([Icon,title,desc])=>
      <div className="panel" key={title} onClick={()=>setNotice(title+" settings")}>
        <div className="between"><div className="row"><Icon color={gold}/><div><b>{title}</b><div className="sub">{desc}</div></div></div><ChevronRight/></div>
      </div>
    )}
    <button className="btn" style={{width:"100%"}} onClick={()=>signOut(auth)}><LogOut size={17}/> Log Out</button>
  </div>;

  const ProfilePage=()=> <div className="page">
    <div className="heading">My Profile</div>
    <div className="panel" style={{textAlign:"center",padding:25}}>
      <Avatar name={profile.name} size={86}/>
      <h2 style={{color:"#ffdfaa"}}>{profile.name}</h2>
      <div className="sub">{profile.country} · ELVORA Member</div>
      <p className="sub">{profile.bio}</p>
      <button className="btn dark" onClick={()=>go("Edit Profile")}>Edit Profile</button>
    </div>
    <div className="grid2">
      <div className="stat"><b>0</b><span className="sub">Friends</span></div>
      <div className="stat"><b>0</b><span className="sub">Followers</span></div>
    </div>
    <div style={{marginTop:18}}>
      {featureCard(Wallet,"Wallet","Coins and transactions")}
      {featureCard(Crown,"VIP & Membership","Membership information")}
      {featureCard(Users,"Family","Family community")}
      {featureCard(Handshake,"Brother & Sister","Community bonds")}
      {featureCard(Heart,"CP Space","Connect with a friend")}
      {featureCard(Trophy,"Leaderboard","Community rankings")}
      {featureCard(Settings,"Settings","Account preferences")}
    </div>
  </div>;

  const EditProfile=()=> <div className="page">
    <div className="heading">Edit Profile</div>
    <div className="panel">
      <label className="sub">Username</label>
      <input className="input" value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/>
      <label className="sub">Bio</label>
      <textarea className="input" rows="3" value={profile.bio} onChange={e=>setProfile({...profile,bio:e.target.value})}/>
      <label className="sub">Country</label>
      <select className="input" value={profile.country} onChange={e=>setProfile({...profile,country:e.target.value})}>
        <option>India</option><option>Bangladesh</option><option>Nepal</option><option>Other</option>
      </select>
      <button className="btn" style={{width:"100%"}} onClick={saveProfile}>Save Profile</button>
    </div>
    <p className="sub">Photo upload aur unique ELVORA ID ke liye storage/backend setup baaki hai.</p>
  </div>;

  const MessagesPage=()=> <div className="page">
    <div className="heading">Messages & Friends</div>
    <div className="panel"><div className="row"><Bell color={gold}/><div><b>Notifications</b><div className="sub">Community updates will appear here.</div></div></div></div>
    <div className="panel"><div className="row"><Users color={gold}/><div><b>Friends</b><div className="sub">Friend requests and friend list</div></div></div></div>
    <div className="panel"><div className="row"><MessageCircle color={gold}/><div><b>Private Messages</b><div className="sub">Private chat backend is not connected yet.</div></div></div></div>
  </div>;

  const MomentPage=()=> <div className="page">
    <div className="heading">Moments</div>
    <div className="panel"><div className="row"><Camera color={gold}/><b>Community Moments</b></div><p className="sub">Community posts and media upload will be connected in a later backend update.</p></div>
  </div>;

  const FamilyPage=()=> <div className="page">
    <div className="heading">Family</div>
    <div className="panel" style={{textAlign:"center",padding:28}}>
      <Crown size={48} color={gold}/><h2 style={{color:"#ffdfaa"}}>ELVORA FAMILY</h2>
      <p className="sub">Create a community, invite members and grow together.</p>
      <button className="btn dark" onClick={()=>setNotice("Family database setup baaki hai.")}>Create Family</button>
    </div>
    <div className="panel"><b>Weekly Family Ranking</b><p className="sub">No ranking data yet.</p></div>
    <div className="panel"><b>Monthly Family Ranking</b><p className="sub">No ranking data yet.</p></div>
  </div>;

  const Leaderboard=()=> <div className="page">
    <div className="heading">Leaderboard</div>
    <div className="grid2">
      <div className="panel purple"><Trophy color={gold}/><b>Room Gifts</b><div className="sub">Coming soon</div></div>
      <div className="panel purple"><Crown color={gold}/><b>Wealth Ranking</b><div className="sub">Coming soon</div></div>
    </div>
    <div className="panel"><b>Daily · Weekly · Monthly</b><p className="sub">Ranking data will appear after backend setup.</p></div>
  </div>;

  const CPPage=()=> <div className="page">
    <div className="heading">CP Space</div>
    <div className="panel" style={{textAlign:"center",padding:30}}>
      <div className="row" style={{justifyContent:"space-around"}}>
        <Avatar name={profile.name} size={75}/><Heart size={36} color="#f1b9c2"/><Avatar name="?" size={75}/>
      </div>
      <h2 style={{color:"#ffdfaa"}}>CP Connection</h2>
      <p className="sub">Connect with a friend after mutual consent.</p>
      <button className="btn dark" onClick={()=>setNotice("CP requests ke liye secure friend system baaki hai.")}>Bind CP</button>
    </div>
  </div>;

  const SiblingPage=()=> <div className="page">
    <div className="heading">Brother & Sister</div>
    <div className="panel" style={{textAlign:"center",padding:28}}>
      <Users size={48} color={gold}/><h2 style={{color:"#ffdfaa"}}>Community Bonds</h2>
      <p className="sub">Create friendly community connections with consent.</p>
      <div className="grid2">
        <button className="btn dark" onClick={()=>setNotice("Brother request backend baaki hai.")}>Brother</button>
        <button className="btn dark" onClick={()=>setNotice("Sister request backend baaki hai.")}>Sister</button>
      </div>
    </div>
  </div>;

  let content;

  if(screen==="LiveRoom") content=<LiveRoom/>;
  else if(screen==="Create Room") content=<CreateRoom/>;
  else if(screen==="Wallet") content=<WalletPage/>;
  else if(screen==="Settings") content=<SettingsPage/>;
  else if(screen==="Edit Profile") content=<EditProfile/>;
  else if(screen==="Family") content=<FamilyPage/>;
  else if(screen==="Leaderboard") content=<Leaderboard/>;
  else if(screen==="CP Space") content=<CPPage/>;
  else if(screen==="Brother & Sister") content=<SiblingPage/>;
  else if(screen==="VIP & Membership") content=(
    <div className="page">
      <div className="heading">VIP & Membership</div>
      <div className="panel">
        <Crown color={gold} size={40}/>
        <h2>VIP Membership</h2>
        <p className="sub">VIP benefits and purchases require secure membership and payment setup.</p>
      </div>
    </div>
  );
  else if(screen==="Messages & Friends") content=<MessagesPage/>;
  else if(screen==="Moment") content=<MomentPage/>;
  else if(screen) content=(
    <div className="page">
      <div className="heading">{screen}</div>
      <div className="panel sub">This section will be connected in the next development stage.</div>
    </div>
  );
  else if(tab==="Room") content=<RoomList/>;
  else if(tab==="Moment") content=<MomentPage/>;
  else if(tab==="Message") content=<MessagesPage/>;
  else content=<ProfilePage/>;

  return <div className="app">
    <style>{css}</style>
    <Header title={screen||tab} backButton={!!screen}/>
    {notice&&<div className="panel" style={{margin:"10px 14px",color:"#ffdfaa"}} onClick={()=>setNotice("")}>{notice} <X size={14}/></div>}
    {content}
    {!screen&&<BottomNav/>}
  </div>;
}
