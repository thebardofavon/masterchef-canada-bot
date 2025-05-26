import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const chefs = ["Alvin Leung", "Michael Bonacini", "Claudio Aprile"];

const speak = (text, chef) => {
  const speech = new SpeechSynthesisUtterance(text);

  // Select a voice based on the chef
  const voices = speechSynthesis.getVoices();
  if (chef === "Alvin Leung") {
    speech.voice = voices.find(voice => voice.name.includes("Google UK English Male"));
  } else if (chef === "Michael Bonacini") {
    speech.voice = voices.find(voice => voice.name.includes("Google UK English Male"));
  } else {
    speech.voice = voices.find(voice => voice.name.includes("Google US English Male"));
  }

  speech.rate = 1.1;
  speech.pitch = 1;
  speechSynthesis.speak(speech);
};

function App() {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [chef, setChef] = useState(chefs[0]);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    speechSynthesis.onvoiceschanged = () => {
      console.log("Voices loaded:", speechSynthesis.getVoices());
    };
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "You", text: message };
    setChat([...chat, userMessage]);

    try {
      // const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/chat`, { message, chef });
      const res = await axios.post(`http://localhost:5000/chat`, { message, chef });

      const botMessage = { sender: chef, text: res.data.reply };

      setChat([...chat, userMessage, botMessage]);

      if (!isMuted) speak(res.data.reply, chef);
    } catch {
      setChat([...chat, userMessage, { sender: chef, text: "Error fetching response." }]);
    }

    setMessage("");
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>👨‍🍳 MasterChef Canada Chatbot</h1>
        <p className="subtitle">Chat with your favorite MasterChef Canada judges!</p>
      </div>
      
      <div className="main-content">
        <div className="controls">
          <select 
            className="chef-select"
            onChange={(e) => setChef(e.target.value)} 
            value={chef}
          >
            {chefs.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          
          <button 
            className="mute-button"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? "🔊 Unmute" : "🔇 Mute"}
          </button>
        </div>

        <div className="chat-container">
          <div className="chatbox">
            {chat.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.sender === "You" ? "user" : "bot"}`}
              >
                <div className="message-content">
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask your favorite chef a question..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              className="send-button"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;  