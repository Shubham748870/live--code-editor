import React, { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Created a new room 👍");
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!roomId || !username) {
      toast.error("Room ID & Username are required!");
      return;
    }

    // ✅ username ko localStorage me save kar do
    localStorage.setItem("username", username);

    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom(e);
    }
  };

  return (
    <div className="homeWrapper">
      <div className="formWrapper">
        <img src="/code-sync-logo.png" alt="Code Sync Logo" />
        <h4 className="mainLabel">Paste invitation ROOM ID</h4>

        <form onSubmit={joinRoom}>
          <div className="inputGroup">
            <input
              type="text"
              className="inputBox"
              placeholder="ROOM ID"
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              onKeyUp={handleInputEnter}
            />
          </div>

          <div className="inputGroup">
            <input
              type="text"
              className="inputBox"
              placeholder="USERNAME"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleInputEnter}
            />
          </div>

          <button type="submit" className="btn joinBtn">
            Join
          </button>
        </form>

        <span className="createInfo">
          If you don't have an invite then create &nbsp;
          <a onClick={createNewRoom} href="/#" className="createNewBtn">
            new room
          </a>
        </span>
      </div>

      <footer>
        <h4>
          Built with ❤️ by{"Shubham "}
          <a
            href="https://github.com/Shubham748870"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shubham748870
          </a>
        </h4>
      </footer>
    </div>
  );
};

export default Home;
