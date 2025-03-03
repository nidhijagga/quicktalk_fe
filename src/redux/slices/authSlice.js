// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Example base URL (adjust as needed)
const baseURL = process.env.REACT_APP_BACKEND_API_URL;

// Signup
export const signupUser = createAsyncThunk(
	"auth/signupUser",
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axios.post(`${baseURL}signup`, userData);
			return response.data; // { status, message }
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

// Login
export const loginUser = createAsyncThunk(
	"auth/loginUser",
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axios.post(`${baseURL}login`, userData);
			// response.data = { status, accessToken, refreshToken, message }
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

// Refresh
export const refreshTokenUser = createAsyncThunk(
	"auth/refreshTokenUser",
	async (_, { rejectWithValue }) => {
		try {
			// Retrieve the stored refresh token from localStorage
			const storedRefreshToken = localStorage.getItem("refreshToken");
			if (!storedRefreshToken) {
				throw new Error("No refresh token found in localStorage");
			}
			const response = await axios.post(`${baseURL}refresh`, {
				refreshToken: storedRefreshToken,
			});
			// response.data = { status, accessToken, refreshToken, message }
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

// Logout
export const logoutUser = createAsyncThunk(
	"auth/logoutUser",
	async (_, { rejectWithValue }) => {
		try {
			// Retrieve the refresh token from localStorage
			const storedRefreshToken = localStorage.getItem("refreshToken");
			if (!storedRefreshToken) {
				// If no token, user is effectively logged out already
				return { status: 200, message: "Logout successful" };
			}
			const response = await axios.post(`${baseURL}logout`, {
				refreshToken: storedRefreshToken,
			});
			// response.data = { status, message }
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState: {
		accessToken: localStorage.getItem("accessToken") || null,
		refreshToken: localStorage.getItem("refreshToken") || null,
		loading: false,
		error: null,
		message: null,
	},
	reducers: {
		clearAuthState: (state) => {
			state.accessToken = null;
			state.refreshToken = null;
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
		},
		clearError: (state) => {
			state.error = null;
		},
		clearMessage: (state) => {
			state.message = null;
		},
	},
	extraReducers: (builder) => {
		// Signup
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
			state.error = action.payload?.message || "Signup failed";
		});

		// Login
		builder.addCase(loginUser.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.message = null;
		});
		builder.addCase(loginUser.fulfilled, (state, action) => {
			state.loading = false;
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			state.message = action.payload.message;
			// Save tokens in localStorage
			localStorage.setItem("accessToken", action.payload.accessToken);
			localStorage.setItem("refreshToken", action.payload.refreshToken);
		});
		builder.addCase(loginUser.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.message || "Login failed";
		});

		// Refresh
		builder.addCase(refreshTokenUser.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.message = null;
		});
		builder.addCase(refreshTokenUser.fulfilled, (state, action) => {
			state.loading = false;
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			state.message = action.payload.message;
			// Update tokens in localStorage
			localStorage.setItem("accessToken", action.payload.accessToken);
			localStorage.setItem("refreshToken", action.payload.refreshToken);
		});
		builder.addCase(refreshTokenUser.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.message || "Token refresh failed";
		});

		// Logout
		builder.addCase(logoutUser.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.message = null;
		});
		builder.addCase(logoutUser.fulfilled, (state, action) => {
			state.loading = false;
			state.accessToken = null;
			state.refreshToken = null;
			state.message = action.payload.message;
			// Clear localStorage
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
		});
		builder.addCase(logoutUser.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.message || "Logout failed";
		});
	},
});

export const { clearError, clearMessage, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
