import React, { useState, useEffect } from "react";
import { SearchBar } from "./searchBar"; // adjust path as needed
import { useNavigate } from "react-router-dom";
import { search } from "@/api";

interface SearchResult {
	type: "student" | "navigation" | "course" | "llm-response" | "llm-error";
	name?: string;
	id?: number;
	label?: string;
	route?: string;
	llm_backend?: string;
}

export const SearchContainer: React.FC = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (query.length > 1) {
				fetchResults(query);
			} else {
				setResults([]);
			}
		}, 300); // debounce time

		return () => clearTimeout(delayDebounce);
	}, [query]);

	const fetchResults = async (q: string) => {
		console.log("=== FETCH RESULTS CALLED ===");
		console.log("Query:", q);

		try {
			console.log("About to call search API...");
			const res = await search(q);
			console.log("=== RAW API RESPONSE ===");
			console.log("Full response object:", res);
			console.log("Response status:", res?.status);
			console.log("Response data property:", res?.data);
			console.log("Is response itself an array?", Array.isArray(res));

			// Handle different response formats
			let data;
			if (res?.data) {
				// Standard axios response format: { data: [...] }
				data = res.data;
			} else if (Array.isArray(res)) {
				// Direct array response
				data = res;
			} else if (res && typeof res === "object") {
				// Single object response
				data = [res];
			} else {
				data = [];
			}

			console.log("Extracted data:", data);
			console.log("Data type:", typeof data);
			console.log("Is data array?", Array.isArray(data));

			// Ensure data is an array
			if (!Array.isArray(data)) {
				console.log("Converting non-array to array");
				data = [data];
			}

			console.log("=== FINAL PROCESSED DATA ===");
			console.log("Final results to set:", data);
			console.log("Setting results state...");
			setResults(data);
			console.log("Results state set successfully");
		} catch (err) {
			console.error("=== SEARCH ERROR ===");
			console.error("Error details:", err);
			console.error("Error message:", (err as any)?.message);
			console.error("Error response:", (err as any)?.response);
			setResults([]); // fallback to empty array
		}
	};

	const handleResultClick = (res: SearchResult) => {
		console.log("Result clicked:", res);

		if ((res.type === "navigation" || res.type === "course") && res.route) {
			navigate(res.route);
		} else if (res.type === "student") {
			navigate(`/students/${res.id}`);
		} else if (res.type === "llm-response") {
			// Handle LLM responses - you can customize this behavior
			console.log("LLM Response clicked:", res.label);
			// For now, just show an alert or do nothing
			// You could navigate somewhere or show a modal, etc.
			alert(res.label || "LLM response received");
		} else if (res.type === "llm-error") {
			console.log("LLM Error clicked:", res.label);
			alert(res.label || "An error occurred");
		}

		setResults([]); // Clear results after selection
		setQuery(""); // Clear the search input
	};

	return (
		<div className="relative w-full space-y-2">
			<SearchBar
				placeholder="Search students or actions..."
				onChange={setQuery}
			/>
			{/* Debug info */}
			{/* <div className="text-xs text-gray-500">
				Query: "{query}" | Results count: {results.length}
			</div> */}

			{results.length > 0 && (
				<ul className="absolute z-10 w-full bg-white border rounded-md shadow p-2 space-y-1 mt-1">
					{results.map((res, idx) => {
						console.log(`=== RENDERING RESULT ${idx} ===`);
						console.log("Result object:", res);

						if (!res || typeof res !== "object") {
							console.log(`Skipping invalid result at ${idx}`);
							return null;
						}

						let display = "Unnamed";
						let resultType = "";

						if (res.type === "student" && res.name) {
							display = res.name;
							resultType = "👤 ";
						} else if (res.type === "navigation") {
							display = res.label || "Navigation Item";
							resultType = "🔗 ";
						} else if (res.type === "course") {
							display = res.label || "Course";
							resultType = "📚 ";
						} else if (res.type === "llm-response") {
							display = res.label || "AI Response";
							resultType = "🤖 ";
						} else if (res.type === "llm-error") {
							display = res.label || "LLM Error";
							resultType = "❌ ";
						} else if (res.label) {
							display = res.label;
						}

						console.log(`Final display for ${idx}: "${resultType}${display}"`);

						return (
							<li
								key={idx}
								className="cursor-pointer hover:bg-gray-100 p-2 rounded flex items-center"
								onClick={() => handleResultClick(res)}
							>
								<span className="text-sm">
									{resultType}
									{display}
								</span>
								{res.type === "llm-response" && (
									<span className="ml-auto text-xs text-gray-500">
										AI Suggestion
									</span>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};
