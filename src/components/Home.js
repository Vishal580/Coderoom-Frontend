import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "../styles/components.css";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  // Generate eight character unique id mixed with capital letters and numbers
  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid().slice(0, 8).toUpperCase();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is requried");
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("room is created");
  };

  // when enter then also join
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="home-container min-vh-100 d-flex align-items-center">
      <div className="row w-100 g-0">
        {/* Left: form column */}
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center p-4">
          <div className="form-card rounded w-100">
            <div className="card-body text-center">
              <h1 className="colorful-text my-3">Welcome to Coderoom</h1>
              <h4 className="colorful-text mb-2 my-3">Enter the ROOM ID</h4>

              <div className="form-group align-items-center d-flex flex-column">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="form-control"
                  placeholder="Enter the Room ID"
                  onKeyUp={handleInputEnter}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  placeholder="Enter your name"
                  onKeyUp={handleInputEnter}
                />
              </div>
              <button
                onClick={joinRoom}
                className="btn-primary colorful-text my-2"
              >
                JOIN
              </button>
              <p className="mt-3 text-light">
                Don't have a Room ID? create
                <span
                  onClick={generateRoomId}
                  className="colorful-text ms-1 fw-bold"
                  style={{ cursor: "pointer" }}
                >
                  New Room
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: banner column */}
        <div className="col-6 d-none d-md-flex banner-column">
          <div className="banner-content">
            <img
              src="..\images\CODEROOM_Banner.jpg"
              alt="Coderoom Banner"
              className="banner-img"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
