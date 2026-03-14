import { stateToMermaid } from './mermaid-logic.js';

const GRID_SIZE = 20;
const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const LANE_WIDTH = 245;
const NODE_SPACING_V = 40; // Vertical spacing between nodes in a lane (aligned to GRID_SIZE)

const HEADER_HEIGHT = 40;

export class MermaidEditor {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            onScoreChange: options.onScoreChange || (() => { }),
            onDataChange: options.onDataChange || (() => { }),
            readOnly: options.readOnly || false,
            phases: options.phases || [],
            initialData: options.initialData || { nodes: [], links: [] }
        };

        // Configuration des swimlanes dynamiques (Plus de colonne Score interne)
        this.swimlanes = this.options.phases.map(p => ({
            id: `lane_${p.valeur || p.id}`,
            title: p.phase || p.title
        }));

        this.svg = container.querySelector('.canvas');
        if (this.svg) this.svg.setAttribute('height', '500');
        this.swimlanesLayer = container.querySelector('.swimlanes-layer');
        this.nodesLayer = container.querySelector('.nodes-layer');
        this.linksLayer = container.querySelector('.links-layer');
        this.scoresLayer = null; // Désactivé, le score est géré par l'application
        this.tempLayer = container.querySelector('.temp-layer');
        this.state = this.options.initialData;

        this.instanceId = `inst_${Math.random().toString(36).substr(2, 9)}`;

        this.dragState = { active: false, target: null, offset: { x: 0, y: 0 } };
        this.connectionState = { active: false, fromPort: null, tempLine: null };

        this.init();
    }

    init() {
        this.renderSwimlanes();

        // Fix uniquely identified marker for this instance to avoid collisions
        const marker = this.svg.querySelector('marker');
        if (marker) {
            marker.id = `arrowhead-${this.instanceId}`;
        }


        // Modal events
        this.modal = document.getElementById('node-modal');

        // Modal buttons (global elements, we attach per-instance but filter by editingNode)
        const btnSave = document.getElementById('modal-save');
        const btnCancel = document.getElementById('modal-cancel');

        if (btnSave) {
            btnSave.addEventListener('click', () => {
                if (this.editingNode) this.saveModal();
            });
        }
        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                if (this.editingNode) this.closeModal();
            });
        }

        this.svg.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.svg.addEventListener('mouseup', () => this.handleMouseUp());
        this.svg.addEventListener('click', (e) => {
            if (e.target === this.svg || e.target.tagName === 'rect' || e.target.classList.contains('grid-rect')) {
                if (this.connectionState.active) {
                    this.resetConnection();
                }
                this.selectedId = null;
                this.updateSelection();
            }
        });

        // Keydown needs careful handling for multiple instances. 
        // We'll attach it to the SVG or the container instead of window.
        this.container.tabIndex = 0; // Make container focusable
        this.container.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Clear button
        const btnClear = this.container.querySelector('.btn-clear-canvas');
        if (btnClear) {
            btnClear.onclick = () => this.clear();
        }

        // Snapshot button
        const btnSnapshot = this.container.querySelector('.btn-snapshot-canvas');
        if (btnSnapshot) {
            btnSnapshot.onclick = () => this.exportAsImage();
        }

        this.renderAll();
    }

    exportAsImage() {
        const svg = this.svg;
        const width = svg.width.baseVal.value;
        const height = svg.height.baseVal.value;

        // Clone SVG to modify it for export
        const clonedSvg = svg.cloneNode(true);
        
        // Define a dedicated stylesheet for export (Forces Light Mode)
        const exportStyles = `
            @import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600&display=swap');
            
            :root {
                --c-bg-app: #f4f0e6;
                --c-bg-panel: #eae5d9;
                --c-bg-input: #ffffff;
                --c-text-main: #2b1d14;
                --c-accent: #8b2b32;
                --c-border: #d0c8b6;
            }

            svg { 
                background-color: var(--c-bg-app); 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .swimlane-header-bg { fill: var(--c-bg-panel); stroke: var(--c-border); }
            .swimlane-title-svg { fill: var(--c-accent); font-size: 14px; font-weight: 600; text-transform: uppercase; }
            .swimlane-separator { stroke: var(--c-border); stroke-width: 1; display: block !important; }
            
            .node-rect { stroke-width: 2; rx: 4px; }
            .node-text { fill: var(--c-text-main); font-size: 14px; font-weight: 500; }
            .node-value-text { font-size: 10px; font-weight: bold; fill: rgba(0,0,0,0.5); }

            /* Node value colors */
            .val-1 { fill: #22c55e !important; stroke: #16a34a !important; }
            .val-2 { fill: #eab308 !important; stroke: #ca8a04 !important; }
            .val-3 { fill: #f97316 !important; stroke: #ea580c !important; }
            .val-4 { fill: #ef4444 !important; stroke: #dc2626 !important; }

            .link-path { fill: none; stroke: var(--c-accent); stroke-width: 2; }
            
            /* Hide UI elements */
            .btn-add-svg, .node-move-btn, .port, .btn-clear-canvas, .btn-snapshot-canvas, .grid-rect {
                display: none !important;
            }
        `;

        const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
        styleEl.textContent = exportStyles;
        clonedSvg.insertBefore(styleEl, clonedSvg.firstChild);

        // Serialize
        const serializer = new XMLSerializer();
        let svgData = serializer.serializeToString(clonedSvg);
        
        // Ensure the XML namespace is correct
        if(!svgData.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
            svgData = svgData.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            // Draw background Ivory
            ctx.fillStyle = "#f4f0e6";
            ctx.fillRect(0, 0, width, height);
            
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
            const link = document.createElement("a");
            link.download = `scenario_${this.instanceId}.jpg`;
            link.href = dataUrl;
            link.click();
        };
        img.src = url;
    }

    clear() {
        if (confirm("Voulez-vous vraiment effacer tout le dessin ?")) {
            this.state.nodes = [];
            this.state.links = [];
            this.selectedId = null;
            this.renderAll();
            this.options.onDataChange(this.state);
        }
    }

    renderAll() {
        this.nodesLayer.innerHTML = '';
        this.linksLayer.innerHTML = '';
        this.state.nodes.forEach(n => this.renderNode(n));
        this.renderLinks();
        this.updateMermaid();
    }

    renderSwimlanes() {
        this.swimlanesLayer.innerHTML = '';

        this.swimlanes.forEach((lane, index) => {
            const x = index * LANE_WIDTH;

            // Header BG
            const header = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            header.setAttribute("class", "swimlane-header-bg");
            header.setAttribute("x", x);
            header.setAttribute("y", 0);
            header.setAttribute("width", LANE_WIDTH);
            header.setAttribute("height", HEADER_HEIGHT);
            this.swimlanesLayer.appendChild(header);

            // Title
            const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
            title.setAttribute("class", "swimlane-title-svg");
            title.setAttribute("x", x + LANE_WIDTH / 2);
            title.setAttribute("y", HEADER_HEIGHT / 2);
            title.setAttribute("text-anchor", "middle");
            title.setAttribute("dominant-baseline", "middle");
            title.textContent = lane.title;
            this.swimlanesLayer.appendChild(title);

            // Button (+) - Only for interactive lanes
            if (!lane.isResult) {
                const btnGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                btnGroup.setAttribute("class", "btn-add-svg");
                btnGroup.style.cursor = "pointer";
                btnGroup.onclick = (e) => {
                    e.stopPropagation();
                    this.addNodeToLane(index);
                };

                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("class", "btn-add-svg-bg");
                circle.setAttribute("cx", x + LANE_WIDTH / 2);
                circle.setAttribute("cy", HEADER_HEIGHT + 25);
                circle.setAttribute("r", 14);

                const cross = document.createElementNS("http://www.w3.org/2000/svg", "text");
                cross.setAttribute("class", "btn-add-svg-text");
                cross.setAttribute("x", x + LANE_WIDTH / 2);
                cross.setAttribute("y", HEADER_HEIGHT + 26);
                cross.setAttribute("text-anchor", "middle");
                cross.setAttribute("dominant-baseline", "middle");
                cross.textContent = "+";

                btnGroup.appendChild(circle);
                btnGroup.appendChild(cross);
                this.swimlanesLayer.appendChild(btnGroup);
            }

            // Separator Line (except last one)
            if (index < this.swimlanes.length - 1) {
                const sep = document.createElementNS("http://www.w3.org/2000/svg", "line");
                sep.setAttribute("class", "swimlane-separator");
                sep.setAttribute("x1", x + LANE_WIDTH);
                sep.setAttribute("y1", 0);
                sep.setAttribute("x2", x + LANE_WIDTH);
                sep.setAttribute("y2", 2000);
                this.swimlanesLayer.appendChild(sep);
            }
        });

        this.svg.setAttribute('width', this.swimlanes.length * LANE_WIDTH);

        // Handle horizontal scrolling if many lanes
        if (this.swimlanes.length > 5) {
            this.container.querySelector('.canvas-container').style.overflowX = 'auto';
        }
    }

    addNodeToLane(laneIndex) {
        const lane = this.swimlanes[laneIndex];
        if (lane.isResult) return;

        // LTR : index 0 est à gauche
        const laneX = laneIndex * LANE_WIDTH;
        const centerX = laneX + LANE_WIDTH / 2 - NODE_WIDTH / 2;

        // Placement horizontal fixe au centre de la colonne (aligné sur la grille)
        const nx = Math.round(centerX / GRID_SIZE) * GRID_SIZE;

        // Calcul du Y : trouver le nœud le plus bas dans cette colonne
        const laneNodes = this.state.nodes.filter(n => n.laneId === lane.id);

        if (laneNodes.length >= 4) {
            alert("Limite atteinte : maximum 4 formes par étape.");
            return;
        }

        let ny = HEADER_HEIGHT + 60; // Offset relative to the new small header
        if (laneNodes.length > 0) {
            const lowest = Math.max(...laneNodes.map(n => n.y + n.height));
            ny = lowest + NODE_SPACING_V;
        }

        // Snap Y
        ny = Math.round(ny / GRID_SIZE) * GRID_SIZE;

        this.addNode(nx, ny, "Nouveau", 1, lane.id);
    }

    addNode(x, y, text = "Nouveau", value = 1, laneId = null) {
        const id = `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const node = { id, x, y, width: NODE_WIDTH, height: NODE_HEIGHT, text, value, laneId };
        this.state.nodes.push(node);
        this.renderNode(node);
        this.updateMermaid();
    }

    reorganizeLane(laneId, deletedY) {
        const shiftAmount = NODE_HEIGHT + NODE_SPACING_V;

        // Sélectionner tous les nœuds de la même colonne situés en dessous
        const nodesToShift = this.state.nodes.filter(n => n.laneId === laneId && n.y > deletedY);

        nodesToShift.forEach(node => {
            node.y -= shiftAmount;
            const el = document.getElementById(node.id);
            if (el) {
                el.setAttribute("transform", `translate(${node.x}, ${node.y})`);
            }
        });
    }

    moveNode(nodeId, direction) {
        const index = this.state.nodes.findIndex(n => n.id === nodeId);
        if (index === -1) return;

        const node = this.state.nodes[index];
        const laneNodes = this.state.nodes
            .filter(n => n.laneId === node.laneId)
            .sort((a, b) => a.y - b.y);

        const laneIndex = laneNodes.findIndex(n => n.id === nodeId);

        let targetIndex = -1;
        if (direction === 'up' && laneIndex > 0) {
            targetIndex = laneIndex - 1;
        } else if (direction === 'down' && laneIndex < laneNodes.length - 1) {
            targetIndex = laneIndex + 1;
        }

        if (targetIndex !== -1) {
            const targetNode = laneNodes[targetIndex];
            // Swap Y positions
            const tempY = node.y;
            node.y = targetNode.y;
            targetNode.y = tempY;

            // Update DOM
            document.getElementById(node.id).setAttribute("transform", `translate(${node.x}, ${node.y})`);
            document.getElementById(targetNode.id).setAttribute("transform", `translate(${targetNode.x}, ${targetNode.y})`);

            this.renderLinks();
            this.updateMermaid();
        }
    }

    renderNode(node) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("id", node.id);
        g.setAttribute("class", "node-group");
        g.setAttribute("transform", `translate(${node.x}, ${node.y})`);

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("class", `node-rect val-${node.value}`);
        rect.setAttribute("width", node.width);
        rect.setAttribute("height", node.height);

        const textArea = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textArea.setAttribute("class", "node-text");
        textArea.setAttribute("x", node.width / 2);
        textArea.setAttribute("y", node.height / 2);
        textArea.setAttribute("text-anchor", "middle");
        textArea.setAttribute("dominant-baseline", "central");
        textArea.textContent = node.text;

        const valText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        valText.setAttribute("class", "node-value-text");
        valText.setAttribute("x", node.width - 10);
        valText.setAttribute("y", node.height - 10);
        valText.setAttribute("text-anchor", "end");
        valText.textContent = node.value;

        g.appendChild(rect);
        g.appendChild(textArea);
        g.appendChild(valText);

        // Move Buttons (left side)
        const btnUp = document.createElementNS("http://www.w3.org/2000/svg", "path");
        btnUp.setAttribute("class", "node-move-btn");
        btnUp.setAttribute("d", "M -15 12 L -5 12 L -10 0 Z"); // Triangle up at the top
        btnUp.addEventListener('click', (e) => {
            e.stopPropagation();
            this.moveNode(node.id, 'up');
        });

        const btnDown = document.createElementNS("http://www.w3.org/2000/svg", "path");
        btnDown.setAttribute("class", "node-move-btn");
        btnDown.setAttribute("d", "M -15 48 L -5 48 L -10 60 Z"); // Triangle down at the bottom
        btnDown.addEventListener('click', (e) => {
            e.stopPropagation();
            this.moveNode(node.id, 'down');
        });

        g.appendChild(btnUp);
        g.appendChild(btnDown);

        // Connection Ports
        const ports = [
            { side: 'top', x: node.width / 2, y: 0 },
            { side: 'right', x: node.width, y: node.height / 2 },
            { side: 'bottom', x: node.width / 2, y: node.height },
            { side: 'left', x: 0, y: node.height / 2 }
        ];

        ports.forEach(p => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("class", "port");
            circle.setAttribute("cx", p.x);
            circle.setAttribute("cy", p.y);
            circle.setAttribute("r", 6); // Increased radius from 5 to 6
            circle.setAttribute("data-side", p.side);

            circle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.connectionState.active) {
                    this.endConnection(node.id, p);
                } else {
                    this.startConnection(node.id, p);
                }
            });

            g.appendChild(circle);
        });

        g.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.classList.contains('port')) return;
            this.selectedId = node.id;
            this.updateSelection();
        });

        // Drag disabled as per user request
        /* 
        g.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('port')) return;
            this.startDrag(e, node);
        });
        */

        g.addEventListener('dblclick', () => {
            this.openModal(node);
        });

        this.options.onDataChange(this.state);
        this.nodesLayer.appendChild(g);
    }

    openModal(node) {
        this.editingNode = node;
        const modal = document.getElementById('node-modal');
        const textInput = document.getElementById('modal-text');
        textInput.value = node.text;

        const radio = document.querySelector(`input[name="node-value"][value="${node.value}"]`);
        if (radio) radio.checked = true;

        modal.classList.remove('hidden');
        modal.classList.add('active');
        textInput.focus();
    }

    closeModal() {
        const modal = document.getElementById('node-modal');
        modal.classList.add('hidden');
        modal.classList.remove('active');
        this.editingNode = null;
    }

    saveModal() {
        if (!this.editingNode) return;

        const text = document.getElementById('modal-text').value;
        const value = parseInt(document.querySelector('input[name="node-value"]:checked')?.value || 1);

        this.editingNode.text = text;
        this.editingNode.value = value;

        // Update DOM
        const g = document.getElementById(this.editingNode.id);
        if (g) {
            const textEl = g.querySelector('.node-text');
            const valEl = g.querySelector('.node-value-text');
            const rect = g.querySelector('.node-rect');

            if (textEl) textEl.textContent = text;
            if (valEl) valEl.textContent = value;
            if (rect) {
                rect.setAttribute("class", `node-rect val-${value}`);
            }
        }

        this.updateMermaid();
        this.closeModal();
    }

    startDrag(e, node) {
        // Disabled
    }

    updateSelection() {
        document.querySelectorAll('.node-group').forEach(el => {
            el.classList.toggle('selected', el.id === this.selectedId);
        });
    }

    startConnection(nodeId, port) {
        this.connectionState.active = true;
        this.connectionState.fromPort = { nodeId, ...port };

        this.connectionState.tempLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.connectionState.tempLine.setAttribute("class", "link-path");
        this.connectionState.tempLine.setAttribute("stroke-dasharray", "5,5");
        this.connectionState.tempLine.style.markerEnd = `url(#arrowhead-${this.instanceId})`;
        this.tempLayer.appendChild(this.connectionState.tempLine);
    }

    endConnection(toId, toPort) {
        if (!this.connectionState.active) return;
        const from = this.connectionState.fromPort;

        if (from.nodeId !== toId) {
            // Check if link already exists
            const exists = this.state.links.some(l =>
                l.fromId === from.nodeId && l.toId === toId &&
                l.fromSide === from.side && l.toSide === toPort.side
            );

            if (!exists) {
                const link = {
                    id: `link_${Date.now()}`,
                    fromId: from.nodeId,
                    fromSide: from.side,
                    toId: toId,
                    toSide: toPort.side
                };
                this.state.links.push(link);
                this.renderLinks();
                this.updateMermaid();
            }
        }

        this.resetConnection();
    }

    resetConnection() {
        this.connectionState.active = false;
        this.connectionState.fromPort = null;
        if (this.connectionState.tempLine) {
            this.tempLayer.removeChild(this.connectionState.tempLine);
            this.connectionState.tempLine = null;
        }
    }

    handleMouseMove(e) {
        const rect = this.svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Drag is disabled, only connection logic remains
        if (this.connectionState.active) {
            const fromNode = this.state.nodes.find(n => n.id === this.connectionState.fromPort.nodeId);
            const startX = fromNode.x + this.connectionState.fromPort.x;
            const startY = fromNode.y + this.connectionState.fromPort.y;

            const path = this.calculateOrthogonalPath(
                { x: startX, y: startY, side: this.connectionState.fromPort.side },
                { x: mouseX, y: mouseY }
            );
            this.connectionState.tempLine.setAttribute("d", path);
        }
    }

    handleMouseUp() {
        if (this.dragState.active) {
            this.dragState.active = false;
            document.getElementById(this.dragState.target.id).classList.remove('dragging');
        }
    }

    calculateOrthogonalPath(start, end) {
        let path = `M ${start.x} ${start.y}`;
        const offset = 20;

        // Segment de sortie (P1)
        let p1 = { x: start.x, y: start.y };
        if (start.side === 'top') p1.y -= offset;
        else if (start.side === 'bottom') p1.y += offset;
        else if (start.side === 'left') p1.x -= offset;
        else if (start.side === 'right') p1.x += offset;

        // Segment d'entrée (P2)
        let p2 = { x: end.x, y: end.y };
        if (end.side) {
            if (end.side === 'top') p2.y -= offset;
            else if (end.side === 'bottom') p2.y += offset;
            else if (end.side === 'left') p2.x -= offset;
            else if (end.side === 'right') p2.x += offset;
        }

        path += ` L ${p1.x} ${p1.y}`;

        // Entre p1 et p2
        if (!end.side) {
            // Mode création de lien (souris)
            if (start.side === 'top' || start.side === 'bottom') {
                path += ` L ${p2.x} ${p1.y} L ${p2.x} ${p2.y}`;
            } else {
                path += ` L ${p1.x} ${p2.y} L ${p2.x} ${p2.y}`;
            }
        } else {
            // Mode rendu final (S -> P1 -> ... -> P2 -> E)
            if (start.side === 'left' || start.side === 'right') {
                if (end.side === 'left' || end.side === 'right') {
                    // S-shape horizontal
                    const midX = (p1.x + p2.x) / 2;
                    path += ` L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
                } else {
                    // L-shape simple
                    path += ` L ${p2.x} ${p1.y} L ${p2.x} ${p2.y}`;
                }
            } else {
                if (end.side === 'top' || end.side === 'bottom') {
                    // S-shape vertical
                    const midY = (p1.y + p2.y) / 2;
                    path += ` L ${p1.x} ${midY} L ${p2.x} ${midY} L ${p2.x} ${p2.y}`;
                } else {
                    // L-shape simple
                    path += ` L ${p1.x} ${p2.y} L ${p2.x} ${p2.y}`;
                }
            }
            path += ` L ${end.x} ${end.y}`;
        }

        return path;
    }

    renderLinks() {
        this.linksLayer.innerHTML = '';
        this.state.links.forEach((link, index) => {
            const fromNode = this.state.nodes.find(n => n.id === link.fromId);
            const toNode = this.state.nodes.find(n => n.id === link.toId);

            if (!fromNode || !toNode) return;

            const startPort = this.getPortCoords(fromNode, link.fromSide);
            const endPort = this.getPortCoords(toNode, link.toSide);

            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("class", "link-group");

            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("class", "link-path");
            pathEl.style.markerEnd = `url(#arrowhead-${this.instanceId})`;

            const d = this.calculateOrthogonalPath(
                { ...startPort, side: link.fromSide },
                { ...endPort, side: link.toSide }
            );

            pathEl.setAttribute("d", d);

            // Invisible wide path for easier clicking/selection/deletion
            const hitPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            hitPath.setAttribute("d", d);
            hitPath.setAttribute("fill", "none");
            hitPath.setAttribute("stroke", "transparent");
            hitPath.setAttribute("stroke-width", "15");
            hitPath.style.cursor = "pointer";

            hitPath.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.state.links.splice(index, 1);
                this.renderLinks();
                this.updateMermaid();
            });

            g.appendChild(pathEl);
            g.appendChild(hitPath);
            this.linksLayer.appendChild(g);
        });
    }

    getPortCoords(node, side) {
        switch (side) {
            case 'top': return { x: node.x + node.width / 2, y: node.y };
            case 'right': return { x: node.x + node.width, y: node.y + node.height / 2 };
            case 'bottom': return { x: node.x + node.width / 2, y: node.y + node.height };
            case 'left': return { x: node.x, y: node.y + node.height / 2 };
        }
    }

    updateMermaid() {
        if (this.outputArea) {
            this.outputArea.value = stateToMermaid(this.state.nodes, this.state.links);
        }
        this.calculateTotalScore();
        this.options.onDataChange(this.state);
    }

    calculateTotalScore() {
        const exploitLane = this.swimlanes[this.swimlanes.length - 1];
        if (!exploitLane) return;

        const exploitNodes = this.state.nodes.filter(n => n.laneId === exploitLane.id);
        let maxScore = 0;

        exploitNodes.forEach(node => {
            const finalScore = this.getNodeScore(node);
            if (finalScore !== null && finalScore > maxScore) {
                maxScore = finalScore;
            }
        });

        if (maxScore > 0) {
            this.options.onScoreChange(maxScore);
        }
    }
    getNodeScore(startNode) {
        const paths = [];
        this.explorePathsBackwards(startNode, startNode.value, paths);

        if (paths.length === 0) return null;

        // Le score final est le MAXIMUM des résultats de chaque chemin
        return Math.max(...paths);
    }

    explorePathsBackwards(currentNode, currentMin, results, depth = 0) {
        const incomingLinks = this.state.links.filter(l => l.toId === currentNode.id);
        const newMin = Math.min(currentMin, currentNode.value);

        if (incomingLinks.length === 0) {
            results.push(newMin);
            return;
        }

        incomingLinks.forEach(link => {
            const prevNode = this.state.nodes.find(n => n.id === link.fromId);
            if (prevNode) {
                this.explorePathsBackwards(prevNode, newMin, results, depth + 1);
            } else {
                results.push(newMin);
            }
        });
    }

    renderScoreCircle(cx, cy, value) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", `score-circle val-${value}`);
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", 20);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("class", "score-text");
        text.setAttribute("x", cx);
        text.setAttribute("y", cy);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.textContent = value;

        g.appendChild(circle);
        g.appendChild(text);
        this.scoresLayer.appendChild(g);
    }
    handleKeyDown(e) {
        // Check if user is typing in an input or textarea
        const target = e.target;
        const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

        if (e.key === 'Escape') {
            if (this.connectionState.active) {
                this.resetConnection();
            } else {
                this.selectedId = null;
                this.updateSelection();
            }
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.selectedId && !isTyping) {
                e.preventDefault();
                const index = this.state.nodes.findIndex(n => n.id === this.selectedId);
                if (index !== -1) {
                    const nodeToDelete = this.state.nodes[index];
                    const laneId = nodeToDelete.laneId;
                    const deletedY = nodeToDelete.y;

                    this.state.nodes.splice(index, 1);
                    if (laneId) this.reorganizeLane(laneId, deletedY);

                    this.state.links = this.state.links.filter(l =>
                        l.fromId !== this.selectedId && l.toId !== this.selectedId
                    );
                    const el = this.container.querySelector(`#${this.selectedId}`);
                    if (el) el.remove();
                    this.selectedId = null;
                    this.renderLinks();
                    this.updateMermaid();
                }
            }
        }
    }

    getData() {
        return this.state;
    }

    static createEditorMarkup() {
        return `
            <div class="editor-main">
                <div class="canvas-container" style="flex: 1; width: 100%;">
                    <svg class="canvas">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-color)" />
                            </marker>
                        </defs>
                        <g class="swimlanes-layer"></g>
                        <g class="links-layer"></g>
                        <g class="nodes-layer"></g>
                        <g class="scores-layer"></g>
                        <g class="temp-layer"></g>
                    </svg>
                    <button class="btn-snapshot-canvas" title="Exporter en JPEG">📷</button>
                    <button class="btn-clear-canvas" title="Effacer tout le dessin">🗑️</button>
                </div>
            </div>
        `;
    }
}
