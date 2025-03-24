"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  const [changingText, setChangingText] = useState("chats");
  const textOptions = ["chats", "Messages", "Live rooms", "Screen sharing"];

  useEffect(() => {
    const interval = setInterval(() => {
      setChangingText((prev) => {
        const nextIndex = (textOptions.indexOf(prev) + 1) % textOptions.length;
        return textOptions[nextIndex];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-4 min-h-screen-2rem text-white px-6 md:px-16">
      {/* Main Section */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between w-full max-w-6xl gap-10">
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 1 }} 
          className="w-full md:w-1/2 text-center md:text-left space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Experience <span className="text-purple-400">Real-Time</span> Communication
          </h1>
          <p className="text-xl text-gray-300">
            Engage in <span className="text-purple-400 animate-pulse">{changingText}</span> and seamless streaming like never before!
          </p>
          <Link href="/get-started" className="inline-block bg-purple-500 px-6 py-3 text-lg rounded-md hover:bg-purple-600 transition-all shadow-lg">
            Get Started
          </Link>
        </motion.div>

        {/* Right Image - Hidden on Small Screens */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 1.2 }} 
          className="hidden md:block w-full md:w-1/2  justify-center"
        >
          <Image 
            src="/images/background-removebg.png" 
            alt="Chat Illustration" 
            width={500} 
            height={500} 
            className="rounded-lg shadow-lg object-contain"
          />
        </motion.div>
      </div>
    </div>
  );
}
