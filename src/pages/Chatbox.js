// src/pages/ChatBox.js
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	getUser,
	logoutUser,
	clearAuthState,
	getUsers,
} from "../redux/slices/authSlice";
import { getChatHistory, sendMessage } from "../redux/slices/chatSlice";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";
import { io } from "socket.io-client";

const ChatBox = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { user, loading, users } = useSelector((state) => state.auth);
	const { messages } = useSelector((state) => state.chat);

	const [selectedUser, setSelectedUser] = useState(null);
	const [message, setMessage] = useState("");
	const [chatMessages, setChatMessages] = useState([]); // local messages state
	const [otherUserTyping, setOtherUserTyping] = useState(false);
	const socket = useRef(null);
	const chatContainerRef = useRef(null); // Ref for chat container
	const typingTimeoutRef = useRef(null);

	const handleTyping = () => {
		if (socket.current && socket.current.connected && selectedUser) {
			socket.current.emit("typing", {
				sender: user._id,
				recipient: selectedUser._id,
			});
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
			typingTimeoutRef.current = setTimeout(() => {
				socket.current.emit("stopTyping", {
					sender: user._id,
					recipient: selectedUser._id,
				});
			}, 2000);
		}
	};

	// Fetch current user profile if not loaded
	useEffect(() => {
		if (!user) {
			dispatch(getUser());
		}
	}, [dispatch, user]);

	// Fetch available users once user is available
	useEffect(() => {
		if (user) {
			dispatch(getUsers());
		}
	}, [dispatch, user]);

	// Establish Socket.IO connection once user is available
	useEffect(() => {
		if (user) {
			socket.current = io("http://localhost:5000", {
				transports: ["websocket"],
			});

			socket.current.on("connect", () => {
				console.log("Socket.IO connected", socket.current.id);
				// Join the user's personal room for targeted messages
				socket.current.emit("join", user._id);
			});

			// Listen for incoming messages
			socket.current.on("message", (data) => {
				console.log("Received message via Socket.IO:", data);
				// If the message belongs to the current conversation, update chatMessages
				if (
					(data.sender === selectedUser?._id &&
						data.recipient === user._id) ||
					(data.sender === user._id &&
						data.recipient === selectedUser?._id)
				) {
					setChatMessages((prev) => [...prev, data]);
				}
			});

			socket.current.on("typing", (data) => {
				if (data.sender === selectedUser?._id) {
					setOtherUserTyping(true);
				}
			});
			socket.current.on("stopTyping", (data) => {
				if (data.sender === selectedUser?._id) {
					setOtherUserTyping(false);
				}
			});

			socket.current.on("disconnect", () => {
				console.log("Socket.IO disconnected");
			});

			return () => {
				if (socket.current) socket.current.disconnect();
			};
		}
	}, [user, selectedUser]);

	// Fetch chat history when a user is selected
	useEffect(() => {
		if (selectedUser && user) {
			dispatch(
				getChatHistory({ user1: user._id, user2: selectedUser._id })
			).then((response) => {
				if (response.payload && response.payload.messages) {
					setChatMessages(response.payload.messages);
				}
			});
		}
	}, [dispatch, selectedUser, user]);

	// Auto-scroll to bottom when chatMessages update
	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	}, [chatMessages]);

	// Logout handler
	const handleLogout = async () => {
		const result = await dispatch(logoutUser());
		if (result.payload && result.payload.status === 200) {
			dispatch(clearAuthState());
			navigate("/login");
		}
	};

	// Send message handler using Socket.IO and REST API for persistence
	const handleSendMessage = async () => {
		if (
			message.trim() &&
			selectedUser &&
			user &&
			socket.current &&
			socket.current.connected
		) {
			const messageData = {
				sender: user._id,
				recipient: selectedUser._id,
				content: message,
				createdAt: new Date(),
			};
			// Persist the message using the REST API
			const result = await dispatch(sendMessage(messageData));
			if (result.payload.status === 201) {
				// Emit the message via Socket.IO so that both sender and recipient receive it
				socket.current.emit("sendMessage", messageData);
				// Clear the input (state update for chatMessages will be handled when the server broadcasts)
				setMessage("");
			}
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			{/* Navigation Bar */}
			<nav className="w-full p-4 bg-blue-500 text-white flex justify-between items-center">
				<h2 className="text-xl">
					{user ? `Hello, ${user.username}!` : "Hello!"}
				</h2>
				<button
					onClick={handleLogout}
					className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition"
				>
					Logout
				</button>
			</nav>
			<div className="flex h-[90vh]">
				{/* Sidebar: List of available users */}
				<aside className="w-1/4 border-r p-4 overflow-y-scroll custom-scrollbar h-screen">
					<h3 className="text-lg font-bold mb-2">Users</h3>
					{users && users.length > 0 ? (
						users.map((u) => (
							<div
								key={u._id}
								onClick={() => setSelectedUser(u)}
								className={`p-2 cursor-pointer rounded mb-2 last:mb-28 ${
									selectedUser && selectedUser._id === u._id
										? "bg-blue-200"
										: "bg-gray-100"
								}`}
							>
								{u.username}
							</div>
						))
					) : (
						<p className="text-gray-500">No users found</p>
					)}
				</aside>

				{/* Main Chat Area */}
				<main className="flex-grow p-4 flex flex-col">
					{selectedUser ? (
						<>
							<div className="flex">
								<h3 className="text-lg font-bold mb-2">
									Chat with {selectedUser.username}
								</h3>
								{otherUserTyping && (
									<div className="mb-2 text-left">
										<span className="inline-block mx-5 rounded italic">
											{selectedUser.username} is typing...
										</span>
									</div>
								)}
							</div>
							<div
								ref={chatContainerRef}
								className="flex-grow border p-4 mb-4 custom-scrollbar overflow-y-scroll h-48"
							>
								{chatMessages && chatMessages.length > 0 ? (
									chatMessages.map((msg, index) => (
										<div
											key={index}
											className={`mb-2 ${
												msg.sender === user._id
													? "text-right"
													: "text-left"
											}`}
										>
											<span
												className={`inline-block p-2 rounded ${
													msg.sender === user._id
														? "bg-green-200"
														: "bg-gray-200"
												}`}
											>
												{msg.content}
											</span>
										</div>
									))
								) : (
									<p className="text-gray-500">
										No messages yet
									</p>
								)}
							</div>
							<div className="flex">
								<input
									ref={typingTimeoutRef}
									type="text"
									className="border border-gray-300 rounded-l p-2 flex-grow focus:outline-none"
									value={message}
									onChange={(e) => {
										setMessage(e.target.value);
										handleTyping();
									}}
									onKeyUp={(e) => {
										if (e.key === "Enter")
											handleSendMessage();
									}}
									placeholder="Type your message..."
								/>
								<button
									onClick={handleSendMessage}
									className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition duration-200"
								>
									Send
								</button>
							</div>
						</>
					) : (
						<p className="text-gray-500">
							Select a user to start chatting
						</p>
					)}
				</main>
			</div>
			{loading && <Loader loading={loading} />}
		</div>
	);
};

export default ChatBox;
