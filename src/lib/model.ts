export class Neuron {
	bias: number;
	weights: number[];
	inputs: number[] = []; // Inputs that produced the current z and output
	z: number = 0; // Weighted sum + bias (before activation)
	output: number = 0; // Activated output
	delta: number = 0; // Error term for backpropagation

	constructor(bias: number, weights: number[]) {
		this.bias = bias;
		this.weights = weights;
	}

	public setOutput(output: number): void {
		this.output = output;
	}

	public setInputs(inputs: number[]): void {
		this.inputs = inputs;
	}

	public setZ(z: number): void {
		this.z = z;
	}

	public setDelta(delta: number): void {
		this.delta = delta;
	}

	public setWeights(weights: number[]): void {
		if (weights.length !== this.weights.length) {
			throw new Error(
				`Weights length mismatch: expected ${this.weights.length}, got ${weights.length}`,
			);
		}
		this.weights = weights;
	}
}

export type NeuronLayer = Neuron[];
export type NeuronNetwork = NeuronLayer[];

export function createNeuronNetwork(
	layersConfig: number[][], // layersConfig[layerIdx][neuronIdx] = bias value
	numInputFeatures: number,
): NeuronNetwork {
	const network: NeuronNetwork = [];
	for (let layerIndex = 0; layerIndex < layersConfig.length; layerIndex++) {
		const currentLayerNeurons: NeuronLayer = [];
		const numNeuronsInLayer = layersConfig[layerIndex].length;
		const numInputsToThisLayerNeurons =
			layerIndex === 0 ? numInputFeatures : layersConfig[layerIndex - 1].length;

		for (let neuronIndex = 0; neuronIndex < numNeuronsInLayer; neuronIndex++) {
			const bias = layersConfig[layerIndex][neuronIndex];
			const weights = Array.from(
				{ length: numInputsToThisLayerNeurons },
				() => Math.random() * 2 - 1,
			);
			currentLayerNeurons.push(new Neuron(bias, weights));
		}
		network.push(currentLayerNeurons);
	}
	return network;
}

export class Model {
	private network: NeuronNetwork;
	private layers: number[][];
	private callbacks: ((model: Model) => void)[] = [];
	public total_epochs: number = 100;
	public learningRate: number = 0.01;
	public activationFunction: string = "relu";

	private data: number[][];
	private inputLayers: number[];
	private outputLayers: number[];

	private trainingData: Array<{ inputs: number[]; targets: number[] }> = [];
	private numInputFeatures: number = 0;
	private numOutputFeatures: number = 0;

	public loss: number[] = [];
	public accuracy: number[] = [];

	public epochs: number = 0;
	private onLayer: number = 0;
	private layerProgress: number = 0;

	private previousLayerResults: number[] = [];
	private currentLayerOutputsForStep: number[] = [];

	// Training state for layer-by-layer training
	private trainingInProgress: boolean = false;
	private trainingPaused: boolean = false;
	private currentTrainingEpoch: number = 0;
	private currentSampleIndex: number = 0;
	private currentTrainingPhase: "forward" | "backward" = "forward";
	private epochPredictions: number[][] = [];
	private epochTargets: number[][] = [];
	private cumulativeEpochLoss: number = 0;
	private shuffledTrainingData: Array<{ inputs: number[]; targets: number[] }> =
		[];

