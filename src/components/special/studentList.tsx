import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

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

export function StudentList({ students, courseName }: StudentListProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold underline underline-offset-1 decoration-4 decoration-primary">
					{courseName ?? "Course"} Student List
				</h2>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Last Seen</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{students.map((student) => (
						<TableRow key={student.student_id}>
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
							<TableCell>{student.lastSeen}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
