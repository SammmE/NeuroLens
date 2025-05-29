
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, Edit3, Database, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const TrainingDataInnerContent = ({ isModal = false }: { isModal?: boolean }) => {
  // In a real scenario, canvas/plot height might adjust based on isModal
  const placeholderHeight = isModal ? "h-64" : "h-40"; 
  return (
    <>
      <Tabs defaultValue="preset" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4 inline-block" />Upload CSV</TabsTrigger>
          <TabsTrigger value="draw"><Edit3 className="mr-2 h-4 w-4 inline-block" />Draw Data</TabsTrigger>
          <TabsTrigger value="preset"><Database className="mr-2 h-4 w-4 inline-block" />Presets</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <div className="space-y-4">
            <Label htmlFor={`csv-file-${isModal ? 'modal' : 'card'}`}>Upload CSV File</Label>
            <Input id={`csv-file-${isModal ? 'modal' : 'card'}`} type="file" accept=".csv" />
            <Button className="w-full"><UploadCloud className="mr-2 h-4 w-4" />Upload and Visualize</Button>
          </div>
        </TabsContent>
        <TabsContent value="draw">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Draw 2D data points with class colors.</p>
            <div 
              aria-label="Data point drawing area"
              className={`w-full ${placeholderHeight} bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground p-4 border border-dashed border-border`}
            >
              <p>Drawing Canvas Placeholder</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Class 1 (Red)</Button>
              <Button variant="outline" size="sm">Class 2 (Blue)</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="preset">
          <div className="space-y-4">
            <Label htmlFor={`preset-dataset-${isModal ? 'modal' : 'card'}`}>Choose a Preset Dataset</Label>
            <Select defaultValue="spirals">
              <SelectTrigger id={`preset-dataset-${isModal ? 'modal' : 'card'}`}>
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spirals">Spirals</SelectItem>
                <SelectItem value="moons">Moons</SelectItem>
                <SelectItem value="circles">Concentric Circles</SelectItem>
                <SelectItem value="linear">Linearly Separable</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full">Load Dataset</Button>
          </div>
        </TabsContent>
      </Tabs>
      <div className="mt-6">
        <h4 className="text-sm font-medium text-foreground mb-2">Data Preview:</h4>
        <div 
          aria-label="Data distribution preview plot"
          className={`w-full ${placeholderHeight} bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground p-4 border border-dashed border-border`}
        >
          <p>Data Distribution Plot Placeholder</p>
        </div>
      </div>
    </>
  );
};


export default function TrainingDataPanel() {
  return (
    <Dialog>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Training Data</CardTitle>
              <CardDescription>Manage and visualize your input dataset.</CardDescription>
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
          <TrainingDataInnerContent />
        </CardContent>
      </Card>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Training Data</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-6 pb-6">
          <TrainingDataInnerContent isModal={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
