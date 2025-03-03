// src/pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Login = () => {
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [message, setMessage] = useState("");

	const handleChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post(
				"http://localhost:5000/api/auth/login",
				formData
			);
			setMessage(res.data.message);
			// Optionally store the token for later use
			localStorage.setItem("token", res.data.token);
		} catch (err) {
			setMessage(err.response?.data?.message || "Error occurred");
		}
	};

	return (
		<div>
			<h2>Login</h2>
			{message && <p>{message}</p>}
			<form onSubmit={handleSubmit}>
				<input
					type="email"
					name="email"
					placeholder="Email"
					onChange={handleChange}
					required
				/>
				<br />
				<input
					type="password"
					name="password"
					placeholder="Password"
					onChange={handleChange}
					required
				/>
				<br />
				<button type="submit">Login</button>
			</form>
			<p>
				Don't have an account? <Link to="/signup">Signup here</Link>
			</p>
		</div>
	);
};

export default Login;
