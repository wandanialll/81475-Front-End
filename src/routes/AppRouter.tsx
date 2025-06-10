import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import React from "react";

import Login from "@/views/Login/Login";
import Dashboard from "@/views/Dashboard/Dashboard";
import NotFound from "@/views/NotFound/NotFound";
import CreateAttendance from "@/views/CreateAttendance/CreateAttendance";
import Courses from "@/views/Courses/Courses";
import CourseDashboard from "@/views/CourseDashboard/CourseDashboard";
import EnrollmentPage from "@/views/Enrollment/Enrollment";
import StudentPhotos from "@/views/StudentPhotos/StudentPhotos";
import FaceRecognition from "@/views/AttendancePage/AttendancePage";
import Chat from "@/views/Chat/Chat";
import FaceScan from "@/components/special/FaceScan";
import MainLayout from "@/components/layout/MainLayout";
import AttendanceSheet from "@/views/AttendanceSheet/AttendanceSheet";
import StudentDetails from "@/components/special/StudentDetails";

interface PrivateRouteProps {
	children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
	const { isAuthenticated } = useAuthStore();
	return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function AppRouter() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/enrollment" element={<EnrollmentPage />} />
				<Route path="/studentphotos" element={<StudentPhotos />} />
				<Route path="/recognition" element={<FaceRecognition />} />

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
					<Route path="chat" element={<Chat />} />
					<Route path="face-scan" element={<FaceScan />} />
					<Route
						path="course/:courseId/dashboard"
						element={<CourseDashboard />}
					/>
					<Route
						path="course/:courseId/attendance/sheet/:sessionId"
						element={<AttendanceSheet />}
					/>
					<Route
						path="student-details/:studentId"
						element={<StudentDetails />}
					/>
				</Route>

				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}
