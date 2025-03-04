// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";

// Base URL from environment variables (only used for endpoints that don't use axiosInstance)
const baseURL = process.env.REACT_APP_BACKEND_API_URL;

// Signup thunk
export const signupUser = createAsyncThunk(
	"auth/signupUser",
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axios.post(`${baseURL}auth/signup`, userData);
			return response.data; // { status, message }
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

// Login thunk
export const loginUser = createAsyncThunk(
	"auth/loginUser",
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axios.post(`${baseURL}auth/login`, userData);
			// Expected response: { status, accessToken, refreshToken, message }
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

// Logout thunk: informs the backend and clears tokens locally
export const logoutUser = createAsyncThunk(
	"auth/logoutUser",
	async (_, { rejectWithValue }) => {
		try {
			const storedRefreshToken = localStorage.getItem("refreshToken");
			if (!storedRefreshToken) {
				return { status: 200, message: "Logout successful" };
			}
			const response = await axiosInstance.post("auth/logout", {
				refreshToken: storedRefreshToken,
			});
			return response.data; // { status, message }
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

// Get user thunk: fetch user profile using access token.
// No need to manually set headers here since axiosInstance interceptor attaches it.
export const getUser = createAsyncThunk(
	"auth/getUser",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get("auth/user_profile");
			// Expected response: { status, user, message }
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

// Get users thunk: fetch all users except the current user.
export const getUsers = createAsyncThunk(
	"auth/getUsers",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get("auth/users");
			// Expected response: { status, message, users }
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
		user: null,
		users: [],
		loading: false,
		error: null,
		message: null,
	},
	reducers: {
		clearAuthState: (state) => {
			state.accessToken = null;
			state.refreshToken = null;
			state.user = null;
			state.users = [];
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
			localStorage.setItem("accessToken", action.payload.accessToken);
			localStorage.setItem("refreshToken", action.payload.refreshToken);
		});
		builder.addCase(loginUser.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.message || "Login failed";
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
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
		});
		builder.addCase(logoutUser.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.message || "Logout failed";
		});

		// Get User
		builder.addCase(getUser.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.message = null;
		});
		builder.addCase(getUser.fulfilled, (state, action) => {
			state.loading = false;
			state.user = action.payload.user;
			state.message = action.payload.message;
		});
		builder.addCase(getUser.rejected, (state, action) => {
			state.loading = false;
			state.error =
				action.payload?.message || "Failed to fetch user info";
		});

		// Get Users
		builder.addCase(getUsers.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.message = null;
		});
		builder.addCase(getUsers.fulfilled, (state, action) => {
			state.loading = false;
			state.users = action.payload.users;
			state.message = action.payload.message;
		});
		builder.addCase(getUsers.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.message || "Failed to fetch users";
		});
	},
});

export const { clearAuthState, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;
