import React, { useEffect, useRef, useState } from 'react'
import { use } from 'react';
import { MdAttachFile, MdSend } from 'react-icons/md'
import useChatContext from "../context/ChatContext"
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessages } from "../services/RoomService";

const ChatPage = () => {

    const {
        roomId,
        currentUser,
        connected,
        setConnected,
        setRoomId,
        setCurrentUser,
      } = useChatContext();
      //console.log(roomId);
      //console.log(currentUser);
      //console.log(connected);
    
    
    const navigate = useNavigate();
    useEffect(() => {
        if (!connected) {
          navigate("/");
        }
      }, [connected, roomId, currentUser]);



    const[messages, setMessages] = useState([])
    const[input, setInput] = useState([])
    const inputRef = useRef(null)
    const chatBoxRef = useRef(null)
    const [stompClient, setStompClient] = useState(null)
    
    //page init:
    //messages ko load karne honge

    useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessages(roomId);
        // console.log(messages);
        setMessages(messages);
      } catch (error) {}
    }
    if (connected) {
      loadMessages();
    }
  }, []);

  //scroll down

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  //stompClient ko init karne honge
  //subscribe

  useEffect(() => {
    const connectWebSocket = () => {
      ///SockJS
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);

        toast.success("connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);

          const newMessage = JSON.parse(message.body);

          setMessages((prev) => [...prev, newMessage]);

          //rest of the work after success receiving the message
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }

    //stomp client
  }, [roomId]);

  //send message handle

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      console.log(input);

      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
      setInput("");
    }

    //
  };

  function handleLogout() {
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }
    

  return (
    <div className="">

        {/*Header*/}
        <header className="dark:border-gray-700 fixed w-full dark:bg-gray-900 py-5 shadow flex justify-around items-center">

            {/*Room Name Container*/}
            <div>
                <h1 className="text-2xl font-semibold">
                    Room: <span>{roomId}</span>
                </h1>
            </div>
            
            {/*User Name Container*/}
            <div>
                <h1 className="text-2xl font-semibold">
                    User: <span>{currentUser}</span>
                </h1>
            </div>

            {/*button: leave room*/}
            <div>
                <button onClick={handleLogout} className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-lg">Leave Room</button>
            </div>

        </header>

        <main ref={chatBoxRef} className="py-20 px-10 w-full dark:bg-slate-600 mx-auto h-screen overflow-auto">
        
            {      
                messages.map((message, index) =>(
                    <div key={index}
                         className={`flex ${
                            message.sender == currentUser ? "justify-end":"justify-start"
                         } `}
                    >
                        <div className={`my-2 ${message.sender === currentUser ? "bg-orange-600" : "bg-green-600"} p-2 max-w-xs rounded`}>
                            <div className="flex flex-row gap-2">

                                <img className="h-10 w-10" src={'https://avatar.iran.liara.run/public/boy'} alt=""></img>

                                <div className="flex flex-col gap-1">

                                    <p className="text-sm font-bold">{message.sender}</p>
                                    <p>{message.content}</p>

                                </div>

                            </div>
                        </div>
                    </div>
                ))
            }
        
        </main>


        {/*Input Message Container*/}
        <div className="fixed bottom-4 w-full h-16">
            <div className="h-full pr-10 gap-2 flex items-center justify-between rounded-full w-1/2 mx-auto dark:bg-gray-900">
            <input
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    sendMessage();
                    }
                }}
                type="text"
                placeholder="Type your message here..."
                className="dark:border-gray-600 w-full dark:bg-gray-800 px-5 py-2 rounded-full h-full focus:outline-none"
            />
                
                <div className="flex gap-1">
                    
                    <button className="dark:bg-purple-600 h-10 w-10 flex justify-center items-center rounded-full">
                        <MdAttachFile size={20} />
                    </button>
                    
                    <button onClick={sendMessage} className="dark:bg-green-600 h-10 w-10 flex justify-center items-center rounded-full">
                        <MdSend size={20} />
                    </button>

                </div>
            </div>

        </div>

    </div>
  )
}

export default ChatPage

