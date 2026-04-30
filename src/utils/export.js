import JSZip from 'jszip';

export function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Parse style attributes from drawio style string
function parseStyle(style) {
    const result = { fillColor: '#ffffff', fontColor: '#000000', fontSize: 20, fontFamily: 'SimSun, "Songti SC", serif', strokeColor: '#000000' };
    const fillMatch = style.match(/fillColor=([^;]+)/);
    if (fillMatch) result.fillColor = fillMatch[1];
    const fontMatch = style.match(/fontColor=([^;]+)/);
    if (fontMatch) result.fontColor = fontMatch[1];
    const sizeMatch = style.match(/fontSize=(\d+)/);
    if (sizeMatch) result.fontSize = parseInt(sizeMatch[1]);
    const famMatch = style.match(/fontFamily=([^;]+)/);
    if (famMatch) result.fontFamily = famMatch[1];
    const strokeMatch = style.match(/strokeColor=([^;]+)/);
    if (strokeMatch) result.strokeColor = strokeMatch[1];
    return result;
}

export function renderToCanvas(diagramData) {
    const scale = 3;
    const canvas = document.createElement('canvas');
    canvas.width = diagramData.svgW * scale;
    canvas.height = diagramData.svgH * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Draw edges
    diagramData.cells.forEach(cell => {
        if (cell.edge && cell.source && cell.target) {
            const src = diagramData.cellMap[cell.source];
            const tgt = diagramData.cellMap[cell.target];
            if (src && tgt) {
                const edgeStyle = parseStyle(cell.style);
                ctx.beginPath();
                ctx.moveTo(src.x + src.w / 2 + diagramData.offsetX, src.y + src.h / 2 + diagramData.offsetY);
                ctx.lineTo(tgt.x + tgt.w / 2 + diagramData.offsetX, tgt.y + tgt.h / 2 + diagramData.offsetY);
                ctx.strokeStyle = edgeStyle.strokeColor;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    });

    // Draw vertices
    diagramData.cells.forEach(cell => {
        if (cell.vertex && cell.w > 0 && cell.h > 0) {
            if (cell.style.indexOf('group') >= 0) return;
            if (cell.value === '') return;
            const cx = cell.x + diagramData.offsetX;
            const cy = cell.y + diagramData.offsetY;
            const isEllipse = cell.style.includes('ellipse');
            const s = parseStyle(cell.style);

            if (isEllipse) {
                ctx.beginPath();
                ctx.ellipse(cx + cell.w / 2, cy + cell.h / 2, cell.w / 2, cell.h / 2, 0, 0, Math.PI * 2);
                ctx.fillStyle = s.fillColor;
                ctx.fill();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = s.fontColor;
                ctx.font = s.fontSize + 'px ' + s.fontFamily;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cell.value, cx + cell.w / 2, cy + cell.h / 2);
            } else {
                ctx.beginPath();
                ctx.rect(cx, cy, cell.w, cell.h);
                ctx.fillStyle = s.fillColor;
                ctx.fill();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = s.fontColor;
                ctx.font = s.fontSize + 'px ' + s.fontFamily;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cell.value, cx + cell.w / 2, cy + cell.h / 2);
            }
        }
    });

    return canvas;
}

export function canvasToBlob(canvas) {
    return new Promise((resolve) => {
        canvas.toBlob(blob => resolve(blob), 'image/png');
    });
}

export async function exportPNG(diagram, tableName) {
    if (!diagram || !diagram.diagramData) return;
    const canvas = renderToCanvas(diagram.diagramData);
    const blob = await canvasToBlob(canvas);
    downloadFile(tableName + '.png', blob, 'image/png');
}

export function exportSVG(diagram, tableName) {
    if (!diagram || !diagram.svgString) return;
    downloadFile(tableName + '.svg', diagram.svgString, 'image/svg+xml');
}

export function exportDrawio(diagram, tableName) {
    if (!diagram || !diagram.xml) return;
    downloadFile(tableName + '.drawio', diagram.xml, 'application/xml');
}

export async function exportAll(diagrams) {
    const zip = new JSZip();
    const folder = zip.folder('er-diagrams');

    for (const d of diagrams) {
        if (!d || !d.diagramData) continue;
        const name = d.fileName || d.tableName || 'table';

        if (d.xml) folder.file(name + '.drawio', d.xml);
        if (d.svgString) folder.file(name + '.svg', d.svgString);

        const canvas = renderToCanvas(d.diagramData);
        const blob = await canvasToBlob(canvas);
        folder.file(name + '.png', blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile('er-diagrams.zip', content, 'application/zip');
}

export async function exportAllDrawio(diagrams) {
    const zip = new JSZip();
    const folder = zip.folder('er-diagrams');
    for (const d of diagrams) {
        if (d && d.xml) folder.file((d.fileName || d.tableName || 'table') + '.drawio', d.xml);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile('er-diagrams-drawio.zip', content, 'application/zip');
}

export async function exportAllPNG(diagrams) {
    const zip = new JSZip();
    const folder = zip.folder('er-diagrams');
    for (const d of diagrams) {
        if (d && d.diagramData) {
            const canvas = renderToCanvas(d.diagramData);
            const blob = await canvasToBlob(canvas);
            folder.file((d.fileName || d.tableName || 'table') + '.png', blob);
        }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile('er-diagrams-png.zip', content, 'application/zip');
}

export async function exportAllSVG(diagrams) {
    const zip = new JSZip();
    const folder = zip.folder('er-diagrams');
    for (const d of diagrams) {
        if (d && d.svgString) folder.file((d.fileName || d.tableName || 'table') + '.svg', d.svgString);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile('er-diagrams-svg.zip', content, 'application/zip');
}
