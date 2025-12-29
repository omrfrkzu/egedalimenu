<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// Check authentication
if (!isset($_SESSION['authed']) || $_SESSION['authed'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Yetkisiz erişim']);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if ($input === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Geçersiz JSON']);
    exit;
}

// Ensure data directory exists
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Save to menu.json
$menuFile = $dataDir . '/menu.json';
$jsonData = json_encode($input, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if (file_put_contents($menuFile, $jsonData) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Dosya yazılamadı']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Menü başarıyla kaydedildi!']);
?>
