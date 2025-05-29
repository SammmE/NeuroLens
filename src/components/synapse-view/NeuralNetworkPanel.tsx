"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { Expand } from "lucide-react";
import { Neuron } from "@/lib/model";
import NeuralNetworkVisualizer from "../NeuralNetworkVisualizer";
import { AppState } from "@/lib/AppState";
import React from "react";


const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center space-x-2">
        <span className={`h-3 w-3 rounded-full ${color}`}></span>
        <span className="text-sm text-muted-foreground">{label}</span>
    </div>
);

// Modified to accept and pass width/height
const NeuralNetworkContent = ({
    isModal = false,
    width,
    height
}: {
    isModal?: boolean;
    width: number;
    height: number;
}) => {
    const [network, setNetwork] = React.useState<Neuron[][]>(AppState.getInstance().getModel()?.getNetwork() || []);

    React.useEffect(() => {
        AppState.getInstance().registerModelCallback((model) => {
            console.log("Model updated, updating network visualization");
            setNetwork(model.getNetwork());
        });
    }, []);

    return (
        <div>
            {
                network.length === 0 ? (
                    <div>Upload some data or use sample data!</div>
                ) : (
                    <NeuralNetworkVisualizer layers={network} width={width} height={height} />
                )
            }
        </div>
    );
};

export default function NeuralNetworkPanel() {
    return (
        <Dialog>
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Neural Network</CardTitle>
                            <CardDescription>
                                Live visualization of the network structure and activations.
                            </CardDescription>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="ml-auto flex-shrink-0"
                                    >
                                        <Expand className="h-5 w-5" />
                                        <span className="sr-only">View Fullscreen</span>
                                    </Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View Fullscreen</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Provide larger width and height for card view */}
                    <NeuralNetworkContent width={1000} height={700} />
                </CardContent>
            </Card>
            <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Neural Network</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto px-6 pb-6">
                    {/* Provide larger width and height for modal view */}
                    <NeuralNetworkContent isModal={true} width={1200} height={800} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
