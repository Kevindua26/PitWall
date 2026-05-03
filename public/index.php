<?php
// ── PHP built-in server: serve existing static files directly ─────────────────
if (php_sapi_name() === 'cli-server') {
    $reqPath  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $filePath = __DIR__ . $reqPath;
    // Let PHP serve actual static files (JS, CSS, images, fonts…) as-is
    if ($reqPath !== '/' && is_file($filePath) && !str_ends_with($reqPath, '.php')) {
        return false;
    }
}

// ── CORS headers (needed because Vite runs on a different port) ───────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── Route /api/* requests ─────────────────────────────────────────────────────
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (str_starts_with($path, '/api/')) {
    header('Content-Type: application/json');

    // Extract the endpoint name: /api/races?... → "races"
    $endpoint = trim(str_replace('/api/', '', $path), '/');
    $endpoint = explode('/', $endpoint)[0]; // handle /api/races/something
    $file     = __DIR__ . '/api/' . $endpoint . '.php';

    if (file_exists($file)) {
        require $file;
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Unknown endpoint: ' . $endpoint]);
    }
    exit();
}

// ── Serve built React app (production) ───────────────────────────────────────
$distIndex = __DIR__ . '/dist/index.html';
if (file_exists($distIndex)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($distIndex);
} else {
    // Dev mode: tell user to use npm run dev
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html><head><title>PITWALL</title></head>
    <body style="background:#06060E;color:#F5F5F5;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:12px">
        <div style="font-size:2rem;font-weight:900">PIT<span style="color:#E8002D">WALL</span></div>
        <p style="color:#888">Run <code style="color:#E8002D">npm run dev</code> to start the frontend dev server on port 5173.</p>
        <p style="color:#555;font-size:0.8rem">PHP API server is running ✓</p>
    </body></html>';
}
