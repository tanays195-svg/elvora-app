import React, { useState } from "react";

const initialRooms = [
  { id: 1, name: "India Friendship Club", host: "ELVORA Host", category: "Friendship", city: "All India", listeners: 124, color: "#8b5cf6", live: true },
  { id: 2, name: "Late Night Talks", host: "Music Lover", category: "General Talk", city: "Kolkata", listeners: 86, color: "#ec4899", live: true },
  { id: 3, name: "Music Lovers India", host: "DJ Star", category: "Music", city: "Mumbai", listeners: 72, color: "#06b6d4", live: true },
  { id: 4, name: "Gaming Zone", host: "Gamer Boy", category: "Gaming", city: "Delhi", listeners: 48, color: "#f59e0b", live: true },
  { id: 5, name: "Study Together", host: "Study Partner", category: "Study", city: "All India", listeners: 29, color: "#10b981", live: false },
  { id: 6, name: "New Friends Corner", host: "Friendly Host", category: "Friendship", city: "Siliguri", listeners: 37, color: "#d946ef", live: true }
];

const newUsers = [
  { name: "Aarav", city: "Delhi", emoji: "😊", color: "#7c3aed" },
  { name: "Riya", city: "Kolkata", emoji: "🌸", color: "#db2777" },
  { name: "Kabir", city: "Mumbai", emoji: "😎", color: "#0891b2" },
  { name: "Ananya", city: "Siliguri", emoji: "✨", color: "#059669" },
  { name: "Dev", city: "Jaipur", emoji: "🎧", color: "#d97706" }
];

const cities = ["All India", "Kolkata", "Delhi", "Mumbai", "Siliguri", "Jaipur"];

