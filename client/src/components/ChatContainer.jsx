import React, { useContext, useEffect, useRef, useState } from "react";
import { formatMessageTime } from "../lib/utils";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState("");

  // Send text message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // Send image message
  const handleSubmitImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Fetch messages on selecting user
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // If no user selected, show placeholder
  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-gray-400 bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} alt="Logo" className="w-16" />
        <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="h-full overflow-y-scroll relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {isOnline && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
        </div>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden w-6 cursor-pointer"
        />
        <img
          src={assets.help_icon}
          alt="help"
          className="max-md:hidden w-5 opacity-80"
        />
      </div>

      {/* Chat messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => {
          const isOwnMessage = msg.senderId === authUser._id;
          const userPic = isOwnMessage
            ? authUser.profilePic || assets.avatar_icon
            : selectedUser.profilePic || assets.avatar_icon;

          return (
            <div
              key={index}
              className={`flex items-end gap-2 mb-6 ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              {!isOwnMessage && (
                <img src={userPic} alt="" className="w-7 h-7 rounded-full" />
              )}

              {msg.image ? (
                <img
                  src={msg.image}
                  alt="sent"
                  className="max-w-[230px] border border-gray-700 rounded-lg"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-all text-white 
                  ${
                    isOwnMessage
                      ? "bg-violet-500/30 rounded-br-none"
                      : "bg-gray-700/40 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </p>
              )}

              <div className="text-center text-xs text-gray-500">
                {formatMessageTime(msg.createdAt)}
              </div>

              {isOwnMessage && (
                <img src={userPic} alt="" className="w-7 h-7 rounded-full" />
              )}
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-[#111]/40 backdrop-blur-md">
        <div className="flex-1 flex items-center bg-gray-100/10 px-3 rounded-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            placeholder="Send a message"
            className="flex-1 text-sm p-3 bg-transparent border-none outline-none text-white placeholder-gray-400"
          />

          <input
            onChange={handleSubmitImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="upload"
              className="w-5 mr-2 cursor-pointer hover:opacity-80"
            />
          </label>
        </div>

        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="send"
          className="w-7 cursor-pointer hover:opacity-80"
        />
      </div>
    </div>
  );
};

export default ChatContainer;
