import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Shield, Eye, Database, Users } from "lucide-react";
import { toast } from "sonner";
import { enroll } from "@/api";
import { generateEmbedding } from "@/api";

const prompts = ["Look forward", "Look left", "Look right"];

export default function EnrollmentPage() {
	const [name, setName] = useState("");
	const [studentId, setStudentId] = useState("");
	const [photos, setPhotos] = useState<(Blob | null)[]>([null, null, null]);
	const [loading, setLoading] = useState(false);
	const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
	const [privacyAccepted, setPrivacyAccepted] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [photoPreviews, setPhotoPreviews] = useState<string[]>(["", "", ""]);
	const [cameraStarted, setCameraStarted] = useState(false);
	const [startCameraClicked, setStartCameraClicked] = useState(false);
	const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
	const navigate = useNavigate(); // Added for navigation

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

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const context = canvas.getContext("2d");
		if (context) {
			context.drawImage(video, 0, 0, canvas.width, canvas.height);
			canvas.toBlob(
				(blob) => {
					if (blob) {
						const newPhotos = [...photos];
						const newPreviews = [...photoPreviews];
						const index =
							retakeIndex !== null ? retakeIndex : currentPromptIndex;

						newPhotos[index] = blob;

						const reader = new FileReader();
						reader.onloadend = () => {
							newPreviews[index] = reader.result as string;
							setPhotos(newPhotos);
							setPhotoPreviews(newPreviews);

							if (retakeIndex !== null) {
								setRetakeIndex(null);
								stopCamera();
							} else if (currentPromptIndex < prompts.length - 1) {
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
		setRetakeIndex(index);
		setCurrentPromptIndex(index);
		if (!cameraStarted) startCamera();
	};

	const handleSubmit = async () => {
		if (!privacyAccepted) {
			toast.error(
				"Please read and accept the privacy notice before proceeding."
			);
			return;
		}

		if (!studentId || isNaN(Number(studentId))) {
			toast.error("Please enter a valid numeric Student ID.");
			return;
		}

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
			const data = await enroll(name, studentId, files);

			if (!("student_id" in data) || data.photos_saved !== 3) {
				throw new Error("Enrollment failed.");
			}

			// Generate embedding after enrollment
			await generateEmbedding(studentId);

			toast.success("Enrollment and embedding successful!");
			handleClearForm();
			navigate("/enrollment-success");
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : "Error during enrollment."
			);
		} finally {
			setLoading(false);
		}

		console.log("Enrollment data:", {
			name,
			studentId,
			photos: files.map((file) => file.name),
		});
	};

	const handleClearForm = () => {
		setName("");
		setStudentId("");
		setPhotos([null, null, null]);
		setPhotoPreviews(["", "", ""]);
		setCurrentPromptIndex(0);
		setPrivacyAccepted(false);
		stopCamera();
	};

	const handleClickStartCamera = () => {
		setStartCameraClicked(true);
		startCamera();
	};

	const PrivacyNoticeDialog = () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<Info className="h-4 w-4 text-black" />
					Privacy Notice
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-black">
						<Shield className="h-5 w-5" />
						How Your Data Is Being Used
					</DialogTitle>
					<DialogDescription>
						Information about data collection and usage for this facial
						recognition attendance system
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<Alert>
						<Shield className="h-4 w-4" />
						<AlertDescription className="text-black">
							This system is being developed as part of a final year project for
							academic purposes only.
						</AlertDescription>
					</Alert>

					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<Users className="h-5 w-5 mt-0.5 text-blue-600" />
							<div>
								<h4 className="font-semibold mb-2 text-black">
									Personal Information Collection
								</h4>
								<p className="text-sm text-gray-600">
									We collect your <strong>name</strong> and{" "}
									<strong>matric number</strong> solely for reference and
									record-keeping purposes within the attendance system. This
									information helps identify you in the system and maintain
									accurate attendance records.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<Eye className="h-5 w-5 mt-0.5 text-green-600" />
							<div>
								<h4 className="font-semibold mb-2 text-black">
									Facial Image Processing
								</h4>
								<p className="text-sm text-gray-600">
									Your facial images are processed to generate{" "}
									<strong>facial embeddings</strong> - mathematical
									representations of your facial features. These embeddings are
									used exclusively for the facial recognition attendance system
									to identify you during attendance marking.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<Database className="h-5 w-5 mt-0.5 text-purple-600" />
							<div>
								<h4 className="font-semibold mb-2 text-black">
									Data Storage & Security
								</h4>
								<p className="text-sm text-gray-600">
									All data is stored securely and used exclusively for this
									academic project. Your original photos are processed into
									facial embeddings, and the system does not retain unnecessary
									personal information beyond what's required for the attendance
									functionality. If you wish to have your data removed at any
									time, you can request it by contacting
									"wanmuhammaddanialzulkifli@gmail.com", and we will delete your
									records
								</p>
							</div>
						</div>

						<div className="bg-gray-50 p-4 rounded-lg">
							<h4 className="font-semibold mb-2 text-black">
								Data Usage Summary:
							</h4>
							<ul className="text-sm space-y-1 text-gray-600">
								<li>
									• <strong>Name & Matric Number:</strong> Reference records for
									system features
								</li>
								<li>
									• <strong>Facial Images:</strong> Converted to embeddings for
									facial recognition
								</li>
								<li>
									• <strong>Purpose:</strong> Final year project - facial
									recognition attendance system
								</li>
								<li>
									• <strong>Retention:</strong> Data used only for project
									duration and academic evaluation. You are free to request for
									your data to be removed at any time.
								</li>
							</ul>
						</div>

						<Alert>
							<Info className="h-4 w-4" />
							<AlertDescription>
								By proceeding with enrollment, you consent to the collection and
								use of your data as described above for this academic project.
							</AlertDescription>
						</Alert>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);

	return (
		<div className="min-h-screen flex items-center justify-center bg-[url('/src/images/bg_5.jpg')] bg-cover bg-center p-3 md:p-5">
			<Card className="w-full max-w-md md:max-w-lg lg:max-w-xl backdrop-blur-md bg-white/20 border-white/30 shadow-xl">
				<CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
					<div className="text-center space-y-4">
						<h1 className="text-xl md:text-2xl font-bold">
							FiRASAT Enrollment
						</h1>
						<PrivacyNoticeDialog />
					</div>
					{/* Privacy consent checkbox */}
					<Alert className="bg-white/20 backdrop-blur-sm border-white/30">
						<Info className="h-4 w-4" />
						<AlertDescription className="flex items-center gap-2">
							<input
								type="checkbox"
								id="privacy-consent"
								checked={privacyAccepted}
								onChange={(e) => setPrivacyAccepted(e.target.checked)}
								className="rounded border-gray-300"
							/>
							<label
								htmlFor="privacy-consent"
								className="text-sm cursor-pointer"
							>
								I have read and accept the privacy notice regarding data usage
								for this academic project
							</label>
						</AlertDescription>
					</Alert>

					{/* Form inputs */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								className="bg-white/30 backdrop-blur-sm border border-white/40 shadow-sm"
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter your name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="student_id">Matric No.</Label>
							<Input
								id="student_id"
								type="number"
								value={studentId}
								onChange={(e) => setStudentId(e.target.value)}
								placeholder="Enter matric number"
								className="bg-white/30 backdrop-blur-sm border border-white/40 shadow-sm"
							/>
						</div>
					</div>

					{/* Camera section */}
					<div className="space-y-3">
						{startCameraClicked && (
							<div className="space-y-3">
								<div className="relative overflow-hidden rounded-lg bg-black/20 backdrop-blur-sm">
									<video
										ref={videoRef}
										autoPlay
										playsInline
										muted
										className="w-full h-auto max-h-64 md:max-h-80 object-cover rounded-lg transform scale-x-[-1]"
									/>
									<canvas
										ref={canvasRef}
										width="640"
										height="480"
										className="hidden"
									/>
								</div>
								<div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
									<p className="font-medium text-center text-sm md:text-base">
										{currentPromptIndex < prompts.length
											? prompts[currentPromptIndex]
											: "All photos taken"}
									</p>
								</div>
							</div>
						)}

						{/* Camera controls */}
						<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
							<Button
								onClick={handleClickStartCamera}
								disabled={cameraStarted || !privacyAccepted}
								className="flex-1"
							>
								Start Camera
							</Button>
							<Button
								onClick={takePhoto}
								disabled={currentPromptIndex >= 3 || !cameraStarted}
								className="flex-1"
							>
								{currentPromptIndex < 3
									? `Take Photo (${currentPromptIndex + 1}/3)`
									: "Done"}
							</Button>
						</div>
					</div>

					{/* Photo previews */}
					{photoPreviews.some((src) => src) && (
						<div className="space-y-3">
							<Label>Preview</Label>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
								{photoPreviews.map((src, index) => (
									<div key={index} className="relative group">
										<div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/30">
											{src ? (
												<img
													src={src}
													alt={`Preview ${index + 1}`}
													className="w-full h-32 md:h-40 object-cover"
												/>
											) : (
												<div className="w-full h-32 md:h-40 bg-gray-200 flex items-center justify-center">
													<span className="text-gray-400 text-sm">
														No Photo
													</span>
												</div>
											)}
											<Button
												type="button"
												size="sm"
												variant="outline"
												className="absolute top-2 right-2"
												onClick={() => handleRetake(index)}
											>
												Retake
											</Button>
										</div>
										<p className="text-xs md:text-sm text-center mt-2 px-1">
											{prompts[index]}
										</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Submit button */}
					<Button
						onClick={handleSubmit}
						disabled={loading || photos.some((p) => !p) || !privacyAccepted}
						className="w-full"
					>
						{loading ? "Submitting..." : "Enroll"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
