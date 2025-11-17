import React, { useState } from "react";
import Login from "./pages/login";
import Dashboard from "./Pages/Dashboard"; // Your existing chat page

function App() {
  // 🚀 Track logged-in user
  const [user, setUser] = useState(null);

  // 🚀 Callback for successful login
  const handleLoginSuccess = (username) => {
    setUser(username);
  };

  return (
    <div>
      <h1>Socket.io Chat App</h1>
      {/* 🚀 Show login if no user, otherwise show chat */}
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard username={user} /> // Pass username to chat/dashboard
      )}
    </div>
  );
}

export default App;
