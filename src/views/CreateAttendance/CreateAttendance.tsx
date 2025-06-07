import { SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";
import { getLecturerCourses } from "@/api";
import { createAttendanceSheet } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, FileText, Users } from "lucide-react";

const CreateAttendanceSheet = () => {
	const [courses, setCourses] = useState<any[]>([]);
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
	const [status, setStatus] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [resetKey, setResetKey] = useState(0);
	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const data = await getLecturerCourses();
				setCourses(data);
			} catch (error) {
				console.error("Failed to fetch courses", error);
			}
		};
		if (user) fetchCourses();
	}, [user]);

	const createSheet = async () => {
		if (!selectedCourseId) return;

		setIsLoading(true);
		setStatus(null);

		try {
			await createAttendanceSheet(selectedCourseId);

			setStatus({
				type: "success",
				message: "Attendance sheet created successfully!",
			});

			setTimeout(() => {
				setSelectedCourseId(null);
				setResetKey((prevKey) => prevKey + 1);
				navigate(`/course/${selectedCourseId}/dashboard`);
			}, 2000);
		} catch (error) {
			setStatus({
				type: "error",
				message: "Error creating attendance sheet. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const selectedCourse = courses.find(
		(course) => String(course.course_id) === selectedCourseId
	);

	return (
		<div className="min-h-full flex items-center justify-center">
			<div className="w-full max-w-md pb-10">
				{/* Header Section */}
				<div className="text-center mb-8">
					{/* <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
						<FileText className="w-8 h-8 text-blue-600" />
					</div> */}
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Create Attendance Sheet
					</h1>
					<p className="text-gray-600">
						Select a course to generate a new attendance tracking sheet
					</p>
				</div>

				{/* Main Card */}
				<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
					<div className="space-y-6">
						{/* Course Selection */}
						<div className="space-y-3">
							<Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
								<Users className="w-4 h-4" />
								Select Course
							</Label>
							<Select
								onValueChange={(val) => setSelectedCourseId(val)}
								value={selectedCourseId || undefined}
								key={resetKey}
							>
								<SelectTrigger className="h-12 text-left">
									<SelectValue placeholder="Choose a course from your list" />
								</SelectTrigger>
								<SelectContent>
									{courses.map((course) => (
										<SelectItem
											key={course.course_id}
											value={String(course.course_id)}
											className="py-3"
										>
											<div className="flex flex-col">
												<span className="font-medium">{course.name}</span>
												<span className="text-sm text-gray-500">
													{course.code}
												</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Selected Course Preview */}
						{selectedCourse && (
							<div className="bg-secondary border border-primary rounded-lg p-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
										<FileText className="w-5 h-5 text-blue-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">
											{selectedCourse.name}
										</h3>
										{selectedCourse.code && (
											<p className="text-sm text-gray-600">
												Course Code: {selectedCourse.code}
											</p>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Create Button */}
						<Button
							onClick={createSheet}
							disabled={!selectedCourseId || isLoading}
							className="w-full h-12 text-base font-semibold hover:ring disabled:bg-gray-300"
						>
							{isLoading ? (
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									Creating Sheet...
								</div>
							) : (
								<div className="flex items-center gap-2">
									<FileText className="w-5 h-5" />
									Create Attendance Sheet
								</div>
							)}
						</Button>

						{/* Status Messages */}
						{status && (
							<div
								className={`flex items-center gap-3 p-4 rounded-lg border ${
									status.type === "success"
										? "bg-green-50 border-green-200 text-green-800"
										: "bg-red-50 border-red-200 text-red-800"
								}`}
							>
								{status.type === "success" ? (
									<CheckCircle className="w-5 h-5 text-green-600" />
								) : (
									<AlertCircle className="w-5 h-5 text-red-600" />
								)}
								<p className="font-medium">{status.message}</p>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-6">
					<p className="text-sm text-gray-500">
						Need help? Contact your system administrator
					</p>
				</div>
			</div>
		</div>
	);
};

export default CreateAttendanceSheet;
