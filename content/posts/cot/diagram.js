// FlowchartGenerator.js - Vanilla JavaScript implementation
document.addEventListener('DOMContentLoaded', function() {
    const cellWidth = 120;
    const cellHeight = 100;
    const shape_height = 40;
    const shape_width = 80;
    const init_cols = 4;
    const init_rows = 4;

    let connections = new Array(init_rows).fill(1);
    let prevNodes = connections.slice();

    function getXY(row, col) {
        const x = col * cellWidth + shape_width / 2; 
        const y = row * cellHeight + shape_height / 2;
        return [x, y];
    } 

    // Initial state
    const state = {
        svgCode: '',
        rows: init_rows,
        columns: init_cols
    };

    // Get DOM elements
    const rowsInput = document.getElementById('rows-input');
    const columnsInput = document.getElementById('columns-input');
    const previewContainer = document.getElementById('preview-container');

    // Initialize UI
    rowsInput.value = state.rows;
    columnsInput.value = state.columns;

    // Event listeners
    rowsInput.addEventListener('change', function(e) {
        state.rows = Math.max(2, Math.min(10, parseInt(e.target.value) || 2));
        rowsInput.value = state.rows;
        connections = new Array(state.rows).fill(0);
        generateFlowchart();
        highlightConnections(connections);
    });

    columnsInput.addEventListener('change', function(e) {
        state.columns = Math.max(2, Math.min(10, parseInt(e.target.value) || 2));
        columnsInput.value = state.columns;
        generateFlowchart();
        highlightConnections(connections);
    });

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
        setTimeout(attachEventListeners, 100);
    }

    function attachEventListeners() {
        for (let row = 0; row < state.rows; row++) {
            for (let col = 0; col < state.columns; col++) {
                const element = document.getElementById(`node-${row}-${col}`);
                if (element) {
                    element.addEventListener('mouseover', function() {
                        connections[row] = col + 1;
                        highlightConnections(connections);
                    });
                }
            }
        }
    }

    function createFlowchartSvg(rows, columns) {
        // SVG dimensions

        const width = columns * cellWidth;
        const height = rows * cellHeight;

        // SVG header and style
        let svg = `<?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
            <svg xmlns="http://www.w3.org/2000/svg" style="background: #ffffff;" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${width}" height="${height}" viewBox="-0.5 -0.5 ${width} ${height}">
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
                const gap_centre = (shape_height + cellHeight) / 2;
                // Add node
                const id = `node`;

                svg += createShape(x, y, height, shapeType, row, col, id);

                // Add connections
                if (row < rows - 1) {
                    // Vertical connection to the node below
                    // svg += createVerticalConnection(x + 40, y + 40, cellHeight);
                    svg += createVerticalStart(x + shape_width / 2, y + shape_height, gap_centre - shape_height, id, row, col); 
                    svg += createVerticalEnd(x + shape_width / 2, y + gap_centre, gap_centre - shape_height, id, row + 1, col); 
                }

                if (row < rows - 1 && col < columns - 1) {
                    // Horizontal connection to the node to the right
                    svg += createHorizontalConnection(x + shape_width / 2, y + gap_centre, cellWidth, id, row, col + 1);
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
                    <path id="${id2}" d="M ${x},${y + 20} C ${x},${y + 8.95} ${x + 11.96},${y} ${x + 25.49},${y} L ${x + 54.51},${y} C ${x + 68.04},${y} ${x + 80},${y + 8.95} ${x + 80},${y + 20} C ${x + 80},${y + 31.05} ${x + 68.04},${y + 40} ${x + 54.51},${y + 40} L ${x + 25.49},${y + 40} C ${x + 11.96},${y + 40} ${x},${y + 31.05} ${x},${y + 20} Z" fill="#ffffff" stroke="#000000" stroke-width="2" stroke-miterlimit="10" pointer-events="all" opacity="${opacity}"/>`;
                break;

            case 1: // Process (rectangle)
                shapeSvg = `
                    <g id="${id2}" fill="#000000" stroke="#000000">
                    <rect x="${x}" y="${y}" width="80" height="40" rx="${rx}" ry="${ry}" stroke-width="2" pointer-events="all" opacity="${opacity}"/>
                    </g>`;
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

    function createVerticalStart(x, y, height, id, row, col) {
        return `
            <path id="${id}-${row}-${col}-start" d="M ${x},${y} L ${x},${y + height}" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="stroke"/>`;
    }

    function createVerticalEnd(x, y, height, id, row, col) {
        return `
            <g id="${id}-${row}-${col}-end" fill="#000000" stroke="#000000">
            <path d="M ${x},${y} L ${x},${y + height}" stroke-miterlimit="10" pointer-events="stroke"/>
            <path d="M ${x},${y + height} L ${x - 3.5},${y + height - 7} L ${x},${y + height - 5.37} L ${x + 3.5},${y + height - 7} Z" stroke-miterlimit="10" pointer-events="all"/>
            </g>`;
    }

    function createHorizontalConnection(x, y, width, id, row, col) {
        return `
            <g id="${id}-${row}-${col}-link" fill="#000000" stroke="#000000">
            <path  d="M ${x},${y} L ${x + width/2},${y} L ${x + width}, ${y}"  stroke-miterlimit="10"/>
            <path  d="M ${x + width/2},${y} L ${x + width/2 - 7},${y - 3.5} L ${x + width/2 - 5.37},${y} L ${x + width/2 - 7},${y + 3.5} Z" stroke-miterlimit="10" pointer-events="all"/>
            </g>`;

        //    return `
        //  <path d="M ${x},${y} L ${x + width - 40},${y}" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="stroke"/>
    }


    function highlightConnections(nodes) {
        cols = Number(document.getElementById("columns-input").value);
        rows = Number(document.getElementById("rows-input").value);

        if (prevNodes.length != rows) {
            prevNodes = new Array(rows).fill(0);
        }


        // The token nodes (input/output) just follow the internal
        // process nodes.
        nodes[nodes.length -1] = nodes[nodes.length - 2];
        prevNodes[nodes.length - 1] = nodes[nodes.length - 2];

        console.log(prevNodes, nodes);

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

        prevNodes = nodes.slice();


        // Reset all elements to default colors
        resetAllElements();

        let previous = [0];

        console.log("---------");
        for (let i = 0; i < nodes.length; i++) {
            let current = [];

            let stopCol, startCol;      
            if (i < 1) {
                startCol = 0
                stopCol = nodes[0];

            } else {
                startCol = Math.max(nodes[i - 1] - 1, 0); 
                stopCol = nodes[i]; 
            }

            for (let j = startCol; j < stopCol; j++) {
                current.push(j);

                let process = document.getElementById(`node-${i}-${j}`);
                if (process != null) {
                    process.style.fill = "red";
                    process.style.stroke = "red";
                }

                let end = document.getElementById(`node-${i}-${j}-end`);
                if (end != null) {
                    end.style.stroke = "red";
                    end.style.fill = "red";
                }

                let start = document.getElementById(`node-${i}-${j}-start`);
                if (start != null) {
                    start.style.stroke = "red";
                }
            }

            let links = current;

            for (j of links) {
                // only add a link between the previous ends and the 
                // current starts
                if (j > startCol) {
                    let link = document.getElementById(`node-${i}-${j}-link`);
                    if (link != null) {
                        link.style.stroke = "red";
                        link.style.fill = "red";
                    }
                    let link2 = document.getElementById(`node-${i-1}-${j}-link`);
                    if (link2 != null) {
                        link2.style.stroke = "red";
                        link2.style.fill = "red";
                    }
                }
            }

            previous = current;
        }
    }

    function resetAllElements() {
        // Reset all nodes
        for (let row = 0; row < state.rows; row++) {
            for (let col = 0; col < state.columns; col++) {
                // Reset shape nodes
                let process = document.getElementById(`node-${row}-${col}`);
                if (process != null) {
                    process.style.fill = "#ffffff";
                    process.style.stroke = "#000000";
                }

                // Reset vertical connections
                let start = document.getElementById(`node-${row}-${col}-start`);
                if (start != null) {
                    start.style.stroke = "#000000";
                }

                let end = document.getElementById(`node-${row}-${col}-end`);
                if (end != null) {
                    end.style.stroke = "#000000";
                    end.style.fill = "#000000";
                }

                // Reset horizontal connections
                let link = document.getElementById(`node-${row}-${col}-link`);
                if (link != null) {
                    link.style.stroke = "#000000";
                    link.style.fill = "#000000";
                }
            }
        }
    }

    highlightConnections(connections);

});


