// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import GlobalChat from "./pages/GlobalChat";
import Signup from "./pages/Signup";

function App() {
  const [user, setUser] = useState(null);

  // ✅ Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // ✅ Save user to localStorage whenever it changes
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <Router>
      <div style={{ padding: 20 }}>
        <h1>Socket.io Chat App</h1>

        <Routes>
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />

          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              user ? <Dashboard user={user} /> : <Navigate to="/login" />
            }
          />

          <Route
            path="/globalchat"
            element={user ? <GlobalChat user={user} /> : <Navigate to="/login" />}
          />

          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
