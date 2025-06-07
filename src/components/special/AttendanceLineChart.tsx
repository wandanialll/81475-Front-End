import React, { useEffect, useState } from "react";
import {
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	Area,
	AreaChart,
} from "recharts";
import { getLecturerAttendancePerformance } from "@/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

interface AttendanceSession {
	sessionId: string;
	present: number;
	absent: number;
}

interface ChartDataPoint {
	session: string;
	sessionId: string;
	present: number;
	absent: number;
}

const chartConfig = {
	present: {
		label: "Present",
	},
	absent: {
		label: "Absent",
	},
};

const AttendanceLineChart: React.FC = () => {
	const [data, setData] = useState<ChartDataPoint[]>([]);
	const [title, setTitle] = useState<string>("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await getLecturerAttendancePerformance();

				const chartData = res.sessions.map(
					(session: AttendanceSession, index: number) => ({
						session: `Session ${index + 1}`,
						sessionId: session.sessionId,
						present: session.present,
						absent: session.absent,
					})
				);

				//setTitle(`${res.lecturer}'s Attendance Sessions`);
				setData(chartData);
			} catch (error) {
				console.error("Error fetching attendance data", error);
				setTitle("Unable to load attendance data.");
			}
		};

		fetchData();
	}, []);

	return (
		<div className="w-full h-full">
			<h3 className="text-lg font-medium mb-2">{title}</h3>
			<ResponsiveContainer width="100%" height="100%">
				<ChartContainer config={chartConfig} className="w-full h-full bg-white">
					{/* <LineChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="session" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Line
						type="monotone"
						dataKey="present"
						stroke="#16a34a"
						strokeWidth={2}
						name="Present"
					/>
					<Line
						type="monotone"
						dataKey="absent"
						stroke="#dc2626"
						strokeWidth={2}
						name="Absent"
					/>
				</LineChart> */}
					<AreaChart data={data}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="sessionId" />
						<YAxis allowDecimals={false} />
						{/* <Tooltip /> */}
						{/* <Legend /> */}
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

export default AttendanceLineChart;
