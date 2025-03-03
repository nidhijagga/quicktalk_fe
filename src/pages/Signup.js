// src/pages/Signup.js
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Signup = () => {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
	});
	const [message, setMessage] = useState("");

	const handleChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post(
				"http://localhost:5000/api/auth/signup",
				formData
			);
			setMessage(res.data.message);
		} catch (err) {
			setMessage(err.response?.data?.message || "Error occurred");
		}
	};

	return (
		<div>
			<h2>Signup</h2>
			{message && <p>{message}</p>}
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					name="username"
					placeholder="Username"
					onChange={handleChange}
					required
				/>
				<br />
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
				<button type="submit">Signup</button>
			</form>
			<p>
				Already have an account? <Link to="/login">Login here</Link>
			</p>
		</div>
	);
};

export default Signup;
