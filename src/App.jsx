import React, { useState } from "react";
import "./styles.css";

const rooms = [
  { id: 1, name: "ELVORA Lounge", category: "Friendship", host: "Alex", people: 12, live: true },
  { id: 2, name: "Music World", category: "Music", host: "Sarah", people: 8, live: true },
  { id: 3, name: "Night Talks", category: "Entertainment", host: "David", people: 5, live: true },
  { id: 4, name: "Gaming Club", category: "Games", host: "Ryan", people: 10, live: true },
];

const tabs = [
  ["Home", "⌂"],
  ["Friends", "♧"],
  ["Voice", "◉"],
  ["Messages", "✉"],
  ["Profile", "♙"],
];

function App() {
  const [tab, setTab] = useState("Home");
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [category, setCategory] = useState("Friendship");
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [search, setSearch] = useState("");
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState([
    { name: "ELVORA", text: "Welcome to ELVORA!" },
    { name: "Alex", text: "Hello everyone!" },
  ]);
  const [notice, setNotice] = useState("");
  const [accent, setAccent] = useState("#d9ad55");

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };

  const sendMessage = () => {
    if (!chat.trim()) return;
    setMessages([...messages, { name: "You", text: chat }]);
    setChat("");
  };

  const createRoom = () => {
    if (!roomName.trim()) {
      showNotice("Please enter a room name");
      return;
    }
    const newRoom = {
      id: Date.now(),
      name: roomName,
      category,
      host: "You",
      people: 1,
      live: true,
    };
    rooms.unshift(newRoom);
    setShowCreate(false);
    setRoomName("");
    setActiveRoom(newRoom);
    showNotice("Room created in preview mode");
  };

  const visibleRooms = rooms.filter((room) =>
    `${room.name} ${room.category} ${room.host}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app" style={{ "--accent": accent }}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">E</div>
          <div>
            <div className="brand-name">ELVORA</div>
            <div className="brand-sub">CONNECT • SHARE • BELONG</div>
          </div>
        </div>
        <button className="icon-button" onClick={() => setTab("Settings")}>⚙</button>
      </header>

      {notice && <div className="toast">{notice}</div>}

      {activeRoom ? (
        <main className="room-screen">
          <button className="back-button" onClick={() => setActiveRoom(null)}>← Back</button>
          <div className="room-heading">
            <span className="live-dot" /> LIVE ROOM
            <h1>{activeRoom.name}</h1>
            <p>{activeRoom.category} · {activeRoom.people}/16 participants</p>
          </div>

          <div className="host-area">
            <div className="host-ring"><div className="avatar host-avatar">👑</div></div>
            <strong>{activeRoom.host}</strong>
            <span className="host-label">ROOM HOST</span>
          </div>

          <div className="seat-grid">
            {Array.from({ length: 15 }, (_, i) => (
              <div className="seat" key={i}>
                <div className="seat-avatar">{i < activeRoom.people - 1 ? ["🌟", "🎧", "😊", "🎵"][i % 4] : "+"}</div>
                <small>{i < activeRoom.people - 1 ? `User ${i + 1}` : "Empty"}</small>
              </div>
            ))}
          </div>

          <div className="room-toolbar">
            <button onClick={() => setMuted(!muted)}>{muted ? "🔇" : "🎙"}<small>{muted ? "Unmute" : "Mic"}</small></button>
            <button onClick={() => setSpeaker(!speaker)}>{speaker ? "🔊" : "🔈"}<small>Speaker</small></button>
            <button onClick={() => showNotice("Invite feature needs backend setup")}>♧<small>Invite</small></button>
            <button onClick={() => showNotice("Virtual gift preview")}>🎁<small>Gifts</small></button>
            <button onClick={() => showNotice("Room chat preview")}>✉<small>Chat</small></button>
            <button onClick={() => showNotice("Room settings")}>⚙<small>Settings</small></button>
          </div>
          <button className="leave-button" onClick={() => setActiveRoom(null)}>Leave Room</button>
          <p className="preview-note">Preview interface only · Live audio requires server connection</p>
        </main>
      ) : (
        <main className="content">
          {tab === "Home" && (
            <>
              <section className="welcome">
                <div>
                  <span className="eyebrow">WELCOME TO YOUR WORLD</span>
                  <h1>Find your <span>people.</span></h1>
                  <p>Discover conversations, communities and live rooms.</p>
                </div>
                <div className="welcome-symbol">E</div>
              </section>

              <div className="section-heading">
                <div><span className="eyebrow">DISCOVER</span><h2>Live Rooms</h2></div>
                <button className="text-button" onClick={() => setTab("Voice")}>See all →</button>
              </div>

              <input className="search-box" placeholder="⌕  Search rooms, people..." value={search} onChange={(e) => setSearch(e.target.value)} />

              <div className="room-list">
                {visibleRooms.map((room) => (
                  <div className="room-card" key={room.id}>
                    <div className="room-art"><span>✦</span><small>ELVORA</small></div>
                    <div className="room-info">
                      <span className="category">{room.category}</span>
                      <h3>{room.name}</h3>
                      <p>Host: {room.host}</p>
                      <small>◉ {room.people} / 16 people</small>
                    </div>
                    <button className="join-button" onClick={() => setActiveRoom(room)}>Join</button>
                  </div>
                ))}
                {visibleRooms.length === 0 && <p className="empty">No rooms found.</p>}
              </div>
              <button className="primary-button" onClick={() => setShowCreate(true)}>＋ Create a Room</button>

              <div className="section-heading"><div><span className="eyebrow">EXPLORE</span><h2>Categories</h2></div></div>
              <div className="category-grid">
                {["🎵 Music", "💬 Friendship", "🎮 Games", "✨ Entertainment", "🌍 Public", "🔒 Private"].map((item) => (
                  <button key={item} onClick={() => { setSearch(item.split(" ").slice(1).join(" ")); setTab("Voice"); }}>{item}</button>
                ))}
              </div>
            </>
          )}

          {tab === "Friends" && (
            <>
              <span className="eyebrow">YOUR COMMUNITY</span><h1>Friends</h1>
              <div className="stat-grid">
                <div className="stat-card"><strong>0</strong><small>Friends</small></div>
                <div className="stat-card"><strong>0</strong><small>Followers</small></div>
                <div className="stat-card"><strong>0</strong><small>Following</small></div>
              </div>
              <input className="search-box" placeholder="Search users by name or ID..." />
              <div className="empty-card">Your friends will appear here.</div>
            </>
          )}

          {tab === "Voice" && (
            <>
              <span className="eyebrow">JOIN THE CONVERSATION</span><h1>Voice Rooms</h1>
              <input className="search-box" placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="room-list">
                {visibleRooms.map((room) => (
                  <div className="room-card" key={room.id}>
                    <div className="room-art"><span>✦</span></div>
                    <div className="room-info"><span className="category">{room.category}</span><h3>{room.name}</h3><p>Host: {room.host}</p><small>{room.people}/16 participants</small></div>
                    <button className="join-button" onClick={() => setActiveRoom(room)}>Join</button>
                  </div>
                ))}
              </div>
              <button className="primary-button" onClick={() => setShowCreate(true)}>＋ Create a Room</button>
            </>
          )}

          {tab === "Messages" && (
            <>
              <span className="eyebrow">STAY CONNECTED</span><h1>Messages</h1>
              <div className="chat-panel">
                <div className="chat-messages">
                  {messages.map((message, i) => <div className="message" key={i}><strong>{message.name}</strong><p>{message.text}</p></div>)}
                </div>
                <div className="chat-input-row">
                  <input value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Write a message..." onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
                  <button onClick={sendMessage}>➤</button>
                </div>
              </div>
              <p className="preview-note">Local preview chat · Cloud messaging is not connected yet</p>
              <button className="secondary-button" onClick={() => showNotice("Voice message needs audio backend")}>🎙 Voice Message</button>
              <button className="secondary-button" onClick={() => showNotice("Image sharing needs storage setup")}>＋ Share Image</button>
            </>
          )}

          {tab === "Profile" && (
            <>
              <span className="eyebrow">YOUR ELVORA IDENTITY</span><h1>My Profile</h1>
              <div className="profile-card">
                <div className="profile-avatar">👤</div>
                <h2>ELVORA Member</h2>
                <p>ELVORA ID: Not assigned</p>
                <div className="level-pill">LEVEL 1 · NEW MEMBER</div>
              </div>
              <div className="stat-grid">
                <div className="stat-card"><strong>0</strong><small>Friends</small></div>
                <div className="stat-card"><strong>0</strong><small>Followers</small></div>
                <div className="stat-card"><strong>0</strong><small>Following</small></div>
              </div>
              {["Edit Profile", "VIP / SVIP / Royal VIP", "Gifts & Frames", "Family & Community", "Achievements", "Settings", "Privacy & Safety"].map((item) => (
                <button className="menu-row" key={item} onClick={() => setTab(item === "Settings" || item === "Privacy & Safety" ? "Settings" : "Profile")}>{item}<span>›</span></button>
              ))}
            </>
          )}

          {tab === "Settings" && (
            <>
              <span className="eyebrow">MAKE IT YOURS</span><h1>Settings</h1>
              <div className="settings-card">
                <h3>Appearance</h3>
                <p>Choose your accent colour</p>
                <div className="colour-row">
                  {["#d9ad55", "#a78bfa", "#60a5fa", "#f28b82", "#55c9a5"].map((colour) => (
                    <button key={colour} style={{ background: colour }} onClick={() => setAccent(colour)} aria-label="Choose accent colour" />
                  ))}
                </div>
              </div>
              {["Language", "Privacy Controls", "Notifications", "Blocked Users", "Help & Support", "About ELVORA", "Log Out"].map((item) => (
                <button className="menu-row" key={item} onClick={() => showNotice(item + " settings need configuration")}>{item}<span>›</span></button>
              ))}
            </>
          )}
        </main>
      )}

      {!activeRoom && (
        <nav className="bottom-nav">
          {tabs.map(([name, icon]) => (
            <button className={tab === name ? "active" : ""} key={name} onClick={() => setTab(name)}>
              <span>{icon}</span><small>{name}</small>
            </button>
          ))}
        </nav>
      )}

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            <span className="eyebrow">START A CONVERSATION</span>
            <h2>Create Voice Room</h2>
            <label>Room name</label>
            <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Enter room name" />
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {["Music", "Friendship", "Entertainment", "Games", "Public", "Private"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <p className="preview-note">Maximum room capacity: 16 seats</p>
            <button className="primary-button" onClick={createRoom}>Create Room</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
