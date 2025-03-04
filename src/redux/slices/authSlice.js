// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";

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
// export const refreshTokenUser = createAsyncThunk(
// 	"auth/refreshTokenUser",
// 	async (_, { rejectWithValue }) => {
// 		try {
// 			// Retrieve the stored refresh token from localStorage
// 			const storedRefreshToken = localStorage.getItem("refreshToken");
// 			if (!storedRefreshToken) {
// 				throw new Error("No refresh token found in localStorage");
// 			}
// 			const response = await axios.post(`${baseURL}refresh`, {
// 				refreshToken: storedRefreshToken,
// 			});
// 			// response.data = { status, accessToken, refreshToken, message }
// 			return response.data;
// 		} catch (error) {
// 			return rejectWithValue(error.response?.data);
// 		}
// 	}
// );

// Logout thunk: informs the backend and clears tokens locally
export const logoutUser = createAsyncThunk(
	"auth/logoutUser",
	async (_, { rejectWithValue }) => {
		try {
			const storedRefreshToken = localStorage.getItem("refreshToken");
			if (!storedRefreshToken) {
				return { status: 200, message: "Logout successful" };
			}
			const response = await axiosInstance.post("logout", {
				refreshToken: storedRefreshToken,
			});
			// Expected response: { status, message }
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

// New thunk: Get user profile using access token
export const getUser = createAsyncThunk(
	"auth/getUser",
	async (_, { getState, rejectWithValue }) => {
		try {
			const accessToken = localStorage.getItem("refreshToken");
			if (!accessToken) throw new Error("No access token available");
			const response = await axiosInstance.get("user_profile", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			// Expected response: { status, user, message }
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
			// Clear localStorage/*  */
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
		});
		builder.addCase(logoutUser.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.message || "Logout failed";
		});

		// getUser cases
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
	},
});

export const { clearError, clearMessage, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
