import React, { useState } from "react";

const initialRooms = [
  {
    id: 1,
    name: "Friends Hangout",
    host: "ELVORA Host",
    category: "Friends",
    listeners: 24,
    color: "#8b5cf6",
  },
  {
    id: 2,
    name: "Late Night Talks",
    host: "Music Lover",
    category: "Chat",
    listeners: 18,
    color: "#ec4899",
  },
  {
    id: 3,
    name: "New Friends",
    host: "Room Creator",
    category: "Social",
    listeners: 32,
    color: "#06b6d4",
  },
];

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

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  function createRoom() {
    if (!roomName.trim()) return;

    const newRoom = {
      id: Date.now(),
      name: roomName,
      host: "You",
      category: "New Room",
      listeners: 1,
      color: "#14b8a6",
    };

    setRooms([newRoom, ...rooms]);
    setRoomName("");
    setShowCreate(false);
  }

  function openRoom(room) {
    setSelectedRoom(room);
    setJoined(false);
    setMuted(false);
    setRequested(false);
  }

  return (
    <div className="app">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #080b14;
          color: white;
          font-family: Arial, sans-serif;
        }

        button, input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app {
          min-height: 100vh;
          max-width: 520px;
          margin: auto;
          background: #0d1120;
          padding-bottom: 85px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #242a3d;
        }

        .logo {
          font-size: 25px;
          font-weight: 900;
          letter-spacing: 2px;
          color: #a78bfa;
        }

        .header-right {
          display: flex;
          gap: 12px;
        }

        .icon-button {
          background: #1b2134;
          border: 1px solid #303750;
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 18px;
        }

        .welcome {
          padding: 22px 20px 10px;
        }

        .welcome h1 {
          font-size: 25px;
          margin: 0 0 8px;
        }

        .welcome p {
          color: #929bb2;
          margin: 0;
          font-size: 14px;
        }

        .search {
          margin: 18px 20px;
          width: calc(100% - 40px);
          padding: 14px 16px;
          background: #171d30;
          border: 1px solid #303750;
          border-radius: 14px;
          color: white;
          outline: none;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
        }

        .section-heading h2 {
          font-size: 18px;
          margin: 0;
        }

        .section-heading span {
          color: #a78bfa;
          font-size: 13px;
        }

        .room-list {
          padding: 0 16px;
        }

        .room-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          margin-bottom: 12px;
          background: #171d30;
          border: 1px solid #29314a;
          border-radius: 17px;
        }

        .room-avatar {
          width: 53px;
          height: 53px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 23px;
          font-weight: bold;
          flex-shrink: 0;
          border: 2px solid #a78bfa;
        }

        .room-info {
          flex: 1;
          min-width: 0;
        }

        .room-info h3 {
          font-size: 15px;
          margin: 0 0 6px;
        }

        .room-info p {
          margin: 0;
          color: #929bb2;
          font-size: 12px;
        }

        .join-button {
          background: #8b5cf6;
          color: white;
          border: 0;
          border-radius: 20px;
          padding: 9px 15px;
          font-size: 12px;
          font-weight: bold;
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
          padding: 12px 5px;
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

        .nav-item strong {
          font-size: 20px;
        }

        .nav-item.active {
          color: #a78bfa;
        }

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
          background: #171d30;
          border: 1px solid #424b68;
          border-radius: 22px;
          padding: 22px;
        }

        .modal h2 {
          margin-top: 0;
        }

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

        .seat {
          text-align: center;
          font-size: 11px;
          color: #c2c8d8;
        }

        .seat-avatar {
          width: 58px;
          height: 58px;
          margin: 0 auto 7px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #252e48;
          border: 2px solid #8b5cf6;
          font-size: 22px;
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
          padding: 35px 10px;
          color: #929bb2;
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
          <button className="icon-button" aria-label="Messages">✉</button>
        </div>
      </header>

      {activeTab === "Discover" && (
        <>
          <section className="welcome">
            <h1>Discover your people ✨</h1>
            <p>Join conversations and meet new friends.</p>
          </section>

          <input
            className="search"
            placeholder="Search voice rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="section-heading">
            <h2>Live Voice Rooms</h2>
            <span>{rooms.length} rooms</span>
          </div>

          <div className="room-list">
            {filteredRooms.map((room) => (
              <div className="room-card" key={room.id}>
                <div
                  className="room-avatar"
                  style={{ background: room.color }}
                >
                  {room.name.charAt(0).toUpperCase()}
                </div>

                <div className="room-info">
                  <h3>{room.name}</h3>
                  <p>{room.host} · {room.listeners} listeners</p>
                  <p>{room.category}</p>
                </div>

                <button
                  className="join-button"
                  onClick={() => openRoom(room)}
                >
                  JOIN
                </button>
              </div>
            ))}

            {filteredRooms.length === 0 && (
              <div className="empty">No rooms found.</div>
            )}
          </div>

          <button
            className="create-button"
            onClick={() => setShowCreate(true)}
          >
            + CREATE VOICE ROOM
          </button>
        </>
      )}

      {activeTab === "Messages" && (
        <>
          <section className="welcome">
            <h1>Messages 💬</h1>
            <p>Your conversations will appear here.</p>
          </section>
          <div className="empty">
            No messages yet.
          </div>
        </>
      )}

      {activeTab === "Community" && (
        <>
          <section className="welcome">
            <h1>Community 🌍</h1>
            <p>Find people with similar interests.</p>
          </section>
          <div className="room-list">
            {["Music Lovers", "Gaming Community", "Daily Talks"].map((name) => (
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
            <p>Friends: 0</p>
            <p>Followers: 0</p>
            <p>Following: 0</p>
          </div>
        </>
      )}

      <nav className="bottom-nav">
        {[
          ["Discover", "⌕"],
          ["Messages", "✉"],
          ["Community", "♧"],
          ["Profile", "◉"],
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
            <button
              className="close-button"
              onClick={() => setShowCreate(false)}
            >
              ✕
            </button>

            <h2>Create a Voice Room</h2>
            <p style={{ color: "#929bb2" }}>
              Give your room a name.
            </p>

            <input
              className="modal-input"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />

            <button className="create-button" onClick={createRoom}>
              CREATE ROOM
            </button>
          </div>
        </div>
      )}

      {selectedRoom && (
        <div className="modal-bg">
          <div className="modal">
            <button
              className="close-button"
              onClick={() => setSelectedRoom(null)}
            >
              ✕
            </button>

            <h2>{selectedRoom.name}</h2>
            <p style={{ color: "#929bb2" }}>
              Hosted by {selectedRoom.host}
            </p>

            <div className="stage">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  className={`seat ${i === 0 ? "active" : ""}`}
                  key={i}
                >
                  <div className="seat-avatar">
                    {i === 0 ? "👤" : i === 1 ? "🎧" : "＋"}
                  </div>
                  {i === 0 ? "Host" : i === 1 ? "Speaker" : `Seat ${i + 1}`}
                </div>
              ))}
            </div>

            <div className="room-actions">
              {!joined ? (
                <button
                  className="action-button primary"
                  onClick={() => setJoined(true)}
                >
                  Join Room
                </button>
              ) : (
                <>
                  <button
                    className="action-button"
                    onClick={() => setMuted(!muted)}
                  >
                    {muted ? "Unmute" : "Mute"}
                  </button>

                  <button
                    className="action-button"
                    onClick={() => setRequested(!requested)}
                  >
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
              Demo room: live voice calling is not connected yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
