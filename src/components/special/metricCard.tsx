import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
	title: string;
	value: string | number;
	icon?: React.ReactNode;
	bgColor?: string;
}

export function MetricCard({ title, value, icon, bgColor }: MetricCardProps) {
	return (
		<Card className={`bg-${bgColor || ""}` + " text-white "}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-bold">{title}</CardTitle>
				{icon && <div className="text-white">{icon}</div>}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
			</CardContent>
		</Card>
	);
}
