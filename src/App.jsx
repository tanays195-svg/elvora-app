import React, { useEffect, useState } from "react";
import {
  collection, doc, setDoc, addDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp, runTransaction
} from "firebase/firestore";
import { auth, db } from "./firebase";
import {
  Home, Compass, Users, UserRound, Mic, MicOff,
  Plus, LogOut, Send, ArrowLeft, Crown, Lock,
  Globe, MessageCircle, Radio, Search, Bell,
  Gift, Heart, Star, Shield, Settings, Wallet,
  Trophy, Sparkles, Music, Gamepad2, UserPlus,
  X, ChevronRight, Gem, Headphones, MessageSquare,
  Flame, CircleUserRound, ShieldCheck
} from "lucide-react";

const purple = "#a855f7";

export default function App() {
  const user = auth.currentUser;

  const [tab, setTab] = useState("home");
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [capacity, setCapacity] = useState("10");
  const [category, setCategory] = useState("General");
  const [privacy, setPrivacy] = useState("public");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [activeProfile, setActiveProfile] = useState(null);
  const [localFriends, setLocalFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [giftTarget, setGiftTarget] = useState(null);
  const [showGifts, setShowGifts] = useState(false);

  const notify = (text) => {
    setToast(text);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || "ELVORA User",
      email: user.email || "",
      photoURL: user.photoURL || "",
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(e => setError(e.message));

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
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, e => setError(e.message));
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
    }, e => setError(e.message));

    const stopMessages = onSnapshot(messagesRef, snap => {
      setMessages(snap.docs.map(d => ({
        id: d.id, ...d.data()
      })));
    }, e => setError(e.message));

    return () => {
      stopMembers();
      stopMessages();
    };
  }, [selected]);

  async function createRoom() {
    if (!roomName.trim() || busy || !user) return;

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
        privacy,
        createdAt: serverTimestamp()
      });

      await joinRoom({
        id: roomRef.id,
        capacity: Number(capacity),
        ownerId: user.uid
      });

      setRoomName("");
      setShowCreate(false);
      notify("Room created!");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom(room) {
    if (!user) return;

    setError("");

    if (room.privacy === "private") {
      notify("This is a private room.");
      return;
    }

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

        const data = roomSnap.data();
        let freeSeat = null;

        for (let i = 1; i <= data.capacity; i++) {
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
      setTab("home");
    } catch (e) {
      setError(e.message);
    }
  }

  async function leaveRoom() {
    if (!selected || !user) return;

    try {
      await runTransaction(db, async tx => {
        const memberRef = doc(
          db, "rooms", selected.id, "members", user.uid
        );

        const snap = await tx.get(memberRef);
        if (!snap.exists()) return;

        const seat = snap.data().seat;

        tx.delete(memberRef);
        tx.delete(
          doc(db, "rooms", selected.id, "seats", String(seat))
        );
      });

      setSelected(null);
      setMembers([]);
      setMessages([]);
    } catch (e) {
      setError(e.message);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!message.trim() || !selected || !user) return;

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
    } catch (e) {
      setError(e.message);
      setMessage(text);
    }
  }

  const avatar = (name, photo, size = 48) => (
    <div style={{
      ...s.avatar,
      width: size,
      height: size,
      minWidth: size,
      fontSize: size / 2.2
    }}>
      {photo
        ? <img src={photo} alt="" style={s.avatarImage} />
        : (name || "U").charAt(0).toUpperCase()}
    </div>
  );

  const title = (name, sub) => (
    <div style={{ marginBottom: 20 }}>
      <h2 style={s.heading}>{name}</h2>
      <div style={s.mutedText}>{sub}</div>
    </div>
  );

  const card = (children, extra = {}) => (
    <div style={{ ...s.card, ...extra }}>{children}</div>
  );

  const button = (text, action, color = purple) => (
    <button style={{ ...s.primary, background: color }} onClick={action}>
      {text}
    </button>
  );

  const gifts = [
    ["🌹", "Rose", "10"],
    ["❤️", "Heart", "50"],
    ["🎂", "Cake", "100"],
    ["💎", "Diamond", "500"],
    ["👑", "Crown", "1000"],
    ["🚀", "Rocket", "5000"]
  ];

  if (selected) {
    return (
      <main style={s.app}>
        <header style={s.topbar}>
          <button style={s.iconBtn} onClick={leaveRoom}>
            <ArrowLeft />
          </button>
          <div style={{ flex: 1 }}>
            <b>{selected.name}</b>
            <small style={s.mutedText}>● LIVE ROOM</small>
          </div>
          <button style={s.iconBtn} onClick={() => setShowGifts(true)}>
            <Gift />
          </button>
        </header>

        <div style={s.roomBanner}>
          <div style={{ fontSize: 26 }}>🎙️</div>
          <div>
            <b>{selected.name}</b>
            <div style={s.mutedText}>
              {selected.category} · {members.length}/{selected.capacity}
            </div>
          </div>
          <span style={s.liveBadge}>LIVE</span>
        </div>

        <section style={s.stage}>
          <div style={s.rowBetween}>
            <h3>Voice Stage</h3>
            <span style={s.mutedText}>🎤 {members.length} speakers</span>
          </div>

          <div style={s.seatGrid}>
            {Array.from(
              { length: selected.capacity || 10 },
              (_, i) => {
                const person = members.find(m => m.seat === i + 1);
                return (
                  <div
                    key={i}
                    style={s.seat}
                    onClick={() => person && setActiveProfile(person)}
                  >
                    {person
                      ? avatar(person.displayName, person.photoURL, 54)
                      : <div style={s.emptySeat}><Mic size={22} /></div>}
                    <small>{person?.displayName || `Seat ${i + 1}`}</small>
                    {person?.uid === selected.ownerId &&
                      <Crown size={14} color="#f5c76b" />}
                  </div>
                );
              }
            )}
          </div>
        </section>

        {card(
          <>
            <div style={s.rowBetween}>
              <h3>Room Members</h3>
              <span style={s.mutedText}>{members.length} online</span>
            </div>
            {members.map(m => (
              <div key={m.uid} style={s.memberRow}>
                {avatar(m.displayName, m.photoURL, 38)}
                <div style={{ flex: 1 }}>
                  <b>{m.displayName}</b>
                  <small style={s.mutedText}>
                    {m.uid === selected.ownerId ? "Room Owner" : "Member"}
                  </small>
                </div>
                {m.uid === selected.ownerId && <Crown color="#f5c76b" />}
              </div>
            ))}
          </>
        )}

        <section style={s.chatPanel}>
          <h3>Room Chat</h3>
          <div style={s.messages}>
            {messages.map(m => (
              <p key={m.id} style={s.chatMessage}>
                <b>{m.senderName}: </b>{m.text}
              </p>
            ))}
          </div>
          <form onSubmit={sendMessage} style={s.chatForm}>
            <input
              style={s.chatInput}
              placeholder="Write a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button style={s.sendBtn} type="submit"><Send /></button>
          </form>
        </section>

        <footer style={s.roomControls}>
          <button
            style={s.control}
            onClick={() => {
              setMuted(!muted);
              notify("Mic preview only. Voice service not connected.");
            }}
          >
            {muted ? <MicOff /> : <Mic />}
            <small>{muted ? "Muted" : "Mic"}</small>
          </button>
          <button style={s.control} onClick={() => setShowGifts(true)}>
            <Gift /><small>Gifts</small>
          </button>
          <button style={s.leaveBtn} onClick={leaveRoom}>
            Leave Room
          </button>
        </footer>

        {showGifts && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <div style={s.rowBetween}>
                <h3>Send a Gift</h3>
                <button style={s.iconBtn} onClick={() => setShowGifts(false)}>
                  <X />
                </button>
              </div>
              <div style={s.giftGrid}>
                {gifts.map(g => (
                  <button key={g[1]} style={s.giftItem}
                    onClick={() => notify("Gift economy will be connected securely later.")}>
                    <span style={{ fontSize: 30 }}>{g[0]}</span>
                    <b>{g[1]}</b>
                    <small>{g[2]} coins</small>
                  </button>
                ))}
              </div>
              <small style={s.mutedText}>
                These are preview items. No coins or payments are processed.
              </small>
            </div>
          </div>
        )}

        {error && <p style={s.error}>{error}</p>}
      </main>
    );
  }

  return (
    <main style={s.app}>
      <header style={s.topbar}>
        <div>
          <div style={s.logo}>ELVORA</div>
          <small style={s.mutedText}>Your voice. Your community.</small>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 9 }}>
          <button style={s.iconBtn} onClick={() => setTab("inbox")}>
            <Bell />
          </button>
          <button style={s.iconBtn} onClick={() => auth.signOut()}>
            <LogOut />
          </button>
        </div>
      </header>

      <section style={s.welcome}>
        {avatar(profile?.displayName, profile?.photoURL, 52)}
        <div style={{ flex: 1 }}>
          <b>Welcome, {profile?.displayName || "User"}</b>
          <small style={s.mutedText}>Find your people on ELVORA</small>
        </div>
        <span style={s.vipTag}>VIP</span>
      </section>

      {tab === "home" && (
        <>
          <div style={s.hero}>
            <div style={{ fontSize: 12, color: "#d8b4fe" }}>
              <Sparkles size={14} /> GLOBAL VOICE COMMUNITY
            </div>
            <h2>Meet people.<br />Share your voice.</h2>
            <p>Join live conversations and discover communities.</p>
            <button style={s.heroBtn} onClick={() => setShowCreate(true)}>
              <Plus size={17} /> Create a Room
            </button>
          </div>

          <div style={s.rowBetween}>
            <div>
              <h2 style={s.heading}>Live Voice Rooms</h2>
              <small style={s.mutedText}>Discover active communities</small>
            </div>
            <button style={s.textBtn} onClick={() => setTab("discover")}>
              See all <ChevronRight size={15} />
            </button>
          </div>

          {rooms.map(room => (
            <div key={room.id} style={s.roomCard}>
              <div style={s.roomCover}>
                {room.category === "Music" ? "🎵" : "🎙️"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>{room.name}</b>
                <small style={s.mutedText}>
                  {room.category} · {room.capacity} seats
                </small>
                <small style={s.mutedText}>Host: {room.ownerName}</small>
              </div>
              {room.privacy === "private" && <Lock size={16} />}
              <button style={s.joinBtn} onClick={() => joinRoom(room)}>
                Join
              </button>
            </div>
          ))}

          {rooms.length === 0 && card(
            <div style={{ textAlign: "center", padding: 18 }}>
              <Radio size={34} color={purple} />
              <h3>No live rooms yet</h3>
              <p style={s.mutedText}>Create your first community room.</p>
              {button("Create Room", () => setShowCreate(true))}
            </div>
          )}

          <h2 style={s.heading}>Explore ELVORA</h2>
          <div style={s.featureGrid}>
            {[
              ["🏆", "Rankings", "rankings"],
              ["💎", "VIP Club", "vip"],
              ["🎁", "Gift Store", "store"],
              ["👨‍👩‍👧", "Families", "family"]
            ].map(item => (
              <button key={item[1]} style={s.feature}
                onClick={() => setTab(item[2])}>
                <span style={{ fontSize: 28 }}>{item[0]}</span>
                <b>{item[1]}</b>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === "discover" && (
        <>
          {title("Discover", "Find rooms and communities")}
          <div style={s.searchBox}>
            <Search size={18} />
            <input
              style={s.searchInput}
              placeholder="Search rooms..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={s.categoryRow}>
            {["General", "Music", "Friends", "Gaming", "Education"].map(c => (
              <button key={c} style={s.category}
                onClick={() => setSearch(c)}>{c}</button>
            ))}
          </div>
          {rooms.filter(r =>
            `${r.name} ${r.category}`.toLowerCase().includes(search.toLowerCase())
          ).map(room => (
            <div key={room.id} style={s.roomCard}>
              <div style={s.roomCover}>🎙️</div>
              <div style={{ flex: 1 }}>
                <b>{room.name}</b>
                <small style={s.mutedText}>{room.category}</small>
                <small style={s.mutedText}>{room.capacity} seats</small>
              </div>
              <button style={s.joinBtn} onClick={() => joinRoom(room)}>Join</button>
            </div>
          ))}
        </>
      )}

      {tab === "friends" && (
        <>
          {title("Friends", "Your ELVORA connections")}
          {card(
            <>
              <Users size={30} color={purple} />
              <h3>Find friends</h3>
              <p style={s.mutedText}>
                Search using an ELVORA ID when the friend service is connected.
              </p>
              <div style={s.searchBox}>
                <Search size={18} />
                <input style={s.searchInput} placeholder="Search ELVORA ID" />
              </div>
              <button style={s.primary}
                onClick={() => notify("Friend search backend is not connected yet.")}>
                Search
              </button>
            </>
          )}
          <h3>Friend Requests</h3>
          <p style={s.mutedText}>No friend requests yet.</p>
          <h3>Your Friends</h3>
          <p style={s.mutedText}>Your friends will appear here.</p>
        </>
      )}

      {tab === "inbox" && (
        <>
          {title("Inbox", "Messages and room invitations")}
          {card(
            <>
              <MessageCircle size={30} color={purple} />
              <h3>Messages</h3>
              <p style={s.mutedText}>
                Private messaging and invitation inbox will appear here.
              </p>
            </>
          )}
          {card(
            <>
              <Bell size={28} color={purple} />
              <h3>Notifications</h3>
              <p style={s.mutedText}>You are all caught up.</p>
            </>
          )}
        </>
      )}

      {tab === "profile" && (
        <>
          {title("My Profile", "Your ELVORA identity")}
          {card(
            <div style={{ textAlign: "center" }}>
              {avatar(profile?.displayName, profile?.photoURL, 86)}
              <h2>{profile?.displayName || "ELVORA User"}</h2>
              <span style={s.vipTag}>VIP MEMBER</span>
              <p style={s.mutedText}>{profile?.email}</p>
              <p style={s.mutedText}>ELVORA ID: {user.uid}</p>
              <p style={s.mutedText}>{profile?.bio || "Add your bio soon"}</p>
              {button("Edit Profile", () =>
                notify("Profile editor will be connected in the next stage.")
              )}
            </div>
          )}
          <div style={s.statsGrid}>
            <div style={s.stat}><b>0</b><small>Friends</small></div>
            <div style={s.stat}><b>0</b><small>Followers</small></div>
            <div style={s.stat}><b>1</b><small>Level</small></div>
          </div>
          {["My Gifts", "My Frames", "My Family", "Settings"].map(x =>
            card(<div style={s.rowBetween}><b>{x}</b><ChevronRight /></div>)
          )}
        </>
      )}

      {tab === "vip" && (
        <>
          {title("VIP Membership", "Special profile privileges")}
          <div style={s.vipHero}>
            <Crown size={44} color="#f5c76b" />
            <h2>ELVORA VIP</h2>
            <p>Exclusive profile styles and membership features.</p>
          </div>
          {["VIP 1 · Red", "VIP 2 · Pink", "VIP 3 · Premium"].map(x =>
            card(<div style={s.rowBetween}><b>{x}</b><Lock /></div>)
          )}
          <p style={s.mutedText}>
            Membership purchases are not enabled in this prototype.
          </p>
        </>
      )}

      {tab === "store" && (
        <>
          {title("Gift Store", "Explore virtual gifts")}
          <div style={s.giftGrid}>
            {gifts.map(g => (
              <div key={g[1]} style={s.giftItem}>
                <span style={{ fontSize: 34 }}>{g[0]}</span>
                <b>{g[1]}</b>
                <small>{g[2]} coins</small>
              </div>
            ))}
          </div>
          <p style={s.mutedText}>
            Preview only. Real coin purchases and gift transfers need secure
            payment and server-side validation.
          </p>
        </>
      )}

      {tab === "wallet" && (
        <>
          {title("Wallet", "Your ELVORA balance")}
          <div style={s.walletCard}>
            <Gem size={35} />
            <h2>0 Coins</h2>
            <p>Wallet balance preview</p>
          </div>
          {card(<><h3>Transactions</h3><p style={s.mutedText}>No transactions yet.</p></>)}
        </>
      )}

      {tab === "rankings" && (
        <>
          {title("Rankings", "Community leaderboard")}
          {["Global Ranking", "Room Ranking", "Family Ranking"].map((x, i) =>
            card(<div style={s.rowBetween}><b>{i + 1}. {x}</b><Trophy color="#f5c76b" /></div>)
          )}
          <p style={s.mutedText}>Rankings will show verified server data.</p>
        </>
      )}

      {tab === "family" && (
        <>
          {title("Families & CP", "Build your community")}
          {card(
            <>
              <Users size={32} color={purple} />
              <h3>Family Community</h3>
              <p style={s.mutedText}>
                Create or join a family and meet community members.
              </p>
              {button("Create Family", () => notify("Family backend not connected yet."))}
            </>
          )}
          {card(
            <>
              <Heart size={32} color="#f472b6" />
              <h3>CP / Partner</h3>
              <p style={s.mutedText}>
                Linked profiles and CP badges will be added with the
                relationship service.
              </p>
            </>
          )}
        </>
      )}

      {tab === "settings" && (
        <>
          {title("Settings", "Manage your account")}
          {card(
            <>
              <b>Account</b>
              <p style={s.mutedText}>{user.email}</p>
              <button style={s.dangerBtn} onClick={() => auth.signOut()}>
                <LogOut size={17} /> Sign Out
              </button>
            </>
          )}
        </>
      )}

      {showCreate && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.rowBetween}>
              <h3>Create Voice Room</h3>
              <button style={s.iconBtn} onClick={() => setShowCreate(false)}>
                <X />
              </button>
            </div>
            <input style={s.field} placeholder="Room name"
              value={roomName} onChange={e => setRoomName(e.target.value)} />
            <label style={s.label}>Stage seats</label>
            <select style={s.field} value={capacity}
              onChange={e => setCapacity(e.target.value)}>
              <option value="2">2 seats</option>
              <option value="10">10 seats</option>
              <option value="15">15 seats</option>
              <option value="20">20 seats</option>
            </select>
            <label style={s.label}>Category</label>
            <select style={s.field} value={category}
              onChange={e => setCategory(e.target.value)}>
              {["General", "Music", "Friends", "Gaming", "Education"].map(c =>
                <option key={c}>{c}</option>
              )}
            </select>
            <label style={s.label}>Privacy</label>
            <select style={s.field} value={privacy}
              onChange={e => setPrivacy(e.target.value)}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <button style={s.primary} disabled={busy} onClick={createRoom}>
              {busy ? "Creating..." : "Create Room"}
            </button>
          </div>
        </div>
      )}

      {activeProfile && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <button style={{ ...s.iconBtn, float: "right" }}
              onClick={() => setActiveProfile(null)}><X /></button>
            {avatar(activeProfile.displayName, activeProfile.photoURL, 75)}
            <h3>{activeProfile.displayName}</h3>
            <p style={s.mutedText}>ELVORA Member</p>
            <button style={s.primary}
              onClick={() => {
                setActiveProfile(null);
                notify("Profile details will be connected next.");
              }}>
              View Profile
            </button>
          </div>
        </div>
      )}

      <nav style={s.nav}>
        {[
          ["home", Home, "Home"],
          ["discover", Compass, "Discover"],
          ["friends", Users, "Friends"],
          ["inbox", MessageCircle, "Inbox"],
          ["profile", UserRound, "Profile"]
        ].map(([id, Icon, label]) => (
          <button key={id} style={{
            ...s.navBtn,
            color: tab === id ? "#d8b4fe" : "#8e829e"
          }} onClick={() => setTab(id)}>
            <Icon size={21} />
            <small>{label}</small>
          </button>
        ))}
      </nav>

      {error && <p style={s.error}>{error}</p>}
      {toast && <div style={s.toast}>{toast}</div>}
    </main>
  );
}

