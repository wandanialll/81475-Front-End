//import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
// import { useNavigate } from "react-router-dom";

export default function EnrollmentSuccessPage() {
	// const navigate = useNavigate();

	// const handleGoHome = () => {
	// 	navigate("/");
	// };

	return (
		<div className="min-h-screen flex items-center justify-center bg-[url('/src/images/bg_5.jpg')] bg-cover bg-center p-3 md:p-5">
			<Card className="w-full max-w-md md:max-w-lg backdrop-blur-md bg-white/20 border-white/30 shadow-xl">
				<CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
					<div className="text-center space-y-4">
						<div className="flex justify-center">
							<CheckCircle className="h-16 w-16 text-green-500" />
						</div>
						<h1 className="text-xl md:text-2xl font-bold text-white">
							Enrollment Successful!
						</h1>
						<p className="text-sm md:text-base text-gray-200">
							Your enrollment for the FiRASAT system has been completed.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
