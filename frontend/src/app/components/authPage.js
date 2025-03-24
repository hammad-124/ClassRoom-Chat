"use client";
import { TextField, Button, Snackbar, Alert } from "@mui/material";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser, registerUser, logout } from "../redux/slice/userSlice";

export default function AuthPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { token, message, error, loading } = useSelector((state) => state.user);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formState, setFormState] = useState(0); // 0 = Login, 1 = Register

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formState === 0) {
      dispatch(loginUser({ username, password })).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          showSnackbar("Login Successful!", "success");
          router.push("/home");
        } else {
          showSnackbar(res.payload || "Login failed!", "error");
        }
      });
    } else {
      dispatch(registerUser({ name, username, password })).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          showSnackbar("Registration Successful! You can now log in.", "success");
          setFormState(0);
        } else {
          showSnackbar(res.payload || "Registration failed!", "error");
        }
      });
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen-2rem text-white px-6 md:px-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center w-full max-w-5xl p-6 md:p-10 rounded-lg shadow-lg border border-white/20 bg-white/10"
      >
        {/* Left Side - Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden md:flex md:w-1/2 justify-center"
        >
          <Image
            src="/images/login.webp"
            alt="Login Illustration"
            width={400}
            height={400}
            className="rounded-lg shadow-lg object-cover"
          />
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full md:w-1/2 flex flex-col gap-6"
        >
          {/* Toggle Buttons */}
          <div className="flex gap-4">
            <Button
              variant="contained"
              sx={{
                backgroundColor: formState === 0 ? "#7E22CE" : "white",
                color: formState === 0 ? "white" : "#7E22CE",
                "&:hover": { backgroundColor: "#9333EA", color: "white" },
              }}
              onClick={() => setFormState(0)}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: formState === 1 ? "#7E22CE" : "white",
                color: formState === 1 ? "white" : "#7E22CE",
                "&:hover": { backgroundColor: "#9333EA", color: "white" },
              }}
              onClick={() => setFormState(1)}
            >
              Sign Up
            </Button>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <TextField
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={inputStyles}
            />

            {formState === 1 && (
              <TextField
                label="Name"
                type="text"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={inputStyles}
              />
            )}

            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={inputStyles}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                backgroundColor: "#a855f7",
                color: "white",
                fontWeight: "bold",
                padding: "10px",
                borderRadius: "6px",
                "&:hover": { backgroundColor: "#9333ea" },
              }}
            >
              {loading ? "Processing..." : formState === 0 ? "Login" : "Register"}
            </Button>
          </motion.form>

          {/* Logout Button */}
          {token && (
            <Button
              onClick={() => {
                dispatch(logout());
                showSnackbar("Logged out successfully!", "info");
              }}
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "red",
                color: "white",
                fontWeight: "bold",
                padding: "10px",
                borderRadius: "6px",
                "&:hover": { backgroundColor: "#b91c1c" },
              }}
            >
              Logout
            </Button>
          )}
        </motion.div>
      </motion.div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // Position to right
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            fontSize: "16px",
            fontWeight: "bold",
            backgroundColor:
              snackbarSeverity === "success"
                ? "#4caf50"
                : snackbarSeverity === "error"
                ? "#f44336"
                : "#ff9800",
            color: "white",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

// Input Styles
const inputStyles = {
  backgroundColor: "grey",
  borderRadius: "6px",
  "& label": { color: "#a855f7" },
  "& label.Mui-focused, & label.MuiFormLabel-filled": { color: "#7e22ce" },
  "& .MuiInputBase-input": { color: "black" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#a855f7" },
    "&:hover fieldset": { borderColor: "#9333ea" },
    "&.Mui-focused fieldset": { borderColor: "#7e22ce" },
  },
};
