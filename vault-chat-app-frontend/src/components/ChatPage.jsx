import React, { useEffect, useRef, useState } from 'react'
import { MdAttachFile, MdSend, MdLogout } from 'react-icons/md'
import useChatContext from "../context/ChatContext"
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessages } from "../services/RoomService";

const ChatPage = () => {
    const { roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser } = useChatContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!connected) navigate("/");
    }, [connected, roomId, currentUser]);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatBoxRef = useRef(null);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        async function loadMessages() {
            try {
                const msgs = await getMessages(roomId);
                setMessages(msgs);
            } catch (error) {}
        }
        if (connected) loadMessages();
    }, []);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scroll({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        const connectWebSocket = () => {
            const sock = new SockJS(`${baseURL}/chat`);
            const client = Stomp.over(sock);
            client.connect({}, () => {
                setStompClient(client);
                toast.success("connected");
                client.subscribe(`/topic/room/${roomId}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages((prev) => [...prev, newMessage]);
                });
            });
        };
        if (connected) connectWebSocket();
    }, [roomId]);

    const sendMessage = async () => {
        if (stompClient && connected && input.trim()) {
            const message = { sender: currentUser, content: input, roomId };
            stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
            setInput("");
        }
    };

    function handleLogout() {
        stompClient?.disconnect();
        setConnected(false);
        setRoomId("");
        setCurrentUser("");
        navigate("/");
    }

    function getInitial(name) {
        return name ? name.charAt(0).toUpperCase() : "?";
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .cp-root {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Outfit', sans-serif;
                    background: #0f1117;
                    overflow: hidden;
                    position: relative;
                }

                /* Background blobs */
                .cp-blob {
                    position: fixed;
                    border-radius: 50%;
                    filter: blur(100px);
                    pointer-events: none;
                    z-index: 0;
                    opacity: 0.2;
                }
                .cp-blob-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, #f97316, transparent 70%);
                    top: -150px; right: -100px;
                }
                .cp-blob-2 {
                    width: 450px; height: 450px;
                    background: radial-gradient(circle, #22c55e, transparent 70%);
                    bottom: -100px; left: -100px;
                }
                .cp-blob-3 {
                    width: 350px; height: 350px;
                    background: radial-gradient(circle, #3b82f6, transparent 70%);
                    top: 50%; left: 35%;
                    opacity: 0.1;
                }

                /* HEADER */
                .cp-header {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px;
                    height: 64px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    flex-shrink: 0;
                }

                .cp-header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .cp-header-dot {
                    width: 8px; height: 8px;
                    background: #22c55e;
                    border-radius: 50%;
                    box-shadow: 0 0 10px rgba(34,197,94,0.7);
                    animation: blink 2s infinite;
                }

                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }

                .cp-header-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #f1f5f9;
                }

                .cp-header-badge {
                    padding: 4px 12px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.09);
                    border-radius: 20px;
                    font-size: 12px;
                    color: rgba(255,255,255,0.45);
                    font-weight: 400;
                }

                .cp-header-badge span {
                    color: rgba(255,255,255,0.75);
                    font-weight: 500;
                }

                .cp-header-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .cp-user-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 5px 14px 5px 5px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                }

                .cp-user-avatar {
                    width: 26px; height: 26px;
                    background: rgba(249, 115, 22, 0.25);
                    border: 1px solid rgba(249, 115, 22, 0.4);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: #fb923c;
                }

                .cp-user-name {
                    font-size: 13px;
                    color: rgba(255,255,255,0.6);
                    font-weight: 400;
                }

                .cp-leave-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.25);
                    border-radius: 10px;
                    color: #f87171;
                    font-family: 'Outfit', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .cp-leave-btn:hover {
                    background: rgba(239, 68, 68, 0.18);
                    border-color: rgba(239, 68, 68, 0.45);
                    color: #fca5a5;
                }

                /* MESSAGES */
                .cp-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px 24px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    position: relative;
                    z-index: 1;
                }

                .cp-messages::-webkit-scrollbar { width: 4px; }
                .cp-messages::-webkit-scrollbar-track { background: transparent; }
                .cp-messages::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.08);
                    border-radius: 4px;
                }

                /* Empty */
                .cp-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    color: rgba(255,255,255,0.2);
                    font-size: 13px;
                    font-weight: 300;
                }

                .cp-empty-icon {
                    font-size: 32px;
                    opacity: 0.4;
                }

                /* Message row */
                .cp-msg-row {
                    display: flex;
                    align-items: flex-end;
                    gap: 10px;
                    animation: msgIn 0.22s ease both;
                }

                .cp-msg-row.mine { flex-direction: row-reverse; }

                @keyframes msgIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .cp-avatar {
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .cp-avatar.theirs {
                    background: rgba(34, 197, 94, 0.15);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: #4ade80;
                }

                .cp-avatar.mine {
                    background: rgba(249, 115, 22, 0.15);
                    border: 1px solid rgba(249, 115, 22, 0.3);
                    color: #fb923c;
                }

                .cp-bubble-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    max-width: 58%;
                }

                .cp-msg-row.mine .cp-bubble-wrap { align-items: flex-end; }

                .cp-sender {
                    font-size: 11px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.3);
                    padding: 0 6px;
                }

                /* Bubbles — keeping original orange / green colors, now glassy */
                .cp-bubble {
                    padding: 10px 16px;
                    font-size: 14px;
                    line-height: 1.55;
                    word-break: break-word;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }

                .cp-bubble.theirs {
                    background: rgba(34, 197, 94, 0.12);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    color: #d1fae5;
                    border-radius: 4px 18px 18px 18px;
                }

                .cp-bubble.mine {
                    background: rgba(249, 115, 22, 0.15);
                    border: 1px solid rgba(249, 115, 22, 0.25);
                    color: #ffedd5;
                    border-radius: 18px 4px 18px 18px;
                }

                /* INPUT BAR */
                .cp-input-bar {
                    position: relative;
                    z-index: 10;
                    padding: 14px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-top: 1px solid rgba(255, 255, 255, 0.07);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-shrink: 0;
                }

                .cp-attach-btn {
                    width: 42px; height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.09);
                    border-radius: 12px;
                    color: rgba(255,255,255,0.35);
                    cursor: pointer;
                    transition: all 0.18s ease;
                    flex-shrink: 0;
                }

                .cp-attach-btn:hover {
                    background: rgba(255,255,255,0.09);
                    color: rgba(255,255,255,0.6);
                }

                .cp-input-wrap {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.09);
                    border-radius: 14px;
                    padding: 0 18px;
                    transition: all 0.2s ease;
                }

                .cp-input-wrap:focus-within {
                    border-color: rgba(249, 115, 22, 0.35);
                    background: rgba(249, 115, 22, 0.04);
                    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.06);
                }

                .cp-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    padding: 13px 0;
                    font-family: 'Outfit', sans-serif;
                    font-size: 14px;
                    color: #f1f5f9;
                    font-weight: 400;
                }

                .cp-input::placeholder { color: rgba(255,255,255,0.2); }

                .cp-send-btn {
                    width: 42px; height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(34, 197, 94, 0.2);
                    border: 1px solid rgba(34, 197, 94, 0.35);
                    border-radius: 12px;
                    color: #4ade80;
                    cursor: pointer;
                    transition: all 0.18s ease;
                    flex-shrink: 0;
                }

                .cp-send-btn:hover {
                    background: rgba(34, 197, 94, 0.3);
                    border-color: rgba(34, 197, 94, 0.55);
                    box-shadow: 0 0 18px rgba(34, 197, 94, 0.2);
                    color: #86efac;
                }

                .cp-send-btn:active { transform: scale(0.95); }
            `}</style>

            <div className="cp-root">
                <div className="cp-blob cp-blob-1" />
                <div className="cp-blob cp-blob-2" />
                <div className="cp-blob cp-blob-3" />

                {/* Header */}
                <header className="cp-header">
                    <div className="cp-header-left">
                        <div className="cp-header-dot" />
                        <span className="cp-header-title">Vault</span>
                        <div className="cp-header-badge">
                            Room: <span>{roomId}</span>
                        </div>
                    </div>

                    <div className="cp-header-right">
                        <div className="cp-user-badge">
                            <div className="cp-user-avatar">{getInitial(currentUser)}</div>
                            <span className="cp-user-name">{currentUser}</span>
                        </div>
                        <button className="cp-leave-btn" onClick={handleLogout}>
                            <MdLogout size={15} />
                            Leave
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div className="cp-messages" ref={chatBoxRef}>
                    {messages.length === 0 ? (
                        <div className="cp-empty">
                            <div className="cp-empty-icon">💬</div>
                            <span>No messages yet — say hello!</span>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isMine = message.sender === currentUser;
                            return (
                                <div key={index} className={`cp-msg-row ${isMine ? "mine" : ""}`}>
                                    <div className={`cp-avatar ${isMine ? "mine" : "theirs"}`}>
                                        {getInitial(message.sender)}
                                    </div>
                                    <div className="cp-bubble-wrap">
                                        <span className="cp-sender">{message.sender}</span>
                                        <div className={`cp-bubble ${isMine ? "mine" : "theirs"}`}>
                                            {message.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input bar */}
                <div className="cp-input-bar">
                    <button className="cp-attach-btn">
                        <MdAttachFile size={18} />
                    </button>

                    <div className="cp-input-wrap">
                        <input
                            className="cp-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type your message here..."
                        />
                    </div>

                    <button className="cp-send-btn" onClick={sendMessage}>
                        <MdSend size={18} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatPage;
