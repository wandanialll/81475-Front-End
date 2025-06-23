import axios from "axios";

// get token from zustand
import { useAuthStore } from "@/store/authStore";
const zutoken = useAuthStore.getState().token; // Get the token from Zustand store
const token = localStorage.getItem("token"); // Get the token from local storage

// declare root url for all api calls
//const rootUrl = "https://railwaytesting-production-f102.up.railway.app/";
//const rootUrl = "http://localhost:5000/";
//const rootUrl = "http://152.42.239.54/";
const rootUrl = "https://api.wandanial.com/";

//chrome takle bukak camera

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

// fetch attendance sheet by session id
export const getAttendanceSheetBySessionId = async (sessionId: string) => {
	const response = await axios.get(
		`${rootUrl}api/attendance/sheet/${sessionId}`,
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
	console.log("Close sheet response:", response.data);
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

// search

export const search = async (query: string) => {
	const response = await axios.get(`${rootUrl}api/search?q=${query}`, {
		headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	});
	return response.data;
};

// enrollment

export const enroll = async (
	name: string,
	studentId: string,
	photos: File[]
) => {
	const formData = new FormData();
	formData.append("name", name);
	formData.append("student_id", studentId);

	photos.forEach((photo, index) => {
		if (photo) {
			formData.append("photo", photo, `${name}_${index + 1}.jpg`);
		}
	});

	const response = await axios.post(`${rootUrl}api/enroll`, formData, {
		headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`,
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data;
};

// overall lecturer attendance
export const getLecturerAttendancePerformance = async () => {
	const response = await axios.get(
		`${rootUrl}api/lecturer/attendance/overall-sessions`,
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		}
	);
	return response.data;
};

// fetch attendance performance by course
export const getCourseAttendancePerformance = async (courseId: string) => {
	const response = await axios.get(
		`${rootUrl}api/course/${courseId}/attendance/details`,
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		}
	);
	return response.data;
};

export const generateEmbedding = async (studentId: string) => {
	const response = await axios.post(
		`${rootUrl}api/embedding/generate`,
		{ student_id: studentId },
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				"Content-Type": "application/json",
			},
		}
	);
	return response.data;
};

// fetch facial recognition attendance
export const fetchFacialRecognitionAttendance = async (
	sessionId: string,
	imageBase64: string,
	reset: boolean = false
) => {
	const payload: any = {
		session_id: sessionId,
	};

	if (reset) {
		payload.reset = true;
	} else if (imageBase64) {
		payload.image = imageBase64;
	} else {
		throw new Error("No image provided");
	}
	const response = await axios.post(
		`${rootUrl}api/attendance/mark-by-face`,
		payload,
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				"Content-Type": "application/json",
			},
		}
	);
	return response.data;
};

export const fetchFocusIndex = async (
	sessionId: string,
	imageBase64: string,
	reset: boolean = false
) => {
	const payload: any = {
		session_id: sessionId,
	};

	if (reset) {
		payload.reset = true;
	} else if (imageBase64) {
		payload.image = imageBase64;
	} else {
		throw new Error("No image provided");
	}
	const response = await axios.post(
		`${rootUrl}api/attendance/calculate-focus-index`,
		payload,
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				"Content-Type": "application/json",
			},
		}
	);
	return response.data;
};

// student details
export const getStudentDetails = async (studentId: string) => {
	const response = await axios.get(
		`${rootUrl}api/student-details/${studentId}`,
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				// "Content-Type": "application/json",
			},
		}
	);
	return response.data;
};

export const getChatResponse = async (userMessage: string, history: any[]) => {
	try {
		const response = await axios.post(
			`${rootUrl}api/chat`,
			{
				message: userMessage,
				history: history.slice(-10),
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			}
		);
		console.log("API Response:", response.data);

		// ✅ Return full response data, not just the message
		return response.data;
	} catch (err) {
		console.error("API call failed:", err);
		throw err;
	}
};

export const getLecturerCoursesWithFocusIndex = async () => {
	const response = await axios.get(
		`${rootUrl}api/lecturer/courses/focus-index`,
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		}
	);
	return response.data;
};
