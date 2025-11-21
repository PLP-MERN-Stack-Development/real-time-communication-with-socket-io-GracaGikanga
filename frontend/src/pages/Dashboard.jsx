// Dashboard.jsx
import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import PrivateChat from "./PrivateChat";
import GlobalChat from "./GlobalChat";

const Dashboard = ({ user, token }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatUsers, setChatUsers] = useState([]); 
  // chatUsers: { user, status: 'pending' | 'accepted', isRequester: boolean }

  useEffect(() => {
    if (!user || !token) return;

    socket.auth = { token };
    socket.connect();

    socket.emit("user_join", { _id: user._id, name: user.name });

    socket.on("user_list", (list) =>
      setOnlineUsers(list.filter((u) => u._id !== user._id))
    );

    // Incoming chat request (for User B)
    socket.on("chat_request", ({ fromUser }) => {
      setChatUsers((prev) => {
        if (prev.some((c) => c.user._id === fromUser._id)) return prev;
        return [...prev, { user: fromUser, status: "pending", isRequester: false }];
      });
    });

    // Response to a chat request you sent (for User A)
    socket.on("chat_request_response", ({ toUserId, response }) => {
      if (response === "accepted") {
        setChatUsers((prev) =>
          prev.map((c) =>
            c.user._id === toUserId ? { ...c, status: "accepted" } : c
          )
        );
      } else {
        setChatUsers((prev) =>
          prev.filter((c) => c.user._id !== toUserId)
        );
        alert("Chat declined");
      }
    });

    return () => socket.disconnect();
  }, [user, token]);

  const handleSelectUser = (selectedUser) => {
    const exists = chatUsers.find((c) => c.user._id === selectedUser._id);
    if (!exists) {
      // User A sends a request to User B
      socket.emit("chat_request", { toUserId: selectedUser._id, fromUser: user });
      setChatUsers((prev) => [
        ...prev,
        { user: selectedUser, status: "pending", isRequester: true },
      ]);
    }
  };

  const respondChat = (userId, accept) => {
    socket.emit("chat_request_response", {
      toUserId: userId,
      response: accept ? "accepted" : "rejected",
    });
    if (accept) {
      setChatUsers((prev) =>
        prev.map((c) =>
          c.user._id === userId ? { ...c, status: "accepted" } : c
        )
      );
    } else {
      setChatUsers((prev) => prev.filter((c) => c.user._id !== userId));
      alert("Chat declined");
    }
  };

  return (
    <div className="min-h-screen bg-[#231123] flex items-center justify-center">
      <div className="flex gap-12 p-4 bg-[#44092E] w-full max-w-[1200px]">
        {/* Left Column */}
        <div style={{ width: 250 }}>
          <h3 className="text-white font-bold mb-2">Online Users:</h3>
          <ul className="flex flex-col gap-2 p-2">
            {onlineUsers.map((u) => (
              <li
                key={u._id}
                className="cursor-pointer p-2 border-b border-gray-200 rounded-md hover:bg-gray-700"
                onClick={() => handleSelectUser(u)}
              >
                {u.name} {u.online ? "🟢" : "⚪️"}
              </li>
            ))}
          </ul>

          {/* Chat Bars */}
          <div className="mt-4 flex flex-col gap-2">
            {chatUsers.map(({ user: cUser, status, isRequester }) => (
              <div
                key={cUser._id}
                className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-md"
              >
                <span>
                  {status === "pending"
                    ? isRequester
                      ? `Request sent to ${cUser.name}`
                      : `Chat request from ${cUser.name}`
                    : `Chat with ${cUser.name}`}
                </span>
                <div className="flex gap-2">
                  {status === "pending" && !isRequester && (
                    <>
                      <button
                        className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded-md text-sm"
                        onClick={() => respondChat(cUser._id, true)}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded-md text-sm"
                        onClick={() => respondChat(cUser._id, false)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-4">
          <GlobalChat
            user={user}
            token={token}
            onlineUsers={onlineUsers}
            onSelectUser={handleSelectUser}
          />

          {chatUsers
            .filter((c) => c.status === "accepted")
            .map(({ user: cUser }) => (
              <PrivateChat
                key={cUser._id}
                user={user}
                token={token}
                recipient={cUser}
                chatOpen={true}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
