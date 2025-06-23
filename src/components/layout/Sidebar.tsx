// src/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import icon from "@/images/special/output.ico";

export default function Sidebar() {
	const { pathname } = useLocation();

	return (
		<aside className="w-52 text-black p-4 bg-white/20 backdrop-blur-lg border border-white/20 rounded-md shadow-lg m-5 border border-white/40">
			<div className="flex flex-row items-center rounded-sm p-2 mb-4 space-x-4 ">
				<img src={icon} alt="Logo" className="w-16 h-16" />
				<h2 className="text-lg text-primary font-bold">FiRASAT</h2>
			</div>
			<nav className="flex flex-col space-y-2">
				<Link
					to="/"
					className={clsx(
						"hover:bg-white/10 hover:backdrop-blur-sm rounded-sm text-white hover:font-bold p-2 hover:border hover:border-white/30",
						{
							"bg-white/30 backdrop-blur-sm rounded-sm text-white font-bold border border-white/40":
								pathname === "/",
						}
					)}
				>
					Dashboard
				</Link>
				<Link
					to="/create-attendance"
					className={clsx(
						"hover:bg-white/10 hover:backdrop-blur-sm rounded-sm text-white hover:font-bold p-2 hover:border hover:border-white/30",
						{
							"bg-white/30 backdrop-blur-sm rounded-sm text-white font-bold border border-white/40":
								pathname === "/create-attendance",
						}
					)}
				>
					Create Attendance
				</Link>
				<Link
					to="/courses"
					className={clsx(
						"hover:bg-white/10 hover:backdrop-blur-sm rounded-sm text-white hover:font-bold p-2 hover:border hover:border-white/30",
						{
							"bg-white/30 backdrop-blur-sm rounded-sm text-white font-bold border border-white/40":
								pathname === "/courses",
						}
					)}
				>
					Courses
				</Link>
				<Link
					to="/chat"
					className={clsx(
						"hover:bg-white/10 hover:backdrop-blur-sm rounded-sm text-white hover:font-bold p-2 hover:border hover:border-white/30",
						{
							"bg-white/30 backdrop-blur-sm rounded-sm text-white font-bold border border-white/40":
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
