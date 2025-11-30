import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { compileCode } from "../services/api";
import Avatar, { genConfig } from "react-nice-avatar";
import "./components.css";

// List of supported languages
const LANGUAGES = [
  "python3",
  "java",
  "c++",
  "nodejs/javascript",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const avatarMapRef = useRef({});
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const [compilerHeight, setCompilerHeight] = useState(30); // % of screen
  const compilerRef = useRef(null);
  const dragStartRef = useRef(null);
  const codeRef = useRef(null);

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);

  const handleDragStart = (e) => {
    dragStartRef.current = {
      startY: e.clientY,
      startHeight: compilerHeight,
    };
  };

  const handleDragMove = (e) => {
    if (!dragStartRef.current) return;
    const deltaY = e.clientY - dragStartRef.current.startY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.max(10, Math.min(75, dragStartRef.current.startHeight - deltaPercent));
    setCompilerHeight(newHeight);
  };

  const handleDragEnd = () => {
    dragStartRef.current = null;
  };

  useEffect(() => {
    if (isCompileWindowOpen) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [isCompileWindowOpen, compilerHeight]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          // ensure each client has an avatar config
          clients.forEach((c) => {
            if (!avatarMapRef.current[c.socketId]) {
              avatarMapRef.current[c.socketId] = genConfig();
            }
          });
          if (username !== Location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        // remove avatar for disconnected socket
        delete avatarMapRef.current[socketId];
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!Location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const result = await compileCode(codeRef.current, selectedLanguage);
      console.log("Backend response:", result);
      setOutput(result.output || JSON.stringify(result));
    } catch (error) {
      console.error("Error compiling code:", error);
      setOutput(error.error || "An error occurred");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  return (
    <div className="side-panel container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        {/* Client panel */}
        <div className="col-md-2 text-light d-flex flex-column">
          <h3 className="colorful-text my-2">{"</> "}CODEROOM</h3>
          <hr style={{ marginTop: "0rem" }} />

          {/* Client list container */}
          <div className="d-flex flex-column flex-grow-1 overflow-auto">
            <span className="mb-3 fw-bold">Members</span>
            {clients.map((client) => (
              <div
                key={client.socketId}
                className="d-flex align-items-center mb-2"
              >
                <Avatar
                  {...(avatarMapRef.current[client.socketId] ||
                    (avatarMapRef.current[client.socketId] = genConfig()))}
                  style={{ width: 50, height: 50, borderRadius: 8 }}
                />
                <span className="ms-2">{client.username}</span>
              </div>
            ))}
          </div>

          <hr />
          {/* Buttons */}
          <div className="mt-auto mb-3">
            <button className="btn-primary colorful-text w-100 mb-2" onClick={copyRoomId}>
              Copy Room ID
            </button>
            <button className="btn-secondary w-100" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="col-md-10 text-light d-flex flex-column position-relative">
          {/* Top bar: compiler toggle (left) and language selector (right) */}
          <div className="p-2 d-flex justify-content-end align-items-center">
            <button
              className="btn-primary colorful-text me-2"
              onClick={toggleCompileWindow}
            >
              {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
            </button>
            <select
              className="lang-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Editor */}
          <div className="flex-grow-1 overflow-hidden">
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={(code) => {
                codeRef.current = code;
              }}
            />
          </div>
        </div>
      </div>

      {/* Compiler section - overlay style */}
      {isCompileWindowOpen && (
        <div
          ref={compilerRef}
          className="compiler-panel"
          style={{
            position: "fixed",
            bottom: 0,
            left: "268px",
            right: 0,
            height: `${compilerHeight}vh`,
            zIndex: 1040,
          }}
        >
          {/* Drag handle */}
          <div
            className="compiler-drag-handle"
            onMouseDown={handleDragStart}
          >
            <div className="drag-indicator"></div>
          </div>

          {/* Compiler header */}
          <div className="d-flex justify-content-between align-items-center p-2 border-bottom border-secondary">
            <h5 className="colorful-text m-0">
              Compiler Output ({selectedLanguage})
            </h5>
            <div>
              <button
                className="btn-primary colorful-text me-2"
                onClick={runCode}
                disabled={isCompiling}
              >
                {isCompiling ? "Compiling..." : "Run Code"}
              </button>
              <button className="btn-secondary" onClick={toggleCompileWindow}>
                Close
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="compiler-output p-3">
            <pre className="bg-black p-2 rounded m-0">
              {output || "Output will appear here after compilation"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorPage;
