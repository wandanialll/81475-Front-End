import React, { useEffect, useRef, useState } from "react";
import { fetchFacialRecognitionAttendance } from "@/api";

const FaceScan: React.FC = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [status, setStatus] = useState("");
	const [isStreaming, setIsStreaming] = useState(true);
	const [matches, setMatches] = useState<
		{ student_id: string; score: number; face: string }[]
	>([]);
	const INTERVAL_MS = 500; // 1 image every 3 seconds

	useEffect(() => {
		const query = new URLSearchParams(window.location.search);
		const id = query.get("session_id");
		if (!id) {
			alert("Session ID missing from URL");
			return;
		}
		setSessionId(id);

		navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
		});
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
			setStatus(JSON.stringify(data, null, 2));

			if (data.matches) {
				setMatches(data.matches);
			}

			if (data.allAccounted) {
				setIsStreaming(false);
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
			setMatches([]); // Clear local UI matches
			setIsStreaming(true);
		} catch (err) {
			console.error("Failed to reset scanning:", err);
		}
	};

	return (
		<div className="flex flex-col items-center gap-4 p-4">
			<video
				ref={videoRef}
				autoPlay
				playsInline
				className="rounded-md shadow"
			/>
			<canvas ref={canvasRef} className="hidden" />
			{!isStreaming && (
				<button
					onClick={() => setIsStreaming(true)}
					className="bg-green-600 text-white py-2 px-4 rounded"
				>
					Resume Scanning
				</button>
			)}
			<button
				onClick={resetScanning}
				className="bg-yellow-500 text-white py-2 px-4 rounded"
			>
				Scan Everyone Again
			</button>

			{matches.length > 0 &&
				matches.map((match, idx) => (
					<div key={idx}>
						<p>Student ID: {match.student_id}</p>
						<p>Score: {match.score.toFixed(2)}</p>
						<img
							src={match.face}
							alt={`Face of student ${match.student_id}`}
							width={100}
						/>
					</div>
				))}

			<pre className="bg-gray-100 p-2 mt-4 rounded w-full max-w-lg overflow-auto">
				{status}
			</pre>
		</div>
	);
};

export default FaceScan;
