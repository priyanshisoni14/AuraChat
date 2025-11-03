import React from "react";
import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext.js";
import { ChatContext } from "../context/ChatContext.js";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);

  const [msgImages, setMsgImages] = useState([]);

  // Collect all image URLs from messages
  useEffect(() => {
    if (messages?.length) {
      const images = messages
        .filter((msg) => msg.image)
        .map((msg) => msg.image);
      setMsgImages(images);
    } else {
      setMsgImages([]);
    }
  }, [messages]);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div
      className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll 
      border-l border-gray-600 p-5 ${selectedUser ? "max-md:hidden" : ""}`}
    >
      {/* User Info Section */}
      <div className="pt-10 flex flex-col items-center gap-2 text-center">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt={selectedUser.fullName}
          className="w-20 h-20 rounded-full object-cover border border-gray-600"
        />
        <h1 className="text-lg font-medium flex items-center gap-2 mt-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-500"
            }`}
          ></span>
          {selectedUser.fullName}
        </h1>
        <p className="text-gray-300 text-sm max-w-[80%] mt-1">
          {selectedUser.bio || "No bio available"}
        </p>
      </div>

      <hr className="border-[#ffffff]/30 my-5" />

      {/* Media Section */}
      <div className="px-2">
        <p className="text-sm font-semibold mb-2">Shared Media</p>
        {msgImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto">
            {msgImages.map((url) => (
              <div
                key={url}
                onClick={() => window.open(url, "_blank")}
                className="cursor-pointer rounded-md overflow-hidden hover:scale-105 transition-transform duration-200"
              >
                <img
                  src={url}
                  alt="shared"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-3">No media shared yet.</p>
        )}
      </div>

      {/* Logout Button */}
      <div className="sticky bottom-4 flex justify-center mt-10">
        <button
          onClick={logout}
          className="bg-gradient-to-r from-purple-400 to-violet-600 
          text-white text-sm font-light py-2 px-10 rounded-full 
          hover:opacity-90 transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
