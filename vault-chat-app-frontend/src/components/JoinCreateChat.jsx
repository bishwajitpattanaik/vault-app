import React, { useState } from 'react'
import toast from "react-hot-toast";
import chatIcon from "../assets/chat.png"
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';

const JoinCreateChat = () => {
    const [detail, setDetail] = useState({ roomId: "", userName: "" });
    const [loading, setLoading] = useState(null); // 'join' | 'create' | null
    const [focused, setFocused] = useState(null);

    const { setRoomId, setCurrentUser, setConnected } = useChatContext();
    const navigate = useNavigate();

    function handleFormInputChange(event) {
        setDetail({ ...detail, [event.target.name]: event.target.value });
    }

    function validateForm() {
        if (!detail.roomId.trim() || !detail.userName.trim()) {
            toast.error("Please fill in all fields.");
            return false;
        }
        return true;
    }

    async function joinChat() {
        if (!validateForm()) return;
        setLoading('join');
        try {
            const room = await joinChatApi(detail.roomId);
            toast.success("Joined successfully!");
            setCurrentUser(detail.userName);
            setRoomId(room.roomId);
            setConnected(true);
            navigate("/chat");
        } catch (error) {
            toast.error(error.status === 400 ? error.response.data : "Error joining room.");
        } finally { setLoading(null); }
    }

    async function createRoom() {
        if (!validateForm()) return;
        setLoading('create');
        try {
            const response = await createRoomApi(detail.roomId);
            toast.success("Room created!");
            setCurrentUser(detail.userName);
            setRoomId(response.roomId);
            setConnected(true);
            navigate("/chat");
        } catch (error) {
            toast.error(error.status === 400 ? "Room already exists!" : "Error creating room.");
        } finally { setLoading(null); }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                * { box-sizing: border-box; }

                .jc-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #111827;
                    font-family: 'Inter', sans-serif;
                    padding: 20px;
                }

                .jc-card {
                    width: 100%;
                    max-width: 400px;
                    background: #1f2937;
                    border-radius: 20px;
                    padding: 40px 36px 36px;
                    border: 1px solid rgba(255,255,255,0.06);
                    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
                    animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .jc-logo-wrap {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                }

                .jc-logo-bg {
                    width: 68px; height: 68px;
                    background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05));
                    border: 1px solid rgba(34,197,94,0.25);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .jc-logo-bg img {
                    width: 40px; height: 40px;
                    object-fit: contain;
                }

                .jc-heading {
                    font-size: 20px;
                    font-weight: 700;
                    color: #f9fafb;
                    text-align: center;
                    margin-bottom: 6px;
                    letter-spacing: -0.3px;
                }

                .jc-desc {
                    font-size: 13px;
                    color: #6b7280;
                    text-align: center;
                    margin-bottom: 32px;
                    font-weight: 400;
                }

                .jc-field {
                    margin-bottom: 16px;
                }

                .jc-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 500;
                    color: #9ca3af;
                    margin-bottom: 7px;
                    letter-spacing: 0.02em;
                }

                .jc-input-wrap {
                    position: relative;
                }

                .jc-input {
                    width: 100%;
                    background: #111827;
                    border: 1.5px solid #374151;
                    border-radius: 10px;
                    padding: 11px 14px;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    color: #f9fafb;
                    outline: none;
                    transition: border-color 0.18s ease, box-shadow 0.18s ease;
                }

                .jc-input::placeholder { color: #4b5563; }

                .jc-input:focus {
                    border-color: #22c55e;
                    box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
                }

                .jc-divider {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 24px 0 20px;
                }

                .jc-divider-line {
                    flex: 1;
                    height: 1px;
                    background: #374151;
                }

                .jc-divider-text {
                    font-size: 11px;
                    color: #4b5563;
                    white-space: nowrap;
                    font-weight: 500;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                .jc-actions {
                    display: flex;
                    gap: 10px;
                }

                .jc-btn {
                    flex: 1;
                    padding: 12px 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 13.5px;
                    font-weight: 600;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.18s ease;
                    letter-spacing: 0.01em;
                    position: relative;
                    overflow: hidden;
                }

                .jc-btn:active:not(:disabled) { transform: scale(0.97); }
                .jc-btn:disabled { opacity: 0.55; cursor: not-allowed; }

                .jc-btn-join {
                    background: #3b82f6;
                    color: #fff;
                    box-shadow: 0 2px 12px rgba(59,130,246,0.3);
                }
                .jc-btn-join:hover:not(:disabled) {
                    background: #2563eb;
                    box-shadow: 0 4px 20px rgba(59,130,246,0.45);
                    transform: translateY(-1px);
                }

                .jc-btn-create {
                    background: #22c55e;
                    color: #fff;
                    box-shadow: 0 2px 12px rgba(34,197,94,0.3);
                }
                .jc-btn-create:hover:not(:disabled) {
                    background: #16a34a;
                    box-shadow: 0 4px 20px rgba(34,197,94,0.45);
                    transform: translateY(-1px);
                }

                .jc-spinner {
                    display: inline-block;
                    width: 14px; height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                    vertical-align: middle;
                    margin-right: 6px;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .jc-footer {
                    margin-top: 28px;
                    text-align: center;
                    font-size: 11px;
                    color: #374151;
                }
            `}</style>

            <div className="jc-page">
                <div className="jc-card">

                    <div className="jc-logo-wrap">
                        <div className="jc-logo-bg">
                            <img src={chatIcon} alt="Vault" />
                        </div>
                    </div>

                    <h1 className="jc-heading">Join Room Or Create Room</h1>
                    <p className="jc-desc">Vault · Real-Time Communication Platform</p>

                    <div className="jc-field">
                        <label className="jc-label">Enter Your Name</label>
                        <input
                            className="jc-input"
                            type="text"
                            name="userName"
                            value={detail.userName}
                            onChange={handleFormInputChange}
                            placeholder="e.g. Bishwajit Pattanaik"
                            autoComplete="off"
                        />
                    </div>

                    <div className="jc-field">
                        <label className="jc-label">Enter Room ID Or New Room ID</label>
                        <input
                            className="jc-input"
                            type="text"
                            name="roomId"
                            value={detail.roomId}
                            onChange={handleFormInputChange}
                            placeholder="e.g. room-365"
                            autoComplete="off"
                            onKeyDown={(e) => e.key === "Enter" && joinChat()}
                        />
                    </div>

                    <div className="jc-divider">
                        <div className="jc-divider-line" />
                        <span className="jc-divider-text">Choose action</span>
                        <div className="jc-divider-line" />
                    </div>

                    <div className="jc-actions">
                        <button className="jc-btn jc-btn-join" onClick={joinChat} disabled={!!loading}>
                            {loading === 'join' && <span className="jc-spinner" />}
                            Join Room
                        </button>
                        <button className="jc-btn jc-btn-create" onClick={createRoom} disabled={!!loading}>
                            {loading === 'create' && <span className="jc-spinner" />}
                            Create Room
                        </button>
                    </div>

                    <p className="jc-footer">by Bishwajit Pattanaik</p>
                </div>
            </div>
        </>
    );
};

export default JoinCreateChat;
