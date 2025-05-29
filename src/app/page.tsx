"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, StepForward, Layers, RotateCcw } from "lucide-react";

import NeuralNetworkPanel from "@/components/synapse-view/NeuralNetworkPanel";
import TrainingMetricsPanel from "@/components/synapse-view/TrainingMetricsPanel";
import TrainingDataPanel from "@/components/synapse-view/TrainingDataPanel";
import ModelControlsPanel from "@/components/synapse-view/ModelControlsPanel";
import { AppState } from "@/lib/AppState";

export type MetricPoint = {
    time: number;
    loss: number;
    accuracy: number;
};

// Props for ModelControlsPanel, including trainingMetricsData
export interface ModelControlsPanelProps {
    epochs: number;
    setEpochs: (value: number | ((prev: number) => number)) => void;
    currentEpoch: number;
    learningRate: number[];
    setLearningRate: (value: number[] | ((prev: number[]) => number[])) => void;
    hiddenLayerCount: number[];
    setHiddenLayerCount: (
        value: number[] | ((prev: number[]) => number[]),
    ) => void;
    activationFunction: string;
    setActivationFunction: (value: string | ((prev: string) => string)) => void;
    isRunning: boolean;
    onPlay: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
    trainingMetricsData: MetricPoint[]; // Added this prop
}

const initialMetrics: MetricPoint[] = [{ time: 0, loss: 1.0, accuracy: 0.1 }];

