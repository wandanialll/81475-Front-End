// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore"; // Adjust the import path as necessary
import React from "react";

import Login from "@/views/Login/Login";
import Dashboard from "@/views/Dashboard/Dashboard";
import NotFound from "@/views/NotFound/NotFound";
import CreateAttendance from "@/views/CreateAttendance/CreateAttendance";
import Courses from "@/views/Courses/Courses";

import MainLayout from "@/components/layout/MainLayout";

const PrivateRoute = ({ children }: { children: React.JSX.Element }) => {
	const { isAuthenticated } = useAuthStore();
	return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function AppRouter() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />

				<Route
					path="/"
					element={
						<PrivateRoute>
							<MainLayout />
						</PrivateRoute>
					}
				>
					<Route index element={<Dashboard />} />
					<Route path="create-attendance" element={<CreateAttendance />} />
					<Route path="courses" element={<Courses />} />
					{/* Add more nested routes here if needed */}
				</Route>

				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}
