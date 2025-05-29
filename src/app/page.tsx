"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, StepForward, Layers, RotateCcw } from "lucide-react";

import NeuralNetworkPanel from '@/components/synapse-view/NeuralNetworkPanel';
import TrainingMetricsPanel from '@/components/synapse-view/TrainingMetricsPanel';
import TrainingDataPanel from '@/components/synapse-view/TrainingDataPanel';
import ModelControlsPanel from '@/components/synapse-view/ModelControlsPanel';

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
  setHiddenLayerCount: (value: number[] | ((prev: number[]) => number[])) => void;
  activationFunction: string;
  setActivationFunction: (value: string | ((prev: string) => string)) => void;
  isRunning: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  trainingMetricsData: MetricPoint[]; // Added this prop
}


const initialMetrics: MetricPoint[] = [{ time: 0, loss: 1.0, accuracy: 0.10 }];

export default function SynapseViewPage() {
  const [epochs, setEpochs] = useState(100);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [learningRate, setLearningRate] = useState([0.01]);
  const [hiddenLayerCount, setHiddenLayerCount] = useState([2]);
  const [activationFunction, setActivationFunction] = useState("relu");
  const [isRunning, setIsRunning] = useState(false);
  const [trainingMetricsData, setTrainingMetricsData] = useState<MetricPoint[]>(initialMetrics);

  const trainingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addMetricPoint = useCallback((epoch: number) => {
    setTrainingMetricsData(prevMetrics => {
      const lastPoint = prevMetrics[prevMetrics.length - 1] || { loss: 1.0, accuracy: 0.1 };
      
      const lossChangeFactor = 0.90 - Math.random() * 0.1; 
      let newLoss = lastPoint.loss * lossChangeFactor;
      
      const accuracyGainFactor = 0.02 + Math.random() * 0.08; 
      let newAccuracy = lastPoint.accuracy + (1 - lastPoint.accuracy) * accuracyGainFactor;

      newLoss *= (1 + (Math.random() - 0.5) * 0.05); 
      newAccuracy *= (1 + (Math.random() - 0.5) * 0.05);
      
      newLoss = parseFloat(Math.max(0.001, newLoss).toFixed(4));
      newAccuracy = parseFloat(Math.min(0.999, Math.max(0, newAccuracy)).toFixed(4));

      return [...prevMetrics, { time: epoch, loss: newLoss, accuracy: newAccuracy }];
    });
  }, []);


  useEffect(() => {
    if (trainingIntervalRef.current) {
      clearInterval(trainingIntervalRef.current);
      trainingIntervalRef.current = null;
    }

    if (isRunning && currentEpoch < epochs) {
      trainingIntervalRef.current = setInterval(() => {
        setCurrentEpoch(prevEpoch => {
          if (prevEpoch >= epochs) {
            setIsRunning(false);
            if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
            return prevEpoch;
          }
          const newEpochValue = prevEpoch + 1;
          addMetricPoint(newEpochValue);
          
          if (newEpochValue >= epochs) {
            setIsRunning(false);
          }
          return newEpochValue;
        });
      }, 500); 
    }

    return () => {
      if (trainingIntervalRef.current) {
        clearInterval(trainingIntervalRef.current);
        trainingIntervalRef.current = null;
      }
    };
  }, [isRunning, epochs, currentEpoch, addMetricPoint]);


  const handlePlay = () => {
    if (currentEpoch >= epochs && epochs > 0) { 
        setCurrentEpoch(0);
        setTrainingMetricsData(initialMetrics);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStep = () => {
    if (currentEpoch < epochs && !isRunning) {
      const newEpochValue = currentEpoch + 1;
      setCurrentEpoch(newEpochValue);
      addMetricPoint(newEpochValue);
      if (newEpochValue >= epochs) {
        setIsRunning(false);
      }
    }
  };
  
  const handleReset = () => {
    if (trainingIntervalRef.current) {
      clearInterval(trainingIntervalRef.current);
      trainingIntervalRef.current = null;
    }
    setIsRunning(false);
    setCurrentEpoch(0);
    setEpochs(100); // Reset epochs to default or chosen initial value
    setLearningRate([0.01]);
    setHiddenLayerCount([2]);
    setActivationFunction("relu");
    setTrainingMetricsData(initialMetrics);
  };

	const handleLayerStep = () => console.log("Layer step clicked");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 flex items-center justify-between p-2 bg-card border-b border-border rounded-b-lg shadow-md w-full h-16">
          <span className="text-lg font-semibold text-foreground px-2 whitespace-nowrap">SynapseView</span>

          <div className="flex flex-col items-center mx-4 flex-grow min-w-0 px-2">
            <Progress value={epochs > 0 ? (currentEpoch / epochs) * 100 : 0} className="w-full max-w-md h-2.5" />
            <span className="text-xs text-muted-foreground mt-1.5">
              Epoch: {currentEpoch} / {epochs}
            </span>
          </div>

          <div className="flex items-center space-x-1 px-2">
            {isRunning ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Pause Training" onClick={handlePause}>
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
                  <Button variant="ghost" size="icon" aria-label="Play Training" onClick={handlePlay}>
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
                <Button variant="ghost" size="icon" aria-label="Step Forward Epoch" onClick={handleStep} disabled={isRunning || currentEpoch >= epochs}>
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
                <Button variant="ghost" size="icon" aria-label="Reset Model" onClick={handleReset}>
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
