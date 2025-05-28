import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UploadCloud, Edit3, Database } from "lucide-react";

export default function TrainingDataPanel() {
	return (
		<Card className="shadow-lg">
			<CardHeader>
				<CardTitle>Training Data</CardTitle>
				<CardDescription>
					Manage and visualize your input dataset.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="preset" className="w-full">
					<TabsList className="grid w-full grid-cols-3 mb-4">
						<TabsTrigger value="upload">
							<UploadCloud className="mr-2 h-4 w-4 inline-block" />
							Upload CSV
						</TabsTrigger>
						<TabsTrigger value="draw">
							<Edit3 className="mr-2 h-4 w-4 inline-block" />
							Draw Data
						</TabsTrigger>
						<TabsTrigger value="preset">
							<Database className="mr-2 h-4 w-4 inline-block" />
							Presets
						</TabsTrigger>
					</TabsList>
					<TabsContent value="upload">
						<div className="space-y-4">
							<Label htmlFor="csv-file">Upload CSV File</Label>
							<Input id="csv-file" type="file" accept=".csv" />
							<Button className="w-full">
								<UploadCloud className="mr-2 h-4 w-4" />
								Upload and Visualize
							</Button>
						</div>
					</TabsContent>
					<TabsContent value="draw">
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Draw 2D data points with class colors.
							</p>
							<div
								aria-label="Data point drawing area"
								className="w-full h-40 bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground p-4 border border-dashed border-border"
							>
								<p>Drawing Canvas Placeholder</p>
							</div>
							<div className="flex space-x-2">
								<Button variant="outline" size="sm">
									Class 1 (Red)
								</Button>
								<Button variant="outline" size="sm">
									Class 2 (Blue)
								</Button>
							</div>
						</div>
					</TabsContent>
					<TabsContent value="preset">
						<div className="space-y-4">
							<Label htmlFor="preset-dataset">Choose a Preset Dataset</Label>
							<Select defaultValue="spirals">
								<SelectTrigger id="preset-dataset">
									<SelectValue placeholder="Select dataset" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="spirals">Spirals</SelectItem>
									<SelectItem value="moons">Moons</SelectItem>
									<SelectItem value="circles">Concentric Circles</SelectItem>
									<SelectItem value="linear">Linearly Separable</SelectItem>
								</SelectContent>
							</Select>
							<Button className="w-full">Load Dataset</Button>
						</div>
					</TabsContent>
				</Tabs>
				<div className="mt-6">
					<h4 className="text-sm font-medium text-foreground mb-2">
						Data Preview:
					</h4>
					<div
						aria-label="Data distribution preview plot"
						className="w-full h-40 bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground p-4 border border-dashed border-border"
					>
						<p>Data Distribution Plot Placeholder</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