	constructor(
		layersConfig: number[][],
		rawData: number[][],
		total_epochs: number = 100,
		learningRate: number = 0.01,
		activationFunction: string = "relu",
		inputColumnIndices: number[] = [],
		outputColumnIndices: number[] = [],
		callbacks?: ((model: Model) => void)[],
	) {
		this.layers = layersConfig;
		this.data = rawData;
		this.total_epochs = total_epochs;
		this.learningRate = learningRate;
		this.activationFunction = activationFunction;
		this.inputLayers = inputColumnIndices;
		this.outputLayers = outputColumnIndices;
		this.callbacks = callbacks || [];

		console.log(this.layers);

		if (layersConfig.length === 0) {
			throw new Error("layersConfig cannot be empty for model creation.");
		}
		if (
			inputColumnIndices.length === 0 &&
			rawData.length > 0 &&
			rawData[0]?.length > 0
		) {
			console.warn(
				"inputColumnIndices is empty. Ensure numInputFeatures is correctly derived or network structure is independent of rawData inputs.",
			);
		}

		this.numInputFeatures = inputColumnIndices.length;
		this.numOutputFeatures = layersConfig[layersConfig.length - 1].length;

		if (
			this.numOutputFeatures !== outputColumnIndices.length &&
			outputColumnIndices.length > 0
		) {
			console.warn(
				`Mismatch: Network output size (${this.numOutputFeatures}) and number of target columns (${outputColumnIndices.length}) provided. Ensure this is intended.`,
			);
		}

		this.network = createNeuronNetwork(layersConfig, this.numInputFeatures);

		if (
			rawData &&
			rawData.length > 0 &&
			inputColumnIndices.length > 0 &&
			outputColumnIndices.length > 0
		) {
			this.trainingData = rawData.map((row) => {
				const inputs = inputColumnIndices.map((i) => {
					if (i >= row.length)
						throw new Error(`Input index ${i} out of bounds for data row.`);
					return row[i];
				});
				const targets = outputColumnIndices.map((i) => {
					if (i >= row.length)
						throw new Error(`Output index ${i} out of bounds for data row.`);
					return row[i];
				});

				if (inputs.length !== this.numInputFeatures) {
					throw new Error(
						`Data row processing error: Expected ${this.numInputFeatures} inputs, got ${inputs.length}. Check inputColumnIndices.`,
					);
				}
				if (targets.length !== this.numOutputFeatures) {
					throw new Error(
						`Data row processing error: Expected ${this.numOutputFeatures} targets, got ${targets.length}. Check outputColumnIndices and network's final layer size.`,
					);
				}
				return { inputs, targets };
			});
		} else {
			console.warn(
				"Training data could not be processed. Raw data or column indices might be missing/empty.",
			);
		}

		this.resetStepExecutionState();
		this.notifyCallbacks();
		this.initializeNeuronOutputs();
	}

	private notifyCallbacks(): void {
		this.callbacks.forEach((callback) => callback(this));
	}

	public getLossHistory(): number[] {
		return this.loss;
	}

	public getAccuracyHistory(): number[] {
		return this.accuracy;
	}

	public getEpochsCompleted(): number {
		return this.epochs;
	}

	public reset(): void {
		this.epochs = 0;
		this.loss = [];
		this.accuracy = [];
		this.onLayer = 0;
		this.layerProgress = 0;
		this.resetStepExecutionState();
		this.initializeNeuronOutputs();
		this.notifyCallbacks();
	}

	/**
	 * Pauses the training process
	 */
	public pauseTraining(): void {
		this.trainingPaused = true;
	}

	/**
	 * Resumes the training process
	 */
	public resumeTraining(): void {
		this.trainingPaused = false;
	}

	/**
	 * Checks if training is currently paused
	 */
	public isTrainingPaused(): boolean {
		return this.trainingPaused;
	}

	/**
	 * Checks if training is in progress (not completed)
	 */
	public isTrainingInProgress(): boolean {
		return this.trainingInProgress;
	}

	public getNetwork(): NeuronNetwork {
		return this.network;
	}

	/**
	 * Gets detailed network state including all neuron properties
	 * Useful for visualization and debugging
	 */
	public getDetailedNetworkState(): {
		layerIndex: number;
		neurons: {
			weights: number[];
			bias: number;
			inputs: number[];
			z: number;
			output: number;
			delta: number;
		}[];
	}[] {
		return this.network.map((layer, layerIndex) => ({
			layerIndex,
			neurons: layer.map((neuron) => ({
				weights: [...neuron.weights],
				bias: neuron.bias,
				inputs: [...neuron.inputs],
				z: neuron.z,
				output: neuron.output,
				delta: neuron.delta,
			})),
		}));
	}

