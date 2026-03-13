/**
 * Converts the editor state (nodes and links) to Mermaid graph syntax.
 */
export function stateToMermaid(nodes, links) {
    const LANE_WIDTH = 250;
    const SWIMLANES = [
        { id: "recon", title: "Reconnaitre" },
        { id: "enter", title: "Rentrer" },
        { id: "find",  title: "Trouver" },
        { id: "exploit", title: "Exploiter" }
    ];

    let output = 'graph TD\n';
    
    // Group nodes by swimlane
    SWIMLANES.forEach((lane, index) => {
        const laneNodes = nodes.filter(n => n.laneId === lane.id);

        if (laneNodes.length > 0) {
            output += `    subgraph ${lane.id} ["${lane.title}"]\n`;
            laneNodes.forEach(node => {
                output += `        ${node.id}["${node.text}"]\n`;
            });
            output += `    end\n`;
        }
    });

    // Add remaining nodes (if any)
    const assignedIds = new Set(nodes.map(n => n.id)); // Actually we filter above
    
    // Add links
    links.forEach(link => {
        const fromNode = nodes.find(n => n.id === link.fromId);
        const toNode = nodes.find(n => n.id === link.toId);
        
        if (fromNode && toNode) {
            output += `    ${link.fromId} --> ${link.toId}\n`;
        }
    });
    
    return output;
}
