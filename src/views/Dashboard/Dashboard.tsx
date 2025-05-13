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

// const mockStudents = [
// 	{
// 		student_id: "1",
// 		name: "Wan Danial",
// 		status: "present" as const,
// 		lastSeen: "2 mins ago",
// 	},
// 	{
// 		student_id: "2",
// 		name: "Jane Smith",
// 		status: "absent" as const,
// 		lastSeen: "3 hours ago",
// 	},
// ];

// type Student = {
// 	studentId: string;
// 	name: string;
// };

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
		<div className="flex min-h-screen w-full">
			<div className="flex-1">
				<main className="p-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<MetricCard
							title="Total Students"
							value={dashboardData?.totalUniqueStudents?.toString() ?? "0"}
							icon={<Users className="h-4 w-4" />}
						/>
						<MetricCard
							title="Total Present"
							value={dashboardData?.totalPresent?.toString() ?? "0"}
							icon={<UserCheck className="h-4 w-4" />}
						/>
						<MetricCard
							title="Total Absents"
							value={dashboardData?.totalAbsents?.toString() ?? "0"}
							icon={<UserX className="h-4 w-4" />}
						/>
						<MetricCard
							title="Alerts/Flags"
							value={dashboardData?.totalAlerts?.toString() ?? "0"}
							icon={<AlertTriangle className="h-4 w-4" />}
						/>
					</div>

					<div className="mt-6">
						<div className="rounded-lg border bg-card p-4">
							<h2 className="text-xl font-semibold mb-4">
								{user?.email}'s Attendance
							</h2>
							<div className="h-[300px] rounded-lg bg-gray-100/50"></div>
						</div>
					</div>

					<div className="mt-6">
						<StudentList
							students={allStudentNames}
							onAddStudent={() => console.log("Add student")}
						/>
					</div>
				</main>
			</div>
		</div>
	);
}
