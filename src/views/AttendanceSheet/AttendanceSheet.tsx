import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import { getAttendanceSheetBySessionId } from "@/api";

const AttendanceSheet = () => {
	const { courseId } = useParams(); // Get the courseId from the URL
	const { sessionId } = useParams(); // Get the sessionId from the URL
	const [openSheets, setOpenSheets] = useState<
		{ session_id: string; started_at: string }[]
	>([]); // State to hold open attendance sheets

	// get open attendance sheets
	useEffect(() => {
		const fetchOpenAttendanceSheets = async () => {
			if (courseId && sessionId) {
				try {
					const data = await getAttendanceSheetBySessionId(sessionId);
					setOpenSheets(data);
				} catch (err: any) {
					console.error("Error fetching open attendance sheets:", err);
				}
			}
		};

		fetchOpenAttendanceSheets();
	}, [courseId]);
	return (
		<div>
			<h1>Open Attendance Sheets</h1>
			{openSheets.length > 0 ? (
				<ul>
					{openSheets.map((sheet) => (
						<li key={sheet.session_id}>
							Session ID: {sheet.session_id}, Started At: {sheet.started_at}
							{/* list student registered for this attendance sheet */}
							Students :
						</li>
					))}
				</ul>
			) : (
				<p>No open attendance sheets available.</p>
			)}
		</div>
	);
};

export default AttendanceSheet;
