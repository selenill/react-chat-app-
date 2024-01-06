import React, { useEffect, useRef, useState } from "react";
import { auth, db } from './firebase';

import { GoogleAuthProvider,  signInWithPopup} from "firebase/auth";

import {
  query,
  collection,
  orderBy,
  onSnapshot,
  limit,
  DocumentData,
  addDoc, 
  serverTimestamp
} from "firebase/firestore";

import { useAuthState } from 'react-firebase-hooks/auth';


export const MainView: React.FC = () => {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <NavBar />
      {!user ? (
        <Home />
      ) : (
        <>
          <ChatRoom />
        </>
      )}
    </div>
  );
}

const NavBar: React.FC = () => {
  const [user] = useAuthState(auth);
  
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert(`Error signing in with Google: ${error}`);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      alert(`Error signing out: ${error}`);
    }
  };

  return (
    <nav className="nav-bar">
      <h1>React Chat</h1>
      {user ? (
        <button onClick={signOut} className="sign-out" type="button">
          Sign Out
        </button>
      ) : (
        <button className="sign-in" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
      )}
    </nav>
  );
};

const Home: React.FC = () => {
  return (
    <main className="home">
      <h2>Welcome to React Chat.</h2>
      <p>Sign in with Google to chat.</p>
    </main>
  );
};

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const scroll = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      const fetchedMessages: DocumentData[] = [];
      QuerySnapshot.forEach((doc) => {
        // Turn timestap into a number
        const data = doc.data();
        const timestamp = data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now();
        fetchedMessages.push({ ...data, id: doc.id, createdAt: timestamp });
      });
      // Sort Messages
      const sortedMessages = fetchedMessages.sort((a, b) => a.createdAt - b.createdAt);
      setMessages(sortedMessages);
    });
    return unsubscribe;
  }, []);

  return (
    <main className="chat-box">
      <div className="messages-wrapper">
        {messages?.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>
      {/* when a new message enters the chat, the screen scrolls down to the scroll div */}
      <span ref={scroll}></span>
      <MessageForm scroll={scroll} />
    </main>
  );
};

const Message: React.FC<DocumentData> = ({ message }) => {
  const [user] = useAuthState(auth);
  return (
    <div className={`chat-bubble ${user?.uid === message.uid ? "right" : ""}`}>
      <img
        className="chat-bubble__left"
        src={message.avatar}
        alt="user avatar"
      />
      <div className="chat-bubble__right">
        <p className="user-name">{message.name}</p>
        <p className="user-message">{message.text}</p>
      </div>
    </div>
  );
};

const MessageForm: React.FC<{ scroll: React.RefObject<HTMLSpanElement> }> = ({ scroll }) => {
  const [message, setMessage] = useState("");

  const sendMsg = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (message.trim() === "") {
      alert("Enter valid message");
      return;
    }
  
    const user = auth.currentUser;
  
    if (user) {
      const { uid, displayName, photoURL } = user;
      await addDoc(collection(db, "messages"), {
        text: message,
        name: displayName,
        avatar: photoURL,
        createdAt: serverTimestamp(),
        uid,
      });
      setMessage("");
      scroll.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      alert("No user is signed in.");
    }
  }

  return (
    <form onSubmit={(event) => sendMsg(event)} className="send-message">
      <label htmlFor="messageInput" hidden>
        Enter Message
      </label>
      <input
        id="messageInput"
        name="messageInput"
        type="text"
        className="form-input__input"
        placeholder="Write something nice..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
};


