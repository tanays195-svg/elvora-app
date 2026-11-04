import React, { useState } from "react";
import {
  Home, Compass, MessageCircle, UserRound, Search, Bell,
  Plus, ChevronRight, Users, Mic, MicOff, Volume2, VolumeX,
  Gift, Settings, Lock, Crown, Sparkles, ArrowLeft,
  MoreHorizontal, Headphones, Radio, ShieldCheck, Globe2,
  Send, X, Heart, Music2, Gamepad2, UserPlus, Share2,
  LogOut, ImagePlus, Check, SlidersHorizontal
} from "lucide-react";
import "./styles.css";

const photo = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=500&q=85`;

const people = [
  { name: "Aarav", image: "photo-1500648767791-00dcc994a43e" },
  { name: "Riya", image: "photo-1534528741775-53994a69daeb" },
  { name: "Kabir", image: "photo-1506794778202-cad84cf45f1d" },
  { name: "Anaya", image: "photo-1524504388940-b1c1722653e1" },
  { name: "Arjun", image: "photo-1507003211169-0a1dd7228f2d" },
  { name: "Meera", image: "photo-1517841905240-472988babdf9" },
  { name: "Reyansh", image: "photo-1535713875002-d1d0cf377fde" },
  { name: "Isha", image: "photo-1529139574466-a303027c1d8b" },
];

const initialRooms = [
  {
    id: 1,
    name: "The Royal Lounge",
    category: "Friendship",
    host: "Aarav",
    people: 126,
    seats: 10,
    cover: "photo-1517248135467-4c7edcad34c4",
    tags: ["Hindi", "Friendly"],
    private: false
  },
  {
    id: 2,
    name: "Music & Chill",
    category: "Music",
    host: "Riya",
    people: 84,
    seats: 10,
    cover: "photo-1514525253161-7a46d19cd819",
    tags: ["Music", "Hindi"],
    private: false
  },
  {
    id: 3,
    name: "Night Owls",
    category: "Entertainment",
    host: "Kabir",
    people: 56,
    seats: 15,
    cover: "photo-1519671482749-fd09be7ccebf",
    tags: ["Talk", "Friends"],
    private: false
  },
  {
    id: 4,
    name: "Private Circle",
    category: "Private",
    host: "Meera",
    people: 12,
    seats: 10,
    cover: "photo-1514933651103-005eec06c04b",
    tags: ["Invite only"],
    private: true
  }
];

const navItems = [
  { name: "Home", icon: Home },
  { name: "Discover", icon: Compass },
  { name: "Messages", icon: MessageCircle },
  { name: "Friends", icon: Users },
  { name: "Profile", icon: UserRound }
];

function Avatar({ image, name, size = "medium", ring = false }) {
  return (
    <div className={`avatar avatar-${size} ${ring ? "avatar-ring" : ""}`}>
      <img src={photo(image)} alt={name} />
    </div>
  );
}

function RoomCard({ room, onJoin }) {
  return (
    <article className="room-card">
      <div className="room-cover">
        <img src={photo(room.cover)} alt={room.name} />
        <div className="cover-shade" />
        <span className="live-label"><i /> LIVE</span>
        {room.private && <span className="private-label"><Lock size={11} /> PRIVATE</span>}
        <span className="room-category">{room.category}</span>
      </div>
      <div className="room-card-body">
        <div className="room-card-title">
          <div className="room-host-avatar">
            <Avatar image={people[room.id % people.length].image} name={room.host} size="small" />
          </div>
          <div className="room-title-text">
            <h3>{room.name}</h3>
            <p>Hosted by {room.host}</p>
          </div>
          <button className="join-button" onClick={() => onJoin(room)}>Join</button>
        </div>
        <div className="room-card-footer">
          <span><Users size={14} /> {room.people} listening</span>
          <span><Mic size={14} /> {room.seats} seats</span>
          <span className="room-tags">{room.tags[0]}</span>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [tab, setTab] = useState("Home");
  const [rooms, setRooms] = useState(initialRooms);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [category, setCategory] = useState("Friendship");
  const [seatCount, setSeatCount] = useState("10");
  const [privacy, setPrivacy] = useState("Public");
  const [search, setSearch] = useState("");
  const [muted, setMuted] = useState(true);
  const [speaker, setSpeaker] = useState(true);
  const [notice, setNotice] = useState("");
  const [showRoomChat, setShowRoomChat] = useState(false);
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState([
    { name: "ELVORA", text: "Welcome to the room!" },
    { name: "Aarav", text: "Hello everyone 👋" },
    { name: "Riya", text: "Good to see you all!" }
  ]);

  const notify = (text) => {
    setNotice(text);
    window.clearTimeout(window.noticeTimer);
    window.noticeTimer = window.setTimeout(() => setNotice(""), 2400);
  };

  const filteredRooms = rooms.filter((room) =>
    `${room.name} ${room.category} ${room.host}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const createRoom = () => {
    if (!roomName.trim()) {
      notify("Please enter a room name");
      return;
    }

    const newRoom = {
      id: Date.now(),
      name: roomName.trim(),
      category,
      host: "You",
      people: 1,
      seats: Number(seatCount),
      cover: "photo-1517248135467-4c7edcad34c4",
      tags: ["New room", "India"],
      private: privacy !== "Public"
    };

    setRooms((old) => [newRoom, ...old]);
    setActiveRoom(newRoom);
    setRoomName("");
    setShowCreate(false);
    setMuted(true);
    notify("Your room is ready in preview mode");
  };

  const sendMessage = () => {
    if (!chat.trim()) return;
    setMessages((old) => [...old, { name: "You", text: chat.trim() }]);
    setChat("");
  };

  const openRoom = (room) => {
    setActiveRoom(room);
    setMuted(true);
    setShowRoomChat(false);
  };

  const closeRoom = () => {
    setActiveRoom(null);
    setShowRoomChat(false);
  };

  const renderHome = () => (
    <>
      <div className="home-greeting">
        <div>
          <span className="eyebrow">WELCOME TO ELVORA</span>
          <h1>Discover your <em>community.</em></h1>
          <p>Find your favourite people and conversations.</p>
        </div>
        <button className="round-action" onClick={() => notify("Notifications preview")}>
          <Bell size={20} />
          <i />
        </button>
      </div>

      <div className="search-wrap">
        <Search size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rooms, people..."
        />
        <SlidersHorizontal size={18} onClick={() => notify("Filters preview")} />
      </div>

      <div className="quick-categories">
        {["For You", "Popular", "Music", "Friendship", "Games"].map((item, i) => (
          <button
            key={item}
            className={i === 0 ? "category-active" : ""}
            onClick={() => {
              setSearch(i === 0 || i === 1 ? "" : item);
              setTab("Discover");
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="section-title">
        <div><span className="eyebrow">HAPPENING NOW</span><h2>Live Voice Rooms</h2></div>
        <button onClick={() => setTab("Discover")}>View all <ChevronRight size={15} /></button>
      </div>

      <div className="room-feed">
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} onJoin={openRoom} />
        ))}
        {filteredRooms.length === 0 && <div className="empty-state">No rooms found.</div>}
      </div>

      <button className="create-room-button" onClick={() => setShowCreate(true)}>
        <Plus size={19} /> Create a Voice Room
      </button>

      <div className="section-title">
        <div><span className="eyebrow">MEET PEOPLE</span><h2>Popular communities</h2></div>
        <button onClick={() => setTab("Discover")}>Explore <ChevronRight size={15} /></button>
      </div>

      <div className="community-strip">
        <div className="community-card">
          <div className="community-art art-music"><Music2 size={27} /></div>
          <strong>Music Lovers</strong><small>2.4K members</small>
        </div>
        <div className="community-card">
          <div className="community-art art-games"><Gamepad2 size={27} /></div>
          <strong>Gaming Zone</strong><small>1.8K members</small>
        </div>
        <div className="community-card">
          <div className="community-art art-friends"><Heart size={27} /></div>
          <strong>Friend Circle</strong><small>3.1K members</small>
        </div>
      </div>
    </>
  );

  const renderDiscover = () => (
    <>
      <span className="eyebrow">EXPLORE ELVORA</span>
      <h1 className="page-heading">Discover</h1>
      <div className="search-wrap">
        <Search size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a room or category..." />
      </div>
      <div className="discover-banner">
        <div>
          <span className="eyebrow">YOUR INDIA COMMUNITY</span>
          <h2>Meet people from across India.</h2>
          <p>Discover rooms and communities near your interests.</p>
        </div>
        <Globe2 size={42} />
      </div>
      <div className="section-title"><div><span className="eyebrow">BROWSE BY INTEREST</span><h2>Categories</h2></div></div>
      <div className="discover-categories">
        {[
          ["Music", Music2], ["Friendship", Heart],
          ["Games", Gamepad2], ["Entertainment", Sparkles],
          ["Study", Headphones], ["Communities", Users]
        ].map(([name, Icon]) => (
          <button key={name} onClick={() => setSearch(name)}>
            <Icon size={21} /><span>{name}</span><ChevronRight size={15} />
          </button>
        ))}
      </div>
      <div className="section-title"><div><span className="eyebrow">POPULAR RIGHT NOW</span><h2>Voice Rooms</h2></div></div>
      <div className="room-feed">
        {filteredRooms.map((room) => <RoomCard key={room.id} room={room} onJoin={openRoom} />)}
      </div>
    </>
  );

  const renderProfile = () => (
    <>
      <div className="profile-cover">
        <img src={photo("photo-1519608487953-e999c86e7455")} alt="Profile cover" />
        <div className="profile-cover-shade" />
        <button className="profile-edit-top" onClick={() => notify("Edit profile preview")}>Edit Profile</button>
      </div>
      <div className="profile-main">
        <Avatar image="photo-1500648767791-00dcc994a43e" name="ELVORA Member" size="profile" ring />
        <div className="profile-name-row">
          <div>
            <h2>ELVORA Member</h2>
            <p>ELVORA ID: 100001 <button onClick={() => notify("ID copied")}>Copy</button></p>
          </div>
          <span className="vip-badge"><Crown size={13} /> VIP 1</span>
        </div>
        <p className="profile-bio">Making new friends and enjoying good conversations.</p>
      </div>

      <div className="profile-stats">
        <div><strong>128</strong><span>Following</span></div>
        <div><strong>2.5K</strong><span>Followers</span></div>
        <div><strong>86</strong><span>Friends</span></div>
      </div>

      <div className="vip-panel">
        <div className="vip-panel-top">
          <div><Crown size={19} /><strong>ELVORA VIP</strong></div>
          <span>LEVEL 1</span>
        </div>
        <p>Unlock profile frames, room decorations and member benefits.</p>
        <div className="vip-progress"><span /></div>
        <small>Membership preview · No payment connected</small>
      </div>

      <div className="profile-menu">
        {[
          [UserRound, "Personal information", "Edit your profile"],
          [Gift, "Gifts & collections", "Your received gifts"],
          [Sparkles, "VIP membership", "Membership benefits"],
          [Users, "My communities", "Your joined communities"],
          [ShieldCheck, "Privacy & safety", "Manage your privacy"],
          [Settings, "Settings", "App preferences"]
        ].map(([Icon, title, subtitle]) => (
          <button key={title} onClick={() => notify(`${title} preview`)}>
            <span className="menu-icon"><Icon size={19} /></span>
            <span className="menu-text"><strong>{title}</strong><small>{subtitle}</small></span>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
    </>
  );

  const renderFriends = () => (
    <>
      <span className="eyebrow">YOUR PEOPLE</span>
      <h1 className="page-heading">Friends</h1>
      <div className="profile-stats friend-stats">
        <div><strong>86</strong><span>Friends</span></div>
        <div><strong>2.5K</strong><span>Followers</span></div>
        <div><strong>128</strong><span>Following</span></div>
      </div>
      <div className="search-wrap"><Search size={18} /><input placeholder="Search by name or ELVORA ID..." /></div>
      <div className="section-title"><div><span className="eyebrow">YOUR CIRCLE</span><h2>Suggested people</h2></div></div>
      <div className="people-list">
        {people.slice(0, 6).map((person, i) => (
          <div className="person-row" key={person.name}>
            <Avatar image={person.image} name={person.name} />
            <div><strong>{person.name}</strong><small>{i % 2 ? "Music lover" : "ELVORA member"}</small></div>
            <button onClick={() => notify("Friend request preview")}><UserPlus size={16} /> Add</button>
          </div>
        ))}
      </div>
    </>
  );

  const renderMessages = () => (
    <>
      <span className="eyebrow">STAY CONNECTED</span>
      <h1 className="page-heading">Messages</h1>
      <div className="search-wrap"><Search size={18} /><input placeholder="Search conversations..." /></div>
      <div className="people-list">
        {people.slice(0, 5).map((person, i) => (
          <button className="person-row message-person" key={person.name} onClick={() => notify("Private chat needs backend connection")}>
            <Avatar image={person.image} name={person.name} />
            <div><strong>{person.name}</strong><small>{i === 0 ? "Hello! Welcome to ELVORA." : "Tap to open conversation"}</small></div>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
      <p className="preview-note">Messages shown here are a preview. Cloud messaging is not connected yet.</p>
    </>
  );

  const renderRoom = () => {
    const seatLimit = activeRoom.seats || 10;
    return (
      <div className="room-page">
        <div className="room-top-actions">
          <button onClick={closeRoom}><ArrowLeft size={21} /></button>
          <span><Radio size={15} /> LIVE ROOM</span>
          <button onClick={() => notify("Room options preview")}><MoreHorizontal size={22} /></button>
        </div>

        <div className="room-hero">
          <img src={photo(activeRoom.cover)} alt={activeRoom.name} />
          <div className="room-hero-shade" />
          <div className="room-hero-info">
            <span className="room-live-pill"><i /> LIVE NOW</span>
            <h1>{activeRoom.name}</h1>
            <p>{activeRoom.category} · Hosted by {activeRoom.host}</p>
            <div><Users size={14} /> {activeRoom.people} people listening</div>
          </div>
        </div>

        <div className="room-stage-heading">
          <div><span className="eyebrow">LIVE CONVERSATION</span><h2>On the stage</h2></div>
          <span className="seat-count">{seatLimit} MIC SEATS</span>
        </div>

        <div className={`stage-grid ${seatLimit === 2 ? "stage-two" : ""} ${seatLimit >= 15 ? "stage-many" : ""}`}>
          {Array.from({ length: seatLimit }, (_, i) => {
            const person = i === 0
              ? { name: activeRoom.host, image: people[0].image }
              : people[(i - 1) % people.length];
            const occupied = i < Math.min(people.length, Math.max(1, activeRoom.people > 1 ? 8 : 1));
            return (
              <button className={`stage-seat ${i === 0 ? "host-seat" : ""}`} key={i}
                onClick={() => notify(occupied ? `${person.name} is on stage` : "Seat request preview")}>
                <div className="stage-avatar-wrap">
                  {occupied
                    ? <Avatar image={person.image} name={person.name} size="stage" ring={i === 0} />
                    : <div className="empty-seat"><Plus size={22} /></div>}
                  {occupied && <span className="seat-mic"><Mic size={11} /></span>}
                </div>
                <strong>{occupied ? person.name : "Empty seat"}</strong>
                {i === 0 && <small>HOST</small>}
              </button>
            );
          })}
        </div>

        <div className="listener-bar">
          <div className="listener-avatars">
            {people.slice(0, 4).map((person) => <Avatar key={person.name} image={person.image} name={person.name} size="tiny" />)}
          </div>
          <span>{activeRoom.people} listening</span>
          <button onClick={() => notify("Listener list preview")}>View all</button>
        </div>

        {showRoomChat && (
          <div className="room-chat-panel">
            <div className="chat-panel-heading"><strong>Room chat</strong><button onClick={() => setShowRoomChat(false)}><X size={18} /></button></div>
            <div className="room-chat-messages">
              {messages.map((m, i) => <p key={i}><strong>{m.name}</strong> {m.text}</p>)}
            </div>
            <div className="room-chat-input">
              <input value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Say something..." onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
              <button onClick={sendMessage}><Send size={17} /></button>
            </div>
          </div>
        )}

        <div className="room-controls">
          <button onClick={() => setMuted(!muted)} className={muted ? "control-muted" : "control-active"}>
            {muted ? <MicOff size={21} /> : <Mic size={21} />}<small>{muted ? "Muted" : "Mic on"}</small>
          </button>
          <button onClick={() => setSpeaker(!speaker)}>
            {speaker ? <Volume2 size={21} /> : <VolumeX size={21} />}<small>Speaker</small>
          </button>
          <button onClick={() => notify("Invite preview")}><Share2 size={21} /><small>Invite</small></button>
          <button onClick={() => notify("Gift catalogue preview")}><Gift size={21} /><small>Gifts</small></button>
          <button onClick={() => setShowRoomChat(!showRoomChat)}><MessageCircle size={21} /><small>Chat</small></button>
          <button onClick={() => notify("Room settings preview")}><Settings size={21} /><small>Manage</small></button>
        </div>
        <button className="leave-room-button" onClick={closeRoom}><LogOut size={17} /> Leave room</button>
        <p className="preview-note">Room interface preview · Real voice audio needs a voice server.</p>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand-lockup" onClick={() => { setTab("Home"); closeRoom(); }}>
          <span className="brand-symbol">E</span>
          <span><strong>ELVORA</strong><small>VOICE COMMUNITY</small></span>
        </button>
        <div className="header-actions">
          <button onClick={() => notify("Search preview")}><Search size={20} /></button>
          <button onClick={() => notify("Notifications preview")} className="notification-button"><Bell size={20} /><i /></button>
        </div>
      </header>

      {notice && <div className="toast-message">{notice}</div>}

      {activeRoom ? (
        renderRoom()
      ) : (
        <main className="main-content">
          {tab === "Home" && renderHome()}
          {tab === "Discover" && renderDiscover()}
          {tab === "Messages" && renderMessages()}
          {tab === "Friends" && renderFriends()}
          {tab === "Profile" && renderProfile()}
        </main>
      )}

      {!activeRoom && (
        <nav className="bottom-navigation">
          {navItems.map(({ name, icon: Icon }) => (
            <button key={name} className={tab === name ? "nav-selected" : ""} onClick={() => { setTab(name); setSearch(""); }}>
              <Icon size={21} strokeWidth={tab === name ? 2.5 : 1.8} />
              <small>{name}</small>
            </button>
          ))}
          <button className="nav-create" onClick={() => setShowCreate(true)}><Plus size={24} /><small>Create</small></button>
        </nav>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <div><span className="eyebrow">START A CONVERSATION</span><h2>Create a room</h2></div>
              <button onClick={() => setShowCreate(false)}><X size={21} /></button>
            </div>
            <label>Room name</label>
            <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Enter your room name" />
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {["Friendship", "Music", "Entertainment", "Games", "Study", "Community"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <label>Microphone seats</label>
            <div className="seat-options">
              {["2", "10", "15", "20"].map((n) => (
                <button key={n} className={seatCount === n ? "seat-option-selected" : ""} onClick={() => setSeatCount(n)}>{n}</button>
              ))}
            </div>
            <label>Room privacy</label>
            <div className="privacy-options">
              {["Public", "Private", "Locked"].map((p) => (
                <button key={p} className={privacy === p ? "privacy-selected" : ""} onClick={() => setPrivacy(p)}>
                  {p === "Public" ? <Globe2 size={16} /> : <Lock size={16} />}{p}
                </button>
              ))}
            </div>
            <button className="create-confirm" onClick={createRoom}><Plus size={18} /> Create room</button>
            <p className="modal-footnote">This creates a local preview room. Online hosting will be added with the backend.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
