
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, StepForward, RotateCcwIcon } from "lucide-react";

interface ModelControlsPanelProps {
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
}

export default function ModelControlsPanel({
  epochs,
  setEpochs,
  currentEpoch,
  learningRate,
  setLearningRate,
  hiddenLayerCount,
  setHiddenLayerCount,
  activationFunction,
  setActivationFunction,
  isRunning,
  onPlay,
  onPause,
  onStep,
  onReset,
}: ModelControlsPanelProps) {

  const handleEpochsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setEpochs(1); // Default to 1 if input is cleared
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        const clampedNum = Math.min(Math.max(num, 1), 10000); // Max epochs via input
        setEpochs(clampedNum);
      }
    }
  };

  const handleActivationChange = (value: string) => {
    setActivationFunction(value);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Model Controls</CardTitle>
        <CardDescription>Adjust hyperparameters and control the training process.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="learning-rate">Learning Rate: {learningRate[0]}</Label>
          <Slider
            id="learning-rate"
            min={0.001}
            max={0.1}
            step={0.001}
            value={learningRate}
            onValueChange={setLearningRate}
            disabled={isRunning}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hidden-layers">Number of Hidden Layers: {hiddenLayerCount[0]}</Label>
          <Slider
            id="hidden-layers"
            min={1}
            max={5}
            step={1}
            value={hiddenLayerCount}
            onValueChange={setHiddenLayerCount}
            disabled={isRunning}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activation-function">Activation Function</Label>
          <Select value={activationFunction} onValueChange={handleActivationChange} disabled={isRunning}>
            <SelectTrigger id="activation-function">
              <SelectValue placeholder="Select function" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relu">ReLU</SelectItem>
              <SelectItem value="sigmoid">Sigmoid</SelectItem>
              <SelectItem value="tanh">Tanh</SelectItem>
              <SelectItem value="leaky_relu">Leaky ReLU</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="epochs-input">Epochs: {epochs}</Label>
          <div className="flex items-center gap-x-3">
            <Slider
              id="epochs-slider"
              min={1}
              max={1000} 
              step={1}
              value={[Math.min(epochs, 1000)]} 
              onValueChange={(valueArray) => setEpochs(valueArray[0])}
              className="flex-1"
              disabled={isRunning}
            />
            <Input
              id="epochs-input"
              type="number"
              value={epochs}
              onChange={handleEpochsInputChange}
              min="1" 
              max="10000" 
              className="w-24 h-10" 
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-4">
          {isRunning ? (
            <Button variant="outline" onClick={onPause} className="md:col-span-1"><Pause className="mr-2 h-4 w-4" /> Pause</Button>
          ) : (
            <Button onClick={onPlay} className="md:col-span-1"><Play className="mr-2 h-4 w-4" /> Play</Button>
          )}
          <Button variant="outline" onClick={onStep} disabled={isRunning} className="md:col-span-1"><StepForward className="mr-2 h-4 w-4" /> Step</Button>
          <Button variant="destructive" onClick={onReset} className="md:col-span-1"><RotateCcwIcon className="mr-2 h-4 w-4" /> Reset</Button>
        </div>

        <div className="mt-6 pt-4 border-t border-border space-y-1 text-sm">
          <p><span className="font-medium text-foreground">Current Epoch:</span> <span className="text-muted-foreground">{currentEpoch} / {epochs}</span></p>
          <p><span className="font-medium text-foreground">Loss:</span> <span className="text-muted-foreground">
            {currentEpoch > 0 && trainingMetricsData && trainingMetricsData.length > 1 ? 
             (trainingMetricsData.find(p => p.time === currentEpoch)?.loss.toFixed(4) ?? 'N/A') : 'N/A'}
          </span></p>
          <p><span className="font-medium text-foreground">Accuracy:</span> <span className="text-muted-foreground">
            {currentEpoch > 0 && trainingMetricsData && trainingMetricsData.length > 1 ? 
             ((trainingMetricsData.find(p => p.time === currentEpoch)?.accuracy ?? 0) * 100).toFixed(2) + '%' : 'N/A'}
          </span></p>
        </div>
      </CardContent>
    </Card>
  );
}
