import React, { useState } from 'react'
import toast from "react-hot-toast";
import chatIcon from "../assets/chat.png"
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';

const JoinCreateChat = () => {
    const [detail, setDetail] = useState({ roomId: "", userName: "" });
    const [loading, setLoading] = useState(false);

    const { setRoomId, setCurrentUser, setConnected } = useChatContext();
    const navigate = useNavigate();

    function handleFormInputChange(event) {
        setDetail({ ...detail, [event.target.name]: event.target.value });
    }

    function validateForm() {
        if (detail.roomId === "" || detail.userName === "") {
            toast.error("Invalid Input !!");
            return false;
        }
        return true;
    }

    async function joinChat() {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const room = await joinChatApi(detail.roomId);
            toast.success("joined..");
            setCurrentUser(detail.userName);
            setRoomId(room.roomId);
            setConnected(true);
            navigate("/chat");
        } catch (error) {
            toast.error(error.status === 400 ? error.response.data : "Error in joining room");
        } finally { setLoading(false); }
    }

    async function createRoom() {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const response = await createRoomApi(detail.roomId);
            toast.success("Room Created Successfully !!");
            setCurrentUser(detail.userName);
            setRoomId(response.roomId);
            setConnected(true);
            navigate("/chat");
        } catch (error) {
            toast.error(error.status === 400 ? "Room already exists !!" : "Error in creating room");
        } finally { setLoading(false); }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

                .jc-root {
                    min-height: 100vh;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Outfit', sans-serif;
                    position: relative;
                    overflow-y: auto;
                    background: #0f1117;
                    padding: 20px 16px;
                }

                .jc-blob {
                    position: fixed;
                    border-radius: 50%;
                    filter: blur(90px);
                    opacity: 0.3;
                    pointer-events: none;
                    z-index: 0;
                }
                .jc-blob-1 {
                    width: 450px; height: 450px;
                    background: radial-gradient(circle, #22c55e, transparent 70%);
                    top: -100px; left: -120px;
                }
                .jc-blob-2 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, #3b82f6, transparent 70%);
                    bottom: -80px; right: -100px;
                }
                .jc-blob-3 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, #8b5cf6, transparent 70%);
                    top: 40%; left: 60%;
                    opacity: 0.15;
                }

                .jc-card {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 420px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 36px 36px 32px;
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    box-shadow:
                        0 8px 40px rgba(0, 0, 0, 0.5),
                        inset 0 1px 0 rgba(255, 255, 255, 0.08);
                    animation: cardUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
                    flex-shrink: 0;
                }

                @keyframes cardUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .jc-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 12%; right: 12%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                }

                .jc-logo {
                    width: 68px; height: 68px;
                    margin: 0 auto 16px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04);
                }

                .jc-logo img {
                    width: 40px; height: 40px;
                    object-fit: contain;
                    filter: drop-shadow(0 0 10px rgba(34,197,94,0.45));
                }

                .jc-title {
                    font-size: 26px;
                    font-weight: 700;
                    color: #f1f5f9;
                    text-align: center;
                    margin-bottom: 5px;
                    letter-spacing: -0.4px;
                }

                .jc-subtitle {
                    font-size: 13px;
                    color: rgba(255,255,255,0.32);
                    text-align: center;
                    margin-bottom: 24px;
                    font-weight: 300;
                }

                .jc-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
                    margin-bottom: 22px;
                }

                .jc-field { margin-bottom: 14px; }

                .jc-label {
                    display: block;
                    font-size: 11.5px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.4);
                    margin-bottom: 8px;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .jc-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 12px;
                    padding: 12px 16px;
                    font-family: 'Outfit', sans-serif;
                    font-size: 14px;
                    color: #f1f5f9;
                    outline: none;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }

                .jc-input::placeholder { color: rgba(255,255,255,0.18); }

                .jc-input:focus {
                    border-color: rgba(34, 197, 94, 0.45);
                    background: rgba(34, 197, 94, 0.04);
                    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.07);
                }

                .jc-buttons {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }

                .jc-btn {
                    flex: 1;
                    padding: 13px 10px;
                    font-family: 'Outfit', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    letter-spacing: 0.01em;
                }

                .jc-btn:active { transform: scale(0.97); }
                .jc-btn:disabled { opacity: 0.45; cursor: not-allowed; }

                .jc-btn-join {
                    background: rgba(59, 130, 246, 0.18);
                    border: 1px solid rgba(59, 130, 246, 0.35);
                    color: #93c5fd;
                }
                .jc-btn-join:hover:not(:disabled) {
                    background: rgba(59, 130, 246, 0.28);
                    border-color: rgba(59, 130, 246, 0.55);
                    box-shadow: 0 0 22px rgba(59, 130, 246, 0.18);
                    color: #bfdbfe;
                }

                .jc-btn-create {
                    background: rgba(34, 197, 94, 0.18);
                    border: 1px solid rgba(34, 197, 94, 0.35);
                    color: #86efac;
                }
                .jc-btn-create:hover:not(:disabled) {
                    background: rgba(34, 197, 94, 0.28);
                    border-color: rgba(34, 197, 94, 0.55);
                    box-shadow: 0 0 22px rgba(34, 197, 94, 0.18);
                    color: #bbf7d0;
                }

                .jc-footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 11px;
                    color: rgba(255,255,255,0.16);
                    font-weight: 300;
                }
            `}</style>

            <div className="jc-root">
                <div className="jc-blob jc-blob-1" />
                <div className="jc-blob jc-blob-2" />
                <div className="jc-blob jc-blob-3" />

                <div className="jc-card">
                    <div className="jc-logo">
                        <img src={chatIcon} alt="Vault" />
                    </div>

                    <h1 className="jc-title">Vault by Bishwajit Pattanaik</h1>
                    <p className="jc-subtitle">Real-Time Communication Platform</p>

                    <div className="jc-divider" />

                    <div className="jc-field">
                        <label className="jc-label">Your Name</label>
                        <input
                            className="jc-input"
                            type="text"
                            name="userName"
                            value={detail.userName}
                            onChange={handleFormInputChange}
                            placeholder="Enter your name"
                            autoComplete="off"
                        />
                    </div>

                    <div className="jc-field">
                        <label className="jc-label">Room ID</label>
                        <input
                            className="jc-input"
                            type="text"
                            name="roomId"
                            value={detail.roomId}
                            onChange={handleFormInputChange}
                            placeholder="Enter Room ID or New Room ID"
                            autoComplete="off"
                            onKeyDown={(e) => e.key === "Enter" && joinChat()}
                        />
                    </div>

                    <div className="jc-buttons">
                        <button className="jc-btn jc-btn-join" onClick={joinChat} disabled={loading}>
                            {loading ? "..." : "Join Room"}
                        </button>
                        <button className="jc-btn jc-btn-create" onClick={createRoom} disabled={loading}>
                            {loading ? "..." : "Create Room"}
                        </button>
                    </div>

                    <p className="jc-footer">Encrypted · Secure · Real-time</p>
                </div>
            </div>
        </>
    );
};

export default JoinCreateChat;
