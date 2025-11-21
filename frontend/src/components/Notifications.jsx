// src/components/Notifications.jsx
import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const handleNotification = (data) => {
      // Make sure the notification is for the current user
      if (data.receiverId === user._id || data.receiverId?._id === user._id) {
        // Add new notification
        setNotifications((prev) => [...prev, data]);

        // Optional: browser alert
        // alert(`New message from ${data.senderName}: ${data.text}`);
      }
    };

    socket.on("new_private_message", handleNotification);

    return () => {
      socket.off("new_private_message", handleNotification);
    };
  }, [user]);

  // Remove a notification after a few seconds (optional)
  useEffect(() => {
    if (notifications.length === 0) return;

    const timer = setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [notifications]);

  return (
    <div className="fixed top-2 right-2 flex flex-col gap-2 z-50">
      {notifications.map((n, idx) => (
        <div
          key={idx}
          className="bg-blue-600 text-white px-3 py-1 rounded-md shadow animate-fade-in"
        >
          <strong>{n.senderName}</strong>: {n.text.slice(0, 50)}
        </div>
      ))}
    </div>
  );
}
