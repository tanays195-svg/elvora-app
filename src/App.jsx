import React, { useEffect, useState } from "react";
import {
  collection, doc, setDoc, addDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp, runTransaction
} from "firebase/firestore";
import { auth, db } from "./firebase";
import {
  Home, Compass, Users, UserRound, Mic, MicOff,
  Plus, LogOut, Send, ArrowLeft, Crown, Lock,
  Globe, MessageCircle, Radio
} from "lucide-react";

export default function App() {
  const user = auth.currentUser;

  const [tab, setTab] = useState("rooms");
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [muted, setMuted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [capacity, setCapacity] = useState("10");
  const [category, setCategory] = useState("General");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || "ELVORA User",
      email: user.email || "",
      photoURL: user.photoURL || "",
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(console.error);

    return onSnapshot(userRef, snap => {
      if (snap.exists()) setProfile(snap.data());
    });
  }, [user]);

  useEffect(() => {
    const q = query(
      collection(db, "rooms"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, snap => {
      setRooms(snap.docs.map(d => ({
        id: d.id, ...d.data()
      })));
    }, err => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selected) return;

    const membersRef = collection(
      db, "rooms", selected.id, "members"
    );

    const messagesRef = query(
      collection(db, "rooms", selected.id, "messages"),
      orderBy("createdAt", "asc"),
      limit(50)
    );

    const stopMembers = onSnapshot(membersRef, snap => {
      setMembers(snap.docs.map(d => d.data()));
    });

    const stopMessages = onSnapshot(messagesRef, snap => {
      setMessages(snap.docs.map(d => ({
        id: d.id, ...d.data()
      })));
    });

    return () => {
      stopMembers();
      stopMessages();
    };
  }, [selected]);

  async function createRoom() {
    if (!roomName.trim() || busy) return;

    setBusy(true);
    setError("");

    try {
      const roomRef = doc(collection(db, "rooms"));

      await setDoc(roomRef, {
        name: roomName.trim(),
        category,
        capacity: Number(capacity),
        ownerId: user.uid,
        ownerName: user.displayName || "ELVORA User",
        privacy: "public",
        createdAt: serverTimestamp()
      });

      await joinRoom({
        id: roomRef.id,
        capacity: Number(capacity),
        ownerId: user.uid
      });

      setRoomName("");
      setShowCreate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom(room) {
    setError("");

    try {
      await runTransaction(db, async tx => {
        const roomRef = doc(db, "rooms", room.id);
        const memberRef = doc(
          db, "rooms", room.id, "members", user.uid
        );

        const roomSnap = await tx.get(roomRef);
        const memberSnap = await tx.get(memberRef);

        if (!roomSnap.exists()) throw new Error("Room not found.");

        if (memberSnap.exists()) return;

        const roomData = roomSnap.data();
        let freeSeat = null;

        for (let i = 1; i <= roomData.capacity; i++) {
          const seatRef = doc(
            db, "rooms", room.id, "seats", String(i)
          );
          const seatSnap = await tx.get(seatRef);

          if (!seatSnap.exists() && freeSeat === null) {
            freeSeat = i;
          }
        }

        if (!freeSeat) throw new Error("Room is full.");

        const memberData = {
          uid: user.uid,
          displayName: user.displayName || "ELVORA User",
          photoURL: user.photoURL || "",
          seat: freeSeat,
          joinedAt: serverTimestamp()
        };

        tx.set(memberRef, memberData);

        tx.set(
          doc(db, "rooms", room.id, "seats", String(freeSeat)),
          memberData
        );
      });

      setSelected(room);
      setTab("rooms");
    } catch (err) {
      setError(err.message);
    }
  }

  async function leaveRoom() {
    if (!selected) return;

    try {
      await runTransaction(db, async tx => {
        const memberRef = doc(
          db, "rooms", selected.id, "members", user.uid
        );

        const memberSnap = await tx.get(memberRef);

        if (!memberSnap.exists()) return;

        const seat = memberSnap.data().seat;

        tx.delete(memberRef);
        tx.delete(
          doc(db, "rooms", selected.id, "seats", String(seat))
        );
      });

      setSelected(null);
      setMembers([]);
      setMessages([]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (!message.trim() || !selected) return;

    const text = message.trim();
    setMessage("");

    try {
      await addDoc(
        collection(db, "rooms", selected.id, "messages"),
        {
          senderId: user.uid,
          senderName: user.displayName || "ELVORA User",
          text,
          createdAt: serverTimestamp()
        }
      );
    } catch (err) {
      setError(err.message);
      setMessage(text);
    }
  }

  const avatar = (name, photo) => (
    <div style={styles.avatar}>
      {photo
        ? <img src={photo} alt="" style={styles.avatarImage} />
        : (name || "U").charAt(0).toUpperCase()}
    </div>
  );

  if (selected) {
    return (
      <main style={styles.app}>
        <header style={styles.header}>
          <button style={styles.iconButton} onClick={leaveRoom}>
            <ArrowLeft />
          </button>
          <div style={{ flex: 1 }}>
            <strong>{selected.name}</strong>
            <small style={styles.subText}>LIVE VOICE ROOM</small>
          </div>
          <Radio color="#c084fc" />
        </header>

        <section style={styles.stage}>
          <h2 style={styles.sectionTitle}>Voice Stage</h2>
          <div style={styles.seatGrid}>
            {Array.from(
              { length: selected.capacity || 10 },
              (_, i) => {
                const person = members.find(m => m.seat === i + 1);
                return (
                  <div key={i} style={styles.seat}>
                    {person
                      ? avatar(person.displayName, person.photoURL)
                      : <div style={styles.emptySeat}>
                          <Mic size={20} />
                        </div>}
                    <small>
                      {person ? person.displayName : `Seat ${i + 1}`}
                    </small>
                    {person?.uid === selected.ownerId &&
                      <Crown size={13} color="#f5c76b" />}
                  </div>
                );
              }
            )}
          </div>
        </section>

        <section style={styles.chatPanel}>
          <h3>Room Chat</h3>
          <div style={styles.messages}>
            {messages.map(m => (
              <p key={m.id} style={styles.chatMessage}>
                <strong>{m.senderName}: </strong>{m.text}
              </p>
            ))}
          </div>
          <form onSubmit={sendMessage} style={styles.chatForm}>
            <input
              style={styles.chatInput}
              placeholder="Write a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button style={styles.sendButton} type="submit">
              <Send size={18} />
            </button>
          </form>
        </section>

        <footer style={styles.controls}>
          <button
            style={styles.controlButton}
            onClick={() => setMuted(!muted)}
          >
            {muted ? <MicOff /> : <Mic />}
            <small>{muted ? "Muted" : "Mic preview"}</small>
          </button>
          <button style={styles.leaveButton} onClick={leaveRoom}>
            Leave Room
          </button>
        </footer>
        {error && <p style={styles.error}>{error}</p>}
      </main>
    );
  }

  return (
    <main style={styles.app}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>ELVORA</h1>
          <small style={styles.subText}>Your voice. Your community.</small>
        </div>
        <button
          style={styles.iconButton}
          onClick={() => auth.signOut()}
        >
          <LogOut />
        </button>
      </header>

      <section style={styles.welcome}>
        {avatar(profile?.displayName, profile?.photoURL)}
        <div>
          <strong>Welcome, {profile?.displayName || "User"}</strong>
          <small style={styles.subText}>Discover your community</small>
        </div>
      </section>

      {tab === "rooms" && (
        <>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Live Voice Rooms</h2>
              <small style={styles.subText}>
                Join conversations around the world
              </small>
            </div>
            <button
              style={styles.createButton}
              onClick={() => setShowCreate(!showCreate)}
            >
              <Plus size={18} /> Create
            </button>
          </div>

          {showCreate && (
            <div style={styles.createPanel}>
              <input
                style={styles.input}
                placeholder="Room name"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
              />
              <select
                style={styles.input}
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
              >
                <option value="2">2 seats</option>
                <option value="10">10 seats</option>
                <option value="15">15 seats</option>
                <option value="20">20 seats</option>
              </select>
              <select
                style={styles.input}
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option>General</option>
                <option>Music</option>
                <option>Friends</option>
                <option>Gaming</option>
                <option>Education</option>
              </select>
              <button
                style={styles.primaryButton}
                onClick={createRoom}
                disabled={busy}
              >
                {busy ? "Creating..." : "Create Room"}
              </button>
            </div>
          )}

          {rooms.map(room => (
            <article key={room.id} style={styles.roomCard}>
              <div style={styles.roomIcon}>
                <Radio size={25} />
              </div>
              <div style={{ flex: 1 }}>
                <strong>{room.name}</strong>
                <small style={styles.subText}>
                  {room.category} · {room.capacity} seats
                </small>
                <small style={styles.subText}>
                  Host: {room.ownerName}
                </small>
              </div>
              <button
                style={styles.joinButton}
                onClick={() => joinRoom(room)}
              >
                Join
              </button>
            </article>
          ))}

          {rooms.length === 0 && (
            <p style={styles.emptyText}>
              No rooms yet. Create the first room!
            </p>
          )}
        </>
      )}

      {tab === "discover" && (
        <section style={styles.simplePanel}>
          <Compass size={32} />
          <h2>Discover</h2>
          <p>Explore public voice rooms in ELVORA.</p>
          <button
            style={styles.primaryButton}
            onClick={() => setTab("rooms")}
          >
            Explore Rooms
          </button>
        </section>
      )}

      {tab === "friends" && (
        <section style={styles.simplePanel}>
          <Users size={32} />
          <h2>Friends</h2>
          <p>Friends and invitations will be added in the next stage.</p>
        </section>
      )}

      {tab === "profile" && (
        <section style={styles.simplePanel}>
          {avatar(profile?.displayName, profile?.photoURL)}
          <h2>{profile?.displayName}</h2>
          <p>{profile?.email}</p>
          <small>ELVORA User ID: {user.uid}</small>
        </section>
      )}

      <nav style={styles.nav}>
        {[
          ["rooms", Home, "Rooms"],
          ["discover", Compass, "Discover"],
          ["friends", Users, "Friends"],
          ["profile", UserRound, "Profile"]
        ].map(([id, Icon, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              ...styles.navButton,
              color: tab === id ? "#d8b4fe" : "#9487aa"
            }}
          >
            <Icon size={21} />
            <small>{label}</small>
          </button>
        ))}
      </nav>

      {error && <p style={styles.error}>{error}</p>}
    </main>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    maxWidth: 620,
    margin: "auto",
    padding: 18,
    paddingBottom: 100,
    boxSizing: "border-box",
    color: "#f7f4ff",
    background: "#0b0913",
    fontFamily: "Arial, sans-serif"
  },
  header: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "12px 0 22px"
  },
  logo: {
    margin: 0, letterSpacing: 4, fontSize: 25,
    background: "linear-gradient(90deg,#d8b4fe,#9333ea)",
    WebkitBackgroundClip: "text", color: "transparent"
  },
  subText: {
    display: "block", color: "#a99cbd",
    fontSize: 12, marginTop: 5
  },
  iconButton: {
    marginLeft: "auto", background: "#241936",
    color: "white", border: "1px solid #49335f",
    borderRadius: 12, padding: 11
  },
  welcome: {
    display: "flex", alignItems: "center", gap: 12,
    padding: 16, background: "#191329",
    border: "1px solid #35264b", borderRadius: 16,
    marginBottom: 25
  },
  avatar: {
    width: 48, height: 48, borderRadius: "50%",
    background: "linear-gradient(135deg,#9333ea,#4c1d95)",
    display: "grid", placeItems: "center",
    fontSize: 20, fontWeight: "bold", overflow: "hidden"
  },
  avatarImage: { width: "100%", height: "100%", objectFit: "cover" },
  sectionHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 10,
    marginBottom: 18
  },
  sectionTitle: { textAlign: "center", fontSize: 19 },
  createButton: {
    display: "flex", alignItems: "center", gap: 5,
    background: "#762ac5", color: "white",
    border: 0, borderRadius: 10, padding: 11
  },
  roomCard: {
    display: "flex", alignItems: "center", gap: 12,
    background: "#191329", border: "1px solid #35264b",
    borderRadius: 16, padding: 14, marginBottom: 12
  },
  roomIcon: {
    width: 48, height: 48, borderRadius: 13,
    background: "#302044", color: "#d8b4fe",
    display: "grid", placeItems: "center"
  },
  joinButton: {
    background: "#9333ea", color: "white",
    border: 0, borderRadius: 10, padding: "10px 15px"
  },
  createPanel: {
    padding: 15, background: "#191329",
    border: "1px solid #49335f", borderRadius: 15,
    marginBottom: 18
  },
  input: {
    display: "block", width: "100%", boxSizing: "border-box",
    padding: 13, marginBottom: 10, borderRadius: 10,
    background: "#0e0b19", color: "white",
    border: "1px solid #49335f"
  },
  primaryButton: {
    width: "100%", padding: 13, background: "#9333ea",
    color: "white", border: 0, borderRadius: 10
  },
  emptyText: { textAlign: "center", color: "#a99cbd", padding: 30 },
  nav: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    maxWidth: 620, margin: "auto", display: "flex",
    justifyContent: "space-around", padding: "12px 5px",
    background: "#171123", borderTop: "1px solid #382849",
    zIndex: 5
  },
  navButton: {
    display: "grid", justifyItems: "center", gap: 5,
    background: "none", border: 0, fontSize: 11
  },
  stage: {
    padding: 15, background: "#191329",
    borderRadius: 18, border: "1px solid #49335f"
  },
  seatGrid: {
    display: "grid", gridTemplateColumns: "repeat(4,1fr)",
    gap: 15, marginTop: 20
  },
  seat: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 6, minWidth: 0,
    fontSize: 11, textAlign: "center"
  },
  emptySeat: {
    width: 48, height: 48, borderRadius: "50%",
    border: "1px dashed #70558f", color: "#b79acb",
    display: "grid", placeItems: "center"
  },
  chatPanel: {
    marginTop: 18, background: "#191329",
    padding: 14, borderRadius: 16
  },
  messages: {
    height: 180, overflowY: "auto",
    fontSize: 13, color: "#e9dff5"
  },
  chatMessage: {
    background: "#292039", padding: 9,
    borderRadius: 9, overflowWrap: "anywhere"
  },
  chatForm: { display: "flex", gap: 8 },
  chatInput: {
    flex: 1, minWidth: 0, padding: 12,
    background: "#0e0b19", color: "white",
    border: "1px solid #49335f", borderRadius: 10
  },
  sendButton: {
    background: "#9333ea", color: "white",
    border: 0, borderRadius: 10, padding: 12
  },
  controls: {
    display: "flex", justifyContent: "center",
    gap: 20, padding: 20
  },
  controlButton: {
    display: "grid", justifyItems: "center", gap: 5,
    background: "#302044", color: "white",
    border: 0, borderRadius: 12, padding: 12
  },
  leaveButton: {
    background: "#a12e58", color: "white",
    border: 0, borderRadius: 12, padding: 13
  },
  simplePanel: {
    textAlign: "center", padding: 35,
    background: "#191329", borderRadius: 18
  },
  error: { color: "#ff8585", fontSize: 13, padding: 10 }
};
