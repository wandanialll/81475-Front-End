// TopNav.tsx
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";

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
		<header className="h-16 bg-white border-b flex items-center justify-between px-4">
			<h1 className="text-xl font-semibold">TopNav</h1>
			<div className="flex items-center space-x-4">
				<span className="text-gray-700">{user?.email}</span>
				<button
					onClick={handleLogout}
					className="bg-red-500 text-white px-4 py-2 rounded"
				>
					Logout
				</button>
			</div>
		</header>
	);
}
