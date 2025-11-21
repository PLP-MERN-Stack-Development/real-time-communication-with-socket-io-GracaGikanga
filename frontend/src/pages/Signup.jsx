import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

         if (res.data.success) {
      setMessage("✅ Signup successful! Redirecting to login...");

      // Redirect to login after 1.5 seconds
      setTimeout(() => navigate("/login"), 1500);
    }

    } catch (err) {
      setMessage("Signup failed: " + err.response?.data?.message);
    }
  };

  return (
     <div className="min-h-screen bg-[#233D4D] flex items-center justify-center">
    <div className= "p-12 w-100 h-100 mx-auto bg-[#722f37] mt-5 rounded-md">
      <h2 className= "font-bold text-lg mb-5">Create Account</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="block mb-2 p-2 bg-white rounded-md mb-2 w-80"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block mb-2 p-2 bg-white rounded-md mb-2 w-80"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block mb-2 p-2 bg-white rounded-md mb-20 w-80"
      />

      <button onClick={handleSignup} className="px-4 py-2 bg-black text-white rounded-md w-80">
        Sign Up
      </button>

          <p
            className={`mt-2 font-bold ${
                        message.startsWith("✅") ? "text-green-500" : "text-black-500"
                        }`}
        >
            {message}

        Already have an account?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          Login
        </span>
      </p>

      <p>{message}</p>
    </div>
    </div>
  );
}
