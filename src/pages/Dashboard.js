// src/pages/Dashboard.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, clearAuthState, getUser } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";

const Dashboard = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { user, loading } = useSelector((state) => state.auth);
	const getUserApiCall = async () => {
		if (!user) {
			await dispatch(getUser());
		}
	};
	// Fetch user profile on component mount if not already loaded
	useEffect(() => {
		getUserApiCall();
	}, []);

	const handleLogout = async () => {
		const result = await dispatch(logoutUser());
		if (result.payload && result.payload.status === 200) {
			dispatch(clearAuthState());
			navigate("/login");
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			{/* Navigation Bar */}
			<nav className="w-full p-4 bg-blue-500 text-white">
				<h2 className="text-xl">
					{user ? `Hello, ${user.username}!` : "Hello!"}
				</h2>
			</nav>
			{/* Dashboard Content */}
			<div className="flex flex-col items-center justify-center flex-grow bg-gray-100">
				<h1 className="text-4xl font-bold mb-6">Dashboard</h1>
				<p className="mb-4">Welcome to your dashboard!</p>
				<button
					onClick={handleLogout}
					className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition"
				>
					Logout
				</button>
				<Loader loading={loading} />
			</div>
		</div>
	);
};

export default Dashboard;
