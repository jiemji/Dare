import { stateToMermaid } from './mermaid-logic.js';

const GRID_SIZE = 20;
const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const SWIMLANES = [
    { id: "recon", title: "Reconnaitre" },
    { id: "enter", title: "Rentrer" },
    { id: "find",  title: "Trouver" },
    { id: "exploit", title: "Exploiter" },
    { id: "score", title: "Score", isResult: true }
];
const LANE_WIDTH = 250;
const NODE_SPACING_V = 30; // Vertical spacing between nodes in a lane

const HEADER_HEIGHT = 80;

class MermaidEditor {
    constructor() {
        this.svg = document.getElementById('canvas');
        this.swimlanesLayer = document.getElementById('swimlanes-layer');
        this.nodesLayer = document.getElementById('nodes-layer');
        this.linksLayer = document.getElementById('links-layer');
        this.scoresLayer = document.getElementById('scores-layer');
        this.tempLayer = document.getElementById('temp-layer');
        this.outputArea = document.getElementById('mermaid-output');
        
        this.state = {
            nodes: [],
            links: []
        };
        
        this.dragState = {
            active: false,
            target: null,
            offset: { x: 0, y: 0 }
        };
        
        this.connectionState = {
            active: false,
            fromPort: null,
            tempLine: null
        };

        this.init();
    }

    init() {
        this.renderSwimlanes();
        document.getElementById('clear-canvas').addEventListener('click', () => this.clear());
        document.getElementById('copy-mermaid').addEventListener('click', () => this.copyToClipboard());
        
        // Modal events
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-save').addEventListener('click', () => this.saveModal());

        this.svg.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.svg.addEventListener('mouseup', () => this.handleMouseUp());
        this.svg.addEventListener('click', (e) => {
            if (e.target === this.svg || e.target.id === 'grid-large' || e.target.tagName === 'rect') {
                if (this.connectionState.active) {
                    this.resetConnection();
                }
                this.selectedId = null;
                this.updateSelection();
            }
        });
        
        this.updateMermaid();
    }

    renderSwimlanes() {
        this.swimlanesLayer.innerHTML = '';
        
        SWIMLANES.forEach((lane, index) => {
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
            title.setAttribute("y", 30);
            title.setAttribute("text-anchor", "middle");
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
                circle.setAttribute("cy", 55);
                circle.setAttribute("r", 14);
                
                const cross = document.createElementNS("http://www.w3.org/2000/svg", "text");
                cross.setAttribute("class", "btn-add-svg-text");
                cross.setAttribute("x", x + LANE_WIDTH / 2);
                cross.setAttribute("y", 56);
                cross.setAttribute("text-anchor", "middle");
                cross.setAttribute("dominant-baseline", "middle");
                cross.textContent = "+";

                btnGroup.appendChild(circle);
                btnGroup.appendChild(cross);
                this.swimlanesLayer.appendChild(btnGroup);
            }

            // Separator Line (except last one)
            if (index < SWIMLANES.length - 1) {
                const sep = document.createElementNS("http://www.w3.org/2000/svg", "line");
                sep.setAttribute("class", "swimlane-separator");
                sep.setAttribute("x1", x + LANE_WIDTH);
                sep.setAttribute("y1", 0);
                sep.setAttribute("x2", x + LANE_WIDTH);
                sep.setAttribute("y2", 2000);
                this.swimlanesLayer.appendChild(sep);
            }
        });

