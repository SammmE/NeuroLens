import NeuralNetworkPanel from '@/components/synapse-view/NeuralNetworkPanel';
import TrainingMetricsPanel from '@/components/synapse-view/TrainingMetricsPanel';
import TrainingDataPanel from '@/components/synapse-view/TrainingDataPanel';
import ModelControlsPanel from '@/components/synapse-view/ModelControlsPanel';

export default function SynapseViewPage() {
  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 bg-background">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">SynapseView</h1>
        <p className="text-lg text-muted-foreground">
          An educational tool to visually understand how neural networks learn.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NeuralNetworkPanel />
        <TrainingMetricsPanel />
        <TrainingDataPanel />
        <ModelControlsPanel />
      </div>
    </main>
  );
}
