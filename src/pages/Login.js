// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError, clearMessage } from "../redux/slices/authSlice";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
	const dispatch = useDispatch();
	const { loading, error, message } = useSelector((state) => state.auth);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const handleChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();
		dispatch(loginUser(formData));
	};

	useEffect(() => {
		if (error) {
			toast.error(error);
			dispatch(clearError());
		}
		if (message) {
			toast.success(message);
			dispatch(clearMessage());
		}
	}, [error, message, dispatch]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white p-8 rounded shadow-md w-full max-w-md">
				<h2 className="text-3xl font-bold text-center mb-6">Login</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-gray-700">Email</label>
						<input
							type="email"
							name="email"
							placeholder="Enter your email"
							onChange={handleChange}
							required
							className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
						/>
					</div>
					<div>
						<label className="block text-gray-700">Password</label>
						<input
							type="password"
							name="password"
							placeholder="Enter your password"
							onChange={handleChange}
							required
							className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
					>
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>
				<p className="mt-4 text-center">
					Don't have an account?{" "}
					<Link
						to="/signup"
						className="text-blue-500 hover:underline"
					>
						Signup here
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Login;
