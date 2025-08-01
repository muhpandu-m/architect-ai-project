import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { getSocket } from "./socket";

// Message type for chat
interface Message {
	id: string;
	text: string;
	imageUrl?: string;
	sender: "user" | "bot";
}

const N8N_API_URL = "https://n8n.muhpandu.com/webhook/architect-ai-bot-hook"; // Production n8n webhook URL

// ...existing code...

function App() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [chatStarted, setChatStarted] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	// Start a new chat session
	const startNewSession = () => {
		const newSessionId = Math.random().toString(36).substring(2) + Date.now();
		localStorage.setItem("architect_ai_session_id", newSessionId);
		setSessionId(newSessionId);
		setMessages([]);
		setChatStarted(true);
	};

	// Regenerate sessionId and clear chat
	const regenerateSession = () => {
		startNewSession();
	};

	// On mount, require user to start chat
	React.useEffect(() => {
		setChatStarted(false);
		setMessages([]);
		setInput("");
		setSessionId(null);
	}, []);

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Auto-resize textarea and expand upward
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height =
				textareaRef.current.scrollHeight + "px";
		}
	}, [input]);

	// Send message to n8n
	const sendMessage = async () => {
		if (!input.trim()) return;
		const userMsg: Message = {
			id: Date.now() + "-user",
			text: input,
			sender: "user",
		};
		setMessages((msgs) => [...msgs, userMsg]);
		setLoading(true);
		setInput("");
		// Focus input after sending
		setTimeout(() => {
			inputRef.current?.focus();
		}, 0);
		try {
			const res = await fetch(N8N_API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: input, sessionId }),
			});
			const data = await res.json();
			// Expecting bot response: { text: string, imageUrl?: string }
			const botMsg: Message = {
				id: Date.now() + "-bot",
				text: data.text,
				imageUrl: data.imageUrl,
				sender: "bot",
			};
			setMessages((msgs) => [...msgs, botMsg]);
		} catch (err) {
			setMessages((msgs) => [
				...msgs,
				{
					id: Date.now() + "-error",
					text: "Error contacting bot.",
					sender: "bot",
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<>
			<div className="chat-title">
				Make Your Design Idea with Architect AI
			</div>
			{!chatStarted ? (
				<div className="start-session-bar">
					<button className="session-btn" onClick={startNewSession}>
						Start New Chat
					</button>
				</div>
			) : (
				<>
					<div className="session-bar">
						<span>
							Session ID: <code>{sessionId}</code>
						</span>
						<button
							className="session-btn"
							onClick={regenerateSession}
							disabled={loading}
						>
							Regenerate Session
						</button>
					</div>
					<div className="chat-container">
						<div className="chat-messages">
							{messages.map((msg) => (
								<div
									key={msg.id}
									className={`chat-message ${msg.sender}`}
								>
									<div className="chat-bubble">
										{msg.text ? (
											<span>
												{msg.text.split("\n").map((line, i) => {
													// Replace **bold** with <b>bold</b>
													const parts = [];
													let lastIdx = 0;
													const boldRegex = /\*\*(.+?)\*\*/g;
													let match;
													let key = 0;
													while (
														(match = boldRegex.exec(line)) !==
														null
													) {
														if (match.index > lastIdx) {
															parts.push(
																line.substring(
																	lastIdx,
																	match.index
																)
															);
														}
														parts.push(
															<b key={key++}>{match[1]}</b>
														);
														lastIdx =
															match.index + match[0].length;
													}
													if (lastIdx < line.length) {
														parts.push(line.substring(lastIdx));
													}
													return (
														<React.Fragment key={i}>
															{parts}
															{i <
																msg.text.split("\n").length -
																	1 && <br />}
														</React.Fragment>
													);
												})}
											</span>
										) : null}
										{msg.imageUrl && (
											<img
												src={msg.imageUrl}
												alt="chat-img"
												className="chat-image"
											/>
										)}
										{msg.imageUrl && (
											<img
												src={msg.imageUrl}
												alt="chat-img"
												className="chat-image"
											/>
										)}
									</div>
								</div>
							))}
							{loading && (
								<div className="chat-message bot">
									<div className="chat-bubble">
										<span className="bouncing-dots">
											<span>.</span>
											<span>.</span>
											<span>.</span>
										</span>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>
						<div className="chat-input">
							<textarea
								ref={textareaRef}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Type your message..."
								disabled={loading}
								rows={1}
								style={{
									resize: "none",
									minHeight: "2.2em",
									maxHeight: "8em",
									overflowY: "auto",
									width: "100%",
									direction: "ltr",
								}}
							/>
							<button
								onClick={sendMessage}
								disabled={loading || !input.trim()}
							>
								Send
							</button>
						</div>
					</div>
				</>
			)}
		</>
	);
}

export default App;