	/**
	 * Gets the current training progress information
	 */
	public getTrainingProgress(): {
		trainingInProgress: boolean;
		currentEpoch: number;
		currentSample: number;
		currentLayer: number;
		totalEpochs: number;
		totalSamples: number;
		totalLayers: number;
		phase: "forward" | "backward";
		progressPercentage: number;
	} {
		const totalSamples =
			this.shuffledTrainingData.length || this.trainingData.length;
		const totalSteps =
			this.total_epochs * totalSamples * this.network.length * 2; // forward + backward
		const currentStep =
			this.currentTrainingEpoch * totalSamples * this.network.length * 2 +
			this.currentSampleIndex * this.network.length * 2 +
			(this.currentTrainingPhase === "forward"
				? this.onLayer
				: this.network.length + (this.network.length - 1 - this.onLayer));

		return {
			trainingInProgress: this.trainingInProgress,
			currentEpoch: this.currentTrainingEpoch,
			currentSample: this.currentSampleIndex,
			currentLayer: this.onLayer,
			totalEpochs: this.total_epochs,
			totalSamples,
			totalLayers: this.network.length,
			phase: this.currentTrainingPhase,
			progressPercentage: Math.min(100, (currentStep / totalSteps) * 100),
		};
	}

	private resetStepExecutionState(): void {
		this.trainingInProgress = false;
		this.trainingPaused = false;
		this.currentTrainingEpoch = 0;
		this.currentSampleIndex = 0;
		this.currentTrainingPhase = "forward";
		this.epochPredictions = [];
		this.epochTargets = [];
		this.cumulativeEpochLoss = 0;
		this.shuffledTrainingData = [];
	}

	private initializeNeuronOutputs(): void {
		this.network.forEach((layer) => {
			layer.forEach((neuron) => {
				neuron.setOutput(0);
				neuron.setZ(0);
				neuron.setDelta(0);
				neuron.setInputs([]);
			});
		});
	}

	/**
	 * Applies the activation function to a given value
	 */
	private applyActivation(z: number): number {
		switch (this.activationFunction) {
			case "relu":
				return Math.max(0, z);
			case "sigmoid":
				return 1 / (1 + Math.exp(-z));
			case "tanh":
				return Math.tanh(z);
			case "linear":
				return z;
			default:
				throw new Error(
					`Unsupported activation function: ${this.activationFunction}`,
				);
		}
	}

	/**
	 * Performs a forward pass through a single neuron
	 * @param neuron The neuron to process
	 * @param inputs The input values to the neuron
	 * @returns The activated output of the neuron
	 */
	public singleNeuronPass(neuron: Neuron, inputs: number[]): number {
		if (inputs.length !== neuron.weights.length) {
			throw new Error(
				`Input size mismatch: neuron expects ${neuron.weights.length} inputs, got ${inputs.length}`,
			);
		}

		// Store inputs for later use (e.g., in backpropagation)
		neuron.setInputs([...inputs]);

		// Calculate weighted sum: z = sum(wi * xi) + bias
		let z = neuron.bias;
		for (let i = 0; i < inputs.length; i++) {
			z += neuron.weights[i] * inputs[i];
		}

		// Store z value
		neuron.setZ(z);

		// Apply activation function
		const output = this.applyActivation(z);

		// Store output
		neuron.setOutput(output);

		return output;
	}

	/**
	 * Performs a forward pass through an entire layer
	 * @param layer The layer to process
	 * @param inputs The input values to the layer
	 * @returns Array of outputs from all neurons in the layer
	 */
	public layerPass(layer: NeuronLayer, inputs: number[]): number[] {
		const outputs: number[] = [];

		for (const neuron of layer) {
			const output = this.singleNeuronPass(neuron, inputs);
			outputs.push(output);
		}

		return outputs;
	}

	/**
	 * Performs a forward pass through the entire network
	 * @param inputs The input values to the network
	 * @returns Array of outputs from the final layer
	 */
	public forwardPass(inputs: number[]): number[] {
		if (inputs.length !== this.numInputFeatures) {
			throw new Error(
				`Input size mismatch: network expects ${this.numInputFeatures} inputs, got ${inputs.length}`,
			);
		}

		let currentInputs = inputs;

		// Process each layer sequentially
		for (let i = 0; i < this.network.length; i++) {
			const layer = this.network[i];
			currentInputs = this.layerPass(layer, currentInputs);
		}

		return currentInputs;
	}

