// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/slices/authSlice";
import chatReducer from "../redux/slices/chatSlice";

const store = configureStore({
	reducer: {
		auth: authReducer,
		chat: chatReducer,
	},
});

export default store;
