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

        console.log(this.layers)

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
	}

	private notifyCallbacks(): void {
		this.callbacks.forEach((callback) => callback(this));
	}

	private resetStepExecutionState(): void {
		this.onLayer = 0;
		this.layerProgress = 0;
		this.currentLayerOutputsForStep = [];
		this.previousLayerResults = [];

		if (
			this.trainingData.length > 0 &&
			this.trainingData[0].inputs.length > 0
		) {
			this.previousLayerResults = [...this.trainingData[0].inputs];
		} else if (this.numInputFeatures > 0) {
			this.previousLayerResults = Array(this.numInputFeatures).fill(0);
		}
	}

	public getNetwork(): NeuronNetwork {
		return this.network;
	}

	public reset(): void {
		if (!this.layers || this.numInputFeatures === undefined) {
			console.error(
				"Cannot reset model: initial configuration (layers, numInputFeatures) not available.",
			);
			return;
		}
		this.network = createNeuronNetwork(this.layers, this.numInputFeatures);
		this.epochs = 0;
		this.loss = [];
		this.accuracy = [];
		this.resetStepExecutionState();
		this.notifyCallbacks();
	}

	private applyActivation(value: number): number {
		switch (this.activationFunction) {
			case "sigmoid":
				return 1 / (1 + Math.exp(-value));
			case "relu":
				return Math.max(0, value);
			case "tanh":
				return Math.tanh(value);
			case "linear":
				return value;
			default:
				console.warn(
					`Unknown activation function: ${this.activationFunction}. Defaulting to linear.`,
				);
				return value;
		}
	}

	private applyActivationDerivative(outputValue: number): number {
		switch (this.activationFunction) {
			case "sigmoid":
				return outputValue * (1 - outputValue);
			case "relu":
				return outputValue > 0 ? 1 : 0;
			case "tanh":
				return 1 - Math.pow(outputValue, 2);
			case "linear":
				return 1;
			default:
				return 1;
		}
	}

	public forwardPass(inputSample: number[]): number[] {
		if (inputSample.length !== this.numInputFeatures) {
			throw new Error(
				`Input sample size ${inputSample.length} does not match model's expected input features ${this.numInputFeatures}`,
			);
		}

		let currentLayerInputs = [...inputSample];

		for (const layer of this.network) {
			const currentLayerOutputs: number[] = [];
			for (const neuron of layer) {
				neuron.inputs = [...currentLayerInputs];

				let z = neuron.bias;
				for (let i = 0; i < neuron.weights.length; i++) {
					z += neuron.weights[i] * currentLayerInputs[i];
				}
				neuron.z = z;
				neuron.output = this.applyActivation(neuron.z);
				currentLayerOutputs.push(neuron.output);
			}
			currentLayerInputs = currentLayerOutputs;
		}
		return currentLayerInputs;
	}

	public backwardPass(targetOutputs: number[]): void {
		if (targetOutputs.length !== this.numOutputFeatures) {
			throw new Error(
				`Target outputs size ${targetOutputs.length} does not match model's output features ${this.numOutputFeatures}`,
			);
		}

		const outputLayer = this.network[this.network.length - 1];
		for (let j = 0; j < outputLayer.length; j++) {
			const neuron = outputLayer[j];
			const error = targetOutputs[j] - neuron.output;
			neuron.delta = error * this.applyActivationDerivative(neuron.output);
		}

		for (let layerIdx = this.network.length - 2; layerIdx >= 0; layerIdx--) {
			const currentHiddenLayer = this.network[layerIdx];
			const nextLayer = this.network[layerIdx + 1];
			for (let i = 0; i < currentHiddenLayer.length; i++) {
				const neuron = currentHiddenLayer[i];
				let sumOfWeightedDeltas = 0;
				for (const nextLayerNeuron of nextLayer) {
					sumOfWeightedDeltas +=
						nextLayerNeuron.weights[i] * nextLayerNeuron.delta;
				}
				neuron.delta =
					sumOfWeightedDeltas * this.applyActivationDerivative(neuron.output);
			}
		}

		for (let layerIdx = 0; layerIdx < this.network.length; layerIdx++) {
			const currentLayer = this.network[layerIdx];
			for (const neuron of currentLayer) {
				for (let k = 0; k < neuron.weights.length; k++) {
					neuron.weights[k] +=
						this.learningRate * neuron.delta * neuron.inputs[k];
				}
				neuron.bias += this.learningRate * neuron.delta;
			}
		}
	}

	public calculateLoss(predicted: number[], actual: number[]): number {
		if (predicted.length !== actual.length) {
			console.error(
				"Predicted and actual arrays must have the same length for loss calculation.",
			);
			return Infinity;
		}
		if (predicted.length === 0) return 0;
		const sumSquaredError = predicted.reduce(
			(sum, p, i) => sum + Math.pow(p - actual[i], 2),
			0,
		);
		return sumSquaredError / predicted.length;
	}

	public calculateEpochAccuracy(
		allPredictedOutputs: number[][],
		allActualTargets: number[][],
	): number {
		if (
			allPredictedOutputs.length === 0 ||
			allPredictedOutputs.length !== allActualTargets.length
		) {
			return 0;
		}
		let correctSamples = 0;
		const tolerance = 0.1;

		for (let i = 0; i < allPredictedOutputs.length; i++) {
			const predictedSample = allPredictedOutputs[i];
			const actualSample = allActualTargets[i];
			if (predictedSample.length !== actualSample.length) continue;

			let isSampleCorrect = true;
			for (let j = 0; j < predictedSample.length; j++) {
				if (Math.abs(predictedSample[j] - actualSample[j]) > tolerance) {
					isSampleCorrect = false;
					break;
				}
			}
			if (isSampleCorrect) {
				correctSamples++;
			}
		}
		return correctSamples / allPredictedOutputs.length;
	}

	public async trainEpoch(): Promise<{
		epochLoss: number;
		epochAccuracy: number;
	}> {
		if (this.trainingData.length === 0) {
			console.warn("No training data available. Skipping epoch.");
			return { epochLoss: 0, epochAccuracy: 0 };
		}

		let cumulativeEpochLoss = 0;
		const epochPredictions: number[][] = [];
		const epochTargets: number[][] = [];

		const shuffledTrainingData = [...this.trainingData].sort(
			() => Math.random() - 0.5,
		);

		for (const sample of shuffledTrainingData) {
			const predictedOutputs = this.forwardPass(sample.inputs);
			this.backwardPass(sample.targets);

			cumulativeEpochLoss += this.calculateLoss(
				predictedOutputs,
				sample.targets,
			);
			epochPredictions.push(predictedOutputs);
			epochTargets.push(sample.targets);
		}

		const averageEpochLoss = cumulativeEpochLoss / this.trainingData.length;
		const epochAccuracy = this.calculateEpochAccuracy(
			epochPredictions,
			epochTargets,
		);

		return { epochLoss: averageEpochLoss, epochAccuracy };
	}

	public async train(
		onEpochComplete?: (epoch: number, loss: number, accuracy: number) => void,
	): Promise<void> {
		console.log(`Starting training for ${this.total_epochs} epochs.`);
		this.loss = [];
		this.accuracy = [];
		this.epochs = 0;

		for (let i = 0; i < this.total_epochs; i++) {
			const { epochLoss, epochAccuracy } = await this.trainEpoch();

			this.epochs++;
			this.loss.push(epochLoss);
			this.accuracy.push(epochAccuracy);

			console.log(
				`Epoch ${this.epochs}/${this.total_epochs} - Loss: ${epochLoss.toFixed(4)}, Accuracy: ${epochAccuracy.toFixed(4)}`,
			);

			if (onEpochComplete) {
				onEpochComplete(this.epochs, epochLoss, epochAccuracy);
			}
			this.notifyCallbacks();
		}
		console.log("Training completed.");
	}

	public getEpochsCompleted(): number {
		return this.epochs;
	}
	public getLossHistory(): number[] {
		return this.loss;
	}
	public getAccuracyHistory(): number[] {
		return this.accuracy;
	}

	private handleEpochCompletionForStepMode(): void {
		this.epochs++;
		this.resetStepExecutionState();
	}

	public fwdNeuron(): void {
		if (this.onLayer >= this.network.length) {
			this.handleEpochCompletionForStepMode();
			this.notifyCallbacks();
			return;
		}

		const currentLayer = this.network[this.onLayer];
		if (this.layerProgress < currentLayer.length) {
			const neuron = currentLayer[this.layerProgress];

			if (this.previousLayerResults.length !== neuron.weights.length) {
				console.error(
					`fwdNeuron: Input mismatch for L${this.onLayer}N${this.layerProgress}. Expected ${neuron.weights.length} inputs, got ${this.previousLayerResults.length}. Resetting step state.`,
				);
				this.resetStepExecutionState();
				this.notifyCallbacks();
				return;
			}

			neuron.inputs = [...this.previousLayerResults];
			neuron.z =
				neuron.weights.reduce(
					(sum, weight, i) => sum + weight * neuron.inputs[i],
					0,
				) + neuron.bias;
			neuron.output = this.applyActivation(neuron.z);

			this.currentLayerOutputsForStep.push(neuron.output);
			this.layerProgress++;

			if (this.layerProgress >= currentLayer.length) {
				this.onLayer++;
				this.layerProgress = 0;
				this.previousLayerResults = [...this.currentLayerOutputsForStep];
				this.currentLayerOutputsForStep = [];
			}
		} else {
			if (this.onLayer < this.network.length) {
				this.onLayer++;
				this.layerProgress = 0;
				this.previousLayerResults = [...this.currentLayerOutputsForStep];
				this.currentLayerOutputsForStep = [];
			} else {
				this.handleEpochCompletionForStepMode();
			}
		}
		this.notifyCallbacks();
	}

	public fwdLayer(): void {
		if (this.onLayer >= this.network.length) {
			this.handleEpochCompletionForStepMode();
			this.notifyCallbacks();
			return;
		}

		const currentLayer = this.network[this.onLayer];

		if (
			this.onLayer === 0 &&
			this.previousLayerResults.length !== this.numInputFeatures
		) {
			console.warn(
				`fwdLayer: Initial inputs for layer 0 might be incorrect. Expected ${this.numInputFeatures}, got ${this.previousLayerResults.length}. Attempting to use first training sample.`,
			);
			this.resetStepExecutionState();
		}
		if (
			this.onLayer > 0 &&
			this.previousLayerResults.length !== this.network[this.onLayer - 1].length
		) {
			console.error(
				`fwdLayer: Input mismatch for L${this.onLayer}. Expected ${this.network[this.onLayer - 1].length} inputs from previous layer, got ${this.previousLayerResults.length}. Resetting step state.`,
			);
			this.resetStepExecutionState();
			this.notifyCallbacks();
			return;
		}

		this.currentLayerOutputsForStep = [];
		for (
			let neuronIndex = 0;
			neuronIndex < currentLayer.length;
			neuronIndex++
		) {
			const neuron = currentLayer[neuronIndex];
			if (this.previousLayerResults.length !== neuron.weights.length) {
				console.error(
					`fwdLayer: Input mismatch for neuron L${this.onLayer}N${neuronIndex}. Expected ${neuron.weights.length} inputs, got ${this.previousLayerResults.length}. Halting layer.`,
				);
				this.resetStepExecutionState();
				this.notifyCallbacks();
				return;
			}
			neuron.inputs = [...this.previousLayerResults];
			neuron.z =
				neuron.weights.reduce(
					(sum, weight, idx) => sum + weight * neuron.inputs[idx],
					0,
				) + neuron.bias;
			neuron.output = this.applyActivation(neuron.z);
			this.currentLayerOutputsForStep.push(neuron.output);
		}

		this.previousLayerResults = [...this.currentLayerOutputsForStep];
		this.currentLayerOutputsForStep = [];

		this.onLayer++;
		this.layerProgress = 0;

		if (this.onLayer >= this.network.length) {
			this.handleEpochCompletionForStepMode();
		}

		this.notifyCallbacks();
	}

	private getNeuronsInLayer(layerIndex: number): number {
		if (layerIndex < 0 || layerIndex >= this.network.length) {
			throw new Error("Layer index out of bounds");
		}
		return this.network[layerIndex].length;
	}
}
