// src/App.js
import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./utils/ProtectedRoute";
import PublicRoute from "./utils/PublicRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
	return (
		<Router>
			<ToastContainer />
			<Routes>
				{/* Public routes: accessible only if not logged in */}
				<Route element={<PublicRoute />}>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
				</Route>

				{/* Protected routes: accessible only if logged in */}
				<Route element={<ProtectedRoute />}>
					<Route path="/dashboard" element={<Dashboard />} />
				</Route>

				{/* Default fallback */}
				<Route
					path="*"
					element={
						// If the user is logged in, redirect to /dashboard; otherwise, go to /login
						<Navigate to="/login" replace />
					}
				/>
			</Routes>
		</Router>
	);
}

export default App;
