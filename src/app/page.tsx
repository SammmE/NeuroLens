
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Play, Pause, StepForward, Layers, RotateCcw } from "lucide-react";

import NeuralNetworkPanel from '@/components/synapse-view/NeuralNetworkPanel';
import TrainingMetricsPanel from '@/components/synapse-view/TrainingMetricsPanel';
import TrainingDataPanel from '@/components/synapse-view/TrainingDataPanel';
import ModelControlsPanel from '@/components/synapse-view/ModelControlsPanel';

export default function SynapseViewPage() {
  return (
    <TooltipProvider>
      <main className="min-h-screen p-4 md:p-6 lg:p-8 bg-background">
        <div className="w-full flex justify-center mb-8">
          <nav className="flex items-center justify-around p-2 space-x-1 bg-card border border-border rounded-lg shadow-md w-auto max-w-xs sm:max-w-sm">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Play Training">
                  <Play className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Play Training</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Pause Training">
                  <Pause className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pause Training</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Step Forward Epoch">
                  <StepForward className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Step Forward (Epoch)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Step Through Layers">
                  <Layers className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Step Through Layers</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Reset Model">
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset Model</p>
              </TooltipContent>
            </Tooltip>
          </nav>
        </div>

        {/* The original header is removed as requested */}
        {/* We keep the descriptive text that was below the old h1, now it serves as a sub-header for the whole app */}
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-primary">SynapseView</h1>
            <p className="text-lg text-muted-foreground">
            An educational tool to visually understand how neural networks learn.
            </p>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeuralNetworkPanel />
          <TrainingMetricsPanel />
          <TrainingDataPanel />
          <ModelControlsPanel />
        </div>
      </main>
    </TooltipProvider>
  );
}
