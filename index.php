<?php
// Front controller: routes REST-like requests to api.php -> handleTableApi
include 'api.php';

// Read URL path (e.g. /lernende/1 or /lernende/all)
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts = explode('/', $path);

// Map public route names to actual database table names
$tableMap = [
    'kurse' => 'tbl_kurse',
    'lehrbetriebe' => 'tbl_lehrbetriebe',
    'lernende' => 'tbl_lernende',
    'dozenten' => 'tbl_dozenten',
    'countries' => 'tbl_countries',
    'kurse_lernende' => 'tbl_kurse_lernende',
    'lehrbetriebe_lernende' => 'tbl_lehrbetriebe_lernende',
];

// If the first segment is not a known route (e.g. because index.php sits in a subfolder),
// drop the first path segment and try again.
if (!isset($tableMap[$parts[0]])) {
    array_shift($parts);
}

// Determine the requested table from the first path segment
$tableKey = $parts[0] ?? null;
$table = $tableMap[$tableKey] ?? null;

// Return 404 if the route does not map to a valid table
if (!$table) {
    http_response_code(404);
    echo json_encode(['error' => 'Table not found']);
    exit;
}

// If a second path part exists, treat it as the resource id or the keyword "all"
if (isset($parts[1])) {
    // Set $_GET['id'] so api.php can read the id (or "all")
    $_GET['id'] = $parts[1];
}

// Call the API handler function defined in api.php
handleTableApi($table);
?>