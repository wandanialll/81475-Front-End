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
		try {
			const res = await search(q);
			let data = res.data;

			// Ensure data is an array
			if (!Array.isArray(data)) {
				data = [data]; // Wrap object into an array
			}

			setResults(data);
		} catch (err) {
			console.error("Search error", err);
			setResults([]); // fallback to empty array
		}
	};

	const handleResultClick = (res: SearchResult) => {
		if ((res.type === "navigation" || res.type === "course") && res.route) {
			navigate(res.route);
		} else if (res.type === "student") {
			navigate(`/students/${res.id}`);
		}
		setResults([]); // Clear results after selection
		setQuery(""); // Clear the search input
	};

	return (
		<div className="space-y-2">
			<SearchBar
				placeholder="Search students or actions..."
				onChange={setQuery}
			/>
			{results.length > 0 && (
				<ul className="bg-white border rounded-md shadow p-2 space-y-1">
					{results.map((res, idx) => {
						if (!res || typeof res !== "object") return null;

						let display = "Unnamed";
						if (res.type === "student" && res.name) {
							display = res.name;
						} else if (res.label) {
							display = res.label;
						} else if (res.type === "llm-error") {
							display = res.label ?? "LLM Error";
						}

						return (
							<li
								key={idx}
								className="cursor-pointer hover:bg-gray-100 p-1 rounded"
								onClick={() => handleResultClick(res)}
							>
								{display}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};
