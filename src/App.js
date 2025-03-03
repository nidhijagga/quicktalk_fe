// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

function App() {
	return (
		<Router>
			<nav>
				<ul>
					<li>
						<Link to="/signup">Signup</Link>
					</li>
					<li>
						<Link to="/login">Login</Link>
					</li>
				</ul>
			</nav>
			<Routes>
				<Route path="/signup" element={<Signup />} />
				<Route path="/login" element={<Login />} />
				{/* Optionally, add a default route */}
				<Route path="/" element={<Signup />} />
			</Routes>
		</Router>
	);
}

export default App;
