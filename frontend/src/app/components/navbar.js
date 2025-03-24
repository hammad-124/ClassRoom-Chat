"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/10 border-b border-white/20 shadow-md px-6 md:px-16 py-2 flex justify-between items-center z-50">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <Image src="/images/logo.webp" alt="ClassRoomChat Logo" width={50} height={50} />
        <Link href="/" className="text-2xl font-bold text-purple-400">
          ClassRoomChat
        </Link>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/join" className="text-white hover:text-purple-400 transition-all">
          Join as Guest
        </Link>
        <Link href="/register" className="text-white hover:text-purple-400 transition-all">
          Register
        </Link>
        <Link href="/auth" className="bg-purple-500 px-5 py-2 rounded-md hover:bg-purple-600 transition-all shadow-md">
          Login
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden text-purple-400" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Dropdown Menu */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: menuOpen ? 1 : 0, y: menuOpen ? 0 : -10 }}
        transition={{ duration: 0.3 }}
        className={`md:hidden absolute top-full left-0 w-full bg-black/80 border-t border-white/20 flex flex-col items-center gap-4 py-4 transition-all ${
          menuOpen ? "block" : "hidden"
        }`}
      >
        <Link href="/join" className="text-white hover:text-purple-400 transition-all" onClick={() => setMenuOpen(false)}>
          Join as Guest
        </Link>
        <Link href="/register" className="text-white hover:text-purple-400 transition-all" onClick={() => setMenuOpen(false)}>
          Register
        </Link>
        <Link href="/auth" className="bg-purple-500 px-5 py-2 rounded-md hover:bg-purple-600 transition-all shadow-md" onClick={() => setMenuOpen(false)}>
          Login
        </Link>
      </motion.div>
    </nav>
  );
}
