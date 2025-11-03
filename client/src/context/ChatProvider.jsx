import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { ChatContext } from "./ChatContext.js";
import toast from "react-hot-toast";

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // Fetch all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      } else {
        toast.error(data.message || "Failed to load users");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Fetch chat messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/user/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      } else {
        toast.error(data.message || "Failed to load messages");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prev) => {
          // avoid duplicates
          if (prev.some((m) => m._id === data.newMessage._id)) return prev;
          return [...prev, data.newMessage];
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Handle new message from socket
  const handleNewMessage = (newMessage) => {
    if (selectedUser && newMessage.senderId === selectedUser._id) {
      // message is from the currently opened chat
      newMessage.seen = true;
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
      axios.put(`/api/messages/mark/${newMessage._id}`);
    } else {
      // message is from other chat
      setUnseenMessages((prev) => ({
        ...prev,
        [newMessage.senderId]:
          prev[newMessage.senderId] ? prev[newMessage.senderId] + 1 : 1,
      }));
    }
  };

  // Subscribe to socket messages
  const subscribeToMessages = () => {
    if (!socket) return;
    socket.off("newMessage"); // clear old listeners before adding
    socket.on("newMessage", handleNewMessage);
  };

  // Unsubscribe
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    if (!socket) return;
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket]); // run only when socket changes

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
};
