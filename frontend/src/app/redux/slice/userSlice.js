import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
const API_URL = "http://localhost:8000/api/v1/users";

// Register User Thunk
export const registerUser = createAsyncThunk(
    "user/register",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            return response.data.message; // Only return success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

// Login User Thunk
export const loginUser = createAsyncThunk(
    "user/login",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, userData);
            return response.data.token; // Store only the token
        } catch (error) {
          console.log("error in login",error)
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

// Redux Slice
const userSlice = createSlice({
    name: "user",
    initialState: {
        token: null,
        message: null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.token = null;
            localStorage.removeItem("token");
        },
    },
    extraReducers: (builder) => {
        builder
            // Register User
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload; // Store success message
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Login User
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload; // Store only the token
                localStorage.setItem("token", action.payload);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.log(state.error);
              
            });
    },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