        this.svg.setAttribute('width', SWIMLANES.length * LANE_WIDTH);
    }

    addNodeToLane(laneIndex) {
        const lane = SWIMLANES[laneIndex];
        if (lane.isResult) return; // Cannot add nodes to result lane
        
        // LTR : index 0 est à gauche
        const laneX = laneIndex * LANE_WIDTH;
        const centerX = laneX + LANE_WIDTH / 2 - NODE_WIDTH / 2;
        
        // Placement horizontal fixe au centre de la colonne (aligné sur la grille)
        const nx = Math.round(centerX / GRID_SIZE) * GRID_SIZE;
        
        // Calcul du Y : trouver le nœud le plus bas dans cette colonne
        const laneNodes = this.state.nodes.filter(n => n.laneId === lane.id);

        let ny = HEADER_HEIGHT + 20; // Offset initial sous l'en-tête
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

        this.nodesLayer.appendChild(g);
    }

    openModal(node) {
        this.editingNode = node;
        const modal = document.getElementById('node-modal');
        const textInput = document.getElementById('modal-text');
        textInput.value = node.text;
        
        const radio = document.querySelector(`input[name="node-value"][value="${node.value}"]`);
        if (radio) radio.checked = true;

        modal.classList.add('active');
        textInput.focus();
    }

    closeModal() {
        document.getElementById('node-modal').classList.remove('active');
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

        // Better orthogonal routing: move out from side first
        let p1 = { x: start.x, y: start.y };
        if (start.side === 'top') p1.y -= offset;
        else if (start.side === 'bottom') p1.y += offset;
        else if (start.side === 'left') p1.x -= offset;
        else if (start.side === 'right') p1.x += offset;

        path += ` L ${p1.x} ${p1.y}`;

        // Then go to end
        if (start.side === 'top' || start.side === 'bottom') {
            path += ` L ${end.x} ${p1.y} L ${end.x} ${end.y}`;
        } else {
            path += ` L ${p1.x} ${end.y} L ${end.x} ${end.y}`;
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
            
            const d = this.calculateOrthogonalPath(
                { ...startPort, side: link.fromSide },
                endPort
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
        this.outputArea.value = stateToMermaid(this.state.nodes, this.state.links);
        // Force un léger délai pour s'assurer que l'état est stable (optionnel mais plus sûr)
        setTimeout(() => this.calculateAndRenderScores(), 0);
    }

    calculateAndRenderScores() {
        this.scoresLayer.innerHTML = '';
        
        // On cherche les nœuds dans la swimlane "exploit"
        const exploitNodes = this.state.nodes.filter(n => n.laneId === 'exploit');
        const scoreLaneIndex = SWIMLANES.findIndex(l => l.id === 'score');
        const scoreX = scoreLaneIndex * LANE_WIDTH + LANE_WIDTH / 2;

        exploitNodes.forEach(node => {
            const finalScore = this.getNodeScore(node);
            
            if (finalScore !== null) {
                this.renderScoreCircle(scoreX, node.y + NODE_HEIGHT / 2, finalScore);
            }
        });
    }

    getNodeScore(startNode) {
        const paths = [];
        this.explorePathsBackwards(startNode, startNode.value, paths);
        
        if (paths.length === 0) return null;
        
        // Le score final est le MAXIMUM des résultats de chaque chemin
        return Math.max(...paths);
    }

    explorePathsBackwards(currentNode, currentMin, results) {
        const incomingLinks = this.state.links.filter(l => l.toId === currentNode.id);
        const newMin = Math.min(currentMin, currentNode.value);

        if (incomingLinks.length === 0) {
            // Fin d'un chemin à rebours
            results.push(newMin);
            return;
        }

        incomingLinks.forEach(link => {
            const prevNode = this.state.nodes.find(n => n.id === link.fromId);
            if (prevNode) {
                this.explorePathsBackwards(prevNode, newMin, results);
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

    clear() {
        this.state.nodes = [];
        this.state.links = [];
        this.nodesLayer.innerHTML = '';
        this.linksLayer.innerHTML = '';
        this.updateMermaid();
    }

    copyToClipboard() {
        this.outputArea.select();
        document.execCommand('copy');
        alert("Copié dans le presse-papier !");
    }
}

// Add Keyboard handler for delete
window.addEventListener('keydown', (e) => {
    const editor = window.mermaidEditor;
    if (!editor) return;

    // Check if user is typing in an input or textarea
    const target = e.target;
    const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    if (e.key === 'Escape') {
        if (editor.connectionState.active) {
            editor.resetConnection();
        } else {
            editor.selectedId = null;
            editor.updateSelection();
        }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only delete if NOT typing in an input field
        if (editor.selectedId && !isTyping) {
            e.preventDefault(); // Prevent accidental navigation or character removal
            const index = editor.state.nodes.findIndex(n => n.id === editor.selectedId);
            if (index !== -1) {
                const nodeToDelete = editor.state.nodes[index];
                const laneId = nodeToDelete.laneId;
                const deletedY = nodeToDelete.y;

                // Remove node
                editor.state.nodes.splice(index, 1);
                
                // Reorganize lane
                if (laneId) {
                    editor.reorganizeLane(laneId, deletedY);
                }

                // Remove associated links
                editor.state.links = editor.state.links.filter(l => 
                    l.fromId !== editor.selectedId && l.toId !== editor.selectedId
                );
                const el = document.getElementById(editor.selectedId);
                if (el) el.remove();
                editor.selectedId = null;
                editor.renderLinks();
                editor.updateMermaid();
            }
        }
    }
});

window.mermaidEditor = new MermaidEditor();
