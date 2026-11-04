import React, {useState} from 'react';
import {
  Home, Compass, MessageCircle, UserRound, Search, Bell, Crown, Mic, MicOff,
  Headphones, Gift, Users, Heart, Plus, ChevronRight, MoreHorizontal, ShieldCheck,
  Settings, Send, Lock, Sparkles, Radio, Star, Wallet, Flag, X, Check, Volume2
} from 'lucide-react';

const rooms = [
 {name:'Midnight Lounge',topic:'Late night conversations',host:'Aarav',count:126,tag:'TRENDING',color:'plum',faces:['A','M','R','S']},
 {name:'The Music Circle',topic:'Songs, stories & good vibes',host:'Mira',count:84,tag:'MUSIC',color:'blue',faces:['M','K','T','J']},
 {name:'Daily Talks',topic:'Meet new people safely',host:'Zoya',count:52,tag:'CHILL',color:'rose',faces:['Z','A','P','N']},
 {name:'Creators Hub',topic:'Ideas, creativity & community',host:'Dev',count:39,tag:'COMMUNITY',color:'gold',faces:['D','S','I','V']}
];
const chats = [
 {name:'Mira',text:'That was such a good song!',time:'2m',unread:2,color:'rose'},
 {name:'Creators Hub',text:'Welcome everyone 👋',time:'18m',unread:4,color:'gold'},
 {name:'Aarav',text:'See you in the lounge',time:'1h',unread:0,color:'blue'},
 {name:'Zoya',text:'Thanks for joining!',time:'Yesterday',unread:0,color:'plum'}
];
const communities = [
 {name:'The Chill Club',members:'12.8K members',desc:'A friendly place for everyday conversations.',color:'plum',icon:'✦'},
 {name:'Music & Moments',members:'8.4K members',desc:'Share music discoveries and creative moments.',color:'blue',icon:'♫'},
 {name:'Creators Circle',members:'5.2K members',desc:'Ideas, projects and positive inspiration.',color:'gold',icon:'✧'}
];
const gifts = [{icon:'🌹',name:'Rose',price:10},{icon:'⭐',name:'Golden Star',price:50},{icon:'🎁',name:'Mystery Box',price:100},{icon:'👑',name:'Royal Crown',price:500}];
function Face({letter,color='plum',size='md',online=false}){return <span className={`face ${color} ${size}`}>{letter}<i className={online?'show':''}/></span>}
function Header({title,sub,action}){return <div className="page-head"><div><div className="eyebrow">{sub}</div><h2>{title}</h2></div>{action}</div>}
function App(){
 const [tab,setTab]=useState('Home');
 const [activeRoom,setActiveRoom]=useState(null);
 const [muted,setMuted]=useState(true);
 const [joined,setJoined]=useState(false);
 const [modal,setModal]=useState('');
 const [toast,setToast]=useState('');
 const [balance,setBalance]=useState(1200);
 const [selectedGift,setSelectedGift]=useState(gifts[0]);
 const [joinedCommunities,setJoinedCommunities]=useState([]);
 const [query,setQuery]=useState('');
 const [message,setMessage]=useState('');
 const [sent,setSent]=useState([]);
 const notify=(s)=>{setToast(s);setTimeout(()=>setToast(''),2200)};
 const openRoom=(r)=>{setActiveRoom(r);setJoined(false);setTab('Rooms')};
 const leaveRoom=()=>{setJoined(false);setActiveRoom(null);notify('You left the room preview')};
 const nav=[['Home',Home],['Discover',Compass],['Rooms',Headphones],['Messages',MessageCircle],['Profile',UserRound]];
 const filtered=rooms.filter(r=>(r.name+' '+r.topic).toLowerCase().includes(query.toLowerCase()));
 return <div className="app-shell">
  <header className="topbar">
   <div className="brand"><div className="brand-symbol">E</div><div><b>ELVORA</b><small>YOUR SOCIAL UNIVERSE</small></div></div>
   <div className="top-actions"><button className="icon-btn" onClick={()=>setModal('notifications')} aria-label="Notifications"><Bell size={19}/><i/></button><button className="wallet-chip" onClick={()=>setModal('wallet')}><span>✦</span>{balance.toLocaleString()}</button></div>
  </header>
  <main className="content">
   {tab==='Home'&&<div className="screen">
    <section className="hero"><div className="hero-copy"><div className="eyebrow">WEDNESDAY, YOUR WAY</div><h1>Find your people.<br/><em>Find your room.</em></h1><p>Good conversations start with a hello.</p><button className="gold-btn" onClick={()=>setTab('Discover')}>Explore ELVORA <ChevronRight size={17}/></button></div><div className="hero-orb"><div className="orb-core">E</div><span className="orbit o1"/><span className="orbit o2"/><span className="orbit o3"/></div></section>
    <div className="section-title"><div><div className="eyebrow">LIVE RIGHT NOW</div><h3>Rooms worth dropping into</h3></div><button className="link-btn" onClick={()=>setTab('Discover')}>See all <ChevronRight size={14}/></button></div>
    <div className="room-stack">{rooms.slice(0,3).map(r=><RoomCard key={r.name} room={r} onClick={()=>openRoom(r)}/>)}</div>
    <div className="section-title"><div><div className="eyebrow">YOUR CORNER</div><h3>Explore more</h3></div></div>
    <div className="quick-grid"><button onClick={()=>setTab('Communities')}><Users/><b>Communities</b><small>Find your circle</small></button><button onClick={()=>setModal('gifts')}><Gift/><b>Gift studio</b><small>Send a little joy</small></button><button onClick={()=>setModal('vip')}><Crown/><b>ELVORA VIP</b><small>Premium perks</small></button><button onClick={()=>setTab('Messages')}><MessageCircle/><b>Messages</b><small>Stay connected</small></button></div>
   </div>}
   {tab==='Discover'&&<div className="screen"><Header title="Discover" sub="FIND YOUR NEXT CONVERSATION" action={<button className="icon-btn" onClick={()=>notify('Filters coming soon')}><Compass size={19}/></button>}/><div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search rooms and topics"/></div><div className="chips"><span className="chip selected">For you</span><span className="chip">Trending</span><span className="chip">Music</span><span className="chip">Talk</span></div><div className="room-stack">{filtered.map(r=><RoomCard key={r.name} room={r} onClick={()=>openRoom(r)}/>)}</div><div className="safety-note"><ShieldCheck size={17}/> Explore respectfully. Block and report tools are available in community controls.</div></div>}
   {tab==='Rooms'&&<div className="screen">{activeRoom?<><button className="back-link" onClick={()=>{setActiveRoom(null);setJoined(false)}}>← All rooms</button><div className={`room-banner ${activeRoom.color}`}><div className="eyebrow">ELVORA VOICE ROOM</div><h2>{activeRoom.name}</h2><p>{activeRoom.topic}</p><div className="room-live"><span className="pulse"/> ROOM PREVIEW · {activeRoom.count} LISTENERS</div></div><div className="stage-head"><div><div className="eyebrow">ON THE STAGE</div><h3>Speakers</h3></div><span className="stage-count">8 SEATS</span></div><div className="stage-grid">{['A','M','R','S','J','K','+','+'].map((f,i)=><div className="stage-seat" key={i}><Face letter={f} color={['plum','rose','blue','gold'][i%4]} size="lg" online={i<4}/><b>{i<4?['Aarav','Mira','Rohan','Sara'][i]:'Open seat'}</b><small>{i===0?'Host':i<4?'Listener':'Request to speak'}</small></div>)}</div><div className="room-controls"><button className={muted?'control-muted':'control-on'} onClick={()=>setMuted(!muted)}>{muted?<MicOff/>:<Mic/>}<small>{muted?'Unmute':'Mute'}</small></button><button className="control-main" onClick={()=>joined?leaveRoom():(setJoined(true),notify('Joined room preview'))}>{joined?'Leave room':'Join room'}</button><button className="control-muted" onClick={()=>setModal('gifts')}><Gift/><small>Gifts</small></button></div>{joined&&<div className="demo-alert">Preview mode: voice transport is not connected yet.</div>}<div className="section-title"><h3>Room chat</h3><span className="stage-count">PREVIEW</span></div><div className="chat-preview"><p><b>Mira</b> Welcome in! ✨</p><p><b>Rohan</b> Good evening everyone.</p><p><b>Sara</b> Nice to meet you all.</p></div></>:<><Header title="Voice rooms" sub="LISTEN IN · JOIN THE CONVERSATION"/><div className="room-stack">{rooms.map(r=><RoomCard key={r.name} room={r} onClick={()=>setActiveRoom(r)}/>)}</div><button className="outline-wide" onClick={()=>setModal('createRoom')}><Plus size={17}/> Create a room</button></>}</div>}
   {tab==='Messages'&&<div className="screen"><Header title="Messages" sub="YOUR CONVERSATIONS" action={<button className="icon-btn" onClick={()=>notify('New chat setup coming soon')}><Plus/></button>}/>{chats.map(c=><button className="chat-row" key={c.name} onClick={()=>setModal('chat:'+c.name)}><Face letter={c.name[0]} color={c.color} size="lg" online/><span className="chat-info"><b>{c.name}</b><small>{c.text}</small></span><span className="chat-time">{c.time}{c.unread>0&&<i>{c.unread}</i>}</span></button>)}<div className="safety-note"><ShieldCheck size={17}/> Only message people you know or trust. You can block or report accounts.</div></div>}
   {tab==='Profile'&&<div className="screen"><Header title="My profile" sub="YOUR ELVORA IDENTITY" action={<button className="icon-btn" onClick={()=>setModal('settings')}><Settings/></button>}/><div className="profile-card"><Face letter="T" color="gold" size="xl" online/><h2>Your profile</h2><p className="muted">@elvora_member · ID 800124</p><p className="profile-bio">Making space for good conversations.</p><div className="stats"><div><b>128</b><small>Friends</small></div><div><b>640</b><small>Followers</small></div><div><b>12</b><small>Following</small></div></div><button className="outline-wide" onClick={()=>notify('Profile editor coming soon')}>Edit profile</button></div><div className="profile-links"><button onClick={()=>setModal('vip')}><Crown/> VIP membership <ChevronRight/></button><button onClick={()=>setModal('wallet')}><Wallet/> My wallet <ChevronRight/></button><button onClick={()=>setModal('safety')}><ShieldCheck/> Safety & privacy <ChevronRight/></button><button onClick={()=>setModal('settings')}><Settings/> Settings <ChevronRight/></button></div></div>}
   {tab==='Communities'&&<div className="screen"><Header title="Communities" sub="BELONG TO SOMETHING GOOD" action={<button className="icon-btn" onClick={()=>notify('Community creation coming soon')}><Plus/></button>}/>{communities.map(c=><div className="community-card" key={c.name}><div className={`community-art ${c.color}`}>{c.icon}</div><div className="community-copy"><b>{c.name}</b><small>{c.members}</small><p>{c.desc}</p><button className="join-small" onClick={()=>setJoinedCommunities(old=>old.includes(c.name)?old.filter(x=>x!==c.name):[...old,c.name])}>{joinedCommunities.includes(c.name)?'Joined ✓':'Join community'}</button></div></div>)}</div>}
  </main>
  <nav className="bottom-nav">{nav.map(([name,Icon])=><button key={name} className={tab===name?'active':''} onClick={()=>setTab(name)}><Icon size={20}/><small>{name}</small></button>)}</nav>
  {toast&&<div className="toast">{toast}</div>}
  {modal&&<div className="modal-backdrop" onClick={()=>setModal('')}><div className="modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setModal('')}><X size={18}/></button><ModalContent type={modal} balance={balance} setBalance={setBalance} selectedGift={selectedGift} setSelectedGift={setSelectedGift} notify={notify} message={message} setMessage={setMessage} sent={sent} setSent={setSent}/></div></div>}
 </div>
}
function RoomCard({room,onClick}){return <button className="room-card" onClick={onClick}><div className={`room-art ${room.color}`}><span className="room-art-mark">{room.color==='gold'?'✧':room.color==='blue'?'◈':'✦'}</span><span className="room-tag">{room.tag}</span></div><div className="room-info"><b>{room.name}</b><small>{room.topic}</small><div className="room-bottom"><div className="face-row">{room.faces.map((f,i)=><Face key={i} letter={f} color={['plum','rose','blue','gold'][i]} size="xs"/>)}</div><span><i className="pulse"/> {room.count} here</span></div></div><ChevronRight className="room-arrow" size={17}/></button>}
function ModalContent({type,balance,setBalance,selectedGift,setSelectedGift,notify,message,setMessage,sent,setSent}){
 if(type==='gifts')return <><div className="eyebrow">SHARE A LITTLE JOY</div><h2>Gift studio</h2><p className="muted">Choose a gift for someone in the room.</p><div className="gift-grid">{gifts.map(g=><button className={selectedGift.name===g.name?'gift-item chosen':'gift-item'} key={g.name} onClick={()=>setSelectedGift(g)}><span>{g.icon}</span><b>{g.name}</b><small>✦ {g.price}</small></button>)}</div><div className="modal-footer"><span>Balance: ✦ {balance}</span><button className="gold-btn" onClick={()=>{if(balance>=selectedGift.price){setBalance(balance-selectedGift.price);notify(`${selectedGift.name} gift demo sent`)}else notify('Not enough demo credits')}}>Send gift · ✦ {selectedGift.price}</button></div><p className="fine-print">Demo credits only. No real-money purchases or transfers.</p></>;
 if(type==='wallet')return <><div className="eyebrow">YOUR ELVORA WALLET</div><h2>✦ {balance.toLocaleString()}</h2><p className="muted">Demo credits balance</p><div className="wallet-info"><Wallet/> Wallet and payment features are not connected. No money is stored here.</div></>;
 if(type==='vip')return <><div className="eyebrow">THE PREMIUM EXPERIENCE</div><h2><Crown className="inline-icon"/> ELVORA VIP</h2><p className="muted">A premium membership concept for your profile.</p><div className="vip-perks"><p><Star/> Exclusive profile frames</p><p><Sparkles/> Special room themes</p><p><Gift/> Member gift collection</p><p><ShieldCheck/> Enhanced account controls</p></div><button className="gold-btn full" onClick={()=>notify('VIP membership is a design preview')}>Explore VIP preview</button><p className="fine-print">Membership purchase is not enabled.</p></>;
 if(type==='createRoom')return <><div className="eyebrow">START A CONVERSATION</div><h2>Create a room</h2><p className="muted">Room creation form preview. Hosting will be enabled after backend setup.</p><input className="modal-input" placeholder="Room name"/><button className="gold-btn full" onClick={()=>notify('Room creation needs server setup')}>Continue</button></>;
 if(type==='notifications')return <><div className="eyebrow">STAY IN THE LOOP</div><h2>Notifications</h2><p className="muted">You're all caught up. New activity will appear here when notifications are connected.</p></>;
 if(type==='safety')return <><div className="eyebrow">YOUR SAFETY MATTERS</div><h2>Safety & privacy</h2><div className="vip-perks"><p><ShieldCheck/> Block accounts that bother you</p><p><Flag/> Report harmful behaviour</p><p><Lock/> Keep personal details private</p></div><p className="fine-print">Safety tools shown here are design previews and must be connected to backend moderation before public launch.</p></>;
 if(type==='settings')return <><div className="eyebrow">MAKE IT YOURS</div><h2>Settings</h2><div className="vip-perks"><p><Lock/> Privacy controls</p><p><Bell/> Notification preferences</p><ShieldCheck/> Account safety</div><p className="fine-print">Settings will be connected to your account after authentication is implemented.</p></>;
 if(type.startsWith('chat:'))return <><div className="eyebrow">PRIVATE CONVERSATION</div><h2>{type.slice(5)}</h2><div className="chat-preview"><p><b>{type.slice(5)}</b> Hey! Welcome to ELVORA.</p>{sent.map((s,i)=><p className="mine" key={i}>{s}</p>)}</div><div className="send-row"><input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write a message..."/><button onClick={()=>{if(message.trim()){setSent([...sent,message.trim()]);setMessage('')}}}><Send size={17}/></button></div><p className="fine-print">Local demo conversation. Messages are not sent to another user.</p></>;
 return null;
}
