function manageNodeChange(nodes, prevNodes) {
    for (let i = 1; i < nodes.length; i++) {
        // if nodes[i] < prevNodes[i] -> decrease the 
        // previous node
        if (nodes[i] < prevNodes[i]) {
            let maxVal = nodes[i];
            // then, propagate through the rest of the array
            for (let j = 0; j < nodes.length; j++) {
                nodes[j] = Math.min(nodes[j], maxVal);
            }
            // break out of the outer loop
            i = nodes.length;
        } else {
            nodes[i] = Math.max(nodes[i], nodes[i - 1]); 
        }
    }

    // Tie the token directly to the last 
    // process.
    const lastHighlight = Math.max(...nodes.slice(-3));
    nodes[nodes.length - 3] = lastHighlight;
    nodes[nodes.length - 2] = lastHighlight;
    nodes[nodes.length - 1] = lastHighlight;

    return nodes
};


function calcColBoundsTriangle(nodes, prevNodes) {
    nodes = manageNodeChange(nodes, prevNodes);

    let starts = new Array(nodes.length);
    let stops = new Array(nodes.length);

    for (let i = 0; i < nodes.length; i++) {
        if (i < 1) {
            starts[i] = 0
            stops[i] = Math.max(...nodes);
        } else {
            starts[i] = Math.max(nodes[i - 1] - 1, 0); 
            stops[i] = Math.max(...nodes);
        }

    }
    return [starts, stops];
}

