import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
	width: 640,
	height: 480,
	facingMode: "user",
};

export default function FaceRecognition() {
	const webcamRef = useRef<Webcam>(null);
	type FaceResult = {
		bbox: [number, number, number, number];
		name: string;
		score: number;
	};
	const [results, setResults] = useState<FaceResult[]>([]);

	const sendFrameToAPI = useCallback(async () => {
		if (
			webcamRef.current &&
			webcamRef.current.video &&
			webcamRef.current.video.readyState === 4
		) {
			const imageSrc = webcamRef.current.getScreenshot();
			if (!imageSrc) {
				return;
			}
			const base64 = imageSrc.split(",")[1]; // remove data:image/jpeg;base64,

			try {
				const res = await fetch("http://localhost:5000/recognize", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ image: base64 }),
				});
				const data = await res.json();
				setResults(data.results || []);
			} catch (err) {
				console.error("Recognition error:", err);
			}
		}
	}, []);

	useEffect(() => {
		const interval = setInterval(sendFrameToAPI, 500); // every 0.5 seconds
		return () => clearInterval(interval);
	}, [sendFrameToAPI]);

	return (
		<div style={{ position: "relative", width: 640, height: 480 }}>
			<Webcam
				ref={webcamRef}
				audio={false}
				screenshotFormat="image/jpeg"
				videoConstraints={videoConstraints}
				style={{ width: 640, height: 480 }}
			/>
			{results.map((face, i) => {
				const { bbox, name, score } = face;
				const [x1, y1, x2, y2] = bbox;
				const boxStyle = {
					position: "absolute",
					left: x1,
					top: y1,
					width: x2 - x1,
					height: y2 - y1,
					border: "2px solid lime",
					color: "white",
					fontWeight: "bold",
					fontSize: 14,
					backgroundColor: "rgba(0,0,0,0.5)",
					padding: 2,
				};
				return (
					<div key={i} style={boxStyle as React.CSSProperties}>
						{name} ({score.toFixed(2)})
					</div>
				);
			})}
		</div>
	);
}
