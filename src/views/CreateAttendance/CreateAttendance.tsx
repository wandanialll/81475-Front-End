// src/views/CreateAttendance/CreateAttendance.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CreateAttendance() {
	const [date, setDate] = useState("");
	const [remarks, setRemarks] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Replace this with actual submission logic
		alert(`Attendance created on ${date} with remarks: ${remarks}`);
		setDate("");
		setRemarks("");
	};

	return (
		<div className="max-w-lg mx-auto mt-10">
			<h1 className="text-2xl font-semibold mb-4">Create Attendance</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block mb-1 text-sm font-medium">Date</label>
					<Input
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						required
					/>
				</div>
				<div>
					<label className="block mb-1 text-sm font-medium">Remarks</label>
					<Input
						type="text"
						value={remarks}
						onChange={(e) => setRemarks(e.target.value)}
					/>
				</div>
				<Button type="submit">Submit</Button>
			</form>
		</div>
	);
}
