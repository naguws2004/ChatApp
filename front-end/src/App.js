// App.js
import React, { useState, useEffect } from 'react';
import { isValidEmail, getRandomColor, generateGuid, setCookie, getCookie, removeCookie } from './common/utilities.js'
import { checkConnection, fetchRooms, addRoom, fetchUsers, addUser, fetchMessages, addMessage } from './service/service.js'
import './App.css';
import io from 'socket.io-client';

function App() {
  const [showCookieWarning, setShowCookieWarning] = useState(true);
  const [joined, setJoined] = useState(false);
  const [uid, setUid] = useState('');
  const [uidExists, setUidExists] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [currentActiveUser, setCurrentActiveUser] = useState({});
  const [currentActiveRoom, setCurrentActiveRoom] = useState('General');
  const [currentNewRoom, setCurrentNewRoom] = useState('');
  const [currentMessage, setCurrentMessage] = useState({});
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState('');
  const socket = io('http://localhost:7000');
  
  useEffect(() => {
    async function testConnection() {
      const connected = await checkConnection();
      if (!connected) {
        alert("Unable to connect to server. Try after some time.");
        window.close();
      } else {
        await handleFetchRooms();
        await handleFetchUsers();
        await handleFetchMessages();
      }
    }
    testConnection();

    const uidCookie = getCookie('uid');
    if (uidCookie) {
      setUid(uidCookie);
      setShowCookieWarning(false);
      setUidExists(true);
      const nameCookie = getCookie('name');
      const emailCookie = getCookie('email');
      const colorCookie = getCookie('color');
      setEmail(emailCookie);
      setName(nameCookie);
      setColor(colorCookie);
    }

    // Add the listener for the 'message' event
    socket.on('message', (data) => {
      setMessage(data); // Update the state with the received message
    });

    // Cleanup function to remove the listener on component unmount
    return () => socket.off('message');
  }, []);

  useEffect(() => {
    async function performFetch() {
      const parsedResponse = JSON.parse(message.message);
      const { type } = parsedResponse;
  
      if (type === 'new_room') {
        await handleFetchRooms();
      }
      if (type === 'new_user') {
        await handleFetchUsers();
      }
      if (type === 'new_message') {
        await handleFetchMessages();
      }
    }
    if (message) performFetch();
  }, [message]);

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
    removeCookie('name');
    removeCookie('email');
    removeCookie('color');
    window.location.reload();
  };

  const handleFetchRooms = async () => {
    const newRooms = await fetchRooms();
    setRooms(newRooms);
  }

  const handleFetchUsers = async () => {
    const newUsers = await fetchUsers();
    setUsers(newUsers);
  }

  const handleFetchMessages = async () => {
    const newMessages = await fetchMessages();
    setMessages(newMessages);
  }

  const handleNewJoin = async () => {
    if (showCookieWarning) {
      alert('Please consent to our use of cookies before proceeding');
      return;
    }
    // Validate email and name (optional)
    if (isValidEmail(email) && name.trim() !== '') {
      const newUid = generateGuid();
      const randomColor = getRandomColor();
      try {
        removeCookie('uid');
        removeCookie('name');
        removeCookie('email');
        removeCookie('color');
        setCookie('uid', newUid.toString());
        setCookie('name', name);
        setCookie('email', email);
        setCookie('color', randomColor);
      } catch (error) {
        console.error('Error storing uid in cookie:', error);
        alert('An error occurred while joining the chat. Please try again.');
        return;
      }
      // Send user join request to server
      const newUser = { uid: newUid, email: email, name: name, active: true, color: randomColor };
      await addUser(newUser);
      await handleJoin(newUser);
  } else {
      alert('Please enter a valid email and name');
    }
  };

  const handleExistingJoin = async () => {
    const existingUser = { uid: uid, email: email, name: name, active: true, color: color };
    await handleJoin(existingUser);
  };

  const handleJoin = async (user) => {
    setUid(user.uid);
    setUidExists(true);
    setJoined(true);
    setColor(user.color);
    setCurrentActiveUser(user);
  };

  const handleRoomChange = async (room) => {
    setCurrentActiveRoom(room);
    await handleFetchMessages();
  };

  const handleSendMessage = async () => {
    if (joined) {
      // Prevent sending empty messages
      if (currentMessage.content.trim() !== '') {
        // Send the message to the server 
        const newMid = generateGuid();
        const newMessage = { mid: newMid, content: currentMessage.content, sender: currentActiveUser, room: currentActiveRoom };
        await addMessage(newMessage);
        // Update the local message list
        // setMessages([...messages, currentMessage]); // Add message object
        // Scroll to the bottom of the chat window
        const chatWindow = document.querySelector('.chat-window');
        chatWindow.scrollTop = chatWindow.scrollHeight;
      } else {
        alert('Please enter a message to send');
      }
    } else {
      alert('Please join the chat to send messages');
    }
  };

  const handleNewRoom = async () => {
    if (joined) {
      // Prevent empty room names
      if (currentNewRoom.trim() !== '') {
        const isDuplicate = rooms.includes(currentNewRoom);
        if (!isDuplicate) {
          // Send room add request to server
          const newRid = generateGuid();
          const newRoom = { rid: newRid, name: currentNewRoom, active: true };
          await addRoom(newRoom);
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
                      onChange={(e) => handleRoomChange(e.target.value)}
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
              {messages
                .filter(message => message.room === currentActiveRoom)
                .map((message, index) => (
                <div style={{margin: '5px'}}>
                  <span className={message.sender.uid === uid ? 'joined-user-message' : ''} 
                      style={{ color: message.sender.color }}>
                        {message.sender.name} : {message.content}</span>
                </div>
                ))}
            </div>
          </div>

          <div className="user-list-main">
            {/* User List */}
            <h2>User List</h2>
            <div className="user-list">
              <ul>
                {users.map((user, index) => (
                  <li key={index} className={user.uid === uid ? 'joined-user' : ''}>
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
