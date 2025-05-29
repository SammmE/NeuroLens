<!-- filepath: c:\Users\sam\Documents\code\NeuroLens\README.md -->
# NeuroLens: SynapseView

NeuroLens is an interactive web application for visualizing and understanding the training process of neural networks. It provides a user-friendly interface to configure, run, and monitor a neural network model in real-time.

## Features

-   **Interactive Neural Network Visualization**: See the structure of the neural network, including layers, neurons, and weights.
-   **Real-time Training Metrics**: Monitor key metrics like loss and accuracy as the model trains.
-   **Training Data Overview**: View the dataset being used to train the model.
-   **Model Controls**:
    -   Adjust hyperparameters such as epochs, learning rate, number of hidden layers, and activation functions.
    -   Play, pause, step through epochs, or step through layers of the training process.
    -   Reset the model to its initial state.
-   **Responsive Design**: The application is designed to work on various screen sizes.

## Tech Stack

-   **Frontend**: Next.js, React, TypeScript
-   **Styling**: Tailwind CSS, Shadcn/ui components
-   **State Management**: Custom `AppState` for managing model and training state.
-   **Visualization**: Recharts for metrics, custom components for network visualization.

## Getting Started

### Prerequisites

-   Node.js (version 20 or higher recommended)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
    cd NeuroLens
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

To start the development server:

```bash
npm run dev
# or
yarn dev
```

This will typically start the application on `http://localhost:9002`. Open this URL in your web browser to see the application.

The `dev` script uses `next dev --turbopack -p 9002`. Turbopack is a fast bundler for Next.js.

### Other Available Scripts

-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server (after building).
-   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.
-   `npm run typecheck`: Runs the TypeScript compiler to check for type errors.
-   `npm run genkit:dev`: Starts Genkit in development mode (related to AI features, if any).
-   `npm run genkit:watch`: Starts Genkit in development mode with watch enabled.

## Using SynapseView

Once the application is running, you will see the SynapseView interface.

1.  **Model Controls Panel**:
    *   **Epochs**: Set the total number of training epochs.
    *   **Learning Rate**: Adjust the learning rate for the optimizer.
    *   **Hidden Layers**: Configure the number of neurons in each hidden layer.
    *   **Activation Function**: Select the activation function for the hidden layers (e.g., ReLU, Sigmoid).
    *   **Control Buttons**:
        *   **Play**: Starts or resumes the training process.
        *   **Pause**: Pauses the ongoing training.
        *   **Step Forward (Epoch)**: Manually advances the training by one epoch.
        *   **Step Through Layers**: (Functionality might be specific to how `trainTickLayer` is implemented) Allows stepping through the network layer by layer during a training step.
        *   **Reset Model**: Resets the model weights, training progress, and metrics to their initial state.

2.  **Neural Network Panel**:
    *   Displays a visual representation of the neural network architecture.
    *   This panel likely updates to show changes in weights or activations as the model trains (if implemented).

3.  **Training Metrics Panel**:
    *   Shows charts for training loss and accuracy over epochs.
    *   Helps in understanding how well the model is learning.

4.  **Training Data Panel**:
    *   Provides a glimpse of the dataset being used for training.
    *   This might show sample data points or a summary of the dataset.

### Workflow

1.  **Configure**: Use the "Model Controls Panel" to set your desired hyperparameters.
2.  **Train**:
    *   Click "Play" to start continuous training.
    *   Click "Pause" to halt training.
    *   Click "Step Forward (Epoch)" to train for a single epoch at a time.
3.  **Observe**:
    *   Watch the "Training Metrics Panel" to see how loss and accuracy evolve.
    *   Observe the "Neural Network Panel" for any visual updates.
4.  **Iterate**: If the model isn't performing as expected, "Reset Model", adjust hyperparameters, and train again.

## Data Generation

The project includes a `datagen.py` script. While its exact usage isn't detailed here, it's likely used to generate synthetic datasets (like `sample.csv` or `sin.csv`) for training the neural network. To use it, you would typically run:

```bash
python datagen.py
```

(You might need to install Python and any dependencies listed within `datagen.py` if you haven't already.)

## Deployment

The `apphosting.yaml` file suggests that this project can be deployed to Google Cloud App Engine. Refer to Google Cloud documentation for deployment instructions.

## Contributing

(Add guidelines for contributing to the project if it's open source or collaborative.)

## License

(Specify the license for your project, e.g., MIT, Apache 2.0.)
