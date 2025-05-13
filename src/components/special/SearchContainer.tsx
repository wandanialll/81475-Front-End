import React, { useState, useEffect } from "react";
import { SearchBar } from "./searchBar"; // adjust path as needed
import { useNavigate } from "react-router-dom";

interface SearchResult {
	type: "student" | "navigation" | "course";
	name?: string;
	id?: number;
	label?: string;
	route?: string;
}

export const SearchContainer: React.FC = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const navigate = useNavigate();
	const token = localStorage.getItem("token");

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
			const res = await fetch(
				`http://localhost:5000/api/search?q=${encodeURIComponent(q)}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			const data: SearchResult[] = await res.json();
			setResults(data);
		} catch (err) {
			console.error("Search error", err);
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
					{results.map((res, idx) => (
						<li
							key={idx}
							className="cursor-pointer hover:bg-gray-100 p-1 rounded"
							onClick={() => handleResultClick(res)}
						>
							{res.type === "student" ? res.name : res.label ?? "Unnamed"}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