	/**
	 * Calculates the derivative of the activation function
	 */
	private activationDerivative(z: number): number {
		switch (this.activationFunction) {
			case "relu":
				return z > 0 ? 1 : 0;
			case "sigmoid": {
				const sigmoid = 1 / (1 + Math.exp(-z));
				return sigmoid * (1 - sigmoid);
			}
			case "tanh": {
				const tanh = Math.tanh(z);
				return 1 - tanh * tanh;
			}
			case "linear":
				return 1;
			default:
				throw new Error(
					`Unsupported activation function: ${this.activationFunction}`,
				);
		}
	}

	/**
	 * Calculates mean squared error loss
	 */
	private calculateLoss(predictions: number[], targets: number[]): number {
		let sum = 0;
		for (let i = 0; i < predictions.length; i++) {
			const diff = predictions[i] - targets[i];
			sum += diff * diff;
		}
		return sum / (2 * predictions.length);
	}

	/**
	 * Calculates accuracy for classification (assumes binary classification with threshold 0.5)
	 */
	private calculateAccuracy(predictions: number[], targets: number[]): number {
		let correct = 0;
		for (let i = 0; i < predictions.length; i++) {
			const predicted = predictions[i] > 0.5 ? 1 : 0;
			const actual = targets[i] > 0.5 ? 1 : 0;
			if (predicted === actual) correct++;
		}
		return correct / predictions.length;
	}

