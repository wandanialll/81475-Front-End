import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Student {
	student_id: string;
	name: string;
	status: "present" | "absent";
	lastSeen?: string;
}

interface StudentListProps {
	students: Student[];
	courseName?: string;
	onAddStudent?: () => void;
}

export function StudentList({
	students,
	courseName,
	onAddStudent,
}: StudentListProps) {
	const navigate = useNavigate();

	// Log students data for debugging
	console.log("Students data in StudentList:", students);

	const handleViewDetails = (studentId: string) => {
		navigate(`/student-details/${studentId}`);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold underline underline-offset-1 decoration-4 decoration-primary">
					{courseName ?? "Course"} Student List
				</h2>
				{onAddStudent && (
					<Button
						onClick={onAddStudent}
						className="bg-green-500 hover:bg-green-600 text-white"
						size="sm"
					>
						Add Student
					</Button>
				)}
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Last Seen</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{students.length > 0 ? (
						students.map((student, index) => (
							<TableRow key={`${student.student_id}-${index}`}>
								<TableCell>{student.name}</TableCell>
								<TableCell>
									<span
										className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
											student.status === "present"
												? "bg-green-100 text-green-700"
												: "bg-rose-100 text-rose-700"
										}`}
									>
										{student.status}
									</span>
								</TableCell>
								<TableCell>{student.lastSeen ?? "N/A"}</TableCell>
								<TableCell>
									<Button
										onClick={() => handleViewDetails(student.student_id)}
										className="bg-blue-500 hover:bg-blue-600 text-white"
										size="sm"
										variant={"secondary_boxed"}
									>
										View Details
									</Button>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={4} className="text-center">
								No students found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
