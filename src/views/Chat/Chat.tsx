import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

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
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const simulateResponse = async (userMessage: string): Promise<string> => {
		await new Promise((resolve) =>
			setTimeout(resolve, 1000 + Math.random() * 2000)
		);

		const responses = [
			"I understand your question. Let me help you with that.",
			"That's an interesting point. Here's what I think about it.",
			"I'd be happy to assist you with this topic.",
			"Let me provide some information on that subject.",
			"That's a great question. Here's my perspective.",
		];

		return (
			responses[Math.floor(Math.random() * responses.length)] +
			" " +
			`You mentioned: "${userMessage.slice(0, 50)}${
				userMessage.length > 50 ? "..." : ""
			}"`
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

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
			const response = await simulateResponse(userMessage.content);

			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: response,
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: "Sorry, I encountered an error. Please try again.",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-screen bg-white">
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
				<form onSubmit={handleSubmit}>
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
						<Button type="submit" disabled={!input.trim() || isLoading}>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
