// TopNav.tsx
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Button } from "../ui/button";
import { SearchContainer } from "../special/SearchContainer";

export default function TopNav() {
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const handleLogout = async () => {
		try {
			localStorage.removeItem("token"); // Remove token from local storage
			// clear zustand state

			await signOut(auth);
			logout();
		} catch (error) {
			console.error("Error signing out: ", error);
		}
	};

	return (
		<header className="h-14 flex items-center justify-between px-4 shadow-2xs">
			{/* Left side with search and border */}
			<div className="w-1/3 ">
				<SearchContainer />
			</div>

			{/* Right side with user info and logout button */}
			<div className="flex items-center space-x-4">
				<span className="text-gray-700">{user?.email}</span>
				<Button variant="destructive" onClick={handleLogout}>
					Logout
				</Button>
			</div>
		</header>
	);
}
