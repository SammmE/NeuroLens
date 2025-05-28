
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, StepForward, RotateCcwIcon } from "lucide-react";

export default function ModelControlsPanel() {
  const [learningRate, setLearningRate] = useState([0.01]);
  const [hiddenLayerCount, setHiddenLayerCount] = useState([2]); // Default to 2 layers
  const [epochs, setEpochs] = useState(100);

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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activation-function">Activation Function</Label>
          <Select defaultValue="relu">
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
          <Label htmlFor="epochs">Epochs</Label>
          <Input 
            id="epochs" 
            type="number" 
            value={epochs} 
            onChange={(e) => setEpochs(parseInt(e.target.value, 10))} 
            min="1"
            max="10000"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4">
          <Button><Play className="mr-2 h-4 w-4" /> Play</Button>
          <Button variant="outline"><Pause className="mr-2 h-4 w-4" /> Pause</Button>
          <Button variant="outline"><StepForward className="mr-2 h-4 w-4" /> Step</Button>
          <Button variant="destructive"><RotateCcwIcon className="mr-2 h-4 w-4" /> Reset</Button>
        </div>

        <div className="mt-6 pt-4 border-t border-border space-y-1 text-sm">
          <p><span className="font-medium text-foreground">Current Epoch:</span> <span className="text-muted-foreground">0 / {epochs}</span></p>
          <p><span className="font-medium text-foreground">Loss:</span> <span className="text-muted-foreground">0.0000</span></p>
          <p><span className="font-medium text-foreground">Accuracy:</span> <span className="text-muted-foreground">0.00%</span></p>
        </div>
      </CardContent>
    </Card>
  );
}