const s = {
  app: {
    minHeight: "100vh", maxWidth: 620, margin: "auto",
    padding: 18, paddingBottom: 105, boxSizing: "border-box",
    color: "#f7f4ff", background: "#0b0913",
    fontFamily: "'DM Sans', Arial, sans-serif"
  },
  topbar: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 0 22px"
  },
  logo: {
    fontSize: 25, fontWeight: 900, letterSpacing: 4,
    background: "linear-gradient(90deg,#e9d5ff,#9333ea)",
    WebkitBackgroundClip: "text", color: "transparent"
  },
  heading: { fontSize: 21, margin: "22px 0 5px" },
  mutedText: {
    display: "block", color: "#a99cbd",
    fontSize: 12, marginTop: 5
  },
  iconBtn: {
    background: "#241936", color: "white",
    border: "1px solid #49335f", borderRadius: 12,
    padding: 10, display: "grid", placeItems: "center"
  },
  avatar: {
    borderRadius: "50%",
    background: "linear-gradient(135deg,#9333ea,#4c1d95)",
    display: "grid", placeItems: "center",
    fontWeight: 800, overflow: "hidden"
  },
  avatarImage: { width: "100%", height: "100%", objectFit: "cover" },
  welcome: {
    display: "flex", alignItems: "center", gap: 12,
    padding: 15, background: "#191329",
    border: "1px solid #35264b", borderRadius: 17,
    marginBottom: 22
  },
  vipTag: {
    background: "linear-gradient(90deg,#f5c76b,#a86b18)",
    color: "#24142d", fontWeight: 900,
    padding: "5px 9px", borderRadius: 7, fontSize: 10
  },
  hero: {
    padding: 22, borderRadius: 20, marginBottom: 24,
    background: "linear-gradient(135deg,#35105c,#17102b 75%)",
    border: "1px solid #623a82"
  },
  heroBtn: {
    display: "flex", alignItems: "center", gap: 8,
    padding: 12, border: 0, borderRadius: 10,
    color: "white", background: "#9333ea", fontWeight: 700
  },
  rowBetween: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 10
  },
  textBtn: {
    display: "flex", alignItems: "center",
    color: "#d8b4fe", background: "none", border: 0
  },
  card: {
    background: "#191329", border: "1px solid #35264b",
    borderRadius: 16, padding: 16, marginBottom: 13
  },
  roomCard: {
    display: "flex", alignItems: "center", gap: 11,
    padding: 13, background: "#191329",
    border: "1px solid #35264b", borderRadius: 16,
    margin: "12px 0"
  },
  roomCover: {
    width: 52, height: 52, borderRadius: 14,
    display: "grid", placeItems: "center",
    background: "linear-gradient(135deg,#59208a,#26173b)",
    fontSize: 25
  },
  joinBtn: {
    background: "#9333ea", color: "white",
    border: 0, borderRadius: 9, padding: "10px 13px"
  },
  primary: {
    width: "100%", padding: 13, border: 0,
    borderRadius: 11, color: "white",
    background: "#9333ea", fontWeight: 700, marginTop: 12
  },
  featureGrid: {
    display: "grid", gridTemplateColumns: "repeat(2,1fr)",
    gap: 12, marginTop: 14
  },
  feature: {
    display: "grid", justifyItems: "start", gap: 8,
    padding: 17, color: "white", textAlign: "left",
    background: "#191329", border: "1px solid #35264b",
    borderRadius: 15
  },
  nav: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    maxWidth: 620, margin: "auto", display: "flex",
    justifyContent: "space-around", padding: "11px 3px",
    background: "#171123", borderTop: "1px solid #382849",
    zIndex: 5
  },
  navBtn: {
    display: "grid", justifyItems: "center", gap: 5,
    background: "none", border: 0, fontSize: 10
  },
  stage: {
    padding: 15, background: "#191329",
    borderRadius: 18, border: "1px solid #49335f",
    marginTop: 15
  },
  roomBanner: {
    display: "flex", alignItems: "center", gap: 12,
    padding: 15, borderRadius: 15,
    background: "linear-gradient(120deg,#35105c,#191329)"
  },
  liveBadge: {
    marginLeft: "auto", color: "#ff7777",
    background: "#491b34", padding: "5px 8px",
    borderRadius: 6, fontSize: 10, fontWeight: 800
  },
  seatGrid: {
    display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    gap: 17, marginTop: 22
  },
  seat: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 6, minWidth: 0,
    fontSize: 11, textAlign: "center"
  },
  emptySeat: {
    width: 54, height: 54, borderRadius: "50%",
    border: "1px dashed #70558f", color: "#b79acb",
    display: "grid", placeItems: "center"
  },
  memberRow: {
    display: "flex", alignItems: "center",
    gap: 10, padding: "10px 0",
    borderBottom: "1px solid #30233e"
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
  sendBtn: {
    background: "#9333ea", color: "white",
    border: 0, borderRadius: 10, padding: 12
  },
  roomControls: {
    display: "flex", justifyContent: "center",
    gap: 13, padding: 20
  },
  control: {
    display: "grid", justifyItems: "center", gap: 5,
    background: "#302044", color: "white",
    border: 0, borderRadius: 12, padding: 12
  },
  leaveBtn: {
    background: "#a12e58", color: "white",
    border: 0, borderRadius: 12, padding: 13
  },
  searchBox: {
    display: "flex", alignItems: "center", gap: 9,
    background: "#191329", border: "1px solid #49335f",
    padding: 12, borderRadius: 12, marginBottom: 13
  },
  searchInput: {
    flex: 1, minWidth: 0, background: "none",
    border: 0, outline: "none", color: "white"
  },
  categoryRow: {
    display: "flex", gap: 8, overflowX: "auto",
    paddingBottom: 12
  },
  category: {
    flexShrink: 0, background: "#302044", color: "white",
    border: "1px solid #49335f", borderRadius: 20, padding: "8px 13px"
  },
  overlay: {
    position: "fixed", inset: 0, zIndex: 20,
    background: "#000b", display: "grid",
    placeItems: "center", padding: 18
  },
  modal: {
    width: "100%", maxWidth: 430, maxHeight: "85vh",
    overflowY: "auto", background: "#191329",
    border: "1px solid #49335f", borderRadius: 20, padding: 19
  },
  field: {
    display: "block", width: "100%", boxSizing: "border-box",
    padding: 13, margin: "8px 0 14px", borderRadius: 10,
    background: "#0e0b19", color: "white",
    border: "1px solid #49335f"
  },
  label: { color: "#c4b5d5", fontSize: 12 },
  giftGrid: {
    display: "grid", gridTemplateColumns: "repeat(3,1fr)",
    gap: 10, margin: "18px 0"
  },
  giftItem: {
    display: "grid", justifyItems: "center", gap: 6,
    background: "#302044", border: "1px solid #49335f",
    color: "white", padding: 12, borderRadius: 13
  },
  walletCard: {
    padding: 25, borderRadius: 18, textAlign: "center",
    background: "linear-gradient(135deg,#59208a,#241438)"
  },
  vipHero: {
    textAlign: "center", padding: 28, borderRadius: 18,
    background: "linear-gradient(135deg,#493016,#21152b)"
  },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3,1fr)",
    gap: 10, margin: "15px 0"
  },
  stat: {
    display: "grid", justifyItems: "center",
    padding: 15, background: "#191329", borderRadius: 13
  },
  dangerBtn: {
    display: "flex", gap: 8, alignItems: "center",
    padding: 12, color: "white", background: "#922e48",
    border: 0, borderRadius: 10
  },
  error: { color: "#ff8585", fontSize: 13, padding: 10 },
  toast: {
    position: "fixed", bottom: 85, left: "50%",
    transform: "translateX(-50%)", zIndex: 30,
    background: "#49335f", color: "white",
    borderRadius: 10, padding: "12px 18px",
    width: "max-content", maxWidth: "90%"
  }
};
