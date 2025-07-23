import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// socket instance outside the component to avoid multiple connects
let socket;

const NotificationListener = ({ token, userId }) => {
  useEffect(() => {
    if (!token || !userId) return;

    // Connect to socket server and pass JWT in query params
    socket = io("http://localhost:5000/notifications", {
      query: { token },
    });

    // Listen for notifications for this specific user
    socket.on("notification", (data) => {
      console.log("📥 New Notification:", data);
      toast.info(`🔔 ${data.message}`, { autoClose: 3000 }); // Or any UI handler
    });

    // Clean up socket connection
    return () => {
      socket.disconnect();
    };
  }, [token, userId]);

  return null; // It’s a headless listener, no UI needed
};

export default NotificationListener;
