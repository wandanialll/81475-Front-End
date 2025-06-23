// src/views/Dashboard/Dashboard.tsx
import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
// import {
// 	Sidebar,
// 	SidebarContent,
// 	SidebarHeader,
// 	SidebarMenu,
// 	SidebarMenuItem,
// 	SidebarMenuButton,
// 	SidebarProvider,
// } from "@/components/ui/sidebar";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { SearchBar } from "@/components/special/searchBar";
import { MetricCard } from "@/components/special/metricCard";
import { StudentList } from "@/components/special/studentList";
import { useAuthStore } from "@/store/authStore";
import { getMainDashboard } from "@/api";
import { useEffect, useState } from "react";
import AttendanceLineChart from "@/components/special/AttendanceLineChart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Dashboard() {
	const user = useAuthStore((state) => state.user);
	const [dashboardData, setDashboardData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDashboardData = async () => {
			setLoading(true);
			try {
				const data = await getMainDashboard();
				setDashboardData(data);
			} catch (error) {
				console.error("Failed to fetch dashboard data", error);
				setError("Failed to fetch dashboard data");
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, [user]);

	if (loading) {
		return <div>Loading your dashboard details...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const allStudentNames =
		dashboardData?.courses?.flatMap((course: any) =>
			course.students.map((student: any) => ({
				student_id: student.studentId.toString(),
				name: student.name,
				status: student.status,
				lastSeen: student.lastSeen,
			}))
		) ?? [];

	return (
		<div className="flex min-h-screen w-full mb-5">
			<div className="flex-1">
				<main>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<MetricCard
							title="Total Students"
							value={dashboardData?.totalUniqueStudents?.toString() ?? "0"}
							icon={<Users className="h-5 w-5" />}
						/>
						<MetricCard
							title="Total Present"
							value={dashboardData?.totalPresent?.toString() ?? "0"}
							icon={<UserCheck className="h-5 w-5" />}
						/>
						<MetricCard
							title="Total Absents"
							value={dashboardData?.totalAbsents?.toString() ?? "0"}
							icon={<UserX className="h-5 w-5" />}
						/>
						<MetricCard
							bgColor="destructivesoft"
							title="Alerts/Flags"
							value={dashboardData?.totalAlerts?.toString() ?? "0"}
							icon={<AlertTriangle className="h-5 w-5" />}
						/>
					</div>

					<div className="mt-6">
						{/* <div className="rounded-lg border bg-card p-4">
							<h2 className="text-xl font-semibold mb-4">
								Overall Attendance Performance
							</h2>
							<div className="h-[300px] rounded-lg bg-gray-100/50">
								<AttendanceLineChart />
							</div>
						</div> */}
						{/* <h2 className="text-xl font-semibold mb-4 underline underline-offset-1 decoration-3 decoration-primary">
							Overall Attendance Performance
						</h2> */}
						<Card>
							<CardHeader>
								{/* <CardTitle>Overall Attendance Performance</CardTitle> */}
								<h2 className="text-xl font-semibold mb-4 text-white">
									Overall Attendance Performance
								</h2>
							</CardHeader>
							<div className="h-[300px] rounded-lg pr-6">
								<AttendanceLineChart />
							</div>
						</Card>
					</div>

					<div className="mt-6">
						<Card>
							<CardContent>
								<StudentList
									students={allStudentNames}
									onAddStudent={() => console.log("Add student")}
								/>
							</CardContent>
						</Card>
					</div>
				</main>
			</div>
		</div>
	);
}
