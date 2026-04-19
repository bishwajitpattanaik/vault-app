import React, { useEffect, useRef, useState } from 'react'
import { MdAttachFile, MdSend } from 'react-icons/md'
import { IoExitOutline } from 'react-icons/io5'
import useChatContext from "../context/ChatContext"
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessages } from "../services/RoomService";

// Deterministic color from name
const AVATAR_COLORS = [
    ['#f97316','#7c2d12'], ['#22c55e','#14532d'], ['#3b82f6','#1e3a5f'],
    ['#a855f7','#581c87'], ['#ec4899','#831843'], ['#14b8a6','#134e4a'],
    ['#f59e0b','#78350f'], ['#06b6d4','#164e63'],
];

function getAvatarMeta(name) {
    if (!name) return { initials: '?', bg: '#374151', text: '#9ca3af' };
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const [bg, text] = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    const parts = name.trim().split(' ');
    const initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
    return { initials, bg, text };
}

function formatTime(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ChatPage = () => {
    const { roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser } = useChatContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!connected) navigate("/");
    }, [connected]);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const chatBoxRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (connected) {
            getMessages(roomId).then(setMessages).catch(() => {});
        }
    }, []);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (!connected) return;
        const sock = new SockJS(`${baseURL}/chat`);
        const client = Stomp.over(sock);
        client.connect({}, () => {
            setStompClient(client);
            toast.success("Connected!");
            client.subscribe(`/topic/room/${roomId}`, (msg) => {
                setMessages(prev => [...prev, JSON.parse(msg.body)]);
            });
        });
    }, [roomId]);

    const sendMessage = () => {
        if (stompClient && connected && input.trim()) {
            stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify({
                sender: currentUser, content: input, roomId
            }));
            setInput("");
            inputRef.current?.focus();
        }
    };

    function handleLogout() {
        stompClient?.disconnect();
        setConnected(false); setRoomId(""); setCurrentUser("");
        navigate("/");
    }

    // Group consecutive messages by same sender
    function groupMessages(msgs) {
        const groups = [];
        msgs.forEach((msg, i) => {
            const prev = msgs[i - 1];
            if (prev && prev.sender === msg.sender) {
                groups[groups.length - 1].messages.push(msg);
            } else {
                groups.push({ sender: msg.sender, messages: [msg] });
            }
        });
        return groups;
    }

    const grouped = groupMessages(messages);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .cp-root {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: #111827;
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                }

                /* ── HEADER ── */
                .cp-header {
                    height: 62px;
                    flex-shrink: 0;
                    background: #1f2937;
                    border-bottom: 1px solid #374151;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                    z-index: 10;
                }

                .cp-header-left {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .cp-header-avatar {
                    width: 36px; height: 36px;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .cp-room-info { display: flex; flex-direction: column; gap: 2px; }

                .cp-room-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #f9fafb;
                    letter-spacing: -0.2px;
                }

                .cp-room-status {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 11.5px;
                    color: #6b7280;
                    font-weight: 400;
                }

                .cp-online-dot {
                    width: 7px; height: 7px;
                    background: #22c55e;
                    border-radius: 50%;
                    box-shadow: 0 0 6px rgba(34,197,94,0.7);
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }

                .cp-header-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .cp-user-chip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #111827;
                    border: 1px solid #374151;
                    border-radius: 20px;
                    padding: 4px 12px 4px 4px;
                }

                .cp-user-chip-avatar {
                    width: 26px; height: 26px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 700;
                    border: 1.5px solid #f97316;
                    flex-shrink: 0;
                }

                .cp-user-chip-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: #d1d5db;
                }

                .cp-leave-btn {
                    display: flex; align-items: center; gap: 6px;
                    padding: 8px 14px;
                    background: rgba(239,68,68,0.1);
                    border: 1px solid rgba(239,68,68,0.3);
                    border-radius: 10px;
                    color: #f87171;
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.18s;
                }

                .cp-leave-btn:hover {
                    background: rgba(239,68,68,0.18);
                    border-color: rgba(239,68,68,0.5);
                    color: #fca5a5;
                }

                /* ── MESSAGES ── */
                .cp-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 20px 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    scroll-behavior: smooth;
                }

                .cp-messages::-webkit-scrollbar { width: 5px; }
                .cp-messages::-webkit-scrollbar-track { background: transparent; }
                .cp-messages::-webkit-scrollbar-thumb {
                    background: #374151;
                    border-radius: 4px;
                }

                /* Empty state */
                .cp-empty {
                    flex: 1;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    gap: 10px;
                    color: #4b5563;
                    font-size: 13.5px;
                }

                .cp-empty-icon { font-size: 36px; }

                /* Message group */
                .cp-group {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    margin-bottom: 8px;
                    animation: msgIn 0.2s ease both;
                }

                @keyframes msgIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .cp-group.mine { align-items: flex-end; }
                .cp-group.theirs { align-items: flex-start; }

                .cp-group-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                    padding: 0 4px;
                }

                .cp-group.mine .cp-group-header { flex-direction: row-reverse; }

                .cp-group-avatar {
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 12px; font-weight: 700;
                    flex-shrink: 0;
                    letter-spacing: 0;
                }

                .cp-group.mine .cp-group-avatar {
                    border: 2px solid rgba(249,115,22,0.5);
                }
                .cp-group.theirs .cp-group-avatar {
                    border: 2px solid rgba(34,197,94,0.5);
                }

                .cp-sender-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: #9ca3af;
                }

                .cp-group.mine .cp-sender-name { color: #fb923c; }
                .cp-group.theirs .cp-sender-name { color: #4ade80; }

                /* Bubbles */
                .cp-bubble-row {
                    display: flex;
                    align-items: flex-end;
                    gap: 6px;
                }

                .cp-group.mine .cp-bubble-row { justify-content: flex-end; }

                .cp-bubble {
                    max-width: 320px;
                    padding: 9px 14px;
                    font-size: 13.5px;
                    line-height: 1.55;
                    font-weight: 400;
                    word-break: break-word;
                    position: relative;
                }

                .cp-group.mine .cp-bubble {
                    background: #ea580c;
                    color: #fff;
                    border-radius: 16px 4px 16px 16px;
                    box-shadow: 0 2px 8px rgba(234,88,12,0.3);
                }

                .cp-group.theirs .cp-bubble {
                    background: #16a34a;
                    color: #fff;
                    border-radius: 4px 16px 16px 16px;
                    box-shadow: 0 2px 8px rgba(22,163,74,0.3);
                }

                .cp-bubble-time {
                    font-size: 10px;
                    opacity: 0.65;
                    margin-top: 3px;
                    display: block;
                    text-align: right;
                }

                .cp-group.theirs .cp-bubble-time { text-align: left; }

                /* ── INPUT BAR ── */
                .cp-input-bar {
                    flex-shrink: 0;
                    background: #1f2937;
                    border-top: 1px solid #374151;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 10;
                }

                .cp-attach-btn {
                    width: 40px; height: 40px;
                    display: flex; align-items: center; justify-content: center;
                    background: #374151;
                    border: none;
                    border-radius: 10px;
                    color: #9ca3af;
                    cursor: pointer;
                    transition: all 0.15s;
                    flex-shrink: 0;
                }

                .cp-attach-btn:hover {
                    background: #4b5563;
                    color: #d1d5db;
                }

                .cp-input-wrap {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    background: #111827;
                    border: 1.5px solid #374151;
                    border-radius: 12px;
                    padding: 0 16px;
                    transition: border-color 0.18s, box-shadow 0.18s;
                    min-height: 44px;
                }

                .cp-input-wrap:focus-within {
                    border-color: #f97316;
                    box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
                }

                .cp-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    color: #f9fafb;
                    padding: 11px 0;
                }

                .cp-input::placeholder { color: #4b5563; }

                .cp-send-btn {
                    width: 42px; height: 42px;
                    display: flex; align-items: center; justify-content: center;
                    background: #22c55e;
                    border: none;
                    border-radius: 11px;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.18s;
                    flex-shrink: 0;
                    box-shadow: 0 2px 10px rgba(34,197,94,0.35);
                }

                .cp-send-btn:hover {
                    background: #16a34a;
                    box-shadow: 0 4px 18px rgba(34,197,94,0.45);
                    transform: scale(1.05);
                }

                .cp-send-btn:active { transform: scale(0.96); }
            `}</style>

            <div className="cp-root">

                {/* Header */}
                <header className="cp-header">
                    <div className="cp-header-left">
                        <div className="cp-header-avatar">💬</div>
                        <div className="cp-room-info">
                            <span className="cp-room-name">Room: {roomId}</span>
                            <div className="cp-room-status">
                                <div className="cp-online-dot" />
                                Connected · Vault Chat
                            </div>
                        </div>
                    </div>

                    <div className="cp-header-right">
                        <div className="cp-user-chip">
                            {(() => { const m = getAvatarMeta(currentUser); return (
                                <div className="cp-user-chip-avatar" style={{background: m.bg, color: m.text}}>
                                    {m.initials}
                                </div>
                            ); })()}
                            <span className="cp-user-chip-name">{currentUser}</span>
                        </div>
                        <button className="cp-leave-btn" onClick={handleLogout}>
                            <IoExitOutline size={16} />
                            Leave Room
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div className="cp-messages" ref={chatBoxRef}>
                    {grouped.length === 0 ? (
                        <div className="cp-empty">
                            <div className="cp-empty-icon">💬</div>
                            <span>No messages yet — say hello!</span>
                        </div>
                    ) : (
                        grouped.map((group, gi) => {
                            const isMine = group.sender === currentUser;
                            return (
                                <div key={gi} className={`cp-group ${isMine ? 'mine' : 'theirs'}`}>
                                    {/* Sender row */}
                                    <div className="cp-group-header">
                                        {(() => { const m = getAvatarMeta(group.sender); return (
                                            <div className="cp-group-avatar" style={{
                                                background: m.bg, color: m.text,
                                                border: `2px solid ${isMine ? 'rgba(249,115,22,0.5)' : 'rgba(34,197,94,0.5)'}`
                                            }}>
                                                {m.initials}
                                            </div>
                                        ); })()}
                                        <span className="cp-sender-name">{group.sender}</span>
                                    </div>

                                    {/* Bubbles */}
                                    {group.messages.map((msg, mi) => (
                                        <div key={mi} className="cp-bubble-row">
                                            <div className="cp-bubble">
                                                {msg.content}
                                                {msg.timeStamp && (
                                                    <span className="cp-bubble-time">
                                                        {formatTime(msg.timeStamp)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input bar */}
                <div className="cp-input-bar">
                    <button className="cp-attach-btn" title="Attach file">
                        <MdAttachFile size={18} />
                    </button>

                    <div className="cp-input-wrap">
                        <input
                            ref={inputRef}
                            className="cp-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type your message here..."
                            autoComplete="off"
                        />
                    </div>

                    <button className="cp-send-btn" onClick={sendMessage} title="Send">
                        <MdSend size={18} />
                    </button>
                </div>

            </div>
        </>
    );
};

export default ChatPage;
