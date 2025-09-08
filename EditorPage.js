import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

import ACTIONS from "../Actions";
import Editor from "../components/editor";
import MonacoEditor from "../components/MonacoEditor";

const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [username] = useState(localStorage.getItem("username") || "Guest");
  const [clients, setClients] = useState([]);
  const [code, setCode] = useState("// 👋 Start coding here...");
  const [useMonaco, setUseMonaco] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");

  const API_BASE =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  // ===== SOCKET.IO =====
  useEffect(() => {
    socketRef.current = io(API_BASE, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      socketRef.current.emit(ACTIONS.JOIN, { roomId, username });
    });

    socketRef.current.on(ACTIONS.JOINED, ({ clients, username: joinedUser }) => {
      setClients(clients || []);
      if (joinedUser && joinedUser !== username) {
        toast.success(`${joinedUser} joined 🎉`);
      }
    });

    socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
      if (code !== null) setCode(code);
    });

    socketRef.current.on(
      ACTIONS.DISCONNECTED,
      ({ socketId, username: leftUser }) => {
        if (leftUser) toast.error(`${leftUser} left 🚪`);
        setClients((prev) => prev.filter((c) => c.socketId !== socketId));
      }
    );

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.CODE_CHANGE);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, [roomId, username]);

  // ===== Copy Room ID =====
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied ✅");
    } catch {
      toast.error("❌ Copy failed");
    }
  };

  // ===== Leave Room =====
  const leaveRoom = () => {
    navigate("/");
    toast.error(`You left the room 🚪`);
  };

  // ===== Run Code =====
  const runCode = async () => {
    try {
      const res = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      setOutput(data.output || "No output");
    } catch (err) {
      setOutput("❌ Failed to run code");
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="userProfile">
          <div className="avatar">{username.charAt(0).toUpperCase()}</div>
          <div className="userInfo">
            <span className="username">{username}</span>
            <span className="status online">🟢 online</span>
          </div>
        </div>

        <div className="room-id">Room: {roomId}</div>
        <button onClick={copyRoomId}>Copy Room ID</button>
        <button onClick={() => setUseMonaco((u) => !u)}>
          Switch to {useMonaco ? "CodeMirror" : "Monaco"}
        </button>
        <button className="leave" onClick={leaveRoom}>
          Leave Room
        </button>

        <h4 style={{ marginTop: "20px" }}>Connected Users:</h4>
        <div className="client-list">
          {clients.length > 0 ? (
            clients.map((c) => (
              <div key={c.socketId} className="client">
                <div className="avatar">
                  {c.username.charAt(0).toUpperCase()}
                </div>
                <div className="userInfo">
                  <span className="username">{c.username}</span>
                  <span className="status online">🟢 online</span>
                </div>
              </div>
            ))
          ) : (
            <p>No users connected</p>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="main-content">
        <div className="editor-container">
          <h3>Editor ({useMonaco ? "Monaco" : "CodeMirror"})</h3>
          <div className="editor-box">
            {useMonaco ? (
              <MonacoEditor
                socketRef={socketRef}
                roomId={roomId}
                onCodeChange={setCode}
                value={code}
              />
            ) : (
              <Editor
                socketRef={socketRef}
                roomId={roomId}
                onCodeChange={setCode}
                value={code}
              />
            )}
          </div>
        </div>

        <div className="preview">
          <h3>Run Code</h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <button onClick={runCode}>Run ▶</button>

          {/* Output Handling */}
          {language === "html" || language === "css" ? (
            <iframe
              title="Live Preview"
              srcDoc={output}
              style={{
                width: "100%",
                height: "300px",
                border: "1px solid #ccc",
                marginTop: "10px",
              }}
            />
          ) : (
            <pre className="output-box">{output}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
