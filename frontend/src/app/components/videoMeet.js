"use client";

import { Button, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const server_url = "http://localhost:8000";

const peerConfigConnection = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

const VideoMeet = () => {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const connections = useRef({});

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [username, setUsername] = useState("");
  const [askForUserName, setAskForUserName] = useState(true);
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    const extractedRoomId = path.substring(path.lastIndexOf("/") + 1) || window.location.href;
    setRoomId(extractedRoomId);
    getPermissions();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (window.localStream) window.localStream.getTracks().forEach((track) => track.stop());
      Object.values(connections.current).forEach((conn) => conn.close());
    };
  }, []);

  useEffect(() => {
    if (video !== undefined && audio !== undefined) getUserMedia();
  }, [video, audio]);

  useEffect(() => {
    if (screen !== undefined) getDisplayMedia();
  }, [screen]);

  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("Permissions granted, local stream:", stream.id);
      setVideoAvailable(true);
      setAudioAvailable(true);
      window.localStream = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error getting permissions:", error);
      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  };

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video && videoAvailable, audio: audio && audioAvailable })
        .then(getUserMediaSuccess)
        .catch((e) => console.error("Error getting user media:", e));
    } else {
      try {
        if (window.localStream) window.localStream.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.error("Error stopping tracks:", e);
      }
    }
  };

  const getUserMediaSuccess = (stream) => {
    console.log("Got local stream:", stream.id);
    if (window.localStream) window.localStream.getTracks().forEach((track) => track.stop());
    window.localStream = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    for (let id in connections.current) {
      if (id === socketIdRef.current) continue;
      updateTracks(id, stream);
      // Only create offer if negotiation is needed
      if (connections.current[id].signalingState === "stable") {
        createOffer(id);
      }
    }
  };

  const getDisplayMedia = () => {
    if (screen && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then(getDisplayMediaSuccess)
        .catch((e) => {
          console.error("Error getting display media:", e);
          setScreen(false);
        });
    }
  };

  const getDisplayMediaSuccess = (stream) => {
    console.log("Got display media stream:", stream.id);
    if (window.localStream) window.localStream.getTracks().forEach((track) => track.stop());
    window.localStream = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    for (let id in connections.current) {
      if (id === socketIdRef.current) continue;
      updateTracks(id, stream);
      if (connections.current[id].signalingState === "stable") {
        createOffer(id);
      }
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        console.log("Screen sharing ended");
        setScreen(false);
        getUserMedia();
      };
    });
  };

  const updateTracks = (socketId, stream) => {
    const peerConnection = connections.current[socketId];
    if (!peerConnection) return;

    const senders = peerConnection.getSenders();
    stream.getTracks().forEach((track) => {
      const existingSender = senders.find((sender) => sender.track && sender.track.kind === track.kind);
      if (existingSender) {
        existingSender.replaceTrack(track).then(() => {
          console.log(`Replaced ${track.kind} track for ${socketId}`);
        }).catch((e) => console.error(`Error replacing ${track.kind} track:`, e));
      } else {
        peerConnection.addTrack(track, stream);
        console.log(`Added new ${track.kind} track for ${socketId}`);
      }
    });
  };

  const handleSignal = (fromId, message) => {
    console.log("Received signal from", fromId, message);
    const signal = JSON.parse(message);
    if (fromId === socketIdRef.current) return;

    const peerConnection = connections.current[fromId];
    if (!peerConnection) return;

    const signalingState = peerConnection.signalingState;
    console.log(`Signaling state for ${fromId}: ${signalingState}`);

    if (signal.sdp) {
      if (signal.sdp.type === "offer" && signalingState !== "stable") {
        console.warn(`Ignoring offer in state ${signalingState}`);
        return;
      }
      if (signal.sdp.type === "answer" && signalingState !== "have-local-offer") {
        console.warn(`Ignoring answer in state ${signalingState}`);
        return;
      }

      peerConnection
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          console.log(`Set remote ${signal.sdp.type} for ${fromId}`);
          if (signal.sdp.type === "offer") {
            peerConnection
              .createAnswer()
              .then((description) => {
                peerConnection.setLocalDescription(description).then(() => {
                  socketRef.current.emit("signals", fromId, JSON.stringify({ sdp: description }));
                  console.log(`Sent answer to ${fromId}`);
                });
              })
              .catch((e) => console.error("Error creating answer:", e));
          }
        })
        .catch((e) => console.error("Error setting remote description:", e));
    }

    if (signal.ice) {
      peerConnection
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((e) => console.error("Error adding ICE candidate:", e));
    }
  };

  const createPeerConnection = (socketId) => {
    console.log("Creating peer connection for:", socketId);
    connections.current[socketId] = new RTCPeerConnection(peerConfigConnection);

    connections.current[socketId].onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("signals", socketId, JSON.stringify({ ice: event.candidate }));
      }
    };

    connections.current[socketId].ontrack = (event) => {
      console.log("Received remote track from:", socketId, event.streams[0].id);
      setVideos((prev) => {
        if (!prev.some((v) => v.socketId === socketId)) {
          return [...prev, { socketId, stream: event.streams[0], autoPlay: true, playsInline: true }];
        }
        return prev;
      });
    };

    connections.current[socketId].onnegotiationneeded = () => {
      if (connections.current[socketId].signalingState === "stable") {
        createOffer(socketId);
      }
    };

    if (window.localStream) {
      updateTracks(socketId, window.localStream);
    }
  };

  const createOffer = (socketId) => {
    const peerConnection = connections.current[socketId];
    if (!peerConnection || peerConnection.signalingState !== "stable") {
      console.log(`Skipping offer creation for ${socketId} in state ${peerConnection?.signalingState}`);
      return;
    }

    peerConnection
      .createOffer()
      .then((description) => {
        peerConnection.setLocalDescription(description).then(() => {
          socketRef.current.emit("signals", socketId, JSON.stringify({ sdp: description }));
          console.log(`Sent offer to ${socketId}`);
        });
      })
      .catch((e) => console.error("Error creating offer:", e));
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      console.log("Connected with socket ID:", socketIdRef.current);
      socketRef.current.emit("join-call", roomId);
    });

    socketRef.current.on("signals", handleSignal);

    socketRef.current.on("user-joined", (id, clients) => {
      console.log("User joined:", id, "Clients:", clients);
      clients.forEach((clientId) => {
        if (clientId === socketIdRef.current || connections.current[clientId]) return;
        createPeerConnection(clientId);
      });

      if (id !== socketIdRef.current && connections.current[id] && window.localStream) {
        updateTracks(id, window.localStream);
        // Offer only if stable
        if (connections.current[id].signalingState === "stable") {
          createOffer(id);
        }
      }
    });

    socketRef.current.on("user-left", (id) => {
      console.log("User left:", id);
      setVideos((prev) => prev.filter((video) => video.socketId !== id));
      if (connections.current[id]) {
        connections.current[id].close();
        delete connections.current[id];
      }
    });
  };

  const toggleVideo = () => {
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setVideo(!video);
    }
  };

  const toggleAudio = () => {
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setAudio(!audio);
    }
  };

  const toggleScreen = () => {
    setScreen(!screen);
  };

  const startMeeting = () => {
    setAskForUserName(false);
    getUserMedia();
    connectToSocketServer();
  };

  const uniqueVideos = Array.from(new Map(videos.map((v) => [v.socketId, v])).values());

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {askForUserName ? (
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px", textAlign: "center" }}>
          <h2 style={{ marginBottom: "20px", color: "#333" }}>Enter Meeting Room</h2>
          <div style={{ marginBottom: "20px" }}>
            <TextField
              label="Your Name"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <Button variant="contained" color="primary" onClick={startMeeting} disabled={!username.trim()}>
              Join Meeting
            </Button>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ marginBottom: "10px", color: "#555" }}>Camera Preview</h3>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              style={{ width: "100%", maxWidth: "500px", borderRadius: "8px", border: "1px solid #ddd" }}
            />
          </div>
        </div>
      ) : (
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
            <Button variant={video ? "contained" : "outlined"} color="primary" onClick={toggleVideo}>
              {video ? "Camera On" : "Camera Off"}
            </Button>
            <Button variant={audio ? "contained" : "outlined"} color="primary" onClick={toggleAudio}>
              {audio ? "Mic On" : "Mic Off"}
            </Button>
            <Button variant={screen ? "contained" : "outlined"} color="primary" onClick={toggleScreen}>
              {screen ? "Screen On" : "Screen Off"}
            </Button>
          </div>

          <div
            style={{
              marginBottom: "20px",
              padding: "10px",
              backgroundColor: "#e8f4fd",
              borderRadius: "8px",
              color: "#0066cc",
            }}
          >
            <p><strong>Room ID:</strong> {roomId}</p>
            <p><strong>Your ID:</strong> {socketIdRef.current}</p>
            <p><strong>Connected Users:</strong> {videos.length + 1} (You + {videos.length} others)</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "20px" }}>
            <div style={{ backgroundColor: "#f8f8f8", borderRadius: "8px", overflow: "hidden", border: "2px solid #3f51b5" }}>
              <div style={{ padding: "10px", backgroundColor: "#3f51b5", color: "white", display: "flex", justifyContent: "space-between" }}>
                <span>{username || "You"}</span>
                <span>{socketIdRef.current ? `(ID: ${socketIdRef.current})` : ""}</span>
              </div>
              <video ref={localVideoRef} autoPlay muted style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            {uniqueVideos.map((video) => (
              <div
                key={video.socketId}
                style={{ backgroundColor: "#f8f8f8", borderRadius: "8px", overflow: "hidden", border: "2px solid #4caf50" }}
              >
                <div style={{ padding: "10px", backgroundColor: "#4caf50", color: "white", display: "flex", justifyContent: "space-between" }}>
                  <span>Remote User</span>
                  <span>(ID: {video.socketId})</span>
                </div>
                <video
                  autoPlay
                  playsInline
                  ref={(el) => {
                    if (el && video.stream) {
                      console.log(`Setting srcObject for video ${video.socketId}`);
                      el.srcObject = video.stream;
                      el.onloadedmetadata = () => {
                        el.play().catch((e) => console.error("Error playing video:", e));
                      };
                    }
                  }}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            ))}
          </div>

          {videos.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f8f8f8", borderRadius: "8px", marginTop: "20px", color: "#666" }}>
              <h3>Waiting for others to join...</h3>
              <p>Share the room ID with others to invite them to this meeting.</p>
              <p style={{ marginTop: "10px", fontWeight: "bold" }}>{roomId}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoMeet;