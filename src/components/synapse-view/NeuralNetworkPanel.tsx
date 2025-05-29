
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Expand } from "lucide-react";

const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center space-x-2">
        <span className={`h-3 w-3 rounded-full ${color}`}></span>
        <span className="text-sm text-muted-foreground">{label}</span>
    </div>
);

const NeuralNetworkContent = ({ isModal = false }: { isModal?: boolean }) => {
  const heightClass = isModal ? "h-full" : "h-64 md:h-80";
  return (
    <>
      <div 
        aria-label="Neural network visualization area"
        className={`w-full ${heightClass} bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground p-4 border border-dashed border-border`}
      >
        <p>Neural Network Graph Placeholder</p>
      </div>
      <div className={`mt-4 space-y-2 ${isModal ? 'p-4' : ''}`}>
        <h4 className="text-sm font-medium text-foreground mb-1">Legend:</h4>
        <LegendItem color="bg-blue-500" label="Input Layer" />
        <LegendItem color="bg-green-500" label="Hidden Layer(s)" />
        <LegendItem color="bg-red-500" label="Output Layer" />
      </div>
    </>
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
              <CardDescription>Live visualization of the network structure and activations.</CardDescription>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto flex-shrink-0">
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
          <NeuralNetworkContent />
        </CardContent>
      </Card>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Neural Network</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-6 pb-6">
          <NeuralNetworkContent isModal={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