function calcColBoundsSnake(nodes, prevNodes) {
    nodes = manageNodeChange(nodes, prevNodes);

    let starts = new Array(nodes.length);
    let stops = new Array(nodes.length);

    for (let i = 0; i < nodes.length; i++) {
        if (i < 1) {
            starts[i] = 0
            stops[i] = nodes[0];
        } else {
            starts[i] = Math.max(nodes[i - 1] - 1, 0); 
            stops[i] = nodes[i]; 
        }

    }
    return [starts, stops];
}
// FlowchartGenerator.js - Vanilla JavaScript implementation
function addFlowchart(container_id, rows, start_tokens, end_tokens, connections=null, interact=true, 
                      notes=null, bounds_func=calcColBoundsSnake,
                      showFinalTokens=false) {
    const cols = start_tokens.length;
    console.assert(end_tokens.length == cols);

    if (connections === null) {
        connections = new Array(rows).fill(1);
    }

    const container = document.getElementById(container_id);
    const previewContainer = document.createElement("div");
    previewContainer.id = `${container_id}-preview_container`; 

    const highlightColor = "var(--accent)";
    const backgroundColor = "var(--fbc-secondary-text)";
    const textColor = "var(--fbc-white)";
    const textSize = Number(getComputedStyle(container).fontSize.slice(0, -2));

    const cellWidth = Math.min(Math.max(50, container.clientWidth / rows), 100);
    const cellHeight = Math.min(Math.max(60, cellWidth * 0.7), 100);
    const shape_width = cellWidth * 0.6;
    const shape_height = cellHeight * 0.6;

    const gap_centre = (shape_height + cellHeight) / 2;
    const gap_horizontal = (shape_width + cellWidth) / 2;

    container.style.height = `${cellHeight * cols}px`;

    const horizontalMargin = container.clientWidth - cellWidth * rows;

    const stroke_width = 2;

    let prevNodes = connections.slice();

    function getXY(row, col) {
        const x = row * cellWidth + horizontalMargin / 2; 
        const y = col * cellHeight + 1;
        return [x, y];
    } 

    // Initial state
    const state = {
        svgCode: '',
        rows: rows,
        columns: cols,
    };

    container.appendChild(previewContainer);

    generateFlowchart();

    highlightConnections(connections);

    // Core functions
    function generateFlowchart() {
        const flowchartSvg = createFlowchartSvg(state.rows, state.columns);
        state.svgCode = flowchartSvg;
        updateUI();
    }

    function updateUI() {
        // Update preview
        previewContainer.innerHTML = state.svgCode;

        // Add event listeners after SVG is added to DOM
        if (interact) {
            setTimeout(attachEventListeners, 100);
        }
    }

    function attachEventListeners() {
        for (let row = 0; row < state.rows; row++) {
            for (let col = 0; col < state.columns; col++) {
                const element = document.getElementById(`${container_id}-node-${row}-${col}`);
                if (element) {
                    element.addEventListener('mouseover', function() {
                        connections[row] = col + 1;
                        highlightConnections(connections);
                    });
                    element.addEventListener('touchstart', function() {
                        connections[row] = col + 1;
                        highlightConnections(connections);
                    });
                }
            }
        }
    }

    function createFlowchartSvg(rows, columns) {
        // SVG dimensions
        const width = container.clientWidth;
        const height = container.clientHeight;

        // SVG header and style
        let svg = `<?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
            <svg xmlns="http://www.w3.org/2000/svg" style="background: none;" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${width}" height="${height}" viewBox="-0.5 -0.5 ${width} ${height}">
            <defs>
            <!-- A marker to be used as an arrowhead -->
            <marker
        id="arrow"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse">
            <path d="M 7, 3.5 L 0,0 L 1.63, 3.5 L 0, 7 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="all"/>
            </marker>
            </defs>
            <g>`;

        // Generate shapes
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const shapeType = getShapeType(row, col, rows);

                const [x, y] = getXY(row, col);

                // Add node
                const prefix = `${container_id}-node`;

                svg += createShape(x, y, height, shapeType, row, col, prefix);

                // Add connections
                if (row < rows - 1) {
                    // Vertical connection to the node below
                    // svg += createVerticalConnection(x + 40, y + 40, cellHeight);
                    svg += createStart(x + shape_width, y + shape_height / 2, gap_horizontal - shape_width, prefix, row, col); 
                    svg += createEnd(x + gap_horizontal, y + shape_height / 2, gap_horizontal - shape_width, prefix, row + 1, col); 
                }

                if (row < rows - 2 && col < columns - 1) {
                    // Horizontal connection to the node to the right
                    svg += createConnection(x + gap_horizontal, y + shape_height / 2, cellHeight, prefix, row, col + 1);
                }
            }
        }

        // Close SVG
        svg += `</g>
            </svg>`;

        return svg;
    }

    function getShapeType(row, col, totalRows) {
        // Define a pattern for shapes
        // 0: terminal (oval)
        // 1: process (rectangle)
        // 2: decision (diamond)

        if (row === 0 || row === totalRows - 1) {
            return 0; // terminal nodes at top and bottom rows
        } else {
            return 1; // process nodes
        }
    }

    function createShape(x, y, height, shapeType, row, col, id) {
        let id2 = `${id}-${row}-${col}`;
        const opacity = (row + col) % 2 === 0 ? '1' : '1'; // Alternate opacity

        const rx = 5;
        const ry = 5;

        let shapeSvg = '';

        switch (shapeType) {
            case 0: // Terminal (oval)
                shapeSvg = `
                <g id="${id2}" stroke="#000000">
                    <rect x="${x}" y="${y + shape_height * 0.2}" width="${shape_width}" height="${shape_height * 0.6}" rx="${shape_height * 0.3}" ry="${shape_height * 0.3}" stroke-width="${stroke_width}" pointer-events="all" opacity="${opacity}" fill="none" stroke-dasharray="4"/>
                    <text id="${id2 + '-text'}" x="${x + shape_width / 2}" y="${y + shape_height - textSize * 0.95}" fill="${textColor}" stroke="none" text-anchor="middle">${(row == 0) ? start_tokens[col] : end_tokens[col]}</text>
                </g>`;
                break;

            case 1: // Process (rectangle)
                shapeSvg = `
                    <g id="${id2}" fill="#000000" stroke="#000000">
                    <rect x="${x}" y="${y}" width="${shape_width}" height="${shape_height}" rx="${rx}" ry="${ry}" stroke-width="${stroke_width}" pointer-events="all" opacity="${opacity}"/>`;

                if (notes != null) {
                    const note = notes[`${row},${col}`];
                    if (note != undefined) {
                        shapeSvg += `<text x="${x + shape_width / 2}" y="${y + shape_height - textSize * 0.95}" fill="${textColor}" stroke="none" font-style="italic" text-anchor="middle">${note}</text>`;
                    }
                }


                shapeSvg += "</g>";
                break;

            case 2: // Decision (diamond)
                shapeSvg = `
                    <path id="${id2}" d="M ${x + 40},${y} L ${x + 80},${y + 20} L ${x + 40},${y + 40} L ${x},${y + 20} Z" fill="#ffffff" stroke="#000000" stroke-width="2" stroke-miterlimit="10" pointer-events="all" opacity="${opacity}"/>`;
                break;

            default:
                return '';
        }

        // Return the shape without embedding event listeners
        return shapeSvg;
    }

    function createStart(x, y, height, id, row, col) {
        return `
            <path id="${id}-${row}-${col}-start" d="M ${x},${y} L ${x + height},${y}" stroke-width="${stroke_width}" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="stroke"/>`;
    }

    function createEnd(x, y, height, id, row, col) {
        return `
            <g id="${id}-${row}-${col}-end" fill="#000000" stroke="#000000">
            <path d="M ${x},${y} L ${x + height},${y}" stroke-miterlimit="10" stroke-width="${stroke_width}" pointer-events="stroke"/>
            <path d="M ${x + height},${y} L ${x + height - 7},${y - 3.5} L ${x + height - 5.37},${y} L ${x + height - 7},${y + 3.5} Z" stroke-miterlimit="10" pointer-events="all"/>
            </g>`;
    }

    function createConnection(x, y, width, id, row, col) {
        return `
            <g id="${id}-${row}-${col}-link" fill="#000000" stroke="#000000">
            <path  d="M ${x},${y} L ${x},${y + width/2} L ${x}, ${y + width}" stroke-width="${stroke_width}" stroke-miterlimit="10"/>
            <path  d="M ${x},${y + width / 2} L ${x - 3.5},${y + width/2 - 7} L ${x},${y + width/2 - 5.37} L ${x + 3.5},${y + width/2 - 7} Z" stroke-miterlimit="10" pointer-events="all"/>
            </g>`;

        //    return `
        //  <path d="M ${x},${y} L ${x + width - 40},${y}" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="strocalcColBoundsSnake
        }


    function highlightConnections(nodes) {
        if (prevNodes.length != rows) {
            prevNodes = new Array(rows).fill(0);
        }

        let [starts, stops] = bounds_func(nodes, prevNodes);

        // Update prevNodes to prepare for a future update.
        prevNodes = nodes.slice();

        // Reset all elements to default colors
        resetAllElements();

        for (let i = 0; i < nodes.length; i++) {
            let current = [];

            for (let j = starts[i]; j < stops[i]; j++) {
                current.push(j);

                let process = document.getElementById(`${container_id}-node-${i}-${j}`);
                if (process != null) {
                    process.style.fill = highlightColor;
                    process.style.stroke = highlightColor;

                    let text = document.getElementById(`${container_id}-node-${i}-${j}-text`);
                    if (text != null & i > 0 & !showFinalTokens) {
                        text.style.display = "block"; 
                    }
                }

                let end = document.getElementById(`${container_id}-node-${i}-${j}-end`);
                if (end != null) {
                    end.style.stroke = highlightColor;
                    end.style.fill = highlightColor;
                }

                let start = document.getElementById(`${container_id}-node-${i}-${j}-start`);
                if (start != null) {
                    start.style.stroke = highlightColor;
                }
            }

            for (j of current) {
                // only add a link between the previous ends and the 
                // current starts
                if (j > starts[i]) {
                    let link = document.getElementById(`${container_id}-node-${i}-${j}-link`);
                    if (link != null) {
                        link.style.stroke = highlightColor;
                        link.style.fill = highlightColor;
                    }
                    let link2 = document.getElementById(`${container_id}-node-${i-1}-${j}-link`);
                    if (link2 != null) {
                        link2.style.stroke = highlightColor;
                        link2.style.fill = highlightColor;
                    }
                }
            }
        }
    }

    function resetAllElements() {
        // Reset all nodes
        for (let row = 0; row < state.rows; row++) {
            for (let col = 0; col < state.columns; col++) {
                // Reset shape ${container_id}-nodes
                let process = document.getElementById(`${container_id}-node-${row}-${col}`);
                if (process != null) {
                    process.style.fill = backgroundColor;
                    process.style.stroke = backgroundColor;

                    let text = document.getElementById(`${container_id}-node-${row}-${col}-text`);
                    if (text != null & row > 0 & !showFinalTokens) {
                        text.style.display = "none"; 
                    }
                }

                // Reset vertical connections
                let start = document.getElementById(`${container_id}-node-${row}-${col}-start`);
                if (start != null) {
                    start.style.stroke = backgroundColor;
                }

                let end = document.getElementById(`${container_id}-node-${row}-${col}-end`);
                if (end != null) {
                    end.style.stroke = backgroundColor;
                    end.style.fill = backgroundColor;
                }

                // Reset horizontal connections
                let link = document.getElementById(`${container_id}-node-${row}-${col}-link`);
                if (link != null) {
                    link.style.stroke = backgroundColor;
                    link.style.fill = backgroundColor;
                }
            }
        }
    }

    highlightConnections(connections);

    return highlightConnections;

};


// Usage:
// 
//addFlowchart("flowchart", 5, 4, ["The"," cat"," sat"," on", " the"], [" 1970s","hedral"," on"," the", " mat"]);
