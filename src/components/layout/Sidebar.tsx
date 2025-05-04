// src/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

export default function Sidebar() {
	const { pathname } = useLocation();

	return (
		<aside className="w-64 bg-gray-800 text-white p-4">
			<h2 className="text-lg font-bold mb-6">Sidebar</h2>
			<nav className="flex flex-col space-y-2">
				<Link
					to="/"
					className={clsx("hover:bg-gray-700 p-2 rounded", {
						"bg-gray-700": pathname === "/",
					})}
				>
					Dashboard
				</Link>
				<Link
					to="/create-attendance"
					className={clsx("hover:bg-gray-700 p-2 rounded", {
						"bg-gray-700": pathname === "/create-attendance",
					})}
				>
					Create Attendance
				</Link>
			</nav>
		</aside>
	);
}
