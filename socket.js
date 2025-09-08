import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    forceNew: true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ["websocket"],
  };

  // Step 1: Pata lagao server kis port pe run ho raha hai
  let backendPort = 5000; // default
  try {
    const res = await fetch("http://localhost:5000/port"); 
    if (res.ok) {
      const data = await res.json();
      backendPort = data.port;
    }
  } catch (err) {
    console.error("❌ Backend port fetch error:", err);
  }

  // Step 2: Connect socket dynamically
  return io(`http://localhost:${backendPort}`, options);
};
