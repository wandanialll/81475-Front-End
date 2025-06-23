import React, { useEffect, useState } from "react";
import {
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	Area,
	AreaChart,
} from "recharts";
import { getCourseAttendancePerformance } from "@/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

interface StudentAttendance {
	studentId: string;
	name: string;
	totalSessions: number;
	presentCount: number;
	absentCount: number;
}

interface ChartDataPoint {
	session: string;
	present: number;
	absent: number;
}

const chartConfig = {
	present: {
		label: "Present",
		color: "#baffd9",
	},
	absent: {
		label: "Absent",
		color: "#DA6C6C",
	},
};

interface AttendanceLineChartProps {
	courseId: string;
}

const AttendanceLineChartCourse: React.FC<AttendanceLineChartProps> = ({
	courseId,
}) => {
	const [data, setData] = useState<ChartDataPoint[]>([]);
	const [title, setTitle] = useState<string>("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await getCourseAttendancePerformance(courseId);

				// Aggregate attendance data by session
				const maxSessions = Math.max(
					...res.students.map(
						(student: StudentAttendance) => student.totalSessions
					)
				);

				const chartData: ChartDataPoint[] = [];
				for (let i = 1; i <= maxSessions; i++) {
					let present = 0;
					let absent = 0;

					res.students.forEach((student: StudentAttendance) => {
						if (i <= student.totalSessions) {
							if (i <= student.presentCount) {
								present += 1;
							} else {
								absent += 1;
							}
						}
					});

					chartData.push({
						session: `Session ${i}`,
						present,
						absent,
					});
				}

				setTitle(`${res.courseName} Attendance`);
				setData(chartData);
			} catch (error) {
				console.error("Error fetching attendance data", error);
				setTitle("Unable to load attendance data.");
			}
		};

		fetchData();
	}, [courseId]);

	return (
		<div className="w-full h-full">
			<h3 className="text-lg text-white font-medium mb-2">{title}</h3>
			<ResponsiveContainer width="100%" height="100%">
				<ChartContainer
					config={chartConfig}
					className="w-full h-full bg-transparent"
				>
					<AreaChart data={data}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="session" />
						<YAxis allowDecimals={false} />
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator="dot" />}
						/>
						<Area
							type="monotone"
							dataKey="present"
							stroke="#c1ffba"
							fill="#baffd9"
							strokeWidth={2}
							name="Present"
						/>
						<Area
							type="monotone"
							dataKey="absent"
							stroke="#dc2626"
							fill="#DA6C6C"
							strokeWidth={2}
							name="Absent"
						/>
					</AreaChart>
				</ChartContainer>
			</ResponsiveContainer>
		</div>
	);
};

export default AttendanceLineChartCourse;
