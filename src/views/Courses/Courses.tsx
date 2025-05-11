import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { getLecturerCourses } from "@/api";

interface Course {
	course_id: string;
	name: string;
	description: string;
}

const Courses: React.FC = () => {
	const user = useAuthStore((state) => state.user);
	const [courses, setCourses] = React.useState<Course[]>([]);

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
	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">My Courses</h1>
				<Input placeholder="Search courses..." className="w-1/3" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{courses.map((course) => (
					<Card
						key={course.course_id}
						className="hover:shadow-lg transition-shadow"
					>
						<CardHeader>
							<CardTitle>{course.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{course.name}</p>
							<Button className="mt-4">Enroll Now</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};

export default Courses;
