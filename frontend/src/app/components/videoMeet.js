"use client";
import React, { useEffect, useRef, useState } from "react";

const server_url = "http://localhost:8000";
var connections = {};

const peerConfigConnection = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"],
    },
  ],
};

const VideoMeet = () => {
  const [currentUrl, setCurrentUrl] = useState("");
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();

  let[videoAvailable,setVideoAvailable]=useState(true);
  let[audioAvailable,setAudioAvailable]=useState(true);
  let[video,setVideo]=useState();
  let[audio,setAudio]=useState();
  let[screen,setScreen]=useState();
  let[showModal,setShowModal]=useState();
  let[screenAvailable,setScreenAvailable]=useState();
  let[messages,setMessages]=useState([]);
  let[message,setMessage]=useState('');
  let[newMessages,setNewMessages]=useState(0);
  let[askForUserName,setAskForUserName]=useState(true);
  let[userName,setUserName]=useState('');
  const videoRef = useRef([]);
  let[videos,setVideos]=useState([]);

  // if(isChrome == false){

  // }


  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  return <div>VideoMeet at {currentUrl}</div>;
};

export default VideoMeet;
