
"use client"

import React from 'react';
import type { MetricPoint, ModelControlsPanelProps as PageModelControlsPanelProps } from '@/app/page'; // Import the props from page
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, StepForward, RotateCcwIcon, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


// Use the imported props interface
interface ModelControlsPanelProps extends PageModelControlsPanelProps {}

const ModelControlsInnerContent = ({
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
  trainingMetricsData,
  isModal = false, // Added for potential styling differences in modal
}: ModelControlsPanelProps & { isModal?: boolean }) => {

  const handleEpochsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setEpochs(1); 
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        const clampedNum = Math.min(Math.max(num, 1), 10000);
        setEpochs(clampedNum);
      }
    }
  };

  const handleActivationChange = (value: string) => {
    setActivationFunction(value);
  };

  const currentLoss = trainingMetricsData.find(p => p.time === currentEpoch)?.loss;
  const currentAccuracy = trainingMetricsData.find(p => p.time === currentEpoch)?.accuracy;

  return (
    <div className={`space-y-6 ${isModal ? 'pt-2' : ''}`}> {/* Adjust padding if needed for modal */}
      <div className="space-y-2">
        <Label htmlFor={`learning-rate-${isModal ? 'modal' : 'card'}`}>Learning Rate: {learningRate[0]}</Label>
        <Slider
          id={`learning-rate-${isModal ? 'modal' : 'card'}`}
          min={0.001}
          max={0.1}
          step={0.001}
          value={learningRate}
          onValueChange={setLearningRate}
          disabled={isRunning}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`hidden-layers-${isModal ? 'modal' : 'card'}`}>Number of Hidden Layers: {hiddenLayerCount[0]}</Label>
        <Slider
          id={`hidden-layers-${isModal ? 'modal' : 'card'}`}
          min={1}
          max={5}
          step={1}
          value={hiddenLayerCount}
          onValueChange={setHiddenLayerCount}
          disabled={isRunning}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`activation-function-${isModal ? 'modal' : 'card'}`}>Activation Function</Label>
        <Select value={activationFunction} onValueChange={handleActivationChange} disabled={isRunning}>
          <SelectTrigger id={`activation-function-${isModal ? 'modal' : 'card'}`}>
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
        <Label htmlFor={`epochs-input-${isModal ? 'modal' : 'card'}`}>Epochs: {epochs}</Label>
        <div className="flex items-center gap-x-3">
          <Slider
            id={`epochs-slider-${isModal ? 'modal' : 'card'}`}
            min={1}
            max={1000} 
            step={1}
            value={[Math.min(epochs, 1000)]} 
            onValueChange={(valueArray) => setEpochs(valueArray[0])}
            className="flex-1"
            disabled={isRunning}
          />
          <Input
            id={`epochs-input-${isModal ? 'modal' : 'card'}`}
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
        <Button variant="outline" onClick={onStep} disabled={isRunning || currentEpoch >= epochs} className="md:col-span-1"><StepForward className="mr-2 h-4 w-4" /> Step</Button>
        <Button variant="destructive" onClick={onReset} className="md:col-span-1"><RotateCcwIcon className="mr-2 h-4 w-4" /> Reset</Button>
      </div>

      <div className="mt-6 pt-4 border-t border-border space-y-1 text-sm">
        <p><span className="font-medium text-foreground">Current Epoch:</span> <span className="text-muted-foreground">{currentEpoch} / {epochs}</span></p>
        <p><span className="font-medium text-foreground">Loss:</span> <span className="text-muted-foreground">
          {typeof currentLoss === 'number' ? currentLoss.toFixed(4) : 'N/A'}
        </span></p>
        <p><span className="font-medium text-foreground">Accuracy:</span> <span className="text-muted-foreground">
          {typeof currentAccuracy === 'number' ? (currentAccuracy * 100).toFixed(2) + '%' : 'N/A'}
        </span></p>
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
              <CardDescription>Adjust hyperparameters and control the training process.</CardDescription>
            </div>
            <DialogTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto flex-shrink-0">
                    <Expand className="h-5 w-5" />
                    <span className="sr-only">View Fullscreen</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Fullscreen</p>
                </TooltipContent>
              </Tooltip>
            </DialogTrigger>
          </div>
        </CardHeader>
        <CardContent>
          <ModelControlsInnerContent {...props} />
        </CardContent>
      </Card>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl h-[80vh] flex flex-col p-0"> {/* Adjusted max-width for controls */}
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
