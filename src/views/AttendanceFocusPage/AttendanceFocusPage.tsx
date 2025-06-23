import React, { useEffect, useRef, useState } from "react";
import { fetchFacialRecognitionAttendance, fetchFocusIndex } from "@/api";
import { closeAttendanceSheet } from "@/api";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Student {
	student_id: string;
	score: number;
	face: string;
	timestamp: Date;
}

interface ScanStats {
	totalStudents: number;
	totalPresent: number;
}

const CombinedScan: React.FC = () => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [status, setStatus] = useState<string>("");
	const [isStreaming, setIsStreaming] = useState<boolean>(true);
	const [recognizedStudents, setRecognizedStudents] = useState<Student[]>([]);
	const [scanStats, setScanStats] = useState<ScanStats>({
		totalStudents: 0,
		totalPresent: 0,
	});
	const [focusIndex, setFocusIndex] = useState<number | null>(null);
	const INTERVAL_MS = 500;

	useEffect(() => {
		const query = new URLSearchParams(window.location.search);
		const id = query.get("session_id");
		if (!id) {
			alert("Session ID missing from URL");
			return;
		}
		setSessionId(id);

		const initCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
				});
				streamRef.current = stream;
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			} catch (error) {
				console.error("Error accessing camera:", error);
				setStatus("Error accessing camera. Please check permissions.");
			}
		};

		initCamera();

		return () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop());
				streamRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (!isStreaming || !sessionId) return;

		const interval = setInterval(() => {
			captureAndSend();
		}, INTERVAL_MS);

		return () => clearInterval(interval);
	}, [isStreaming, sessionId]);

	const captureAndSend = async () => {
		if (!canvasRef.current || !videoRef.current) return;

		const canvas = canvasRef.current;
		const video = videoRef.current;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		const imageBase64 = canvas.toDataURL("image/jpeg");

		try {
			if (!sessionId) {
				setStatus("Session ID is missing.");
				return;
			}

			const [attendanceResponse, focusResponse] = await Promise.all([
				fetchFacialRecognitionAttendance(sessionId, imageBase64).catch(
					(err) => ({
						error: String(err),
					})
				),
				fetchFocusIndex(sessionId, imageBase64).catch((err) => ({
					error: String(err),
				})),
			]);

			let statusMessage = "";
			if ("error" in attendanceResponse) {
				statusMessage += `Attendance error: ${attendanceResponse.error}. `;
			} else if (
				attendanceResponse.matches &&
				attendanceResponse.matches.length > 0
			) {
				statusMessage += `Found ${attendanceResponse.matches.length} new recognition(s). `;
				setRecognizedStudents((prev) => {
					const newStudents = attendanceResponse.matches.map(
						(match: Student) => ({
							...match,
							timestamp: new Date(),
						})
					);
					const existingIds = new Set(prev.map((s) => s.student_id));
					const uniqueNewStudents = newStudents.filter(
						(s: Student) => !existingIds.has(s.student_id)
					);
					return [...prev, ...uniqueNewStudents];
				});
			} else if (attendanceResponse.status === "no_faces_detected") {
				statusMessage += "No faces detected. ";
			}

			if ("error" in focusResponse) {
				statusMessage += `Focus error: ${focusResponse.error}.`;
			} else if (focusResponse.status === "pose_data_stored") {
				statusMessage += "Pose data stored.";
			} else if (focusResponse.status === "no_people_detected") {
				statusMessage += "No people detected for pose.";
			}

			setStatus(statusMessage || "Scanning...");

			if (attendanceResponse.stats) {
				setScanStats(attendanceResponse.stats);
			}

			if (attendanceResponse.allAccounted) {
				setIsStreaming(false);
				setStatus("All students accounted for! Scanning stopped.");
			}
		} catch (err) {
			console.error("Error processing frame:", err);
			setStatus("Error processing frame.");
		}
	};

	const resetScanning = async () => {
		if (!sessionId) {
			setStatus("Session ID is missing.");
			return;
		}
		try {
			await Promise.all([
				fetchFacialRecognitionAttendance(sessionId, "", true),
				fetchFocusIndex(sessionId, "", true),
			]);
			setRecognizedStudents([]);
			setScanStats({ totalStudents: 0, totalPresent: 0 });
			setFocusIndex(null);
			setIsStreaming(true);
			setStatus("Reset complete. Starting fresh scan...");
		} catch (err) {
			console.error("Failed to reset scanning:", err);
			setStatus("Failed to reset scanning.");
		}
	};

	// const closeSession = async () => {
	// 	if (!sessionId) {
	// 		setStatus("Session ID is missing.");
	// 		return;
	// 	}
	// 	try {
	// 		const response = await axios.post(
	// 			`${process.env.REACT_APP_API_URL || ""}api/attendance/close-sheet`,
	// 			{ session_id: sessionId },
	// 			{
	// 				headers: {
	// 					Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
	// 					"Content-Type": "application/json",
	// 				},
	// 			}
	// 		);
	// 		setIsStreaming(false);
	// 		setStatus("Session closed. Focus index calculated.");
	// 		setFocusIndex(response.data.focus_index);
	// 	} catch (err) {
	// 		console.error("Failed to close session:", err);
	// 		setStatus("Failed to close session.");
	// 	}
	// };

	const closeSession = async () => {
		if (!sessionId) {
			setStatus("Session ID is missing.");
			return;
		}
		try {
			await closeAttendanceSheet(sessionId);
			setIsStreaming(false);
			setStatus("Session closed. Focus index calculated.");
		} catch (err) {
			console.error("Failed to close session:", err);
			setStatus("Failed to close session.");
		}
	};

	const stopCamera = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
			setIsStreaming(false);
			setStatus("Camera stopped");
		}
	};

	const formatTimestamp = (timestamp: Date): string => {
		return timestamp.toLocaleTimeString();
	};

	return (
		<div className="flex justify-center min-h-full space-x-5">
			<div className="w-full max-w-2xl">
				<Card className="min-h-full">
					<CardHeader>
						<CardTitle>Attendance & Focus Scan</CardTitle>
						<CardDescription>
							Session ID: {sessionId || "Loading..."}
						</CardDescription>
						{scanStats.totalStudents > 0 && (
							<div className="text-sm text-muted-foreground">
								Progress: {scanStats.totalPresent} of {scanStats.totalStudents}{" "}
								students present
							</div>
						)}
						{focusIndex !== null && (
							<div className="text-sm text-muted-foreground">
								Focus Index: {(focusIndex * 100).toFixed(2)}%
							</div>
						)}
					</CardHeader>

					<CardContent className="flex flex-col items-center">
						<video ref={videoRef} autoPlay playsInline className="max-w-full" />
						<canvas ref={canvasRef} className="hidden" />

						<div className="mt-4 p-3 bg-muted rounded-lg min-h-[60px] w-full">
							<div className="text-sm font-medium mb-1">Status:</div>
							<div className="text-sm text-muted-foreground">{status}</div>
							{isStreaming && (
								<div className="text-xs text-green-600 mt-1">
									● Scanning active
								</div>
							)}
						</div>

						<div className="flex flex-row space-x-5 items-center mt-4">
							{!isStreaming && streamRef.current && (
								<Button
									onClick={() => setIsStreaming(true)}
									className="py-2 px-4"
								>
									Resume Scanning
								</Button>
							)}
							<Button
								onClick={resetScanning}
								variant="secondary"
								className="py-2 px-4"
							>
								Reset Scan
							</Button>
							<Button
								onClick={closeSession}
								variant="default"
								className="py-2 px-4"
							>
								Close Session
							</Button>
							<Button
								onClick={stopCamera}
								variant="destructive"
								className="py-2 px-4"
							>
								Stop Camera
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="w-80 max-h-screen overflow-y-auto">
				<div className="mb-4">
					<h3 className="text-lg font-semibold mb-2">
						Recognized Students ({recognizedStudents.length})
					</h3>
				</div>

				<div className="space-y-3">
					{recognizedStudents.length === 0 ? (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center text-muted-foreground">
									No students recognized yet
								</div>
							</CardContent>
						</Card>
					) : (
						recognizedStudents
							.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
							.map((student, idx) => (
								<Card key={`${student.student_id}-${idx}`} className="relative">
									<CardHeader className="pb-2">
										<CardTitle className="text-base">
											Student ID: {student.student_id}
										</CardTitle>
										<CardDescription className="text-xs">
											Score: {student.score.toFixed(3)} | Recognized at:{" "}
											{formatTimestamp(student.timestamp)}
										</CardDescription>
									</CardHeader>

									<CardContent className="pt-2">
										{student.face && (
											<img
												src={student.face}
												alt={`Face of student ${student.student_id}`}
												className="rounded w-16 h-16 object-cover"
											/>
										)}
									</CardContent>

									{Date.now() - student.timestamp.getTime() < 3000 && (
										<div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
									)}
								</Card>
							))
					)}
				</div>
			</div>
		</div>
	);
};

export default CombinedScan;
