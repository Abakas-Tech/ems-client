import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { getWelcomeMessage, sendMessage } from "../../api/public/chatBot.api"; // Import provided API functions
import styles from "./chatBot.module.css"; 

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const messagesEndRef = useRef(null);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show notification for 3 seconds on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom smoothly when messages or typing indicator change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  // Fetch welcome message and set temporary session ID when chat opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      // Generate temporary random session ID as a string
      const newSessionId = Math.random().toString(36).substring(2, 10);
      setSessionId(newSessionId);
      setIsBotTyping(true);
      getWelcomeMessage()
        .then((res) => {
          setMessages([{ type: "bot", text: res.reply, flag: res.flag }]);
          setIsBotTyping(false);
        })
        .catch((err) => {
          console.error(err);
          setIsBotTyping(false);
        });
    }
  }, [isOpen, sessionId]);

  // Handle sending user message with session ID
  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsBotTyping(true);

    // Send message with session_id as string in body
    sendMessage( sessionId,  input )
      .then((res) => {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: res.reply, flag: res.flag },
        ]);
        setIsBotTyping(false);
      })
      .catch((err) => {
        console.error(err);
        setIsBotTyping(false);
      });
  };

  // Toggle chat window
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      {!isOpen && (
        <>
          {showNotification && (
            <div className={styles.notification}>
              Hey, I'm here to help you!
            </div>
          )}
          <button
            onClick={toggleOpen}
            className="btn btn-primary rounded-circle p-3 shadow-lg"
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              width: "60px",
              height: "60px",
              fontSize: "24px",
              zIndex: 1050,
            }}
          >
            <i className="bi bi-chat-dots"></i>
          </button>
        </>
      )}
      {isOpen && (
        <div
          className={`card shadow-lg border-0 ${styles.chatContainer} ${
            isOpen ? styles.slideIn : styles.slideOut
          }`}
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            width: isMobile ? "100%" : "400px",
            height: isMobile ? "100%" : "550px",
            zIndex: 1050,
            borderRadius: isMobile ? 0 : "15px",
          }}
        >
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center px-4 py-3">
            <h5 className="mb-0">Abakas Bot</h5>
            <button
              className="btn-close btn-close-white"
              onClick={toggleOpen}
            ></button>
          </div>
          <div
            className={`card-body d-flex flex-column p-4 ${styles.chatBody}`}
            style={{ height: "calc(100% - 140px)", backgroundColor: "#f8f9fa" }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 d-flex ${
                  msg.type === "user"
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`d-flex align-items-start ${
                    msg.type === "user" ? "flex-row-reverse" : "flex-row"
                  } ${styles.messageBubble}`}
                  style={{ maxWidth: "90%" }}
                >
                  <i
                    className={`bi ${
                      msg.type === "user" ? "bi-person-circle" : "bi-robot"
                    } ${msg.type === "user" ? "ms-3" : "me-3"}`}
                    style={{
                      fontSize: "28px",
                      color: msg.type === "user" ? "#007bff" : "#6c757d",
                    }}
                  ></i>
                  <div
                    className={`${styles.messageBox} ${
                      msg.type === "user" ? styles.user : styles.bot
                    }`}
                    style={{
                      padding: "10px 20px",
                      lineHeight: "1.5",
                    }}
                  >
                    {msg.type === "bot" ? (
                      <>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                        {msg.flag === 1 && (
                          <button
                            className="btn btn-outline-primary mt-3"
                            onClick={() => (window.location.href = "/contact")}
                            style={{ borderRadius: "20px" }}
                          >
                            Contact Support
                          </button>
                        )}
                      </>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isBotTyping && (
              <div className={`mb-4 d-flex justify-content-start`}>
                <div className={styles.typingIndicator}>
                  <i
                    className="bi bi-robot me-3"
                    style={{ fontSize: "28px", color: "#6c757d" }}
                  ></i>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="card-footer p-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                style={{ borderRadius: "20px 0 0 20px", padding: "12px" }}
              />
              <button
                className={`btn btn-primary ${styles.sendBtn}`}
                onClick={handleSend}
                style={{
                  borderRadius: "0 20px 20px 0",
                  padding: "12px 15px",
                  width: "50px",
                }}
              >
                <i className="bi bi-send" style={{ fontSize: "18px" }}></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
