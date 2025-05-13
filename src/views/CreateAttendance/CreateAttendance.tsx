"use client";

import { SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";
import { getLecturerCourses } from "@/api";
import { createAttendanceSheet } from "@/api";
import { useAuthStore } from "@/store/authStore";

const CreateAttendanceSheet = () => {
	const [courses, setCourses] = useState<any[]>([]);
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);
	const [resetKey, setResetKey] = useState(0); // State to trigger reset
	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const data = await getLecturerCourses();
				setCourses(data);
			} catch (error) {
				console.error("Failed to fetch courses", error);
			}
		};

		if (user) fetchCourses();
	}, [user]);

	const createSheet = async () => {
		if (!selectedCourseId) return;

		try {
			await createAttendanceSheet(selectedCourseId);
			setStatus("Attendance sheet created successfully!");
			setSelectedCourseId(null); // Reset selected course
			setResetKey((prevKey) => prevKey + 1); // Increment reset key to re-render
		} catch (error) {
			setStatus("Error creating attendance sheet.");
		}
	};

	return (
		<div className="flex flex-col p-5 space-y-5" key={resetKey}>
			<h1 className="text-2xl font-bold">Create Attendance Sheet</h1>

			<div className="flex flex-col space-y-2">
				<Label>Select Course</Label>
				<Select
					onValueChange={(val: SetStateAction<string | null>) =>
						setSelectedCourseId(val)
					}
					value={selectedCourseId || undefined} // Ensure controlled component
				>
					<SelectTrigger>
						<SelectValue placeholder="Choose a course" />
					</SelectTrigger>
					<SelectContent>
						{courses.map((course) => (
							<SelectItem
								key={course.course_id}
								value={String(course.course_id)}
							>
								{course.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<Button onClick={createSheet} disabled={!selectedCourseId}>
				Create Attendance Sheet
			</Button>
			{status && <p className="text-sm text-muted-foreground">{status}</p>}
		</div>
	);
};

export default CreateAttendanceSheet;
