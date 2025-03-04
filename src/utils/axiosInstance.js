// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_API_URL, // e.g., "http://localhost:5000/api/auth/"
});

// Request interceptor: Attach the access token from localStorage to the Authorization header
axiosInstance.interceptors.request.use(
	(config) => {
		const accessToken = localStorage.getItem("accessToken");
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor: If 401, try to refresh the token and retry the original request
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		// Check if error is 401 and we haven't retried yet (to avoid infinite loops)
		if (
			error.response &&
			error.response.status === 401 &&
			!originalRequest._retry
		) {
			originalRequest._retry = true;
			const refreshToken = localStorage.getItem("refreshToken");
			if (refreshToken) {
				try {
					// Call the refresh endpoint. We send the refresh token in the body.
					const { data } = await axios.post(
						`${process.env.REACT_APP_BACKEND_API_URL}auth/refresh`,
						{ refreshToken }
					);
					// Expected data: { status, accessToken, refreshToken, message }
					// Save new tokens in localStorage
					localStorage.setItem("accessToken", data.accessToken);
					localStorage.setItem("refreshToken", data.refreshToken);
					// Update the Authorization header and retry original request
					originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
					return axiosInstance(originalRequest);
				} catch (refreshError) {
					// If refresh fails, you might want to force a logout or redirect to login
					return Promise.reject(refreshError);
				}
			}
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
