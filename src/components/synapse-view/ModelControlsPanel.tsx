"use client";

import React from "react";
import type {
    MetricPoint,
    ModelControlsPanelProps as PageModelControlsPanelProps,
} from "@/app/page"; // Import the props from page
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
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
import { Slider } from "@/components/ui/slider";
import { Play, Pause, StepForward, RotateCcwIcon, Expand } from "lucide-react";
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
import { AppState } from "@/lib/AppState";

// Use the imported props interface
interface ModelControlsPanelProps extends PageModelControlsPanelProps { }

const DEFAULT_NEURONS_PER_LAYER = 4;

const ModelControlsInnerContent = ({
    isRunning,
    isModal = false,
}: ModelControlsPanelProps & { isModal?: boolean }) => {
    const [learningRate, setLearningRate] = React.useState<number[]>([0.01]);
    const [hiddenLayerCount, setHiddenLayerCount] = React.useState<number[]>([2]);
    const [neuronCounts, setNeuronCounts] = React.useState<number[]>(
        Array(2).fill(DEFAULT_NEURONS_PER_LAYER) // Initialize based on default hiddenLayerCount
    );
    const [activationFunction, setActivationFunction] = React.useState<string>("relu");
    const [epochs, setEpochs] = React.useState<number>(1);

    const handleEpochsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "") {
            setEpochs(1); // Or some other default/minimum
            AppState.getInstance().setTotalEpochs(1);
        } else {
            const num = parseInt(value, 4);
            if (!Number.isNaN(num)) {
                const clampedNum = Math.min(Math.max(num, 1), 10000);
                setEpochs(clampedNum);
                AppState.getInstance().setTotalEpochs(clampedNum);
            }
        }
    };

    const handleActivationChange = (value: string) => {
        setActivationFunction(value);
        AppState.getInstance().setActivationFunction(value);
    };

    const handleNeuronCountChange = (index: number, value: string) => {
        // Ensure the value is a valid number and within bounds
        const numValue = parseInt(value, 10);
        if (!Number.isNaN(numValue) && numValue > 0) {
            const newNeuronCounts = [...neuronCounts];
            newNeuronCounts[index] = numValue;
            setNeuronCounts(newNeuronCounts);
            AppState.getInstance().setHiddenLayerNeurons(newNeuronCounts);
        }

    };

    return (
        <div className={`space-y-6 ${isModal ? "pt-2" : ""}`}>
            <div className="space-y-2">
                <Label htmlFor={`learning-rate-${isModal ? "modal" : "card"}`}>
                    Learning Rate: {learningRate[0]}
                </Label>
                <Slider
                    id={`learning-rate-${isModal ? "modal" : "card"}`}
                    min={0.001}
                    max={0.1}
                    step={0.001}
                    value={learningRate}
                    onValueChange={(event) => {
                        setLearningRate([event[0]]);
                        AppState.getInstance().setLearningRate(event[0]);
                    }}
                    disabled={isRunning}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor={`hidden-layers-${isModal ? "modal" : "card"}`}>
                    Number of Hidden Layers: {hiddenLayerCount[0]}
                </Label>
                <Slider
                    id={`hidden-layers-${isModal ? "modal" : "card"}`}
                    min={1}
                    max={5}
                    step={1}
                    value={hiddenLayerCount}
                    onValueChange={(event) => {
                        const newLayerCount = event[0];
                        setHiddenLayerCount([newLayerCount]);
                        // Adjust neuronCounts array based on the newLayerCount
                        const newNeuronCounts = Array(newLayerCount).fill(DEFAULT_NEURONS_PER_LAYER).map((defaultCount, index) => {
                            return neuronCounts[index] !== undefined ? neuronCounts[index] : defaultCount;
                        });
                        setNeuronCounts(newNeuronCounts);
                        AppState.getInstance().setHiddenLayerNeurons(newNeuronCounts);
                    }}
                    disabled={isRunning}
                />
            </div>
            {Array.from({ length: hiddenLayerCount[0] }).map((_, index) => {
                // console.log(`Layer ${index + 1}`); // Keep for debugging if needed
                return (
                    <div key={`layer-${index}-neurons-${isModal}`} className="space-y-2 ml-4 flex items-center">
                        <Label htmlFor={`neurons-layer-${index}-${isModal ? "modal" : "card"}`} className="min-w-[150px] mr-2">
                            Neurons in Layer {index + 1}:
                        </Label>
                        <Input
                            id={`neurons-layer-${index}-${isModal ? "modal" : "card"}`}
                            type="number"
                            value={neuronCounts[index] === undefined ? DEFAULT_NEURONS_PER_LAYER : neuronCounts[index]} // Ensure a value is always present
                            onChange={(e) => handleNeuronCountChange(index, e.target.value)}
                            min="1"
                            className="w-28 h-10" // Increased width
                            disabled={isRunning}
                        />
                    </div>
                );
            })}
            <div className="space-y-2">
                <Label htmlFor={`activation-function-${isModal ? "modal" : "card"}`}>
                    Activation Function
                </Label>
                <Select
                    value={activationFunction}
                    onValueChange={handleActivationChange} // Simplified handler call
                    disabled={isRunning}
                >
                    <SelectTrigger
                        id={`activation-function-${isModal ? "modal" : "card"}`}
                    >
                        <SelectValue placeholder="Select function" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="relu">ReLU</SelectItem>
                        <SelectItem value="sigmoid">Sigmoid</SelectItem>
                        <SelectItem value="tanh">Tanh</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor={`epochs-input-${isModal ? "modal" : "card"}`}>
                    Epochs:
                </Label>
                <div className="flex items-center gap-x-3">
                    <Slider
                        id={`epochs-slider-${isModal ? "modal" : "card"}`}
                        min={1}
                        max={1000} // Slider max kept at 1000 for usability
                        step={1}
                        value={[Math.min(epochs, 1000)]} // Ensure slider value doesn't exceed its own max
                        onValueChange={(valueArray) => {
                            setEpochs(valueArray[0]);
                            AppState.getInstance().setTotalEpochs(valueArray[0]);
                        }}
                        className="flex-1"
                        disabled={isRunning}
                    />
                    <Input
                        id={`epochs-input-${isModal ? "modal" : "card"}`}
                        type="number"
                        value={epochs} // Direct value binding
                        onChange={handleEpochsInputChange}
                        min="1"
                        max="10000"
                        className="w-24 h-10"
                        disabled={isRunning}
                    />
                </div>
            </div>
        </div>
    );
};

export default function ModelControlsPanel(props: ModelControlsPanelProps) {
    return (
        <Dialog>
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Model Controls</CardTitle>
                            <CardDescription>
                                Adjust hyperparameters and control the training process.
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
                    <ModelControlsInnerContent {...props} />
                </CardContent>
            </Card>
            <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Model Controls</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto px-6 pb-6">
                    <ModelControlsInnerContent {...props} isModal={true} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
