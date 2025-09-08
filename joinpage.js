import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";

const JoinPage = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  // create new room
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("New Room Created 🎉");
  };

  // join room
  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      toast.error("Room ID & Username required ⚠️");
      return;
    }

    // save username
    localStorage.setItem("username", username);

    // go to editor page
    navigate(`/editor/${roomId}`);
  };

  return (
    <div className="join-page">
      <div className="join-card">
        <h2>Join Live Code Room</h2>

        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button onClick={joinRoom}>Join Room</button>

        <p>
          Don’t have a room?{" "}
          <span onClick={createNewRoom} className="create-room">
            Create New
          </span>
        </p>
      </div>
    </div>
  );
};

export default JoinPage;
