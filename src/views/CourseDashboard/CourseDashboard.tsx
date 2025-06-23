import React, { useEffect, useState } from "react";
import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/special/metricCard";
import { StudentList } from "@/components/special/studentList";
import { useParams } from "react-router-dom";
import {
	getCourseDashboard,
	getOpenAttendanceSheets,
	closeAttendanceSheet,
} from "@/api";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import AttendanceLineChartCourse from "@/components/special/AttendanceLineChartCourse";

interface Student {
	student_id: string;
	name: string;
	status: "present" | "absent";
	lastSeen: string;
}

interface CourseDetails {
	name: string;
	totalStudents: number;
	totalPresent: number;
	totalAbsents: number;
	alerts: number;
	students: any[];
}

const CourseDashboard: React.FC = () => {
	const { courseId } = useParams<{ courseId: string }>();
	const [courseData, setCourseData] = useState<CourseDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [openSheets, setOpenSheets] = useState<
		{ session_id: string; started_at: string }[]
	>([]);

	useEffect(() => {
		const fetchCourseDetails = async () => {
			setLoading(true);
			setError(null);
			try {
				if (courseId) {
					const data = await getCourseDashboard(courseId);
					console.log("Course dashboard data:", data);
					console.log("Students in course:", data.students);
					setCourseData(data);
				} else {
					setError("Course ID not found in the URL.");
				}
			} catch (err: any) {
				setError("Failed to fetch course details.");
				console.error("Error fetching course details:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchCourseDetails();
	}, [courseId]);

	useEffect(() => {
		const fetchOpenAttendanceSheets = async () => {
			if (courseId) {
				try {
					const data = await getOpenAttendanceSheets(courseId);
					setOpenSheets(data);
				} catch (err: any) {
					console.error("Error fetching open attendance sheets:", err);
				}
			}
		};

		fetchOpenAttendanceSheets();
	}, [courseId]);

	if (loading) {
		return <div>Loading course details...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!courseData || !courseId) {
		return <div>No course data available.</div>;
	}

	const validStudents: Student[] = courseData.students
		.map((student) => ({
			student_id:
				student.studentId?.toString() || student.student_id?.toString() || "",
			name: student.name || "Unknown",
			status: (student.status as "present" | "absent") || "absent",
			lastSeen: student.lastSeen || "N/A",
		}))
		.filter((student) => student.student_id !== "");

	return (
		<div className="flex min-h-screen w-full">
			<div className="flex-1">
				<main>
					<div className="mb-6">
						<h1 className="text-2xl font-bold">{courseData.name}</h1>
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<MetricCard
							title="Total Students"
							value={courseData.totalStudents.toString()}
							icon={<Users className="h-4 w-4" />}
						/>
						<MetricCard
							title="Total Present"
							value={courseData.totalPresent.toString()}
							icon={<UserCheck className="h-4 w-4" />}
						/>
						<MetricCard
							title="Total Absents"
							value={courseData.totalAbsents.toString()}
							icon={<UserX className="h-4 w-4" />}
						/>
						<MetricCard
							title="Alerts/Flags"
							value={courseData.alerts.toString()}
							icon={<AlertTriangle className="h-4 w-4" />}
						/>
					</div>

					{/* <div className="mt-6">
						<div className="rounded-lg border bg-card p-4">
							<h2 className="text-xl font-semibold mb-4">
								{courseData.name}'s Attendance Overview
							</h2>
							<div className="h-[300px] rounded-lg pr-5">
								<AttendanceLineChartCourse courseId={courseId} />
							</div>
						</div>
					</div> */}
					<Card className="mt-5">
						{/* <CardHeader>
							<CardTitle>{courseData.name}'s Attendance Overview</CardTitle>
						</CardHeader> */}
						<CardContent>
							<div className="h-[300px] rounded-lg pr-5">
								<AttendanceLineChartCourse courseId={courseId} />
							</div>
						</CardContent>
					</Card>

					<div className="mt-6">
						<h2 className="text-xl font-semibold mb-2">
							Open Attendance Sheets
						</h2>
						{openSheets.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No open attendance sessions
							</p>
						) : (
							<div className="space-y-4">
								{openSheets.map((sheet) => (
									<Card
										key={sheet.session_id}
										className="flex flex-row justify-between p-5"
									>
										<div>
											<p className="font-medium">
												Session: {sheet.session_id.slice(0, 8)}...
											</p>
											<p className="text-sm text-gray-500">
												Started: {new Date(sheet.started_at).toLocaleString()}
											</p>
										</div>
										<div className="space-x-5">
											<Button
												variant="destructive"
												onClick={async () => {
													try {
														await closeAttendanceSheet(sheet.session_id);
														setOpenSheets((prev) =>
															prev.filter(
																(s) => s.session_id !== sheet.session_id
															)
														);
													} catch (err: any) {
														console.error(
															"Error closing attendance sheet:",
															err
														);
													}
												}}
											>
												Close Sheet
											</Button>
											<Link to={`/face-scan?session_id=${sheet.session_id}`}>
												<Button>Start Attendance</Button>
											</Link>
										</div>
									</Card>
								))}
							</div>
						)}
					</div>

					<Card className="mt-5 p-5 mb-5">
						<StudentList
							students={validStudents}
							courseName={courseData.name}
							onAddStudent={() => console.log("Add student")}
						/>
					</Card>
				</main>
			</div>
		</div>
	);
};

export default CourseDashboard;
