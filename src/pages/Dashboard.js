// src/pages/Dashboard.js
import React from "react";
import { useDispatch } from "react-redux";
import { logoutUser, clearAuthState } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleLogout = async () => {
		// Dispatch the logout thunk to notify backend and clear tokens
		const result = await dispatch(logoutUser());
		if (result.payload.status === 200) {
			clearAuthState();
			navigate("/login");
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
			<h1 className="text-4xl font-bold mb-6">Dashboard</h1>
			<p className="mb-4">Welcome to your dashboard!</p>
			<button
				onClick={handleLogout}
				className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition"
			>
				Logout
			</button>
		</div>
	);
};

export default Dashboard;
