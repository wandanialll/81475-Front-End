import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
//import { getLecturerCourses } from "@/api";
import { useNavigate } from "react-router-dom";
import { getLecturerCoursesWithFocusIndex } from "@/api";

interface Course {
	course_id: string;
	name: string;
	description: string;
	latest_focus_index: number | null;
}

const Courses: React.FC = () => {
	const user = useAuthStore((state) => state.user);
	const [courses, setCourses] = React.useState<Course[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const data = await getLecturerCoursesWithFocusIndex();
				setCourses(data);
			} catch (error) {
				console.error("Failed to fetch courses", error);
			}
		};

		if (user) fetchCourses();
	}, [user]);
	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">My Courses</h1>
				{/* <Input placeholder="Search courses..." className="w-1/3" /> */}
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{courses.map((course) => (
					<Card
						key={course.course_id}
						className="hover:shadow-lg transition-shadow text-white"
					>
						<CardHeader>
							<CardTitle>{course.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{course.name}</p>
							<p>
								<strong>Focus Index:</strong>{" "}
								{course.latest_focus_index !== null
									? course.latest_focus_index.toFixed(2)
									: "N/A"}
							</p>
							<Button
								className="mt-4"
								onClick={() =>
									navigate(`/course/${course.course_id}/dashboard`)
								}
							>
								Details
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};

export default Courses;
