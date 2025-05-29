"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { UploadCloud, Database, Expand } from "lucide-react";
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
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const TrainingDataInnerContent = ({
    isModal = false,
}: {
    isModal?: boolean;
}) => {
    const [csvData, setCsvData] = React.useState<number[][]>(AppState.getInstance().getCSVData());
    const [file, setFile] = React.useState<File | null>(null);
    const [cols, setCols] = React.useState<string[][]>(AppState.getInstance().getCols());
    const [columnIO, setColumnIO] = React.useState<boolean[]>([]);

    React.useEffect(() => {
        if (cols.length > 0 && cols[0]) {
            const initialIO = cols[0].map((_, index) => index === 0);
            setColumnIO(initialIO);
        } else {
            setColumnIO([]);
        }
    }, [cols]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleCSV = async () => {
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const csvContent = event.target?.result as string;
                try {
                    await AppState.getInstance().loadCSV(csvContent);
                } catch (error) {
                    console.error("Error loading CSV:", error);
                }
            };
            reader.readAsText(file);
        }
    };

    React.useEffect(() => {
        AppState.getInstance().registerTDCallback((_csvData) => {
            setCsvData(_csvData);
            const newCols = AppState.getInstance().getCols();
            setCols(newCols);
            if (newCols.length > 0 && newCols[0]) {
                const initialIO = newCols[0].map((_, index) => index === 0);
                setColumnIO(initialIO);
            } else {
                setColumnIO([]);
            }
        });
    }, []);


    const handleColumnIOCheckboxChange = (index: number) => {
        setColumnIO(prevIO => {
            const newIO = [...prevIO];
            newIO[index] = !newIO[index];
            console.log("New Column I/O config:", newIO);
            return newIO;
        });
    };

    const placeholderHeight = isModal ? "h-64" : "h-40";
    return (
        <>
            <Tabs defaultValue="preset" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upload">
                        <UploadCloud className="mr-2 h-4 w-4 inline-block" />
                        Upload CSV
                    </TabsTrigger>
                    <TabsTrigger value="preset">
                        <Database className="mr-2 h-4 w-4 inline-block" />
                        Presets
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                    <div className="space-y-4">
                        <Label htmlFor={`csv-file-${isModal ? "modal" : "card"}`}>
                            Upload CSV File
                        </Label>
                        <Input
                            id={`csv-file-${isModal ? "modal" : "card"}`}
                            onChange={handleFileChange}
                            type="file"
                            accept=".csv"
                        />
                        <Button onClick={handleCSV} className="w-full">
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Upload and Visualize
                        </Button>
                    </div>
                </TabsContent>
                <TabsContent value="preset">
                    <div className="space-y-4">
                        <Label htmlFor={`preset-dataset-${isModal ? "modal" : "card"}`}>
                            Choose a Preset Dataset
                        </Label>
                        <Select defaultValue="spirals" onValueChange={(value) => {
                            console.log("Loading dataset:", value);
                            if (value === "dailytemp") {
                                AppState.getInstance().loadCSV("Date,Temp\\n2023-01-01,10\\n2023-01-02,12\\n2023-01-03,11");
                            } else {
                                AppState.getInstance().loadCSV(``);
                            }
                        }}>
                            <SelectTrigger
                                id={`preset-dataset-${isModal ? "modal" : "card"}`}
                            >
                                <SelectValue placeholder="Select dataset" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dailytemp">Minimum Daily Temperatures Dataset</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>
            </Tabs>
            <div className="mt-6">
                <h4 className="text-sm font-medium text-foreground mb-2">
                    Data Preview:
                </h4>
                {csvData.length > 0 && csvData[0] ? (
                    <div>
                        {cols.length > 0 && cols[0] && (
                            <div className="mb-4 p-4 border rounded-md">
                                <h5 className="text-xs font-medium text-muted-foreground mb-2">Configure Input/Output Columns:</h5>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
                                    {cols[0].map((colName, index) => (
                                        <div key={colName} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`col-io-${index}-${isModal ? "modal" : "card"}`}
                                                checked={columnIO[index] === undefined ? false : columnIO[index]}
                                                onCheckedChange={() => handleColumnIOCheckboxChange(index)}
                                            />
                                            <Label
                                                htmlFor={`col-io-${index}-${isModal ? "modal" : "card"}`}
                                                className="text-sm font-normal cursor-pointer"
                                                title={colName}
                                            >
                                                {colName.length > 15 ? colName.substring(0, 12) + "..." : colName} ({columnIO[index] ? "Input" : "Output"})
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Checked = Input, Unchecked = Output (Target)</p>
                            </div>
                        )}
                        {csvData[0].length >= 2 ? (
                            <ChartContainer
                                config={{
                                    y: {
                                        label: "Y-Value",
                                        color: "hsl(var(--chart-1))",
                                    },
                                    x: {
                                        label: "X-Value",
                                        color: "hsl(var(--chart-2))",
                                    }
                                }}
                                className="h-[200px] w-full"
                            >
                                <LineChart
                                    data={(() => {
                                        const inputIndex = columnIO.findIndex(isInput => isInput);
                                        const outputIndex = columnIO.findIndex(isInput => !isInput);
                                        if (inputIndex !== -1 && outputIndex !== -1) {
                                            return csvData.slice(1).map(row => ({
                                                x: row[inputIndex],
                                                y: row[outputIndex]
                                            }));
                                        }
                                        return csvData.slice(1).map(row => ({ x: row[0], y: row[1] }));
                                    })()}
                                    margin={{
                                        left: 12,
                                        right: 12,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="x"
                                        type="number"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis dataKey="y" type="number" tickLine={false} axisLine={false} tickMargin={8} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Line dataKey="y" type="monotone" stroke="var(--color-y)" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ChartContainer>
                        ) : (
                            <div
                                className={`w-full ${placeholderHeight} bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground p-4 border border-dashed border-border`}
                            >
                                <p>Data has {csvData[0].length} column(s). Preview chart requires at least 2 columns (one Input, one Output).</p>
                            </div>
                        )}
                    </div>
                ) : (<div
                    className={`w-full ${placeholderHeight} bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground p-4 border border-dashed border-border`}
                >
                    <p>No data yet</p>
                </div>)}

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
                            <CardDescription>
                                Manage and visualize your input dataset.
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
