import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
	title: string;
	value: string | number;
	icon?: React.ReactNode;
}

export function MetricCard({ title, value, icon }: MetricCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{icon && <div className="text-muted-foreground">{icon}</div>}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
			</CardContent>
		</Card>
	);
}
