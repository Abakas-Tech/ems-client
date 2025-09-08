import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  getWelcomeMessage,
  sendMessage,
  selectMenu,
} from "../../api/chatBot.api";
import styles from "./chatBot.module.css";
import { Link, useNavigate } from "react-router-dom";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [menus, setMenus] = useState([]);
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show initial notification
  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  // Initialize session and fetch welcome message
  // Initialize session and fetch welcome message
  useEffect(() => {
    if (isOpen && !sessionId) {
      let storedSession = localStorage.getItem("chatSessionId");
      if (!storedSession) {
        storedSession = Math.random().toString(36).substring(2, 10);
        localStorage.setItem("chatSessionId", storedSession);
      }
      setSessionId(storedSession);

      setIsBotTyping(true);
      getWelcomeMessage()
        .then((res) => {
          setMessages([{ type: "bot", text: res.reply, flag: res.flag }]);
          setMenus(res.menus || []);
          setIsBotTyping(false);
        })
        .catch(() => {
          setIsBotTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "Ooops! Connection error. Please try again.",
              flag: 0,
            },
          ]);
        });
    }
  }, [isOpen, sessionId]);

  // Send user message
  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsBotTyping(true);

    sendMessage(sessionId, input)
      .then((res) => {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: res.reply, flag: res.flag },
        ]);
        setMenus(res.flag === 1 ? res.menus || [] : []);
        setIsBotTyping(false);
      })
      .catch(() => {
        setIsBotTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Ooops! Connection error. Please try again.",
            flag: 0,
          },
        ]);
      });
  };

  // Handle menu selection
  const handleMenuClick = (menuId) => {
    if (!sessionId) return;
    setIsBotTyping(true);

    selectMenu({ session_id: sessionId, menu_flag: menuId })
      .then((res) => {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: res.reply, flag: res.flag },
        ]);
        setMenus(res.flag === 1 ? res.menus || [] : []);
        setIsBotTyping(false);
      })
      .catch(() => {
        setIsBotTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Ooops! Connection error. Please try again.",
            flag: 0,
          },
        ]);
      });
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  const renderMenus = () => {
    if (!menus || menus.length === 0) return null;
    return (
      <div
        className="d-flex flex-wrap mb-1"
        style={{ gap: "10px", justifyContent: "flex-start" }}
      >
        {menus.map((menu) => (
          <button
            key={menu.id}
            className={`btn btn-light-main  btn-main fw-medium" ${styles.menuButton}`}
            onClick={() => handleMenuClick(menu.id)}
            style={{
              borderRadius: "5px",
              fontSize: "0.75rem",
              padding: "0px 5px",
              whiteSpace: "nowrap",
              height: "25px",
            }}
          >
            {menu.name}
          </button>
        ))}
      </div>
    );
  };

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
            className={`btn rounded-circle p-2 shadow-lg ${styles.floatingBtn}`}
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              width: "50px",
              height: "50px",
              fontSize: "18px",
              zIndex: 100050,
            }}
          >
            <i className="bi bi-chat-dots"></i>
          </button>
        </>
      )}

      {isOpen && (
        <div
          className={`${styles.chatContainer} ${
            isOpen ? styles.slideIn : styles.slideOut
          }`}
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            width: isMobile ? "100%" : "400px",
            height: isMobile ? "100%" : "500px",
            zIndex: 9999999999,
          }}
        >
          <div className="card shadow-lg " style={{ height: "100%" }}>
            <div
              className="card-header d-flex justify-content-between align-items-center p-2  "
              style={{ background: "#00A0C2", color: "#fff" }}
            >
              <h5 className="mb-0 text-white fs-5">Assistant Bot</h5>
              <div className="d-flex flex-row align-items-center">
                <button
                  className="btn-close btn-close-white fw-bold fs-3"
                  onClick={toggleOpen}
                ></button>
              </div>
            </div>

            <div
              className={`card-body ${styles.chatBody}`}
              style={{
                height: "400px",
                position: "relative",
                overflowY: "auto",
              }}
            >
              {messages.map((msg, index) => {
                const time = new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div key={index}>
                    {msg.type === "bot" ? (
                      <div className="d-flex justify-content-start align-items-center mb-1">
                        <p className="small mb-0">Assistant Bot</p>
                        <p className="small mb-0 text-muted ms-2">{time}</p>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-end align-items-center mb-1">
                        <p className="small mb-0 text-muted me-2">{time}</p>
                        <p className="small mb-0">You</p>
                      </div>
                    )}

                    <div
                      className={`d-flex flex-row ${
                        msg.type === "user"
                          ? "justify-content-end mb-4 pt-1"
                          : "justify-content-start"
                      } ${styles.messageBubble}`}
                    >
                      {msg.type === "user" ? (
                        <>
                          <div>
                            <p
                              className={`small p-2 me-3 mb-3 text-white ${styles.messageBox} ${styles.user}`}
                            >
                              {msg.text}
                            </p>
                          </div>
                          <i
                            className="bi bi-person-circle ms-3"
                            style={{ fontSize: "28px", color: "#00A0C2" }}
                          ></i>
                        </>
                      ) : (
                        <>
                          <i
                            className="bi bi-robot me-3"
                            style={{ fontSize: "28px", color: "#00A0C2" }}
                          ></i>
                          <div>
                            <p
                              className={`small p-2 ms-3 mb-3 ${styles.messageBox} ${styles.bot}`}
                            >
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                              {msg.flag === 1 && (
                                <button
                                  className="btn btn-light-main btn-md btn-main fw-medium"
                                  onClick={() => {
                                    navigate("/contact");
                                    toggleOpen();
                                  }}
                                  style={{
                                    borderRadius: "5px",
                                    fontSize: "0.8rem",
                                    height: "35px",
                                  }}
                                >
                                  Contact Support
                                </button>
                              )}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {menus.length > 0 && renderMenus()}

              {isBotTyping && (
                <div
                  className="d-flex justify-content-start"
                  style={{ backgroundColor: "transparent" }}
                >
                  <i
                    className="fas fa-robot"
                    style={{ fontSize: "30px", color: "#6c757d" }}
                  ></i>
                  <div className={styles.typingIndicator}>
                    <div className={styles.typingDot}></div>
                    <div className={styles.typingDot}></div>
                    <div className={styles.typingDot}></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="card-footer text-muted d-flex justify-content-start align-items-center p-3">
              <div className="input-group mb-0">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type message"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  style={{ borderRadius: "15px 0 0 15px", padding: "10px" }}
                />
                <button
                  className={` btn btn-light-main  btn-main fw-medium${styles.sendBtn}`}
                  type="button"
                  onClick={handleSend}
                  style={{ borderRadius: "0 15px 15px 0", padding: "10px" }}
                >
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
