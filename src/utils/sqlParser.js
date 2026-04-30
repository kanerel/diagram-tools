// SQL Parser - 解析 CREATE TABLE 语句

export function splitCreateTables(sql) {
    var normalized = sql.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    normalized = normalized.replace(/--[^\n]*/g, '');
    normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
    var parts = [];
    var regex = /CREATE\s+TABLE\s/gi;
    var match;
    var lastIndex = 0;
    while ((match = regex.exec(normalized)) !== null) {
        if (match.index > lastIndex) {
            // skip content before CREATE TABLE
        }
        lastIndex = match.index;
    }
    // Find all CREATE TABLE positions
    var positions = [];
    regex.lastIndex = 0;
    while ((match = regex.exec(normalized)) !== null) {
        positions.push(match.index);
    }
    for (var i = 0; i < positions.length; i++) {
        var start = positions[i];
        var end = (i + 1 < positions.length) ? positions[i + 1] : normalized.length;
        parts.push(normalized.substring(start, end).trim());
    }
    return parts;
}

export function parseCreateTable(sql) {
    // Extract table name
    var nameMatch = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`([^`]+)`|"([^"]+)"|(\w+))/i);
    var tableName = nameMatch ? (nameMatch[1] || nameMatch[2] || nameMatch[3]) : 'unknown';

    // Extract columns between parentheses
    var parenMatch = sql.match(/\(([\s\S]*)\)\s*(?:ENGINE|DEFAULT|CHARSET|COLLATE|AUTO_INCREMENT|COMMENT|WITH|TABLESPACE|UNION|^\))/i);
    var columnsStr = parenMatch ? parenMatch[1] : '';

    // Extract table comment from options after closing paren
    var afterParen = sql.substring(sql.lastIndexOf(')') + 1);
    var commentMatch = afterParen.match(/COMMENT\s*=?\s*'([^']*)'/i);
    var tableComment = commentMatch ? commentMatch[1] : '';

    // Parse columns (respecting parenthesis depth)
    var columns = [];
    var depth = 0;
    var current = '';
    for (var i = 0; i < columnsStr.length; i++) {
        var ch = columnsStr[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        if (ch === ',' && depth === 0) {
            var col = current.trim();
            if (col) {
                var parsed = processColumn(col);
                if (parsed) columns.push(parsed);
            }
            current = '';
        } else {
            current += ch;
        }
    }
    if (current.trim()) {
        var parsed = processColumn(current.trim());
        if (parsed) columns.push(parsed);
    }

    var tableDisplay = tableComment || tableName;
    return {
        tableName: tableName,
        tableComment: tableComment,
        tableDisplay: tableDisplay,
        label: tableDisplay,
        columns: columns
    };
}

function processColumn(col) {
    // Skip constraints
    var upper = col.toUpperCase().trim();
    if (/^(PRIMARY\s+KEY|UNIQUE\s+KEY|UNIQUE|KEY|INDEX|CONSTRAINT|CHECK|FOREIGN\s+KEY)/.test(upper)) {
        return null;
    }
    // Extract column name
    var nameMatch = col.match(/^`([^`]+)`|"([^"]+)"|(\w+)/);
    if (!nameMatch) return null;
    var name = nameMatch[1] || nameMatch[2] || nameMatch[3];
    // Extract column comment
    var commentMatch = col.match(/COMMENT\s+'([^']*)'/i);
    var display = commentMatch ? commentMatch[1] : name;
    return { name: name, display: display };
}
