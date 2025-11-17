//import { io } from "socket.io-client";
import { io } from "socket.io-client";

//Create a connection to your backend Socket.io server
export const socket = io("http://localhost:5000", {
    //forces Socket.io to use WebSockets only
  transports: ["websocket"], // ensures stable connection
});


socket.on("connect", () => {
  console.log("Connected to server!", socket.id);
});

// so that you can use the same socket connection in any React component
export default socket;