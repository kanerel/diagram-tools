export function parseDiagram(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    const model = doc.querySelector('mxGraphModel');
    if (!model) throw new Error('Cannot find mxGraphModel');

    const cellNodes = model.querySelectorAll('mxCell');
    const cells = [];
    const cellMap = {};

    cellNodes.forEach(node => {
        const id = node.getAttribute('id');
        const value = node.getAttribute('value') || '';
        const style = node.getAttribute('style') || '';
        const parentId = node.getAttribute('parent');
        const source = node.getAttribute('source');
        const target = node.getAttribute('target');
        const edge = node.getAttribute('edge') === '1';
        const vertex = node.getAttribute('vertex') === '1';

        // Read geometry from mxGeometry child element
        const geo = node.querySelector('mxGeometry');
        let x = 0, y = 0, w = 0, h = 0;
        if (geo) {
            x = parseFloat(geo.getAttribute('x')) || 0;
            y = parseFloat(geo.getAttribute('y')) || 0;
            w = parseFloat(geo.getAttribute('width')) || 0;
            h = parseFloat(geo.getAttribute('height')) || 0;
        }

        const cell = { id, value, style, parent: parentId, source, target, edge, vertex, x, y, w, h };
        cells.push(cell);
        cellMap[id] = cell;
    });

    // Resolve group positions - only if parent has 'group' style
    cells.forEach(c => {
        if (c.parent && c.parent !== '1' && cellMap[c.parent]) {
            const parent = cellMap[c.parent];
            if (parent.style && parent.style.indexOf('group') >= 0) {
                c.x += parent.x;
                c.y += parent.y;
            }
        }
    });

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    cells.forEach(c => {
        if (c.vertex && c.w > 0 && c.h > 0) {
            if (c.style.indexOf('group') >= 0) return;
            if (c.value === '') return;
            if (c.x < minX) minX = c.x;
            if (c.y < minY) minY = c.y;
            if (c.x + c.w > maxX) maxX = c.x + c.w;
            if (c.y + c.h > maxY) maxY = c.y + c.h;
        }
    });

    const padding = 40;
    const svgW = maxX - minX + padding * 2;
    const svgH = maxY - minY + padding * 2;
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;

    return { cells, cellMap, svgW, svgH, offsetX, offsetY };
}

export function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function drawioToSvg(xml) {
    const data = parseDiagram(xml);
    const cells = data.cells;
    const cellMap = data.cellMap;
    const svgW = data.svgW, svgH = data.svgH;
    const offsetX = data.offsetX, offsetY = data.offsetY;

    const parts = [];
    parts.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" style="user-select:none">');
    parts.push('<style>.draggable{cursor:move}.draggable:hover{opacity:0.85}</style>');
    parts.push('<g id="viewport">');
    parts.push('<rect width="' + svgW + '" height="' + svgH + '" fill="#ffffff"/>');

    // Draw edges
    for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        if (!c.edge || !c.source || !c.target) continue;
        const src = cellMap[c.source];
        const tgt = cellMap[c.target];
        if (!src || !tgt) continue;

        const srcCx = src.x + src.w / 2 + offsetX;
        const srcCy = src.y + src.h / 2 + offsetY;
        const tgtCx = tgt.x + tgt.w / 2 + offsetX;
        const tgtCy = tgt.y + tgt.h / 2 + offsetY;

        let strokeColor = '#000000';
        const strokeMatch = c.style.match(/strokeColor=([^;]+)/);
        if (strokeMatch) strokeColor = strokeMatch[1];

        parts.push('<line class="edge-line" data-source="' + c.source + '" data-target="' + c.target + '" x1="' + srcCx + '" y1="' + srcCy + '" x2="' + tgtCx + '" y2="' + tgtCy + '" stroke="' + strokeColor + '" stroke-width="1"/>');
    }

    // Draw vertices
    for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        if (!c.vertex || c.w === 0 || c.h === 0) continue;
        if (c.style.indexOf('group') >= 0) continue;
        if (c.value === '') continue;

        const cx = c.x + offsetX;
        const cy = c.y + offsetY;

        let fillColor = '#ffffff';
        let fontColor = '#000000';
        let fontSize = 20;
        let fontFamily = 'SimSun, "Songti SC", serif';

        const fillMatch = c.style.match(/fillColor=([^;]+)/);
        if (fillMatch) fillColor = fillMatch[1];
        const fontMatch = c.style.match(/fontColor=([^;]+)/);
        if (fontMatch) fontColor = fontMatch[1];
        const sizeMatch = c.style.match(/fontSize=(\d+)/);
        if (sizeMatch) fontSize = parseInt(sizeMatch[1]);
        const famMatch = c.style.match(/fontFamily=([^;]+)/);
        if (famMatch) fontFamily = famMatch[1];

        const isEllipse = c.style.indexOf('ellipse') >= 0;

        parts.push('<g class="draggable" data-cell-id="' + c.id + '">');
        if (isEllipse) {
            const ecx = cx + c.w / 2;
            const ecy = cy + c.h / 2;
            const rx = c.w / 2;
            const ry = c.h / 2;
            parts.push('<ellipse cx="' + ecx + '" cy="' + ecy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fillColor + '" stroke="#000000" stroke-width="1"/>');
            parts.push('<text x="' + ecx + '" y="' + ecy + '" text-anchor="middle" dominant-baseline="central" fill="' + fontColor + '" font-size="' + fontSize + '" font-family="' + fontFamily + '" pointer-events="none">' + escapeXml(c.value) + '</text>');
        } else {
            parts.push('<rect x="' + cx + '" y="' + cy + '" width="' + c.w + '" height="' + c.h + '" fill="' + fillColor + '" stroke="#000000" stroke-width="1"/>');
            parts.push('<text x="' + (cx + c.w / 2) + '" y="' + (cy + c.h / 2) + '" text-anchor="middle" dominant-baseline="central" fill="' + fontColor + '" font-size="' + fontSize + '" font-family="' + fontFamily + '" pointer-events="none">' + escapeXml(c.value) + '</text>');
        }
        parts.push('</g>');
    }

    parts.push('</g>');
    parts.push('</svg>');
    return { svgString: parts.join('\n'), diagramData: data };
}
