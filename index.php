<?php
include 'api.php';

// URL-Pfad auslesen
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts = explode('/', $path);

// Map für Tabellen
$tableMap = [
    'kurse' => 'tbl_kurse',
    'lehrbetriebe' => 'tbl_lehrbetriebe',
    'lernende' => 'tbl_lernende',
    'dozenten' => 'tbl_dozenten',
    'countries' => 'tbl_countries',
    'kurse_lernende' => 'tbl_kurse_lernende',
    'lehrbetriebe_lernende' => 'tbl_lehrbetriebe_lernende',
];

// Falls der erste Teil kein Tablename ist → skippen
if (!isset($tableMap[$parts[0]])) {
    array_shift($parts);
}

$tableKey = $parts[0] ?? null;
$table = $tableMap[$tableKey] ?? null;

if (!$table) {
    http_response_code(404);
    echo json_encode(['error' => 'Table not found']);
    exit;
}

// Wenn es einen zweiten URL-Teil gibt (ID oder "all")
if (isset($parts[1])) {
    $_GET['id'] = $parts[1];   // <— "all" oder ID wird direkt gesetzt
}

handleTableApi($table);
?>