import React, { useState, useEffect } from 'react';
import { isValidEmail, getRandomColor, generateGuid, setCookie, getCookie, removeCookie } from './common/utilities.js'
import './App.css';

function App() {
  const [showCookieWarning, setShowCookieWarning] = useState(true);
  const [joined, setJoined] = useState(false);
  const [uid, setUid] = useState('');
  const [uidExists, setUidExists] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [currentActiveUser, setCurrentActiveUser] = useState({});
  const [currentActiveRoom, setCurrentActiveRoom] = useState('General');
  const [currentNewRoom, setCurrentNewRoom] = useState('');
  const [currentMessage, setCurrentMessage] = useState({});
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState(['General']);

  useEffect(() => {
    const uidCookie = getCookie('uid');
    if (uidCookie) {
      setShowCookieWarning(false);
      setUidExists(true);
      setUid(uidCookie);
      setEmail('nageshkumar.y@gmail.com');
      setName('nagesh');
        // You can also set other state variables based on the uidCookie
    }
  }, []);

  const handleAcceptCookies = () => {
    setShowCookieWarning(false);
  };

  const handleClearSessions = () => {
    setShowCookieWarning(true);
    setUidExists(false);
    setUid('');
    setEmail('');
    setName('');
    removeCookie('uid');
    window.location.reload();
  };

  const handleNewJoin = async () => {
    if (showCookieWarning) {
      alert('Please consent to our use of cookies before proceeding');
      return;
    }
    // Validate email and name (optional)
    if (isValidEmail(email) && name.trim() !== '') {
      const uid = generateGuid();
      await handleJoin(uid, email, name);
    } else {
      alert('Please enter a valid email and name');
    }
  };

  const handleExistingJoin = async () => {
    await handleJoin(uid, email, name);
  };

  const handleJoin = async (uid, email, name) => {
    const randomColor = getRandomColor();
    const newUser = { uid, email, name, joined: true, color: randomColor };

    try {
      removeCookie('uid');
      setCookie('uid', uid.toString());
    } catch (error) {
      console.error('Error storing uid in cookie:', error);
      alert('An error occurred while joining the chat. Please try again.');
      return;
    }

    setUid(uid);
    setUidExists(true);
    setJoined(true);
    setCurrentActiveUser(newUser);
    setUsers([...users, newUser]);
    // Send user join request to server (if applicable)
  };

  const handleRoomChange = (room) => {
    setCurrentActiveRoom(room);
    // Fetch messages and users for the new room (if applicable)
  };

  const handleSendMessage = () => {
    if (joined) {
      // Prevent sending empty messages
      if (currentMessage.content.trim() !== '') {
        // Update the local message list
        setMessages([...messages, currentMessage]); // Add message object
        // Scroll to the bottom of the chat window
        const chatWindow = document.querySelector('.chat-window');
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Send the message to the server (if applicable)
      } else {
        alert('Please enter a message to send');
      }
    } else {
      alert('Please join the chat to send messages');
    }
  };

  const handleNewRoom = () => {
    if (joined) {
      // Prevent empty room names
      if (currentNewRoom.trim() !== '') {
        const isDuplicate = rooms.includes(currentNewRoom);
        if (!isDuplicate) {
          setRooms([...rooms, currentNewRoom]);
        } else {
          alert('This room name already exists!');
        }
      } else {
        alert('Please enter a room name to add');
      }
    } else {
      alert('Please join the chat to add rooms');
    }
  };

  return (
      <>
      {showCookieWarning && (
        <div id="cookie-consent" className="cookie-consent">
          This website uses cookies to enhance your experience. By continuing to use this website, you consent to our use of cookies.
          <button id="accept-cookies" onClick={handleAcceptCookies}>Accept Cookies</button>
        </div>
      )}
      {!joined ? (
        <div className="join-form">
          <h2>Join the Chatter</h2>
          <span style={{color:'red'}}>Session Id: {uid}</span>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button className="join-button" 
            onClick={handleNewJoin}>Join New Session</button>
          <button className="join-button" disabled={!uidExists}
            style={{ display: uidExists ? 'block' : 'none' }}
            onClick={handleExistingJoin}>Join Existing Session</button>
          <button className="join-button"
            onClick={handleClearSessions}>Clear Previous Sessions</button>
      </div>
      ) : (
        <div className="chat-app">
          <div className="chat-room-main">
            <div className="room-input">
              <label htmlFor="name">New Room:</label>
              <input
                type="text"
                id="newroom"
                placeholder="Type new room name here..."
                disabled={!joined}
                onChange={(e) => setCurrentNewRoom(e.target.value)}
              />
            </div>
            <div className="right-aligned-div">
              <button className="room-button"
                onClick={handleNewRoom} disabled={!joined}>Create</button>
            </div>
            <hr/>
            <h2>Chat Rooms</h2>
            <div className="chat-room">
              {/* Chat Room List */}
              {rooms.map((room, index) => (
                  <div key={index}>
                    <input
                      type="radio"
                      id={room}
                      name="room"
                      value={room}
                      checked={currentActiveRoom === room}
                      onChange={() => setCurrentActiveRoom(room)}
                    />
                    <label htmlFor={room}>{room}</label>
                  </div>
                ))}
            </div>
          </div>

          <div className="chat-window-main">
            {/* Chat Window */}
            {/* Display selected room name */}
            <h2>Current Chat Room: {currentActiveRoom}</h2>
            <div className="chat-window">
              <ul>
                {messages
                  .filter(message => message.room === currentActiveRoom)
                  .map((message, index) => (
                  <li key={index}>
                    <span className={message.sender.joined ? 'joined-user' : ''} 
                      style={{ color: message.sender.color }}>
                        {message.sender.name}</span> : {message.content}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="user-list-main">
            {/* User List */}
            <h2>User List</h2>
            <div className="user-list">
              <ul>
                {users.map((user, index) => (
                  <li key={index} className={user.joined ? 'joined-user' : ''}>
                    <span style={{ color: user.color }}>{user.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="message-window">
            <h2>Enter Your Message</h2>
            <div className="message-input">
              <label htmlFor="name">Message:</label>
              <textarea
                id="message"
                rows="5"
                placeholder="Type your message here..."
                disabled={!joined}
                onChange={(e) => setCurrentMessage({ content: e.target.value, sender: currentActiveUser, room: currentActiveRoom })}
              />
            </div>
            <div className="right-aligned-div">
              <button className="message-button"
                onClick={handleSendMessage} disabled={!joined}>Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