function App() {
  const [activeTab, setActiveTab] = useState("Discover");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [requested, setRequested] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState(initialRooms);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All India");
  const [category, setCategory] = useState("All");
  const [following, setFollowing] = useState([]);

  const categories = ["All", "Friendship", "Music", "Gaming", "General Talk", "Study"];

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.host.toLowerCase().includes(search.toLowerCase()) ||
      room.city.toLowerCase().includes(search.toLowerCase());

    const matchesCity =
      city === "All India" ||
      room.city === city ||
      room.city === "All India";

    const matchesCategory =
      category === "All" || room.category === category;

    return matchesSearch && matchesCity && matchesCategory;
  });

  const filteredUsers = newUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.city.toLowerCase().includes(search.toLowerCase());

    const matchesCity =
      city === "All India" || user.city === city;

    return matchesSearch && matchesCity;
  });

  function createRoom() {
    if (!roomName.trim()) return;

    const newRoom = {
      id: Date.now(),
      name: roomName.trim(),
      host: "You",
      category: category === "All" ? "Friendship" : category,
      city: city,
      listeners: 1,
      color: "#14b8a6",
      live: true
    };

    setRooms((previous) => [newRoom, ...previous]);
    setRoomName("");
    setShowCreate(false);
    setActiveTab("Discover");
    setCategory("All");
    setSearch("");
  }

  function openRoom(room) {
    setSelectedRoom(room);
    setJoined(false);
    setMuted(false);
    setRequested(false);
  }

  function toggleFollow(name) {
    setFollowing((previous) =>
      previous.includes(name)
        ? previous.filter((item) => item !== name)
        : [...previous, name]
    );
  }

  return (
    <div className="app">
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          background: #080b14;
          color: white;
          font-family: Arial, sans-serif;
        }

        button, input, select { font: inherit; }
        button { cursor: pointer; }

        .app {
          min-height: 100vh;
          max-width: 520px;
          margin: auto;
          background: #0d1120;
          padding-bottom: 90px;
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          border-bottom: 1px solid #242a3d;
          position: sticky;
          top: 0;
          background: #0d1120;
          z-index: 4;
        }

        .logo {
          font-size: 25px;
          font-weight: 900;
          letter-spacing: 2px;
          color: #a78bfa;
        }

        .header-right { display: flex; gap: 10px; }

        .icon-button {
          background: #1b2134;
          border: 1px solid #303750;
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 18px;
        }

        .welcome { padding: 23px 20px 8px; }
        .welcome h1 { font-size: 24px; margin: 0 0 8px; }
        .welcome p { color: #929bb2; margin: 0; font-size: 13px; }

        .search {
          display: block;
          margin: 17px 20px;
          width: calc(100% - 40px);
          padding: 14px 16px;
          background: #171d30;
          border: 1px solid #303750;
          border-radius: 14px;
          color: white;
          outline: none;
        }

        .search:focus { border-color: #8b5cf6; }

        .filter-row {
          display: flex;
          gap: 9px;
          overflow-x: auto;
          padding: 3px 20px 13px;
          scrollbar-width: none;
        }

        .filter-row::-webkit-scrollbar { display: none; }

        .filter-chip {
          flex-shrink: 0;
          background: #171d30;
          border: 1px solid #303750;
          color: #b7bfd2;
          padding: 9px 14px;
          border-radius: 22px;
          font-size: 12px;
        }

        .filter-chip.selected {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: white;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px 12px;
        }

        .section-heading h2 { font-size: 17px; margin: 0; }
        .section-heading span { color: #a78bfa; font-size: 12px; }

        .city-select {
          background: #171d30;
          color: white;
          border: 1px solid #424b68;
          padding: 9px;
          border-radius: 10px;
          max-width: 145px;
          font-size: 12px;
        }

        .room-list { padding: 0 16px; }

        .room-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          margin-bottom: 11px;
          background: #171d30;
          border: 1px solid #29314a;
          border-radius: 17px;
        }

        .room-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 22px;
          font-weight: bold;
          flex-shrink: 0;
          border: 2px solid #a78bfa;
        }

        .room-info { flex: 1; min-width: 0; }
        .room-info h3 { font-size: 14px; margin: 0 0 5px; }
        .room-info p { margin: 3px 0; color: #929bb2; font-size: 11px; }

        .live-label { color: #fb7185 !important; font-weight: bold; }

        .join-button {
          background: #8b5cf6;
          color: white;
          border: 0;
          border-radius: 20px;
          padding: 9px 13px;
          font-size: 11px;
          font-weight: bold;
          flex-shrink: 0;
        }

        .create-button {
          margin: 15px 20px;
          width: calc(100% - 40px);
          padding: 15px;
          border: 0;
          border-radius: 14px;
          color: white;
          font-weight: bold;
          background: linear-gradient(100deg, #7c3aed, #a855f7);
        }

        .user-list {
          display: flex;
          gap: 13px;
          overflow-x: auto;
          padding: 5px 20px 15px;
          scrollbar-width: none;
        }

        .user-card {
          min-width: 112px;
          background: #171d30;
          border: 1px solid #29314a;
          border-radius: 16px;
          padding: 13px 9px;
          text-align: center;
        }

        .user-avatar {
          width: 52px;
          height: 52px;
          margin: auto auto 8px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 24px;
          border: 2px solid #a78bfa;
        }

        .user-card h3 { font-size: 13px; margin: 4px 0; }
        .user-card p { color: #929bb2; font-size: 11px; margin: 4px 0 9px; }

        .follow-button {
          background: #29314a;
          border: 1px solid #424b68;
          color: white;
          border-radius: 15px;
          padding: 7px 12px;
          font-size: 11px;
        }

        .follow-button.following {
          background: #4c3287;
          border-color: #8b5cf6;
        }

        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 520px;
          display: flex;
          justify-content: space-around;
          background: #111729;
          border-top: 1px solid #303750;
          padding: 11px 5px;
          z-index: 5;
        }

        .nav-item {
          background: transparent;
          border: 0;
          color: #8c96ad;
          font-size: 11px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .nav-item strong { font-size: 20px; }
        .nav-item.active { color: #a78bfa; }

        .modal-bg {
          position: fixed;
          inset: 0;
          background: #000b;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          z-index: 10;
        }

        .modal {
          width: 100%;
          max-width: 450px;
          max-height: 90vh;
          overflow-y: auto;
          background: #171d30;
          border: 1px solid #424b68;
          border-radius: 22px;
          padding: 22px;
        }

        .modal h2 { margin-top: 0; }

        .close-button {
          float: right;
          background: #29314a;
          color: white;
          border: 0;
          border-radius: 50%;
          width: 32px;
          height: 32px;
        }

        .modal-input {
          width: 100%;
          padding: 13px;
          background: #0d1120;
          border: 1px solid #424b68;
          border-radius: 10px;
          color: white;
          margin: 10px 0;
        }

        .stage {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px 8px;
          padding: 24px 5px;
        }

        .seat { text-align: center; font-size: 11px; color: #c2c8d8; }

        .seat-avatar {
          width: 55px;
          height: 55px;
          margin: 0 auto 7px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #252e48;
          border: 2px solid #8b5cf6;
          font-size: 21px;
        }

        .seat.active .seat-avatar {
          border: 3px solid #22d3ee;
          box-shadow: 0 0 15px #22d3ee;
        }

        .room-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          justify-content: center;
          margin-top: 15px;
        }

        .action-button {
          background: #29314a;
          color: white;
          border: 1px solid #424b68;
          padding: 11px 14px;
          border-radius: 20px;
          font-size: 12px;
        }

        .action-button.primary {
          background: #8b5cf6;
          border: 0;
        }

        .empty {
          text-align: center;
          padding: 30px 10px;
          color: #929bb2;
          font-size: 13px;
        }

        .profile {
          margin: 25px 20px;
          padding: 25px;
          text-align: center;
          background: #171d30;
          border-radius: 20px;
        }

        .profile-avatar {
          width: 85px;
          height: 85px;
          border-radius: 50%;
          margin: auto;
          display: grid;
          place-items: center;
          background: #34305c;
          border: 3px solid #a78bfa;
          font-size: 35px;
        }
      `}</style>

      <header className="header">
        <div className="logo">ELVORA</div>
        <div className="header-right">
          <button className="icon-button" aria-label="Notifications">♧</button>
          <button className="icon-button" aria-label="Messages" onClick={() => setActiveTab("Messages")}>✉</button>
        </div>
      </header>

      {activeTab === "Discover" && (
        <>
          <section className="welcome">
            <h1>Discover your people ✨</h1>
            <p>Explore India, join conversations and make connections.</p>
          </section>

          <input
            className="search"
            placeholder="⌕ Search rooms, people or cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="section-heading">
            <h2>Explore by City 📍</h2>
          </div>

          <div className="filter-row">
            {cities.map((item) => (
              <button
                key={item}
                className={`filter-chip ${city === item ? "selected" : ""}`}
                onClick={() => setCity(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="section-heading">
            <h2>Popular Categories</h2>
          </div>

          <div className="filter-row">
            {categories.map((item) => (
              <button
                key={item}
                className={`filter-chip ${category === item ? "selected" : ""}`}
                onClick={() => setCategory(item)}
              >
                {item === "All" ? "🌍 All" :
                  item === "Friendship" ? "💜 Friendship" :
                  item === "Music" ? "🎵 Music" :
                  item === "Gaming" ? "🎮 Gaming" :
                  item === "Study" ? "📚 Study" : "💬 General Talk"}
              </button>
            ))}
          </div>

          <div className="section-heading">
            <h2>🔥 India Popular Rooms</h2>
            <span>{filteredRooms.length} rooms</span>
          </div>

          <div className="room-list">
            {filteredRooms
              .slice()
              .sort((a, b) => b.listeners - a.listeners)
              .slice(0, 4)
              .map((room) => (
                <div className="room-card" key={room.id}>
                  <div className="room-avatar" style={{ background: room.color }}>
                    {room.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <p>{room.host} · {room.city}</p>
                    <p>{room.listeners} listeners · {room.category}</p>
                  </div>
                  <button className="join-button" onClick={() => openRoom(room)}>
                    JOIN
                  </button>
                </div>
              ))}
          </div>

          <div className="section-heading">
            <h2>🔴 Live Now</h2>
            <span>Join a room</span>
          </div>

          <div className="room-list">
            {filteredRooms.filter((room) => room.live).length === 0 ? (
              <div className="empty">No live rooms found for this filter.</div>
            ) : (
              filteredRooms.filter((room) => room.live).map((room) => (
                <div className="room-card" key={room.id}>
                  <div className="room-avatar" style={{ background: room.color }}>🎙️</div>
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <p className="live-label">● LIVE NOW</p>
                    <p>{room.listeners} people listening · {room.city}</p>
                  </div>
                  <button className="join-button" onClick={() => openRoom(room)}>JOIN</button>
                </div>
              ))
            )}
          </div>

          <div className="section-heading">
            <h2>✨ New People</h2>
            <span>Meet members</span>
          </div>

          <div className="user-list">
            {filteredUsers.map((user) => (
              <div className="user-card" key={user.name}>
                <div className="user-avatar" style={{ background: user.color }}>
                  {user.emoji}
                </div>
                <h3>{user.name}</h3>
                <p>📍 {user.city}</p>
                <button
                  className={`follow-button ${following.includes(user.name) ? "following" : ""}`}
                  onClick={() => toggleFollow(user.name)}
                >
                  {following.includes(user.name) ? "Following" : "Follow"}
                </button>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="empty">No new people found.</div>
            )}
          </div>

          <button className="create-button" onClick={() => setShowCreate(true)}>
            + CREATE YOUR VOICE ROOM
          </button>
        </>
      )}

      {activeTab === "Messages" && (
        <>
          <section className="welcome">
            <h1>Messages 💬</h1>
            <p>Your conversations will appear here.</p>
          </section>
          <div className="empty">No messages yet. Messaging needs a backend connection.</div>
        </>
      )}

      {activeTab === "Community" && (
        <>
          <section className="welcome">
            <h1>Community 🌍</h1>
            <p>Find people with similar interests.</p>
          </section>
          <div className="room-list">
            {["Music Lovers", "Gaming Community", "Daily Talks", "Study Circle"].map((name) => (
              <div className="room-card" key={name}>
                <div className="room-avatar">✦</div>
                <div className="room-info">
                  <h3>{name}</h3>
                  <p>Discover this community</p>
                </div>
                <button className="join-button">VIEW</button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "Profile" && (
        <>
          <section className="welcome">
            <h1>My Profile</h1>
            <p>Your ELVORA account</p>
          </section>
          <div className="profile">
            <div className="profile-avatar">👤</div>
            <h2>ELVORA Member</h2>
            <p style={{ color: "#929bb2" }}>Welcome to ELVORA</p>
            <p>Friends: {following.length}</p>
            <p>Followers: 0</p>
            <p>Following: {following.length}</p>
          </div>
        </>
      )}

      <nav className="bottom-nav">
        {[
          ["Discover", "⌕"],
          ["Messages", "✉"],
          ["Community", "♧"],
          ["Profile", "◉"]
        ].map(([tab, symbol]) => (
          <button
            key={tab}
            className={`nav-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            <strong>{symbol}</strong>
            {tab}
          </button>
        ))}
      </nav>

      {showCreate && (
        <div className="modal-bg">
          <div className="modal">
            <button className="close-button" onClick={() => setShowCreate(false)}>✕</button>
            <h2>Create a Voice Room</h2>
            <p style={{ color: "#929bb2" }}>Give your room a name.</p>
            <input
              className="modal-input"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <button className="create-button" onClick={createRoom}>CREATE ROOM</button>
          </div>
        </div>
      )}

      {selectedRoom && (
        <div className="modal-bg">
          <div className="modal">
            <button className="close-button" onClick={() => setSelectedRoom(null)}>✕</button>
            <h2>{selectedRoom.name}</h2>
            <p style={{ color: "#929bb2" }}>
              Hosted by {selectedRoom.host} · {selectedRoom.city}
            </p>

            <div className="stage">
              {Array.from({ length: 8 }, (_, i) => (
                <div className={`seat ${i === 0 ? "active" : ""}`} key={i}>
                  <div className="seat-avatar">
                    {i === 0 ? "👤" : i === 1 ? "🎧" : "＋"}
                  </div>
                  {i === 0 ? "Host" : i === 1 ? "Speaker" : `Seat ${i + 1}`}
                </div>
              ))}
            </div>

            <div className="room-actions">
              {!joined ? (
                <button className="action-button primary" onClick={() => setJoined(true)}>
                  Join Room
                </button>
              ) : (
                <>
                  <button className="action-button" onClick={() => setMuted(!muted)}>
                    {muted ? "Unmute" : "Mute"}
                  </button>
                  <button className="action-button" onClick={() => setRequested(!requested)}>
                    {requested ? "Request Sent" : "Request to Speak"}
                  </button>
                  <button
                    className="action-button primary"
                    onClick={() => {
                      setJoined(false);
                      setSelectedRoom(null);
                    }}
                  >
                    Leave Room
                  </button>
                </>
              )}
            </div>

            <p style={{ color: "#929bb2", fontSize: 11, textAlign: "center" }}>
              Demo room only. Real-time voice calling is not connected yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
