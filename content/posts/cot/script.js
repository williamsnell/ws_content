const colors = ["#23B0FF", "#FF6266", "#FFA86A", "#EE72F1", "#23B0FF"];

const textBackground = "#36383c";
/**
 * Token Probability Visualization
 * Self-contained function to create a visualization from JSON data.
 */
function create_visualizer(json_path, elem_id) {
    // State variables
    let data = null;
    let currentSequenceIndex = 0;
    
    // Get target element
    const targetElement = document.getElementById(elem_id);
    if (!targetElement) {
        console.error(`Target element with ID '${elem_id}' not found.`);
        return;
    }
    
    // Initialize the visualizer
    initializeVisualizer();
    
    /**
     * Initialize the visualizer UI and load data
     */
    function initializeVisualizer() {
        // Create container structure
        targetElement.innerHTML = `
            <div id="sequenceVisualization_${elem_id}" class="container" style="display: none; border: 0; background-color: ${textBackground}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <div class="sequence-content">
                    <div id="tokenContainer_${elem_id}" class="token-container"></div>
                    <div id="answerIndicator_${elem_id}" class="answer-indicator"></div>
                </div>
                <div class="sequence-navigation" style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <button id="prevButton_${elem_id}">Previous</button>
                    <button id="nextButton_${elem_id}">Next</button>
                </div>
            </div>
        `;
        
        // Add keyframes for spinner animation if not already defined
        if (!document.querySelector('style#visualizer-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'visualizer-styles';
            styleElement.textContent = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // Add event listeners for navigation buttons
        document.getElementById(`prevButton_${elem_id}`).addEventListener('click', () => {
            if (data && currentSequenceIndex > 0) {
                currentSequenceIndex--;
                showSequence(currentSequenceIndex);
                updateNavigationButtons();
            }
        });
        
        document.getElementById(`nextButton_${elem_id}`).addEventListener('click', () => {
            if (data && currentSequenceIndex < Object.keys(data).length - 1) {
                currentSequenceIndex++;
                showSequence(currentSequenceIndex);
                updateNavigationButtons();
            }
        });
        
        // Load data
        loadData(json_path);
    }
    
    /**
     * Load JSON data from specified path
     */
    function loadData(dataUrl) {
        // Fetch the JSON data
        fetch(dataUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(jsonData => {
                data = jsonData;
                
                // Show the first sequence
                currentSequenceIndex = 0;
                showSequence(currentSequenceIndex);
                
                // Update button states
                updateNavigationButtons();
            })
            .catch(error => {
                console.error('Error loading data:', error);
                // Create error info box if not exists
                const infoBox = document.createElement('div');
                infoBox.className = 'info-box';
                infoBox.style.cssText = 'background-color: rgb(255, 255, 255, 0.2); border: 1px solid #b6d4fe; border-radius: 4px; padding: 10px 15px; margin-bottom: 20px;';
                infoBox.innerHTML = `
                    <p style="color: rgb(255, 255, 255, 0.2);">Error loading data: ${error.message}</p>
                    <p>Make sure the file "${dataUrl}" exists and is valid JSON.</p>
                `;
                targetElement.appendChild(infoBox);
            });
    }

/**
    * Linearly blends between two hex colors
    * @param {string} color1 - Starting hex color (format: "#RRGGBB" or "#RGB")
    * @param {string} color2 - Ending hex color (format: "#RRGGBB" or "#RGB")
    * @param {number} ratio - Blend ratio between 0 and 1 (0 = color1, 1 = color2)
    * @returns {string} Resulting hex color
    */
    function blendColors(color1, color2, ratio) {
        // Ensure ratio is between 0 and 1
        ratio = Math.max(0, Math.min(1, ratio));

        // Expand shorthand hex format (e.g., "#03F" to "#0033FF")
        function expandHex(hex) {
            hex = hex.replace(/^#/, '');
            if (hex.length === 3) {
                hex = hex.split('').map(char => char + char).join('');
            }
            return hex;
        }

        // Convert hex to RGB components
        const hex1 = expandHex(color1);
        const hex2 = expandHex(color2);

        // Parse each hex color into RGB components
        const r1 = parseInt(hex1.substring(0, 2), 16);
        const g1 = parseInt(hex1.substring(2, 4), 16);
        const b1 = parseInt(hex1.substring(4, 6), 16);

        const r2 = parseInt(hex2.substring(0, 2), 16);
        const g2 = parseInt(hex2.substring(2, 4), 16);
        const b2 = parseInt(hex2.substring(4, 6), 16);

        // Linear interpolation formula: a + (b - a) * ratio
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);

        // Convert back to hex format
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    } 

    /**
     * Helper function to get lighter color for token backgrounds
     */
    function getLighterColor(hexColor, factor) {
        // Convert hex to RGB
        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);
        
        // Lighten
        r = Math.round(r + (255 - r) * factor);
        g = Math.round(g + (255 - g) * factor);
        b = Math.round(b + (255 - b) * factor);
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * Show a specific sequence by index
     */
    function showSequence(index) {
        if (!data) return;
        
        // Ensure index is within valid range
        if (index < 0) index = 0;
        if (index >= data.length) index = data.length - 1;
        
        // Update current index
        currentSequenceIndex = index;
        
        const sequence = data[index];
        const sequenceVisualization = document.getElementById(`sequenceVisualization_${elem_id}`);
        const tokenContainer = document.getElementById(`tokenContainer_${elem_id}`);
        
        sequenceVisualization.style.display = 'block';
        
        // Calculate the highest probability class for the entire sequence
        const aggregatedProbs = calculateAggregatedProbs(sequence.probs);
        const predictedClass = aggregatedProbs.indexOf(Math.max(...aggregatedProbs));
        const correctClass = sequence.answer;
        
        // Display tokens
        tokenContainer.innerHTML = '';
        
        // Create a line wrapper to organize tokens in rows
        let currentLine = document.createElement('div');
        currentLine.className = 'token-line';
        currentLine.style.display = 'flex';
        currentLine.style.flexWrap = 'wrap';
        currentLine.style.minHeight = "2rem";
        
        // Add to token container
        tokenContainer.appendChild(currentLine);
        
        sequence.tokens.forEach((token, i) => {
            const originalToken = token; // Keep original for checks
            token = token.replaceAll("Ġ", " ");
            
            // Count how many newlines are in this token
            const newlineCount = (originalToken.match(/Ċ/g) || []).length;
            const hasNewline = newlineCount > 0;
            
            // Replace Ċ with actual newlines for display
            token = token.replaceAll("Ċ", "");
            
            // Replace all Â with nothing.
            token = token.replaceAll("Â", "");
            
            // Since we skip the BOS token, we need to 
            // add 1 to our probs index.
            const tokenProbs = sequence.probs[i + 1];
            const highestProbIndex = tokenProbs.indexOf(Math.max(...tokenProbs));
            
            const tokenElement = document.createElement('div');
            tokenElement.className = 'token';
            tokenElement.style.position = 'relative';
            tokenElement.style.padding = '2px 2px';
            tokenElement.style.margin = '0px 0px';
            tokenElement.style.borderRadius = '0px';
            tokenElement.style.border = '0px';
            tokenElement.style.cursor = 'pointer';
            tokenElement.style.transition = 'all 0.2s';
            tokenElement.style.maxWidth = '350px';
            
            // Calculate background color based on highest probability and correctness
            const maxProb = Math.max(...tokenProbs); // Confidence level
            const maxProbIndex = tokenProbs.indexOf(maxProb); // Predicted class
            
            // Determine if prediction is correct
            const isCorrect = maxProbIndex === correctClass;
            
            const baseColor = isCorrect ? '#73f271' : '#ee62f1'; // green : red
            
            // Adjust opacity based on confidence level with minimum confidence of 0.1 (10%)
            // Normalize the confidence to a 0.1-1.0 range for opacity
            const minConfidence = 0.1; // 10% minimum for 10 classes
            const normalizedConfidence = (maxProb - minConfidence) / (1 - minConfidence);
            // const opacity = 0. + (normalizedConfidence * 0.7); // Scale from 0.2 to 0.9 based on confidence


            
            // Apply the background color
            tokenElement.style.backgroundColor = blendColors(textBackground, baseColor, normalizedConfidence); //`${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
            
            // Token text
            const tokenText = document.createElement('div');
            tokenText.className = 'token-text';
            // tokenText.style.fontWeight = 'bold';
            tokenText.style.marginBottom = '2px';
            tokenText.style.whiteSpace = 'pre-wrap';
            tokenText.textContent = token;
            tokenElement.appendChild(tokenText);
            
            // Store the token probabilities for the line colorbar
            tokenElement.dataset.tokenProbs = JSON.stringify(tokenProbs);
            
            // Create token details popup
            const tokenDetails = document.createElement('div');
            tokenDetails.className = 'token-details';
            tokenDetails.style.position = 'absolute';
            tokenDetails.style.top = '100%';
            tokenDetails.style.left = '0';
            tokenDetails.style.width = '280px';
            //tokenDetails.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            tokenDetails.style.backdropFilter = "blur(50px)";
            tokenDetails.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            tokenDetails.style.borderRadius = '4px';
            tokenDetails.style.padding = '10px';
            tokenDetails.style.zIndex = '100';
            tokenDetails.style.display = 'none';
            tokenDetails.style.pointerEvents = 'none';
            tokenDetails.style.touchAction = 'auto';
            
            // Sort probabilities in descending order for details view
            const sortedProbs = tokenProbs.map((prob, idx) => ({ prob, index: idx }))
                .sort((a, b) => b.prob - a.prob);
            
            // Create column graph first
            const probGraph = document.createElement('div');
            probGraph.className = 'probability-graph';
            probGraph.style.marginTop = '10px';
            probGraph.style.display = 'flex';
            probGraph.style.height = '120px';
            probGraph.style.alignItems = 'flex-end';
            probGraph.style.borderBottom = '1px solid #dee2e6';
            probGraph.style.paddingBottom = '5px';
            probGraph.style.gap = '2px';
            
            // Create labels container
            const probLabels = document.createElement('div');
            probLabels.className = 'probability-labels';
            probLabels.style.display = 'flex';
            probLabels.style.justifyContent = 'space-around';
            probLabels.style.marginTop = '5px';
            probLabels.style.fontSize = '10px';
            
            // Add bars for each class (not sorted)
            tokenProbs.forEach((prob, index) => {
                // Create bar with height based on probability
                const bar = document.createElement('div');
                bar.className = 'probability-bar';
                bar.style.flex = '1';
                bar.style.margin = '0 2px';
                bar.style.transition = 'height 0.3s';
                bar.style.minHeight = '1px';
                
                // Add correct-class style if this is the correct answer
                if (index === correctClass) {
                    bar.style.outline = '2px solid #73f271';
                    bar.style.outlineOffset = '1px';
                    bar.style.position = 'relative';
                    bar.style.zIndex = '10';
                }
                
                bar.style.height = `${Math.max(prob * 100, 1)}%`; // Min height of 1%
                bar.style.backgroundColor = "var(--accent)";//colors[0]; //[index % colors.length];
                probGraph.appendChild(bar);
                
                // Create label for this class
                const label = document.createElement('div');
                label.textContent = String.fromCharCode(65 + index); // A, B, C, etc.
                
                // Add correct-class style if this is the correct answer
                if (index === correctClass) {
                    label.style.fontWeight = 'bold';
                }
                
                probLabels.appendChild(label);
            });
            
            // Add graph and labels to token details
            tokenDetails.appendChild(probGraph);
            tokenDetails.appendChild(probLabels);
            tokenElement.appendChild(tokenDetails);
            
            // Store token probabilities for details popup
            tokenElement.dataset.tokenProbs = JSON.stringify(tokenProbs);
            
            // Add token to the current line
            currentLine.appendChild(tokenElement);
            
            // If this token had newlines, create appropriate number of new lines
            if (hasNewline) {
                // Create a new line for each newline character
                for (let j = 0; j < newlineCount; j++) {
                    // Create new token line
                    currentLine = document.createElement('div');
                    currentLine.className = 'token-line';
                    currentLine.style.display = 'flex';
                    currentLine.style.flexWrap = 'wrap';
                    currentLine.style.minHeight = "2rem";
                    // Add to container
                    tokenContainer.appendChild(currentLine);
                }
            }
        });
        
        // Add event listeners to tokens
        addTokenEventListeners();
    }
    
    /**
     * Update navigation button states based on current index
     */
    function updateNavigationButtons() {
        const prevButton = document.getElementById(`prevButton_${elem_id}`);
        const nextButton = document.getElementById(`nextButton_${elem_id}`);
        
        if (data) {
            // Disable prev button if at first sequence
            prevButton.disabled = currentSequenceIndex <= 0;
            
            // Disable next button if at last sequence
            nextButton.disabled = currentSequenceIndex >= data.length - 1;
        }
    }
    
    /**
     * Add event listeners to tokens for interactivity
     */
    function addTokenEventListeners() {
        document.querySelectorAll(`#tokenContainer_${elem_id} .token`).forEach(token => {
            // Store state variables in data attributes
            token.dataset.isTooltipVisible = 'false';
            
            // Function to show tooltip
            const showTooltip = () => {
                token.style.transform = 'translateY(-4px)';
                token.style.zIndex = '50';
                
                const tokenDetails = token.querySelector('.token-details');
                tokenDetails.style.display = 'block';
                tokenDetails.style.pointerEvents = 'auto'; // Enable interaction for mobile
                
                // Position the tooltip to stay within viewport
                positionTooltip(token, tokenDetails);
                
                token.dataset.isTooltipVisible = 'true';
            };
            
            // Function to hide tooltip
            const hideTooltip = () => {
                if (token.dataset.isTooltipVisible === 'false') return;
                
                token.style.transform = 'translateY(0)';
                token.style.zIndex = '1';
                
                const tokenDetails = token.querySelector('.token-details');
                tokenDetails.style.display = 'none';
                tokenDetails.style.pointerEvents = 'none';
                
                token.dataset.isTooltipVisible = 'false';
            };
            
            // Desktop: Mouse hover events
            token.addEventListener('mouseenter', showTooltip);
            token.addEventListener('mouseleave', hideTooltip);
            
            // Mobile: Touch events
            token.addEventListener('touchstart', (e) => {
                // If tooltip is already visible, hide it
                if (token.dataset.isTooltipVisible === 'true') {
                    hideTooltip();
                    return;
                }
                
                // Hide all other tooltips first
                document.querySelectorAll(`#tokenContainer_${elem_id} .token`).forEach(t => {
                    if (t !== token) {
                        t.dataset.isTooltipVisible = 'false';
                        t.style.transform = 'translateY(0)';
                        t.style.zIndex = '1';
                        const details = t.querySelector('.token-details');
                        if (details) {
                            details.style.display = 'none';
                            details.style.pointerEvents = 'none';
                        }
                    }
                });
                
                // Show this tooltip
                showTooltip();
                
                // Prevent scrolling when interacting with the tooltip
                e.preventDefault();
            }, { passive: false });
            
            // Document-level touch event to close tooltips when tapping elsewhere
            if (!document.hasTooltipHandler) {
                document.addEventListener('touchstart', (e) => {
                    // Check if touch is outside of any token
                    const isOutsideToken = !e.target.closest('.token');
                    if (isOutsideToken) {
                        // Hide all tooltips
                        document.querySelectorAll('.token').forEach(t => {
                            t.dataset.isTooltipVisible = 'false';
                            t.style.transform = 'translateY(0)';
                            t.style.zIndex = '1';
                            const details = t.querySelector('.token-details');
                            if (details) {
                                details.style.display = 'none';
                                details.style.pointerEvents = 'none';
                            }
                        });
                    }
                });
                document.hasTooltipHandler = true;
            }
            
            // Click effect to toggle expanded state
            token.addEventListener('click', (e) => {
                // Only handle clicks, not touches (we handle touches separately)
                if (e.pointerType === 'touch') return;
                
                const wasExpanded = token.classList.contains('expanded');
                
                // Remove expanded class from all tokens first
                document.querySelectorAll(`#tokenContainer_${elem_id} .token`).forEach(t => {
                    t.classList.remove('expanded');
                });
                
                // If it wasn't expanded before, expand it now
                if (!wasExpanded) {
                    token.classList.add('expanded');
                }
            });
        });
    }
    
    /**
     * Position tooltip to stay within viewport boundaries
     */
    function positionTooltip(tokenElement, tooltipElement) {
        // Get the dimensions and positions
        const tokenRect = tokenElement.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Reset position to default (remove any previous adjustments)
        tooltipElement.style.top = '100%';
        tooltipElement.style.left = '0';
        tooltipElement.style.right = 'auto';
        tooltipElement.style.bottom = 'auto';
        tooltipElement.style.transform = 'none';
        
        // Force a reflow to get accurate dimensions after resetting
        tooltipElement.getBoundingClientRect();
        
        // Calculate tooltip position after default positioning
        const updatedTooltipRect = tooltipElement.getBoundingClientRect();
        
        // Check if tooltip would go off the right edge
        if (updatedTooltipRect.right > viewportWidth) {
            tooltipElement.style.left = 'auto';
            tooltipElement.style.right = '0';
        }
        
        // Check if tooltip would go off the left edge
        if (updatedTooltipRect.left < 0) {
            tooltipElement.style.left = '0';
            tooltipElement.style.right = 'auto';
        }
        
        // Check if tooltip would go off the bottom edge
        if (updatedTooltipRect.bottom > viewportHeight) {
            tooltipElement.style.top = 'auto';
            tooltipElement.style.bottom = '100%';
        }
        
        // Final check for any overlap with viewport edges
        const finalRect = tooltipElement.getBoundingClientRect();
        
        // If we still have issues, center the tooltip under the token
        if (finalRect.right > viewportWidth || finalRect.left < 0 || 
            finalRect.bottom > viewportHeight || finalRect.top < 0) {
            
            // Center horizontally on the token
            tooltipElement.style.left = '50%';
            tooltipElement.style.right = 'auto';
            tooltipElement.style.transform = 'translateX(-50%)';
            
            // If still overflows right or left, adjust further
            const centeredRect = tooltipElement.getBoundingClientRect();
            if (centeredRect.right > viewportWidth) {
                const overflowRight = centeredRect.right - viewportWidth;
                tooltipElement.style.transform = `translateX(calc(-50% - ${overflowRight}px))`;
            } else if (centeredRect.left < 0) {
                const overflowLeft = Math.abs(centeredRect.left);
                tooltipElement.style.transform = `translateX(calc(-50% + ${overflowLeft}px))`;
            }
        }
    }
    
    /**
     * Calculate aggregated probabilities across all tokens
     */
    function calculateAggregatedProbs(probs) {
        // Simple averaging across tokens
        const numClasses = probs[0].length;
        const aggregated = new Array(numClasses).fill(0);
        
        probs.forEach(tokenProbs => {
            tokenProbs.forEach((prob, i) => {
                aggregated[i] += prob;
            });
        });
        
        // Normalize
        const total = probs.length;
        return aggregated.map(sum => sum / total);
    }
}
