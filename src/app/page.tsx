
"use client";

import React, { useState } from 'react';
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

export default function SynapseViewPage() {
  const [epochs, setEpochs] = useState(100);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [learningRate, setLearningRate] = useState([0.01]);
  const [hiddenLayerCount, setHiddenLayerCount] = useState([2]);
  const [activationFunction, setActivationFunction] = useState("relu");

  // Placeholder functions for training controls - to be implemented
  const handlePlay = () => {
    console.log("Play clicked");
    // Example: Simulate epoch progression
    if (currentEpoch < epochs) {
      setCurrentEpoch(prev => prev + 1);
    }
  };
  const handlePause = () => console.log("Pause clicked");
  const handleStep = () => {
    console.log("Step clicked");
     if (currentEpoch < epochs) {
      setCurrentEpoch(prev => prev + 1);
    }
  };
  const handleReset = () => {
    console.log("Reset clicked");
    setCurrentEpoch(0);
  };
  const handleLayerStep = () => console.log("Layer step clicked");


  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 flex items-center justify-between p-2 bg-card border-b border-border rounded-b-lg shadow-md w-full h-16">
          {/* Left: Title */}
          <span className="text-lg font-semibold text-foreground px-2 whitespace-nowrap">SynapseView</span>

          {/* Center: Progress and Epoch Count */}
          <div className="flex flex-col items-center mx-4 flex-grow min-w-0 px-2">
            <Progress value={epochs > 0 ? (currentEpoch / epochs) * 100 : 0} className="w-full max-w-md h-2.5" />
            <span className="text-xs text-muted-foreground mt-1.5">
              Epoch: {currentEpoch} / {epochs}
            </span>
          </div>

          {/* Right: Control Buttons */}
          <div className="flex items-center space-x-1 px-2">
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Step Forward Epoch" onClick={handleStep}>
                  <StepForward className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Step Forward (Epoch)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Step Through Layers" onClick={handleLayerStep}>
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
  
        <main className="p-4 md:p-6 lg:p-8 pt-[calc(theme(spacing.4)_+_64px)] md:pt-[calc(theme(spacing.6)_+_64px)] lg:pt-[calc(theme(spacing.8)_+_64px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NeuralNetworkPanel />
            <TrainingMetricsPanel />
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
              onPlay={handlePlay}
              onPause={handlePause}
              onStep={handleStep}
              onReset={handleReset}
            />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
