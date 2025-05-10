// src/views/Login/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
	const setUser = useAuthStore((state) => state.setUser);
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleLogin = async () => {
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			setUser(userCredential.user);
			navigate("/");
		} catch (err) {
			setError("Invalid email or password");
		}
	};

	return (
		<div className="flex items-center justify-center h-screen bg-black">
			<div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
				<h2 className="text-2xl font-bold mb-4">Sign In</h2>
				{error && (
					<p className="text-red-500 text-sm mb-2">
						{error}. Contact your system administrator
					</p>
				)}
				<Input
					type="email"
					placeholder="Email"
					className="mb-3"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<Input
					type="password"
					placeholder="Password"
					className="mb-4"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<Button className="w-full" onClick={handleLogin}>
					Sign In
				</Button>
			</div>
		</div>
	);
}
