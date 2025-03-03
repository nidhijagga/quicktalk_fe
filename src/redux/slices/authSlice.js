// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = process.env.REACT_APP_BACKEND_API_URL;

export const signupUser = createAsyncThunk(
	"auth/signupUser",
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axios.post(`${baseURL}signup`, userData);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response.data);
		}
	}
);

export const loginUser = createAsyncThunk(
	"auth/loginUser",
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axios.post(`${baseURL}login`, userData);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response.data);
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState: {
		token: localStorage.getItem("token") || null,
		loading: false,
		error: null,
		message: null,
	},
	reducers: {
		logout: (state) => {
			state.token = null;
			localStorage.removeItem("token");
		},
		// Clear error after it has been shown
		clearError: (state) => {
			state.error = null;
		},
		// Clear message after it has been shown
		clearMessage: (state) => {
			state.message = null;
		},
	},
	extraReducers: (builder) => {
		// Signup cases
		builder.addCase(signupUser.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.message = null;
		});
		builder.addCase(signupUser.fulfilled, (state, action) => {
			state.loading = false;
			state.message = action.payload.message;
		});
		builder.addCase(signupUser.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload.message || "Signup failed";
		});

		// Login cases
		builder.addCase(loginUser.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.message = null;
		});
		builder.addCase(loginUser.fulfilled, (state, action) => {
			state.loading = false;
			state.token = action.payload.token;
			state.message = action.payload.message;
			localStorage.setItem("token", action.payload.token);
		});
		builder.addCase(loginUser.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload.message || "Login failed";
		});
	},
});

export const { logout, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;
