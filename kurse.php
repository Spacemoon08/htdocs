<?php
include 'api.php';
// URL parsen
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'); // z. B. kurse/1
$segments = explode('/', $path);

// Tabelle aus dem ersten Segment
$table = $segments[0] ?? null;
if (!$table) {
    http_response_code(400);
    echo json_encode(['error' => 'Table is required']);
    exit;
}
handleTableApi('tbl_' . $table);
?>