	/**
	 * Shuffles the training data for the current epoch
	 */
	private shuffleTrainingData(): void {
		this.shuffledTrainingData = [...this.trainingData];
		for (let i = this.shuffledTrainingData.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.shuffledTrainingData[i], this.shuffledTrainingData[j]] = [
				this.shuffledTrainingData[j],
				this.shuffledTrainingData[i],
			];
		}
	}

	/**
	 * Training function that progresses layer by layer on each call
	 * Performs forward pass layer by layer, then backpropagation and weight updates
	 * @returns Object containing training state information
	 */
	public train_tick(): {
		completed: boolean;
		paused: boolean;
		currentEpoch: number;
		currentSample: number;
		currentLayer: number;
		phase: "forward" | "backward" | "epoch_complete";
		loss?: number;
		accuracy?: number;
	} {
		// Check if training is paused
		if (this.trainingPaused) {
			return {
				completed: false,
				paused: true,
				currentEpoch: this.currentTrainingEpoch,
				currentSample: this.currentSampleIndex,
				currentLayer: this.onLayer,
				phase: this.currentTrainingPhase,
			};
		}

		// Initialize training if not started
		if (!this.trainingInProgress) {
			if (this.trainingData.length === 0) {
				throw new Error("No training data available");
			}
			this.trainingInProgress = true;
			this.trainingPaused = false;
			this.currentTrainingEpoch = 0;
			this.currentSampleIndex = 0;
			this.currentTrainingPhase = "forward";
			this.onLayer = 0;
			this.epochPredictions = [];
			this.epochTargets = [];
			this.cumulativeEpochLoss = 0;
			this.shuffleTrainingData();
		}

		// Check if training is complete
		if (this.currentTrainingEpoch >= this.total_epochs) {
			this.trainingInProgress = false;
			return {
				completed: true,
				paused: false,
				currentEpoch: this.currentTrainingEpoch,
				currentSample: this.currentSampleIndex,
				currentLayer: this.onLayer,
				phase: "epoch_complete",
			};
		}

		const currentSample = this.shuffledTrainingData[this.currentSampleIndex];

		// Forward pass phase - process layer by layer
		if (this.currentTrainingPhase === "forward") {
			if (this.onLayer === 0) {
				// First layer - use input data
				this.previousLayerResults = currentSample.inputs;
			}

			// Process current layer
			const currentLayer = this.network[this.onLayer];
			this.currentLayerOutputsForStep = this.layerPass(
				currentLayer,
				this.previousLayerResults,
			);

			// Move to next layer
			this.onLayer++;
			this.previousLayerResults = [...this.currentLayerOutputsForStep];

			// Notify callbacks after each layer forward pass
			this.notifyCallbacks();

			// Check if forward pass is complete
			if (this.onLayer >= this.network.length) {
				// Store predictions for epoch-level metrics
				this.epochPredictions.push([...this.currentLayerOutputsForStep]);
				this.epochTargets.push([...currentSample.targets]);

				// Calculate loss for this sample
				const sampleLoss = this.calculateLoss(
					this.currentLayerOutputsForStep,
					currentSample.targets,
				);
				this.cumulativeEpochLoss += sampleLoss;

				// Switch to backward phase
				this.currentTrainingPhase = "backward";
				this.onLayer = this.network.length - 1; // Start from last layer
			}

			return {
				completed: false,
				paused: false,
				currentEpoch: this.currentTrainingEpoch,
				currentSample: this.currentSampleIndex,
				currentLayer: this.onLayer - 1,
				phase: "forward",
			};
		}

		// Backward pass phase - backpropagation layer by layer
		if (this.currentTrainingPhase === "backward") {
			const currentLayer = this.network[this.onLayer];

			if (this.onLayer === this.network.length - 1) {
				// Output layer - calculate deltas using output error
				for (let i = 0; i < currentLayer.length; i++) {
					const neuron = currentLayer[i];
					const error = neuron.output - currentSample.targets[i];
					const derivative = this.activationDerivative(neuron.z);
					neuron.setDelta(error * derivative);
				}
			} else {
				// Hidden layer - calculate deltas using next layer's deltas
				const nextLayer = this.network[this.onLayer + 1];
				for (let i = 0; i < currentLayer.length; i++) {
					const neuron = currentLayer[i];
					let error = 0;

					// Sum weighted deltas from next layer
					for (let j = 0; j < nextLayer.length; j++) {
						error += nextLayer[j].delta * nextLayer[j].weights[i];
					}

					const derivative = this.activationDerivative(neuron.z);
					neuron.setDelta(error * derivative);
				}
			}

			// Update weights and biases for current layer
			for (const neuron of currentLayer) {
				// Store old weights for potential debugging/visualization
				const oldWeights = [...neuron.weights];
				const oldBias = neuron.bias;

				// Update weights using gradient descent
				for (let i = 0; i < neuron.weights.length; i++) {
					neuron.weights[i] -=
						this.learningRate * neuron.delta * neuron.inputs[i];
				}
				// Update bias using gradient descent
				neuron.bias -= this.learningRate * neuron.delta;

				// Ensure weights array is properly updated (force array reference update)
				neuron.setWeights([...neuron.weights]);
			}

			// Move to previous layer
			this.onLayer--;

			// Notify callbacks after each layer update during backpropagation
			this.notifyCallbacks();

			// Check if backward pass is complete
			if (this.onLayer < 0) {
				// Reset neuron outputs for next sample
				this.initializeNeuronOutputs();

				// Move to next sample
				this.currentSampleIndex++;
				this.onLayer = 0;
				this.currentTrainingPhase = "forward";

				// Check if epoch is complete
				if (this.currentSampleIndex >= this.shuffledTrainingData.length) {
					// Calculate epoch metrics
					const epochLoss =
						this.cumulativeEpochLoss / this.shuffledTrainingData.length;

					// Calculate epoch accuracy
					let totalAccuracy = 0;
					for (let i = 0; i < this.epochPredictions.length; i++) {
						totalAccuracy += this.calculateAccuracy(
							this.epochPredictions[i],
							this.epochTargets[i],
						);
					}
					const epochAccuracy = totalAccuracy / this.epochPredictions.length;

					// Store metrics
					this.loss.push(epochLoss);
					this.accuracy.push(epochAccuracy);
					this.epochs++;

					// Reset for next epoch
					this.currentSampleIndex = 0;
					this.currentTrainingEpoch++;
					this.epochPredictions = [];
					this.epochTargets = [];
					this.cumulativeEpochLoss = 0;

					if (this.currentTrainingEpoch < this.total_epochs) {
						this.shuffleTrainingData();
					}

					// Notify callbacks
					this.notifyCallbacks();

					return {
						completed: false,
						paused: false,
						currentEpoch: this.currentTrainingEpoch - 1,
						currentSample: this.currentSampleIndex,
						currentLayer: this.onLayer,
						phase: "epoch_complete",
						loss: epochLoss,
						accuracy: epochAccuracy,
					};
				}
			}

			return {
				completed: false,
				paused: false,
				currentEpoch: this.currentTrainingEpoch,
				currentSample: this.currentSampleIndex,
				currentLayer: this.onLayer + 1,
				phase: "backward",
			};
		}

		// Should not reach here
		throw new Error("Invalid training state");
	}
}
