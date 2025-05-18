import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { enroll } from "@/api";

const prompts = ["Look forward", "Look left", "Look right"];

export default function EnrollmentPage() {
	const [name, setName] = useState("");
	// Initialize photos with 3 null placeholders
	const [photos, setPhotos] = useState<(Blob | null)[]>([null, null, null]);
	const [loading, setLoading] = useState(false);
	const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [photoPreviews, setPhotoPreviews] = useState<string[]>(["", "", ""]);
	const [cameraStarted, setCameraStarted] = useState(false);
	const [startCameraClicked, setStartCameraClicked] = useState(false);

	const startCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "user" },
				audio: false,
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				setCameraStarted(true);
			}
		} catch (error) {
			toast.error("Camera access denied or not available.");
		}
	};

	const stopCamera = () => {
		if (videoRef.current?.srcObject) {
			(videoRef.current.srcObject as MediaStream)
				.getTracks()
				.forEach((track) => track.stop());
			videoRef.current.srcObject = null;
			setCameraStarted(false);
		}
	};

	const takePhoto = () => {
		if (!videoRef.current || !canvasRef.current) return;
		const video = videoRef.current;
		const canvas = canvasRef.current;

		// ✅ Set canvas dimensions to match the video feed
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const context = canvas.getContext("2d");
		if (context) {
			context.drawImage(video, 0, 0, canvas.width, canvas.height);
			canvas.toBlob(
				(blob) => {
					if (blob) {
						const newPhotos = [...photos];
						newPhotos[currentPromptIndex] = blob;

						const newPreviews = [...photoPreviews];
						const reader = new FileReader();
						reader.onloadend = () => {
							newPreviews[currentPromptIndex] = reader.result as string;
							setPhotos(newPhotos);
							setPhotoPreviews(newPreviews);

							if (currentPromptIndex < prompts.length - 1) {
								setCurrentPromptIndex((prev) => prev + 1);
							} else {
								stopCamera();
							}
						};
						reader.readAsDataURL(blob);
					}
				},
				"image/jpeg",
				0.95
			);
		}
	};

	const handleRetake = (index: number) => {
		setCurrentPromptIndex(index);
		if (!cameraStarted) startCamera();
	};

	// const handleSubmit = async () => {
	// 	if (!name || photos.length !== 3 || photos.some((p) => !p)) {
	// 		toast.error("Please enter your name and take exactly 3 photos.");
	// 		return;
	// 	}

	// 	const formData = new FormData();
	// 	formData.append("name", name);

	// 	// Append all photos with the **same** field name "photo"
	// 	photos.forEach((photo, index) => {
	// 		if (photo) {
	// 			formData.append("photo", photo, `${name}_${index + 1}.jpg`);
	// 		}
	// 	});

	// 	setLoading(true);
	// 	try {
	// 		const files: File[] = photos
	// 			.map((photo, index) =>
	// 				photo
	// 					? new File([photo], `${name}_${index + 1}.jpg`, {
	// 							type: "image/jpeg",
	// 					  })
	// 					: null
	// 			)
	// 			.filter((file): file is File => file !== null);

	// 		const data = await enroll(name, files);

	// 		if (!data.success) {
	// 			throw new Error(data.message || "Enrollment failed.");
	// 		}

	// 		setPhotos([null, null, null]);
	// 		setPhotoPreviews(["", "", ""]);
	// 		setCurrentPromptIndex(0);
	// 	} catch (error) {
	// 		console.error(error);
	// 		toast.error(
	// 			error instanceof Error ? error.message : "Error during enrollment."
	// 		);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	const handleSubmit = async () => {
		if (!name || photos.length !== 3 || photos.some((p) => !p)) {
			toast.error("Please enter your name and take exactly 3 photos.");
			return;
		}

		const files: File[] = photos
			.map((photo, index) =>
				photo
					? new File([photo], `${name}_${index + 1}.jpg`, {
							type: "image/jpeg",
					  })
					: null
			)
			.filter((file): file is File => file !== null);

		setLoading(true);

		try {
			const data = await enroll(name, files);

			if (!("student_id" in data) || data.photos_saved !== 3) {
				throw new Error("Enrollment failed.");
			}

			toast.success("Enrollment successful!");

			setPhotos([null, null, null]);
			setPhotoPreviews(["", "", ""]);
			setCurrentPromptIndex(0);
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : "Error during enrollment."
			);
		} finally {
			setLoading(false);
			handleClearForm();
		}
	};

	const handleClearForm = () => {
		setName("");
		setPhotos([null, null, null]);
		setPhotoPreviews(["", "", ""]);
		setCurrentPromptIndex(0);
		stopCamera();
	};

	const handleClickStartCamera = () => {
		setStartCameraClicked(true);
		startCamera();
	};

	return (
		<div className="flex py-5 md:h-screen items-center justify-center">
			<Card className="w-full mx-5 md:w-1/4">
				<CardContent className="space-y-6">
					<h1 className="text-2xl font-bold">FiRASAT Enrollment</h1>

					<div className="grid w-full max-w-sm items-center gap-1.5">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your name"
						/>
					</div>

					<div className="space-y-2 w-full">
						{startCameraClicked && (
							<div>
								<video
									ref={videoRef}
									autoPlay
									playsInline
									muted
									className="rounded transform scale-x-[-1]"
								/>
								<canvas
									ref={canvasRef}
									width="640"
									height="480"
									className="hidden"
								/>
								<p className="font-medium text-center">
									{currentPromptIndex < prompts.length
										? prompts[currentPromptIndex]
										: "All photos taken"}
								</p>
							</div>
						)}
						<div className="flex justify-between md:justify-start gap-2">
							<Button onClick={handleClickStartCamera} disabled={cameraStarted}>
								Start Camera
							</Button>
							<Button
								onClick={takePhoto}
								disabled={currentPromptIndex >= 3 || !cameraStarted}
							>
								{currentPromptIndex < 3
									? `Take Photo (${currentPromptIndex + 1}/3)`
									: "Done"}
							</Button>
						</div>
					</div>

					{photoPreviews.some((src) => src) && (
						<div>
							<Label>Preview</Label>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
								{photoPreviews.map((src, index) => (
									<div key={index} className="relative group">
										{src ? (
											<img
												src={src}
												alt={`Preview ${index + 1}`}
												className="rounded shadow"
											/>
										) : (
											<div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
												<span className="text-gray-400">No Photo</span>
											</div>
										)}
										<Button
											type="button"
											size="sm"
											variant="outline"
											className="absolute top-1 right-1"
											onClick={() => handleRetake(index)}
										>
											Retake
										</Button>
										<p className="text-sm text-center mt-2">{prompts[index]}</p>
									</div>
								))}
							</div>
						</div>
					)}

					<Button
						onClick={handleSubmit}
						disabled={loading || photos.some((p) => !p)}
						className="w-full"
					>
						{loading ? "Submitting..." : "Enroll"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
