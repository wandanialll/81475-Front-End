// src/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import icon from "@/images/special/output.ico";

export default function Sidebar() {
	const { pathname } = useLocation();

	return (
		<aside className="w-48 text-black p-4 bg-secondary ">
			<div className="flex flex-row items-center rounded-sm p-2 mb-4 space-x-4">
				<img src={icon} alt="Logo" className="w-16 h-16" />
				<h2 className="text-lg text-primary font-bold">FiRASAT</h2>
			</div>
			<nav className="flex flex-col space-y-2">
				<Link
					to="/"
					className={clsx(
						"hover:underline hover:underline-offset-3 hover:decoration-5 hover:decoration-primary p-2",
						{
							"underline underline-offset-1 decoration-3 decoration-primary":
								pathname === "/",
						}
					)}
				>
					Dashboard
				</Link>
				<Link
					to="/create-attendance"
					className={clsx(
						"hover:underline hover:underline-offset-3 hover:decoration-5 hover:decoration-primary p-2",
						{
							"underline underline-offset-1 decoration-5 decoration-primary":
								pathname === "/create-attendance",
						}
					)}
				>
					Create Attendance
				</Link>
				<Link
					to="/courses"
					className={clsx(
						"hover:underline hover:underline-offset-3 hover:decoration-5 hover:decoration-primary p-2",
						{
							"underline underline-offset-1 decoration-3 decoration-primary":
								pathname === "/courses",
						}
					)}
				>
					Courses
				</Link>
				<Link
					to="/chat"
					className={clsx(
						"hover:underline hover:underline-offset-3 hover:decoration-5 hover:decoration-primary p-2",
						{
							"underline underline-offset-1 decoration-3 decoration-primary":
								pathname === "/chat",
						}
					)}
				>
					Chat
				</Link>
			</nav>
		</aside>
	);
}
