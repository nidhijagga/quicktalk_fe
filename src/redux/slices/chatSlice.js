// src/redux/slices/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// Thunk for fetching chat history between two users
// Expects an object with { user1, user2 } as parameters
export const getChatHistory = createAsyncThunk(
	"chat/getChatHistory",
	async ({ user1, user2 }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get(
				`chat/history/${user1}/${user2}`
			);
			// Expected response: { status, message, messages }
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

// Thunk for sending a new message
// Expects an object with { sender, recipient, content }
export const sendMessage = createAsyncThunk(
	"chat/sendMessage",
	async (messageData, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post("chat/send", messageData);
			// Expected response: { status, message, messageData }
			// messageData is the saved message object
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

const chatSlice = createSlice({
	name: "chat",
	initialState: {
		messages: [],
		loading: false,
		error: null,
		message: null,
	},
	reducers: {
		// Optional reducer to clear chat messages or reset state
		clearChat: (state) => {
			state.messages = [];
			state.error = null;
			state.message = null;
		},
	},
	extraReducers: (builder) => {
		// getChatHistory cases
		builder.addCase(getChatHistory.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.message = null;
		});
		builder.addCase(getChatHistory.fulfilled, (state, action) => {
			state.loading = false;
			state.messages = action.payload.messages;
			state.message = action.payload.message;
		});
		builder.addCase(getChatHistory.rejected, (state, action) => {
			state.loading = false;
			state.error =
				action.payload?.message || "Failed to fetch chat history";
		});

		// sendMessage cases
		builder.addCase(sendMessage.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.message = null;
		});
		builder.addCase(sendMessage.fulfilled, (state, action) => {
			state.loading = false;
			// Append the newly sent message to the messages array
			state.messages.push(action.payload.messageData);
			state.message = action.payload.message;
		});
		builder.addCase(sendMessage.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.message || "Failed to send message";
		});
	},
});

export const { clearChat } = chatSlice.actions;
export default chatSlice.reducer;
