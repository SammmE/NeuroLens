import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center space-x-2">
        <span className={`h-3 w-3 rounded-full ${color}`}></span>
        <span className="text-sm text-muted-foreground">{label}</span>
    </div>
);

export default function NeuralNetworkPanel() {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Neural Network</CardTitle>
                <CardDescription>
                    Live visualization of the network structure and activations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className="w-full h-64 md:h-80 bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground p-4 border border-dashed border-border"
                >
                    <p>Neural Network Graph Placeholder</p>
                </div>
                <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-foreground mb-1">Legend:</h4>
                    <LegendItem color="bg-blue-500" label="Input Layer" />
                    <LegendItem color="bg-green-500" label="Hidden Layer(s)" />
                    <LegendItem color="bg-red-500" label="Output Layer" />
                </div>
            </CardContent>
        </Card>
    );
}
