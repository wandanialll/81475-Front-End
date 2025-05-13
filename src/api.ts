import axios from "axios";

// get token from zustand
import { useAuthStore } from "@/store/authStore";
const zutoken = useAuthStore.getState().token; // Get the token from Zustand store
const token = localStorage.getItem("token"); // Get the token from local storage

// declare root url for all api calls
// const rootUrl = "https://railwaytesting-production-f102.up.railway.app/api";
const rootUrl = "http://localhost:5000/";

export const getLecturerCourses = async () => {
	// Check if the token is available
	console.log("Token from local store:", token); // For debugging
	console.log("Token from local_s storage:", localStorage.getItem("token")); // For debugging
	console.log("Token from Zustand store:", zutoken); // For debugging

	const response = await axios.get(`${rootUrl}api/lecturer/courses`, {
		headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	});
	console.log("API response:", response.data);

	console.log("Authorization header:", response.config.headers.Authorization);

	// random console log to check if the token is being sent
	console.log("Token being sent:", response.config.headers.Authorization);

	return response.data;
};

export const getCourseDashboard = async (courseId: string) => {
	const response = await axios.get(
		`${rootUrl}api/course/${courseId}/dashboard`,
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		}
	);
	return response.data;
};

export const createAttendanceSheet = async (courseId: string) => {
	const response = await axios.post(
		`${rootUrl}api/attendance/create-sheet`,
		{
			course_id: parseInt(courseId),
		},
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		}
	);

	// check response
	if (response.status !== 201 && response.status !== 200) {
		throw new Error("Failed to create attendance sheet");
	}
	return response.data;
};

// featch open attendance sheets

export const getOpenAttendanceSheets = async (courseId: string) => {
	const response = await axios.get(
		`${rootUrl}api/course/${courseId}/attendance/open-sheets`,
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		}
	);
	return response.data;
};

// close attendance sheet
export const closeAttendanceSheet = async (sheetId: string) => {
	const response = await axios.post(
		`${rootUrl}api/attendance/close-sheet`,
		{ session_id: sheetId },
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				"Content-Type": "application/json",
			},
		}
	);
	return response.data;
};

// fetch main user dashboard
export const getMainDashboard = async () => {
	const response = await axios.get(`${rootUrl}api/lecturer/dashboard`, {
		headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	});
	return response.data;
};
