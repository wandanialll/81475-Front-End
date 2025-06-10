import React, { useEffect, useRef, useState } from "react";
import { fetchFacialRecognitionAttendance } from "@/api";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";

const FaceScan: React.FC = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [status, setStatus] = useState("");
	const [isStreaming, setIsStreaming] = useState(true);
	const [recognizedStudents, setRecognizedStudents] = useState<
		{ student_id: string; score: number; face: string; timestamp: Date }[]
	>([]);
	const [scanStats, setScanStats] = useState<{
		totalStudents: number;
		totalPresent: number;
	}>({ totalStudents: 0, totalPresent: 0 });
	const INTERVAL_MS = 500; // 1 image every 500ms

	useEffect(() => {
		const query = new URLSearchParams(window.location.search);
		const id = query.get("session_id");
		if (!id) {
			alert("Session ID missing from URL");
			return;
		}
		setSessionId(id);

		// Initialize camera
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

		// Cleanup function to stop camera when component unmounts
		return () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => {
					track.stop();
				});
				streamRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			if (isStreaming && sessionId) {
				captureAndSend();
			}
		}, INTERVAL_MS);

		return () => clearInterval(interval);
	}, [isStreaming, sessionId]);

	const captureAndSend = async () => {
		if (!canvasRef.current || !videoRef.current) return;

		const canvas = canvasRef.current;
		const video = videoRef.current;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext("2d")!;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		const imageBase64 = canvas.toDataURL("image/jpeg");

		try {
			if (!sessionId) {
				setStatus("Session ID is missing.");
				return;
			}
			const data = await fetchFacialRecognitionAttendance(
				sessionId,
				imageBase64
			);

			// Update status with scan info
			if (data.matches && data.matches.length > 0) {
				setStatus(`Found ${data.matches.length} new recognition(s)`);
			} else if (data.status === "no_faces_detected") {
				setStatus("No faces detected in current frame");
			} else {
				setStatus("Scanning...");
			}

			// Add new matches to the recognized students list
			if (data.matches && data.matches.length > 0) {
				setRecognizedStudents((prev) => {
					const newStudents = data.matches.map((match: any) => ({
						...match,
						timestamp: new Date(),
					}));

					// Filter out duplicates by student_id and add new ones
					const existingIds = new Set(prev.map((s) => s.student_id));
					const uniqueNewStudents = newStudents.filter(
						(s: { student_id: string }) => !existingIds.has(s.student_id)
					);

					return [...prev, ...uniqueNewStudents];
				});
			}

			// Update scan statistics
			if (data.stats) {
				setScanStats(data.stats);
			}

			// Stop streaming if all students are accounted for
			if (data.allAccounted) {
				setIsStreaming(false);
				setStatus("All students accounted for! Scanning stopped.");
			}
		} catch (err) {
			console.error("Error sending image:", err);
			setStatus("Error sending image.");
		}
	};

	const resetScanning = async () => {
		if (!sessionId) return;
		try {
			await fetchFacialRecognitionAttendance(sessionId, "", true); // true = reset flag
			setRecognizedStudents([]); // Clear recognized students
			setScanStats({ totalStudents: 0, totalPresent: 0 });
			setIsStreaming(true);
			setStatus("Reset complete. Starting fresh scan...");
		} catch (err) {
			console.error("Failed to reset scanning:", err);
			setStatus("Failed to reset scanning.");
		}
	};

	const stopCamera = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => {
				track.stop();
			});
			streamRef.current = null;
			setIsStreaming(false);
			setStatus("Camera stopped");
		}
	};

	const formatTimestamp = (timestamp: Date) => {
		return timestamp.toLocaleTimeString();
	};

	return (
		<div className="flex justify-center min-h-full space-x-5">
			<div className="w-full">
				<Card className="min-h-full">
					<CardHeader>
						<CardTitle>Face Scan Attendance</CardTitle>
						<CardDescription>
							Session ID: {sessionId || "Loading..."}
						</CardDescription>
						{scanStats.totalStudents > 0 && (
							<div className="text-sm text-muted-foreground">
								Progress: {scanStats.totalPresent} of {scanStats.totalStudents}{" "}
								students present
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
								Scan Everyone Again
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
							.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Most recent first
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

									{/* Green indicator for recent recognition */}
									{Date.now() - student.timestamp.getTime() < 3000 && (
										<div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
									)}
								</Card>
							))
					)}
				</div>
			</div>
		</div>
	);
};

export default FaceScan;
