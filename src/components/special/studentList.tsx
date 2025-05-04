import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Student {
	id: string;
	name: string;
	status: "present" | "absent";
	lastSeen?: string;
}

interface StudentListProps {
	students: Student[];
	onAddStudent?: () => void;
}

export function StudentList({ students, onAddStudent }: StudentListProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">TMF4913 Student List</h2>
				<Button
					onClick={onAddStudent}
					className="bg-rose-400 hover:bg-rose-500"
				>
					Add Student
				</Button>
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
						<TableRow key={student.id}>
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
