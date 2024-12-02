import React, { useState } from 'react';
import './App.css';

function App() {
  const [joined, setJoined] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [currentActiveUser, setCurrentActiveUser] = useState({});
  const [currentActiveRoom, setCurrentActiveRoom] = useState('General');
  const [currentNewRoom, setCurrentNewRoom] = useState('');
  const [currentMessage, setCurrentMessage] = useState({});
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState(['General']);

  const handleJoin = () => {
    // Validate email and name (optional)
    if (isValidEmail(email) && name.trim() !== '') {
      const randomColor = getRandomColor(); // Assuming getRandomColor() returns a valid color
      const newUser = { email, name, joined: true, color: randomColor };
      setJoined(true);
      setCurrentActiveUser(newUser); // Assuming this state is used elsewhere
      setUsers([...users, newUser]);
      // Send user join request to server (if applicable)
    } else {
      alert('Please enter a valid email and name');
    }
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
      {!joined ? (
        <div className="join-form">
          <h2>Join the Chatter</h2>
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
            onClick={handleJoin}>Join</button>
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
                rows="4"
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

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    // Generate a random number between 0 and 8 (inclusive)
    const randomIndex = Math.floor(Math.random() * 9);
    color += letters[randomIndex];
  }
  return color.toString();
};

export default App;
