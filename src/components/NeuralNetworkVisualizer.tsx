import React, { useRef, useEffect, useState, FC } from 'react'; // Changed React import
import { Neuron } from '../lib/model';

interface NeuralNetworkVisualizerProps {
    layers: Neuron[][];
    width?: number;
    height?: number;
}

// Helper function to draw an arrowhead
function drawArrowhead(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    arrowheadSize: number,
    neuronRadius: number
) {
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Calculate the point on the circumference of the neuron circle for the arrowhead base
    const targetEdgeX = toX - neuronRadius * Math.cos(angle);
    const targetEdgeY = toY - neuronRadius * Math.sin(angle);

    ctx.save();
    ctx.beginPath();
    ctx.translate(targetEdgeX, targetEdgeY);
    ctx.rotate(angle);
    ctx.moveTo(0, 0); // Tip of the arrow at the neuron's edge
    ctx.lineTo(-arrowheadSize, -arrowheadSize / 2);
    ctx.lineTo(-arrowheadSize, arrowheadSize / 2);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle; // Use current line color for arrowhead
    ctx.fill();
    ctx.restore();
}

const NeuralNetworkVisualizer: FC<NeuralNetworkVisualizerProps> = ({
    layers,
    width = 800,
    height = 600,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedNeuron, setSelectedNeuron] = useState<{ layerIndex: number; neuronIndex: number } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Constants for full network mode (some used by click detection too)
        const neuronRadius = 30;
        const layerHorizontalGap = width / (layers.length + 1);
        const neuronNodeSize = neuronRadius * 2;
        const connectionArrowheadSize = 8;

        // Calculate neuron positions for full network mode and for click detection in normal mode
        const neuronPositions: { x: number; y: number }[][] = [];
        if (!selectedNeuron) { // Only calculate if needed for full view or click detection in full view
            for (let l = 0; l < layers.length; l++) {
                neuronPositions[l] = [];
                const currentLayerNeurons = layers[l];
                const numNeuronsInLayer = currentLayerNeurons.length;
                const layerX = layerHorizontalGap * (l + 1);

                if (numNeuronsInLayer === 0) {
                    continue;
                }

                const verticalGapBetweenNeurons = neuronRadius;
                const layerVisualHeight = numNeuronsInLayer * neuronNodeSize + Math.max(0, numNeuronsInLayer - 1) * verticalGapBetweenNeurons;
                const startY = (height - layerVisualHeight) / 2;

                for (let n = 0; n < numNeuronsInLayer; n++) {
                    const neuronY = startY + n * (neuronNodeSize + verticalGapBetweenNeurons) + neuronRadius;
                    neuronPositions[l][n] = { x: layerX, y: neuronY };
                }
            }
        }


        const handleClick = (event: MouseEvent) => {
            if (!canvasRef.current) return;
            const canvasElem = canvasRef.current;
            const rect = canvasElem.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            if (selectedNeuron) {
                // Check if the large displayed neuron is clicked to exit display mode
                const centerX = width / 2;
                const centerY = height / 2;
                const displayNeuronRadius = Math.min(width, height) / 4.5; // Must match rendering logic
                const distanceToCenter = Math.sqrt((clickX - centerX) ** 2 + (clickY - centerY) ** 2);

                if (distanceToCenter < displayNeuronRadius) {
                    setSelectedNeuron(null);
                    return; // Exit handled
                }
                // If in selected mode and click is not on the neuron itself, do nothing further with this click.
                return;
            } else {
                // Check if a neuron is clicked in normal display mode
                // neuronPositions would have been calculated if !selectedNeuron
                for (let l = 0; l < neuronPositions.length; l++) {
                    for (let n = 0; n < (neuronPositions[l]?.length || 0); n++) {
                        const neuronPos = neuronPositions[l][n];
                        if (!neuronPos) continue;
                        const distance = Math.sqrt((clickX - neuronPos.x) ** 2 + (clickY - neuronPos.y) ** 2);
                        if (distance < neuronRadius) {
                            setSelectedNeuron({ layerIndex: l, neuronIndex: n });
                            return;
                        }
                    }
                }
            }
        };

        canvas.addEventListener('click', handleClick);

        // Clear canvas before drawing
        ctx.clearRect(0, 0, width, height);

        if (!layers || layers.length === 0) {
            canvas.removeEventListener('click', handleClick);
            return; // Nothing to draw
        }

        if (selectedNeuron) {
            // --- SINGLE NEURON DISPLAY MODE ---
            const { layerIndex, neuronIndex } = selectedNeuron;
            const neuronData = layers[layerIndex][neuronIndex];

            const centerX = width / 2;
            const centerY = height / 2;
            const displayNeuronRadius = Math.min(width, height) / 5; // Slightly smaller for more space
            const detailFont = '14px Arial';
            const smallFont = '12px Arial';
            const equationFont = '13px Arial';

            // Draw neuron
            ctx.beginPath();
            ctx.arc(centerX, centerY, displayNeuronRadius, 0, 2 * Math.PI);
            ctx.fillStyle = 'hsl(261 52% 47% / 1)';
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.1;
            ctx.stroke();

            // Draw output text inside the neuron (if finite)
            if (Number.isFinite(neuronData.output)) {
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '18px Arial';
                ctx.fillText(`${neuronData.output.toFixed(2)}`, centerX, centerY);
            }

            // Draw bias text above the neuron
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.font = '16px Arial';
            ctx.fillText(`Bias: ${neuronData.bias.toFixed(2)}`, centerX, centerY - displayNeuronRadius - 15);

            // Draw incoming weights as arrows (if not input layer)
            if (layerIndex > 0 && neuronData.weights && neuronData.weights.length > 0) {
                const prevLayer = layers[layerIndex - 1];
                const numWeights = neuronData.weights.length;
                // const arcRadius = displayNeuronRadius * 2.5; // Radius for placing source indicators
                // const startAngle = -Math.PI / 2 - (numWeights > 1 ? Math.PI / 4 : 0); // Start angle for the arc of sources
                // const angleStep = numWeights > 1 ? (Math.PI / 2) / (numWeights - 1) : 0; // Angle step between sources
                const sourceNeuronRadius = 10; // Small radius for source indicators
                const weightArrowheadSize = 6;

                // New: Define X position for the vertical line of source indicators
                const sourceIndicatorsX = centerX - displayNeuronRadius * 2.0; // Position them to the left

                // New: Define vertical spread and starting Y
                const totalVerticalSpread = displayNeuronRadius * 1.5; // Allow some padding
                let startYForIndicators = centerY - totalVerticalSpread / 2;
                if (numWeights === 1) { // If only one, center it vertically relative to the main neuron
                    startYForIndicators = centerY;
                }
                const yStepBetweenIndicators = numWeights > 1 ? totalVerticalSpread / (numWeights - 1) : 0;


                for (let k = 0; k < numWeights; k++) {
                    if (k >= prevLayer.length) continue; // Should not happen if data is consistent

                    // const currentAngle = startAngle + k * angleStep; // Old arc logic
                    // const sourceIndicatorX = centerX - arcRadius * Math.cos(currentAngle); // Old arc logic
                    // const sourceIndicatorY = centerY - arcRadius * Math.sin(currentAngle); // Old arc logic

                    const sourceIndicatorX = sourceIndicatorsX; // Use the common X for vertical alignment
                    const sourceIndicatorY: number = (numWeights === 1) ? startYForIndicators : startYForIndicators + k * yStepBetweenIndicators;


                    // Draw source indicator (small circle + label)
                    ctx.beginPath();
                    ctx.arc(sourceIndicatorX, sourceIndicatorY, sourceNeuronRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = '#777'; // Grey for source indicator
                    ctx.fill();
                    ctx.fillStyle = 'white';
                    ctx.font = smallFont;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`L${layerIndex - 1}[N${k}]`, sourceIndicatorX, sourceIndicatorY);

                    // Draw arrow from source to main neuron
                    const lineAngle = Math.atan2(centerY - sourceIndicatorY, centerX - sourceIndicatorX);
                    const arrowSourceEdgeX = sourceIndicatorX + sourceNeuronRadius * Math.cos(lineAngle);
                    const arrowSourceEdgeY = sourceIndicatorY + sourceNeuronRadius * Math.sin(lineAngle);
                    const arrowTargetEdgeX = centerX - displayNeuronRadius * Math.cos(lineAngle);
                    const arrowTargetEdgeY = centerY - displayNeuronRadius * Math.sin(lineAngle);

                    ctx.strokeStyle = 'skyblue';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(arrowSourceEdgeX, arrowSourceEdgeY);
                    ctx.lineTo(arrowTargetEdgeX, arrowTargetEdgeY);
                    ctx.stroke();
                    drawArrowhead(ctx, sourceIndicatorX, sourceIndicatorY, centerX, centerY, weightArrowheadSize, displayNeuronRadius);

                    // Draw weight text on the arrow
                    const textDistFactor = 0.6; // Place text 60% along the arrow
                    const weightTextX = arrowSourceEdgeX + (arrowTargetEdgeX - arrowSourceEdgeX) * textDistFactor;
                    const weightTextY = arrowSourceEdgeY + (arrowTargetEdgeY - arrowSourceEdgeY) * textDistFactor;
                    ctx.save();
                    ctx.translate(weightTextX, weightTextY);
                    let textAngle = lineAngle;
                    if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) textAngle += Math.PI;
                    ctx.rotate(textAngle);
                    ctx.fillStyle = 'white';
                    ctx.font = detailFont;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(neuronData.weights[k].toFixed(2), 0, -2); // Slightly above line
                    ctx.restore();
                }
            } else if (layerIndex === 0) {
                ctx.font = detailFont;
                ctx.textAlign = 'center';
                ctx.fillStyle = 'white';
                ctx.fillText('(Input Layer Neuron)', centerX, centerY + displayNeuronRadius + 35);
            }

            // Draw equation at the bottom
            ctx.font = equationFont;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            let equationY = height - 60; // Starting Y for equation lines
            const lineSpacing = 18;

            let sumString = '';
            let calculatedWeightedSum = neuronData.bias;
            if (layerIndex > 0 && neuronData.weights && neuronData.weights.length > 0) {
                sumString = '(';
                for (let k = 0; k < neuronData.weights.length; k++) {
                    const weightVal = neuronData.weights[k];
                    const inputVal = neuronData.inputs?.[k]; // Use optional chaining
                    const inputStr = (inputVal !== undefined && Number.isFinite(inputVal)) ? inputVal.toFixed(2) : `inp[${k}]`;
                    sumString += `${weightVal.toFixed(2)}*${inputStr}`;
                    if (k < neuronData.weights.length - 1) sumString += ' + ';
                    calculatedWeightedSum += weightVal * ((inputVal !== undefined && Number.isFinite(inputVal)) ? inputVal : 0); // Assume 0 for unknown inputs in calculation
                }
                sumString += ')';
            } else {
                sumString = '(No incoming weights)'; // Or just display bias if input layer
                calculatedWeightedSum = neuronData.bias; // For input layer, sum is just bias if we consider no prior inputs
            }

            const biasStr = neuronData.bias.toFixed(2);
            ctx.fillText(`Weighted Sum = ${sumString} + ${biasStr} = ${calculatedWeightedSum.toFixed(2)}`, width / 2, equationY);
            equationY += lineSpacing;

            const outputStr = Number.isFinite(neuronData.output) ? neuronData.output.toFixed(2) : String(neuronData.output);
            ctx.fillText(`Final Output (Activation): ${outputStr}`, width / 2, equationY);

        } else {
            // --- FULL NETWORK DISPLAY MODE ---
            // neuronPositions are already calculated if we are in this block

            // 2. Draw connections (and weights)
            ctx.lineWidth = 1.5;
            ctx.font = '10px Arial';

            for (let l = 1; l < layers.length; l++) {
                const currentLayerNeurons = layers[l];
                const prevLayerNeurons = layers[l - 1];

                if (!prevLayerNeurons || prevLayerNeurons.length === 0) continue;

                for (let n = 0; n < currentLayerNeurons.length; n++) {
                    const neuron = currentLayerNeurons[n];
                    if (!neuronPositions[l] || !neuronPositions[l][n] || !neuronPositions[l - 1]) continue;
                    const targetPos = neuronPositions[l][n];

                    const numIncomingConnections = Math.min(neuron.weights?.length || 0, prevLayerNeurons.length);
                    const isGrey = neuron.output === 0.0;

                    if (neuron.weights) {
                        for (let k = 0; k < neuron.weights.length; k++) {
                            if (k < prevLayerNeurons.length && neuronPositions[l - 1][k]) { // Ensure source neuron and its position exist
                                const sourcePos = neuronPositions[l - 1][k];
                                const weight = neuron.weights[k];

                                const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
                                const sourceEdgeX = sourcePos.x + neuronRadius * Math.cos(angle);
                                const sourceEdgeY = sourcePos.y + neuronRadius * Math.sin(angle);
                                const targetEdgeX = targetPos.x - neuronRadius * Math.cos(angle);
                                const targetEdgeY = targetPos.y - neuronRadius * Math.sin(angle);

                                if (isGrey) {
                                    ctx.strokeStyle = '#555';
                                } else {
                                    ctx.strokeStyle = 'skyblue';
                                }

                                ctx.beginPath();
                                ctx.moveTo(sourceEdgeX, sourceEdgeY);
                                ctx.lineTo(targetEdgeX, targetEdgeY);
                                ctx.stroke();

                                drawArrowhead(ctx, sourcePos.x, sourcePos.y, targetPos.x, targetPos.y, connectionArrowheadSize, neuronRadius);

                                const lineDx = targetEdgeX - sourceEdgeX;
                                const lineDy = targetEdgeY - sourceEdgeY;
                                const lineLength = Math.sqrt(lineDx * lineDx + lineDy * lineDy);
                                const weightTextPadding = 500; // User's current value
                                const minTextDisplayLength = 20;
                                const minVisibleLineLengthForPaddedText = (2 * weightTextPadding) + minTextDisplayLength;

                                let textAnchorX: number, textAnchorY: number;
                                let xTextOffset = 0;

                                if (lineLength < minVisibleLineLengthForPaddedText) {
                                    textAnchorX = sourceEdgeX + lineDx / 2;
                                    textAnchorY = sourceEdgeY + lineDy / 2;
                                    if (numIncomingConnections > 0 && lineLength > 0) {
                                        xTextOffset = ((k + 0.5) / numIncomingConnections - 0.5) * lineLength;
                                    }
                                } else {
                                    const unitDx = lineDx / lineLength;
                                    const unitDy = lineDy / lineLength;
                                    const paddedSourceX = sourceEdgeX + unitDx * weightTextPadding;
                                    const paddedSourceY = sourceEdgeY + unitDy * weightTextPadding;
                                    const paddedTargetX = targetEdgeX - unitDx * weightTextPadding;
                                    const paddedTargetY = targetEdgeY - unitDy * weightTextPadding;
                                    textAnchorX = (paddedSourceX + paddedTargetX) / 2;
                                    textAnchorY = (paddedSourceY + paddedTargetY) / 2;
                                    const actualTextPlacementLength = lineLength - (2 * weightTextPadding);
                                    if (numIncomingConnections > 0 && actualTextPlacementLength > 0) {
                                        xTextOffset = ((k + 0.5) / numIncomingConnections - 0.5) * actualTextPlacementLength;
                                    }
                                }

                                ctx.save();
                                ctx.translate(textAnchorX, textAnchorY);
                                let textAngle = angle;
                                if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
                                    textAngle += Math.PI;
                                }
                                ctx.rotate(textAngle);
                                ctx.textAlign = 'center';
                                ctx.fillStyle = 'white';

                                if (k % 2 === 0) {
                                    ctx.textBaseline = 'bottom';
                                    ctx.fillText(weight.toFixed(2), xTextOffset, -3);
                                } else {
                                    ctx.textBaseline = 'top';
                                    ctx.fillText(weight.toFixed(2), xTextOffset, 3);
                                }
                                ctx.restore();
                            }
                        }
                    }
                }
            }

            // 3. Draw neurons (and biases/outputs)
            ctx.font = '10px Arial';
            for (let l = 0; l < layers.length; l++) {
                const currentLayerNeurons = layers[l];
                for (let n = 0; n < currentLayerNeurons.length; n++) {
                    const neuron = currentLayerNeurons[n];
                    if (!neuronPositions[l] || !neuronPositions[l][n]) continue;

                    const { x, y } = neuronPositions[l][n];

                    ctx.beginPath();
                    ctx.arc(x, y, neuronRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = 'hsl(261 52% 47% / 1)';
                    ctx.fill();
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 0.1;
                    ctx.stroke();

                    if (Number.isFinite(neuron.output)) {
                        ctx.fillStyle = 'white';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(`${neuron.output.toFixed(2)}`, x, y);
                    }

                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(`B: ${neuron.bias.toFixed(2)}`, x, y - neuronRadius - 5);
                }
            }
        } // End of else (full network display mode)

        return () => {
            canvas.removeEventListener('click', handleClick);
        };
    }, [layers, width, height, selectedNeuron]); // Removed setSelectedNeuron from dependencies

    return <canvas ref={canvasRef} width={width} height={height} />;
};

export default NeuralNetworkVisualizer;
