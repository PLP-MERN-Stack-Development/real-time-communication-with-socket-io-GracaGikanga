import { useState } from "react";
import axios from "axios";

export default function Login({ onLoginSuccess }) { // 🚀 Accept a prop to notify parent on successful login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // 🚀 Function to handle login
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });

      if (res.data.success) {
        setMessage("Login successful! Welcome " + res.data.username);
        // 🚀 Call parent function to notify chat component
        onLoginSuccess(res.data.username);
      }
    } catch (err) {
      setMessage("Login failed: Invalid credentials");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {/* 🚀 Login button */}
      <button onClick={handleLogin}>Login</button>
      <p>{message}</p>
    </div>
  );
}
