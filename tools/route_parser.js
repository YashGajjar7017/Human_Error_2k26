const fs = require('fs');
const path = require('path');

function findRoutesInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const routeRegex = /router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g;
    const matches = [];
    let m;
    while ((m = routeRegex.exec(content)) !== null) {
        matches.push({ method: m[1].toUpperCase(), path: m[2] });
    }
    return matches;
}

function parseRoutes(dir) {
    const files = fs.readdirSync(dir);
    const result = {};
    files.forEach(f => {
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) return;
        if (!f.endsWith('.js')) return;
        try {
            const routes = findRoutesInFile(full);
            if (routes.length > 0) result[f] = routes;
        } catch (err) {
            console.error('Failed to parse', full, err.message);
        }
    });
    return result;
}

(function main(){
    const routesDir = path.join(__dirname, '..', 'Backend', 'Routes');
    const out = path.join(__dirname, '..', 'Backend', 'ROUTES_AUTOGEN.json');
    const parsed = parseRoutes(routesDir);
    fs.writeFileSync(out, JSON.stringify(parsed, null, 2));
    console.log('Wrote', out);
})();
