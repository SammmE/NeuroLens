import * as CSV from "csv-string";
import { createNeuronNetwork, Model } from "./model";

export class AppState {
	private static instance: AppState;
	private csvData: number[][] = [];
	private inputLayers: number[] = [];
	private outputLayers: number[] = [];
	private hiddenLayers: number[] = [4, 4];
	private learningRate: number = 0.01; // default learning rate
	private activationFunction: string = "relu"; // default activation function
	private total_epochs: number = 100; // default epochs
	private cols: string[][] = []; // column name, input/output
	private model: Model | null = null; // Model instance

	// list of callbacks
	private td_callback: ((csvData: number[][]) => void)[] = [];
	private modelUpdateCallbacks: ((model: Model) => void)[] = [];

	private constructor() {
		this.reloadModel();
	}

	public static getInstance(): AppState {
		if (!AppState.instance) {
			AppState.instance = new AppState();
		}
		return AppState.instance;
	}

	public getModel(): Model | null {
		return this.model;
	}

	public async loadCSV(data: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				let raw_csvData: string[][] = CSV.parse(data);

				// move first row to cols, make first column input, rest output
				if (raw_csvData.length > 0) {
					this.cols = raw_csvData[0].map((col, index) => {
						return [col, index === 0 ? "input" : "output"];
					});
					raw_csvData.shift(); // remove header row
				}

				// convert all data to numbers
				this.csvData = raw_csvData.map((row) =>
					row.map((value) => {
						const num = parseFloat(value);
						return isNaN(num) ? 0 : num; // convert NaN to 0
					}),
				);

				this.td_callback.forEach((callback) => callback(this.csvData));
				this.reloadModel();
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	public getCSVData(): number[][] {
		return this.csvData;
	}

	public isCSVDataLoaded(): boolean {
		return this.csvData.length > 0;
	}

	public registerTDCallback(callback: (csvData: number[][]) => void): void {
		this.td_callback.push(callback);
	}

	public registerModelCallback(callback: (model: Model) => void): void {
		this.modelUpdateCallbacks.push(callback);
	}

	public getCols(): string[][] {
		return this.cols;
	}

	public setCols(cols: string[][]): void {
		this.cols = cols;

		this.reloadModel();
	}

	public reloadModel(): void {
		if (this.isCSVDataLoaded()) {
			// Create a neuron network based on the input and output layers.
			this.inputLayers = [];
			this.outputLayers = [];
			this.cols.forEach((col, index) => {
				if (col[1] === "input") {
					this.inputLayers.push(index);
				} else if (col[1] === "output") {
					this.outputLayers.push(index);
				}
			});
			console.log(this.inputLayers);
			const layers = [
				Array(this.inputLayers.length).fill(0), // Input layer
				...this.hiddenLayers.map((neurons) => Array(neurons).fill(0)), // Hidden layers
				Array(this.outputLayers.length).fill(0), // Output layer
			];

			this.model = new Model(
				layers,
				this.csvData,
				this.total_epochs,
				this.learningRate,
				this.activationFunction,
				this.inputLayers,
				this.outputLayers,
				this.modelUpdateCallbacks,
			);
		}
	}

	public train(): boolean {
		console.log("Training model with current configuration...");
		let res = this.model?.train_tick();
		console.log("Training result:", res);
		return res?.completed ?? false;
	}

	public pauseTraining(): void {
		this.model?.pauseTraining();
	}

	public resumeTraining(): void {
		this.model?.resumeTraining();
	}

	public isTrainingPaused(): boolean {
		return this.model?.isTrainingPaused() ?? false;
	}

	public isTrainingInProgress(): boolean {
		return this.model?.isTrainingInProgress() ?? false;
	}

	public setLearningRate(rate: number): void {
		if (rate > 0 && rate <= 1) {
			this.learningRate = rate;
			this.reloadModel(); // Reload model to apply new learning rate
		} else {
			console.error("Learning rate must be between 0 and 1.");
		}
	}

	public getLearningRate(): number {
		return this.learningRate;
	}

	public setActivationFunction(func: string): void {
		const validFunctions = ["relu", "sigmoid", "tanh"];
		if (validFunctions.includes(func)) {
			this.activationFunction = func;
			this.reloadModel(); // Reload model to apply new activation function
		} else {
			console.error(
				"Invalid activation function. Valid options are: " +
				validFunctions.join(", "),
			);
		}
	}

	public getActivationFunction(): string {
		return this.activationFunction;
	}

	public setTotalEpochs(epochs: number): void {
		if (epochs > 0) {
			this.total_epochs = epochs;
			this.reloadModel(); // Reload model to apply new epochs
		} else {
			console.error("Total epochs must be a positive integer.");
		}
	}

	public getTotalEpochs(): number {
		return this.total_epochs;
	}

	public setHiddenLayerNeurons(neuronCounts: number[]): void {
		this.hiddenLayers = [...neuronCounts]; // Store a copy
		console.log("AppState updated hiddenLayerNeurons:", this.hiddenLayers);
		this.reloadModel(); // Reload model to apply new hidden layer configuration
	}

	public getHiddenLayerNeurons(): number[] {
		return this.hiddenLayers;
	}
}
