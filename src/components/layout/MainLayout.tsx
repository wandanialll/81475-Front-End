// src/components/layout/MainLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function MainLayout() {
	return (
		<div className="flex h-screen bg-[url('/src/images/bg.jpg')] bg-cover bg-center bg-fixed">
			<Sidebar />
			<div className="flex flex-col flex-1">
				<div className="z-50">
					<TopNav />
				</div>
				<main className="overflow-auto flex-1 pt-5 pr-5">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
