import axios from "axios";

// get token from zustand
import { useAuthStore } from "@/store/authStore";
const zutoken = useAuthStore.getState().token; // Get the token from Zustand store
const token = localStorage.getItem("token"); // Get the token from local storage

export const getLecturerCourses = async () => {
	// Check if the token is available
	console.log("Token from local store:", token); // For debugging
	console.log("Token from local_s storage:", localStorage.getItem("token")); // For debugging
	console.log("Token from Zustand store:", zutoken); // For debugging
	const response = await axios.get(
		"https://railwaytesting-production-f102.up.railway.app/api/lecturer/courses",
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		}
	);
	console.log("API response:", response.data);

	console.log("Authorization header:", response.config.headers.Authorization);

	// random console log to check if the token is being sent
	console.log("Token being sent:", response.config.headers.Authorization);

	return response.data;
};
