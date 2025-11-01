import { AuthContext } from './AuthContext';
import  axios  from 'axios'
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL;


axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {

const [token, setToken]= useState(localStorage.getItem('token'))
const [authUser, setAuthUser]= useState(null)
const [onlineUsers, setOnlineUsers]= useState([])
const [socket, setSocket]= useState(null)
const [loading, setLoading] = useState(true)


// check if token is valid if so set the data and connect to socket
const checkAuth = async ()=>{
    try {
        const {data} = await axios.get('/api/auth/check')
        if(data.success){
            setAuthUser(data.user)
            connectSocket(data.user)
        }
    } catch (error) {
        toast.error(error.message)
    }
}

//login function to handle user authentication and socket connection
const login = async (state, credentials)=>{
    try {
        const {data} = await axios.post(`/api/auth/${state}`, credentials)
        if(data.success){
            setAuthUser(data.user)
            connectSocket(data.user)
            axios.defaults.headers.common["token"]= data.token
            setToken(data.token)
            localStorage.setItem('token', data.token)
            toast.success(data.message)
        } else {
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
}

//logout function to handle user logout and socket disconnection
const logout = async ()=>{
    localStorage.removeItem('token')
    setToken(null)
    setAuthUser(null)
    setOnlineUsers([])
    axios.defaults.headers.common["token"]= null
    toast.success('You have been logged out')
    socket.disconnect()
}

//update profile function to handle user profile update
const updateProfile = async (body) => {
  try {
    const token = localStorage.getItem("token"); // or from context/state

    const { data } = await axios.put(
      "/api/auth/update-profile",
      body,
      {
        headers: {
          token, // required by protectRoute middleware
        },
      }
    );

    if (data.success) {
      setAuthUser(data.user);
      toast.success("Profile updated successfully");
      return true;
    } else {
      toast.error(data.message || "Update failed");
    }
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Something went wrong");
    return false;
  }
};


//connect socket function to handle socket connection and online users updates
const connectSocket = (userData)=>{
    if(!userData || socket?.connected) return;
    const newsocket = io(backendUrl, {
        query: {
            userId: userData._id,
        }
    });
    newsocket.connect();
    setSocket(newsocket);
    newsocket.on("getOnlineUsers", (userIds)=>{
        setOnlineUsers(userIds)
    })
}


useEffect(() => {
  const initAuth = async () => {
    if (token) {
      axios.defaults.headers.common["token"] = token
      await checkAuth()
    }
    setLoading(false) 
  }

  initAuth()

  return () => {
    if (socket) socket.disconnect()
  }
}, [])

    const value= {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        checkAuth,
        loading
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}