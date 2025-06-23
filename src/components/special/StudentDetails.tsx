import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getStudentDetails } from "@/api";

// Define TypeScript interfaces
interface Course {
	courseId: number;
	name: string;
}

interface AttendanceRecord {
	courseId: number;
	sessionId: number;
	present: boolean;
	timestamp: string;
}

interface Photo {
	photoId: number;
	filename: string;
	mimetype: string;
	capturedAt: string;
	imageData: string;
}

interface StudentDetailsData {
	studentId: number;
	name: string;
	courses: Course[];
	attendanceRecords: AttendanceRecord[];
	photos: Photo[];
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ hasError: boolean; error: string | null }
> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error: error.message };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="p-4 text-red-600">
					<h2>Something went wrong:</h2>
					<p>{this.state.error}</p>
				</div>
			);
		}
		return this.props.children;
	}
}

const StudentDetails: React.FC = () => {
	const { studentId } = useParams<{ studentId: string }>();
	const [student, setStudent] = useState<StudentDetailsData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [photoErrors, setPhotoErrors] = useState<{ [key: number]: string }>({});

	useEffect(() => {
		const fetchStudentDetails = async () => {
			if (!studentId) {
				setError("Student ID is missing from the URL.");
				setLoading(false);
				return;
			}

			try {
				const studentDetails = await getStudentDetails(studentId);
				console.log("Fetched student details:", studentDetails);
				// Log photo data specifically
				console.log("Photo data:", studentDetails.photos);
				setStudent(studentDetails);
				setLoading(false);
			} catch (error) {
				setError(
					"Failed to fetch student details: " + (error as Error).message
				);
				setLoading(false);
			}
		};

		fetchStudentDetails();
	}, [studentId]);

	// Handle image loading errors
	const handleImageError = (photoId: number, filename: string) => {
		setPhotoErrors((prev) => ({
			...prev,
			[photoId]: `Failed to load image: ${filename}`,
		}));
	};

	// Convert hex to base64 safely
	const toBase64 = (hexString: string): string => {
		try {
			const bytes = new Uint8Array(
				hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
			);
			return btoa(String.fromCharCode(...bytes));
		} catch (e) {
			console.error("Error converting hex to base64:", e);
			return "";
		}
	};

	if (loading) return <div className="p-4">Loading...</div>;
	if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
	if (!student) return <div className="p-4">No student data found.</div>;

	return (
		<ErrorBoundary>
			<div className="mb-5 space-y-5">
				<Card>
					{/* <CardHeader>
						<CardTitle className="text-lg font-semibold">
							Student Details
						</CardTitle>
					</CardHeader> */}
					<CardContent>
						<div className="flex justify-between items-start space-x-4">
							<div>
								<div>
									<p>
										<strong>Name:</strong> {student.name}
									</p>
									<p>
										<strong>ID:</strong> {student.studentId}
									</p>
								</div>
								<div>
									<strong>Courses:</strong>
									{student.courses.length > 0 ? (
										<ul className="list-disc pl-5 mt-1">
											{student.courses.map((course) => (
												<li key={course.courseId}>
													{course.name} (ID: {course.courseId})
												</li>
											))}
										</ul>
									) : (
										<p className="mt-1">No courses enrolled.</p>
									)}
								</div>
							</div>
							<div>
								{student.photos && student.photos.length > 0 ? (
									(() => {
										const photo = student.photos.find(
											(p) => p.filename && p.filename.includes("1")
										);
										if (!photo) {
											return (
												<p className="mt-1">No matching photo available.</p>
											);
										}

										return (
											<div className="p-2 rounded">
												{photoErrors[photo.photoId] ? (
													<p className="text-red-600 text-sm">
														{photoErrors[photo.photoId]}
													</p>
												) : (
													<img
														src={
															photo.imageData && photo.mimetype
																? `data:${photo.mimetype};base64,${toBase64(
																		photo.imageData
																  )}`
																: ""
														}
														alt={photo.filename || "Student photo"}
														className="w-full h-48 object-cover rounded"
														onError={() =>
															handleImageError(photo.photoId, photo.filename)
														}
													/>
												)}
												{/* <p className="mt-2 text-sm">
													<strong>Filename:</strong> {photo.filename || "N/A"}
												</p>
												<p className="text-sm">
													<strong>Captured:</strong> {photo.capturedAt || "N/A"}
												</p>
												<p className="text-sm">
													<strong>Photo ID:</strong> {photo.photoId}
												</p> */}
											</div>
										);
									})()
								) : (
									<p className="mt-1">No photos available.</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Attendance Records</CardTitle>
					</CardHeader>
					<CardContent>
						<div>
							{student.attendanceRecords.length > 0 ? (
								<table className="w-full border-collapse mt-1">
									<thead>
										<tr>
											<th className="border p-2 text-left">Course ID</th>
											<th className="border p-2 text-left">Session ID</th>
											<th className="border p-2 text-left">Present</th>
											<th className="border p-2 text-left">Timestamp</th>
										</tr>
									</thead>
									<tbody>
										{student.attendanceRecords.map((record, index) => (
											<tr key={index}>
												<td className="border p-2">{record.courseId}</td>
												<td className="border p-2">{record.sessionId}</td>
												<td className="border p-2">
													{record.present ? "Yes" : "No"}
												</td>
												<td className="border p-2">{record.timestamp}</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<p className="mt-1">No attendance records.</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* <div className="flex justify-between">
					<div className="bg-primary">
						<div>
							<p>
								<strong>ID:</strong> {student.studentId}
							</p>
							<p>
								<strong>Name:</strong> {student.name}
							</p>
						</div>
						<div>
							<strong>Courses:</strong>
							{student.courses.length > 0 ? (
								<ul className="list-disc pl-5 mt-1">
									{student.courses.map((course) => (
										<li key={course.courseId}>
											{course.name} (ID: {course.courseId})
										</li>
									))}
								</ul>
							) : (
								<p className="mt-1">No courses enrolled.</p>
							)}
						</div>
					</div>
					<div>
						<strong>Photos:</strong>
						{student.photos && student.photos.length > 0 ? (
							(() => {
								const photo = student.photos.find(
									(p) => p.filename && p.filename.includes("1")
								);
								if (!photo) {
									return <p className="mt-1">No matching photo available.</p>;
								}

								return (
									<div className="border p-2 rounded mt-1">
										{photoErrors[photo.photoId] ? (
											<p className="text-red-600 text-sm">
												{photoErrors[photo.photoId]}
											</p>
										) : (
											<img
												src={
													photo.imageData && photo.mimetype
														? `data:${photo.mimetype};base64,${toBase64(
																photo.imageData
														  )}`
														: ""
												}
												alt={photo.filename || "Student photo"}
												className="w-full h-48 object-cover rounded"
												onError={() =>
													handleImageError(photo.photoId, photo.filename)
												}
											/>
										)}
										<p className="mt-2 text-sm">
											<strong>Filename:</strong> {photo.filename || "N/A"}
										</p>
										<p className="text-sm">
											<strong>Captured:</strong> {photo.capturedAt || "N/A"}
										</p>
										<p className="text-sm">
											<strong>Photo ID:</strong> {photo.photoId}
										</p>
									</div>
								);
							})()
						) : (
							<p className="mt-1">No photos available.</p>
						)}
					</div>
				</div> */}
				{/* <Card>
					<CardHeader>
						<CardTitle>Student Details</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							<div>
								<p>
									<strong>ID:</strong> {student.studentId}
								</p>
								<p>
									<strong>Name:</strong> {student.name}
								</p>
							</div>
							<div>
								<strong>Courses:</strong>
								{student.courses.length > 0 ? (
									<ul className="list-disc pl-5 mt-1">
										{student.courses.map((course) => (
											<li key={course.courseId}>
												{course.name} (ID: {course.courseId})
											</li>
										))}
									</ul>
								) : (
									<p className="mt-1">No courses enrolled.</p>
								)}
							</div>
							<div>
								<strong>Attendance Records:</strong>
								{student.attendanceRecords.length > 0 ? (
									<table className="w-full border-collapse mt-1">
										<thead>
											<tr>
												<th className="border p-2 text-left">Course ID</th>
												<th className="border p-2 text-left">Session ID</th>
												<th className="border p-2 text-left">Present</th>
												<th className="border p-2 text-left">Timestamp</th>
											</tr>
										</thead>
										<tbody>
											{student.attendanceRecords.map((record, index) => (
												<tr key={index}>
													<td className="border p-2">{record.courseId}</td>
													<td className="border p-2">{record.sessionId}</td>
													<td className="border p-2">
														{record.present ? "Yes" : "No"}
													</td>
													<td className="border p-2">{record.timestamp}</td>
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<p className="mt-1">No attendance records.</p>
								)}
							</div>
							<div>
								<strong>Photos:</strong>
								{student.photos && student.photos.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-1">
										{student.photos.map((photo) => (
											<div key={photo.photoId} className="border p-2 rounded">
												{photoErrors[photo.photoId] ? (
													<p className="text-red-600 text-sm">
														{photoErrors[photo.photoId]}
													</p>
												) : (
													<img
														src={
															photo.imageData && photo.mimetype
																? `data:${photo.mimetype};base64,${toBase64(
																		photo.imageData
																  )}`
																: ""
														}
														alt={photo.filename || "Student photo"}
														className="w-full h-48 object-cover rounded"
														onError={() =>
															handleImageError(photo.photoId, photo.filename)
														}
													/>
												)}
												<p className="mt-2 text-sm">
													<strong>Filename:</strong> {photo.filename || "N/A"}
												</p>
												<p className="text-sm">
													<strong>Captured:</strong> {photo.capturedAt || "N/A"}
												</p>
												<p className="text-sm">
													<strong>Photo ID:</strong> {photo.photoId}
												</p>
											</div>
										))}
									</div>
								) : (
									<p className="mt-1">No photos available.</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card> */}
			</div>
		</ErrorBoundary>
	);
};

export default StudentDetails;
