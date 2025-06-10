// src/views/Login/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// import logo
import logo from "@/images/logo_firasat.png";

export default function Login() {
	const setUser = useAuthStore((state) => state.setUser);
	const setToken = useAuthStore((state) => state.setToken);
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
			const user = userCredential.user;

			//  Get ID token
			const token = await user.getIdToken(true);
			console.log("Token:", token); // For debugging

			setToken(token); // Set token in Zustand store

			// Set token and user globally (Zustand, etc.)
			setUser(user); // already in your code
			localStorage.setItem("token", token); // or use Zustand

			navigate("/");
		} catch (err) {
			setError("Invalid email or password");
		}
	};

	return (
		<div className="flex items-center justify-center h-screen bg-[url('/src/images/bg.jpg')] bg-cover bg-center">
			<Card className="flex flex-row items-center p-5 space-x-5 bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg ">
				<div className="w-max">
					<img src={logo} alt="Logo" className="w-60 h-60 justify-center" />
				</div>
				<div className="flex flex-col items-center w-96 ">
					<h2 className="text-2xl font-bold mb-4">Sign In</h2>
					{error && (
						<p className="text-red-500 text-sm mb-2">
							{error}. Contact your system administrator
						</p>
					)}
					<Input
						type="email"
						placeholder="Email"
						className="mb-3 bg-white/30 backdrop-blur-sm border border-white/40 shadow-sm"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<Input
						type="password"
						placeholder="Password"
						className="mb-4 bg-white/30 backdrop-blur-sm border border-white/40 shadow-sm"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<Button
						variant={"themed"}
						className="w-full shadow-destructive"
						onClick={handleLogin}
					>
						Sign In
					</Button>
				</div>
			</Card>
		</div>
	);
}
