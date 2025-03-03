// src/components/routes/PublicRoute.js
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
	const token = useSelector((state) => state.auth.accessToken);
	return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
