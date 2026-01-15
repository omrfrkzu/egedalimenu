<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$menuFile = __DIR__ . '/../data/menu.json';

if (!file_exists($menuFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'Menu file not found', 'items' => []]);
    exit;
}

$menuData = file_get_contents($menuFile);

// Validate JSON
$decoded = json_decode($menuData, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Invalid JSON format: ' . json_last_error_msg(),
        'items' => []
    ]);
    exit;
}

// Ensure items array exists
if (!isset($decoded['items']) || !is_array($decoded['items'])) {
    $decoded['items'] = [];
}

echo json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
?>
