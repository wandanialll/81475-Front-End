import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

export default function LLMChatInterface() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessageToBackend = async (
		userMessage: string,
		history: Message[]
	): Promise<string> => {
		try {
			const response = await fetch("http://localhost:5000/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: userMessage,
					history: history.slice(-10), // Send last 10 messages for context
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.success && data.response) {
				return data.response;
			} else {
				throw new Error(data.error || "Unknown error occurred");
			}
		} catch (error) {
			console.error("Backend request failed:", error);
			throw error;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		// Clear any previous connection errors
		setConnectionError(null);

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: input.trim(),
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			const response = await sendMessageToBackend(
				userMessage.content,
				messages
			);

			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: response,
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error("Error sending message:", error);

			// Set connection error for display
			if (error instanceof Error && error.message.includes("fetch")) {
				setConnectionError(
					"Unable to connect to the server. Please check if your backend is running on http://localhost:5000"
				);
			}

			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content:
					error instanceof Error
						? `Error: ${error.message}`
						: "Sorry, I encountered an error. Please check your connection and try again.",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-screen bg-white">
			{connectionError && (
				<div className="p-4">
					<Alert className="border-red-200 bg-red-50">
						<AlertCircle className="h-4 w-4 text-red-600" />
						<AlertDescription className="text-red-800">
							{connectionError}
						</AlertDescription>
					</Alert>
				</div>
			)}
			{/* Scrollable Messages Area */}
			<ScrollArea className="flex-1 p-4 overflow-y-auto">
				<div className="space-y-4">
					{messages.length === 0 && (
						<div className="text-center text-gray-500 mt-8">
							Start a conversation by typing a message below.
						</div>
					)}

					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex ${
								message.role === "user" ? "justify-end" : "justify-start"
							}`}
						>
							<div
								className={`max-w-[80%] rounded-lg px-4 py-2 ${
									message.role === "user"
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-900"
								}`}
							>
								<div className="text-sm">{message.content}</div>
								<div
									className={`text-xs mt-1 ${
										message.role === "user" ? "text-blue-100" : "text-gray-500"
									}`}
								>
									{message.timestamp.toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</div>
							</div>
						</div>
					))}

					{isLoading && (
						<div className="flex justify-start">
							<div className="bg-gray-100 rounded-lg px-4 py-2">
								<div className="text-sm text-gray-500">Thinking...</div>
							</div>
						</div>
					)}

					{/* Dummy div to scroll to */}
					<div ref={bottomRef} />
				</div>
			</ScrollArea>

			{/* Fixed Input Box */}
			<div className="border-t p-4 bg-white sticky bottom-0">
				<div className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type your message..."
						disabled={isLoading}
						className="flex-1"
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSubmit(e);
							}
						}}
					/>
					<Button onClick={handleSubmit} disabled={!input.trim() || isLoading}>
						<Send className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
