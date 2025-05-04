// src/components/layout/MainLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function MainLayout() {
	return (
		<div className="flex h-screen">
			<Sidebar />
			<div className="flex flex-col flex-1">
				<TopNav />
				<main className="p-4 overflow-auto flex-1">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
