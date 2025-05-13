import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
	placeholder?: string;
	onChange?: (value: string) => void;
}

export function SearchBar({
	placeholder = "Search...",
	onChange,
}: SearchBarProps) {
	return (
		<div className="relative">
			<Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				placeholder={placeholder}
				onChange={(e) => onChange?.(e.target.value)}
				className="pl-8"
			/>
		</div>
	);
}
