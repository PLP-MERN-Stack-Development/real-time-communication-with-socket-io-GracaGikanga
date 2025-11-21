import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });

      if (res.data.success) {
        const loggedInUser = { _id: res.data.user._id, name: res.data.user.name };
        const token = res.data.token;

        localStorage.setItem("user", JSON.stringify(loggedInUser));
        localStorage.setItem("token", token);
        onLoginSuccess(loggedInUser, token);
        navigate("/dashboard");
      } else setMessage("Login failed: Invalid credentials");
    } catch (err) {
      console.error(err);
      setMessage("Login failed: Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#233D4D] flex items-center justify-center">
      <div className="p-12 w-100 mx-auto bg-[#722f37] rounded-md">
        <h2 className="font-bold text-lg mb-5">Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="block mb-2 p-2 bg-white rounded-md w-80"/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="block mb-2 p-2 bg-white rounded-md w-80"/>
        <button onClick={handleLogin} className="px-4 py-2 bg-black text-white rounded-md w-80">Login</button>
        <p className="mt-2">Don't have an account? <span className="text-green-200 cursor-pointer font-bold" onClick={()=>navigate("/signup")}>Sign up</span></p>
        {message && <p className="mt-2 text-red-300">{message}</p>}
      </div>
    </div>
  );
}
