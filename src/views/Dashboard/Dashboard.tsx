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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchBar } from "@/components/special/searchBar";
import { MetricCard } from "@/components/special/metricCard";
import { StudentList } from "@/components/special/studentList";

const mockStudents = [
	{
		id: "1",
		name: "Wan Danial",
		status: "present" as const,
		lastSeen: "2 mins ago",
	},
	{
		id: "2",
		name: "Jane Smith",
		status: "absent" as const,
		lastSeen: "3 hours ago",
	},
];

type Student = {
	studentId: string;
	name: string;
};

export default function Dashboard() {
	return (
		<div className="flex min-h-screen w-full">
			{/* <Sidebar className="border-r bg-gray-100/40">
					<SidebarHeader>
						<div className="px-4 py-2">
							<h2 className="text-lg font-semibold">Menu</h2>
						</div>
					</SidebarHeader>
					<SidebarContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton className="w-full bg-rose-200">
									Dashboard
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>Attendance</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>Options</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarContent>
				</Sidebar> */}

			<div className="flex-1">
				<header className="border-b bg-white px-6 py-3">
					<div className="flex items-center justify-between">
						<div className="w-1/3">
							<SearchBar placeholder="Search" />
						</div>
						<Avatar>
							<AvatarImage src="/placeholder.svg" />
							<AvatarFallback>CU</AvatarFallback>
						</Avatar>
					</div>
				</header>

				<main className="p-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<MetricCard
							title="Total Students"
							value="150"
							icon={<Users className="h-4 w-4" />}
						/>
						<MetricCard
							title="Total Present"
							value="142"
							icon={<UserCheck className="h-4 w-4" />}
						/>
						<MetricCard
							title="Total Absents"
							value="8"
							icon={<UserX className="h-4 w-4" />}
						/>
						<MetricCard
							title="Alerts/Flags"
							value="3"
							icon={<AlertTriangle className="h-4 w-4" />}
						/>
					</div>

					<div className="mt-6">
						<div className="rounded-lg border bg-card p-4">
							<h2 className="text-xl font-semibold mb-4">
								TMF4913 Attendance Statistics
							</h2>
							<div className="h-[300px] rounded-lg bg-gray-100/50"></div>
						</div>
					</div>

					<div className="mt-6">
						<StudentList
							students={mockStudents}
							onAddStudent={() => console.log("Add student")}
						/>
					</div>
				</main>
			</div>
		</div>
	);
}