export default function SynapseViewPage() {
    const [epochs, setEpochs] = useState(100);
    const [currentEpoch, setCurrentEpoch] = useState(0);
    const [learningRate, setLearningRate] = useState([0.01]);
    const [hiddenLayerCount, setHiddenLayerCount] = useState([2]);
    const [activationFunction, setActivationFunction] = useState("relu");
    const [isRunning, setIsRunning] = useState(false);
    const [trainingMetricsData, setTrainingMetricsData] =
        useState<MetricPoint[]>(initialMetrics);

    const trainingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Update metrics from the actual model
    const updateMetricsFromModel = useCallback(() => {
        const appState = AppState.getInstance();
        const model = appState.getModel();
        
        if (model) {
            const lossHistory = model.getLossHistory();
            const accuracyHistory = model.getAccuracyHistory();
            const currentEpochs = model.getEpochsCompleted();
            
            // Update current epoch
            setCurrentEpoch(currentEpochs);
            
            // Convert model data to MetricPoint format
            const newMetrics: MetricPoint[] = [];
            for (let i = 0; i < Math.max(lossHistory.length, accuracyHistory.length); i++) {
                newMetrics.push({
                    time: i + 1, // Epochs are 1-indexed for display
                    loss: lossHistory[i] || 0,
                    accuracy: accuracyHistory[i] || 0
                });
            }
            
            // If we have new data, update the metrics
            if (newMetrics.length > 0) {
                setTrainingMetricsData(newMetrics);
            }
        }
    }, []);

    // Register callback to update metrics when model changes
    useEffect(() => {
        const appState = AppState.getInstance();
        
        // Register for model updates
        appState.registerModelCallback(() => {
            updateMetricsFromModel();
        });
        
        // Initial update
        updateMetricsFromModel();
    }, [updateMetricsFromModel]);

    const addMetricPoint = useCallback((epoch: number) => {
        // This function is now deprecated in favor of updateMetricsFromModel
        // but keeping it for compatibility with existing timer-based logic
        updateMetricsFromModel();
    }, [updateMetricsFromModel]);

    useEffect(() => {
        if (trainingIntervalRef.current) {
            clearInterval(trainingIntervalRef.current);
            trainingIntervalRef.current = null;
        }

        if (isRunning) {
            trainingIntervalRef.current = setInterval(() => {
                const appState = AppState.getInstance();
                
                // Check if training is paused
                if (appState.isTrainingPaused()) {
                    return; // Skip this tick if paused
                }
                
                const result = appState.train(); // Use the actual training method
                
                if (result) {
                    // Training completed
                    setIsRunning(false);
                    if (trainingIntervalRef.current) {
                        clearInterval(trainingIntervalRef.current);
                        trainingIntervalRef.current = null;
                    }
                }
                
                // Update metrics after each training step
                updateMetricsFromModel();
            }, 100); // Faster interval for more responsive updates
        }

        return () => {
            if (trainingIntervalRef.current) {
                clearInterval(trainingIntervalRef.current);
                trainingIntervalRef.current = null;
            }
        };
    }, [isRunning, updateMetricsFromModel]);

    const handlePlay = () => {
        const appState = AppState.getInstance();
        appState.resumeTraining();
        setIsRunning(true);
    };

    const handlePause = () => {
        const appState = AppState.getInstance();
        appState.pauseTraining();
        setIsRunning(false);
    };

    const handleStep = () => {
        if (!isRunning) {
            const appState = AppState.getInstance();
            // Ensure training is not paused for single step
            appState.resumeTraining();
            const result = appState.train(); // Single training step
            
            // Update metrics after the step
            updateMetricsFromModel();
            
            if (result) {
                console.log("Training completed!");
            }
            
            // Pause after single step to prevent auto-continue
            appState.pauseTraining();
        }
    };

    const handleReset = () => {
        if (trainingIntervalRef.current) {
            clearInterval(trainingIntervalRef.current);
            trainingIntervalRef.current = null;
        }
        setIsRunning(false);
        
        // Reset the actual model
        const appState = AppState.getInstance();
        const model = appState.getModel();
        if (model) {
            model.reset();
        }
        
        setCurrentEpoch(0);
        setEpochs(100); // Reset epochs to default or chosen initial value
        setLearningRate([0.01]);
        setHiddenLayerCount([2]);
        setActivationFunction("relu");
        setTrainingMetricsData(initialMetrics);
        
        // Update metrics from reset model
        updateMetricsFromModel();
    };

    const handleLayerStep = () => {
        const appState = AppState.getInstance();
        const isFinished = appState.train(); // This calls trainTickLayer
        
        // Update metrics after the layer step
        updateMetricsFromModel();
        
        if (isFinished) {
            console.log("Training completed!");
        }
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background">
                <nav className="sticky top-0 z-50 flex items-center justify-between p-2 bg-card border-b border-border rounded-b-lg shadow-md w-full h-16">
                    <span className="text-lg font-semibold text-foreground px-2 whitespace-nowrap">
                        SynapseView
                    </span>

                    <div className="flex flex-col items-center mx-4 flex-grow min-w-0 px-2">
                        <Progress
                            value={(() => {
                                const appState = AppState.getInstance();
                                const model = appState.getModel();
                                const totalEpochs = model?.total_epochs || epochs;
                                return totalEpochs > 0 ? (currentEpoch / totalEpochs) * 100 : 0;
                            })()}
                            className="w-full max-w-md h-2.5"
                        />
                        <span className="text-xs text-muted-foreground mt-1.5">
                            Epoch: {currentEpoch} / {(() => {
                                const appState = AppState.getInstance();
                                const model = appState.getModel();
                                return model?.total_epochs || epochs;
                            })()}
                        </span>
                    </div>

                    <div className="flex items-center space-x-1 px-2">
                        {isRunning ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Pause Training"
                                        onClick={handlePause}
                                    >
                                        <Pause className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Pause Training</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Play Training"
                                        onClick={handlePlay}
                                    >
                                        <Play className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Play Training</p>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Step Forward Epoch"
                                    onClick={handleStep}
                                    disabled={isRunning || (() => {
                                        const appState = AppState.getInstance();
                                        const model = appState.getModel();
                                        const totalEpochs = model?.total_epochs || epochs;
                                        return currentEpoch >= totalEpochs;
                                    })()}
                                >
                                    <StepForward className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Step Forward (Epoch)</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Step Through Layers"
                                    onClick={handleLayerStep}
                                >
                                    <Layers className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Step Through Layers</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Reset Model"
                                    onClick={handleReset}
                                >
                                    <RotateCcw className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Reset Model</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </nav>

                <main className="px-2 pb-2 md:px-4 md:pb-4 lg:px-6 lg:pb-6 pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <NeuralNetworkPanel />
                        <TrainingMetricsPanel data={trainingMetricsData} />
                        <TrainingDataPanel />
                        <ModelControlsPanel
                            epochs={epochs}
                            setEpochs={setEpochs}
                            currentEpoch={currentEpoch}
                            learningRate={learningRate}
                            setLearningRate={setLearningRate}
                            hiddenLayerCount={hiddenLayerCount}
                            setHiddenLayerCount={setHiddenLayerCount}
                            activationFunction={activationFunction}
                            setActivationFunction={setActivationFunction}
                            isRunning={isRunning}
                            onPlay={handlePlay}
                            onPause={handlePause}
                            onStep={handleStep}
                            onReset={handleReset}
                            trainingMetricsData={trainingMetricsData} // Pass trainingMetricsData
                        />
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}
