/**
 * ER Diagram Generator
 * 用代码生成 drawio XML，替代模板文件
 * 
 * 布局规律（从15个模板中提取）：
 * - 中心矩形（表名）：180×50，位于 group 中心
 * - 椭圆节点（字段）：140×60，围绕中心均匀分布在圆上
 * - 半径 = 180 + N * 24（N = 字段数）
 * - 起始角度 = 180°（左侧），顺时针均匀分布
 * - 角度间隔 = 360° / N
 */

function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * 生成 drawio XML
 * @param {string} tableDisplay - 表显示名（用于中心节点）
 * @param {Array<{name: string, display: string}>} columns - 字段列表
 * @param {Object} [opts] - 可选样式参数
 * @param {number} [opts.rectW=180] - 矩形宽度
 * @param {number} [opts.rectH=50] - 矩形高度
 * @param {number} [opts.ellipseW=140] - 椭圆宽度
 * @param {number} [opts.ellipseH=60] - 椭圆高度
 * @param {number} [opts.radiusFactor=1] - 连接线长度倍率
 * @param {number} [opts.fontSize=20] - 字体大小
 * @returns {string} drawio XML 字符串
 */
export function generateDiagramXml(tableDisplay, columns, opts = {}) {
    const N = columns.length;
    const rectW = opts.rectW || 180;
    const rectH = opts.rectH || 50;
    const ellipseW = opts.ellipseW || 140;
    const ellipseH = opts.ellipseH || 60;
    const fontSize = opts.fontSize || 20;
    const radiusFactor = opts.radiusFactor || 1;

    // 计算半径：从模板数据拟合
    const radius = (180 + N * 24) * radiusFactor;

    // 中心矩形的中心点（椭圆围绕此点均匀分布）
    const cx = rectW / 2;  // 90
    const cy = rectH / 2;  // 25

    // 计算每个字段椭圆的位置
    const fields = [];
    for (let i = 0; i < N; i++) {
        // 角度：从 180° 开始，顺时针均匀分布
        const angleDeg = 180 + (360 / N) * i;
        const angleRad = angleDeg * Math.PI / 180;

        // 椭圆中心
        const ecx = cx + radius * Math.cos(angleRad);
        const ecy = cy - radius * Math.sin(angleRad);

        // 椭圆左上角
        const ex = ecx - ellipseW / 2;
        const ey = ecy - ellipseH / 2;

        fields.push({ x: ex, y: ey, display: columns[i].display });
    }

    // 计算 group 的边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const f of fields) {
        if (f.x < minX) minX = f.x;
        if (f.y < minY) minY = f.y;
        if (f.x + ellipseW > maxX) maxX = f.x + ellipseW;
        if (f.y + ellipseH > maxY) maxY = f.y + ellipseH;
    }
    // 也考虑中心矩形
    if (0 < minX) minX = 0;
    if (0 < minY) minY = 0;
    if (rectW > maxX) maxX = rectW;
    if (rectH > maxY) maxY = rectH;

    // 加 padding（椭圆边缘到 group 边缘至少 20px）
    const pad = 20;
    minX -= pad;
    minY -= pad;
    maxX += pad;
    maxY += pad;

    const groupW = maxX - minX;
    const groupH = maxY - minY;
    const groupX = 360;
    const groupY = 250;

    // 中心矩形相对于 group 的位置（矩形左上角在 0,0，所以只需减去 minX/minY 的偏移）
    const rectRelX = -minX;
    const rectRelY = -minY;

    // 椭圆相对于 group 的位置
    const fieldsRel = fields.map(f => ({
        x: f.x - minX,
        y: f.y - minY,
        display: f.display
    }));

    // 生成 XML
    const groupId = N + 3;
    const rectId = '2';
    let xml = '<mxfile><diagram id="ER-Diagram" name="ER Diagram"><mxGraphModel><root>';
    xml += '<mxCell id="0"/>';
    xml += '<mxCell id="1" parent="0"/>';

    // 边：从中心矩形到每个椭圆
    for (let i = 0; i < N; i++) {
        const edgeId = String(N + 4 + i);
        const targetId = String(3 + i);
        xml += `<mxCell id="${edgeId}" parent="1" edge="1" source="${rectId}" target="${targetId}" style="endArrow=none;html=1;strokeColor=#000000;strokeWidth=1;fontSize=${fontSize};fontFamily=SimSun, &quot;Songti SC&quot;, serif;fontColor=#000000;editable=1;labelBackgroundColor=none;labelPosition=right;align=left;spacingLeft=5;verticalAlign=middle;"><mxGeometry relative="1" as="geometry"><mxPoint as="offset" x="1" y="-1"/></mxGeometry></mxCell>`;
    }

    // Group 容器
    xml += `<mxCell id="${groupId}" parent="1" vertex="1" connectable="0" style="group;dropTarget=0;pointerEvents=0;"><mxGeometry x="${groupX}" y="${groupY}" width="${groupW}" height="${groupH}" as="geometry"/></mxCell>`;

    // 椭圆节点（字段）
    for (let i = 0; i < N; i++) {
        const f = fieldsRel[i];
        const cellId = String(3 + i);
        xml += `<mxCell id="${cellId}" parent="${groupId}" vertex="1" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;fontColor=#000000;fontSize=${fontSize};fontFamily=SimSun, &quot;Songti SC&quot;, serif;" value="${escapeXml(f.display)}"><mxGeometry x="${f.x}" y="${f.y}" width="${ellipseW}" height="${ellipseH}" as="geometry"/></mxCell>`;
    }

    // 中心矩形（表名）
    xml += `<mxCell id="${rectId}" parent="${groupId}" vertex="1" style="rounded=1;arcSize=0;whiteSpace=wrap;html=1;fillColor=#ffffff;fontColor=#000000;fontSize=${fontSize};fontFamily=SimSun, &quot;Songti SC&quot;, serif;" value="${escapeXml(tableDisplay)}"><mxGeometry x="${rectRelX}" y="${rectRelY}" width="${rectW}" height="${rectH}" as="geometry"/></mxCell>`;

    xml += '</root></mxGraphModel></diagram></mxfile>';
    return xml;
}
