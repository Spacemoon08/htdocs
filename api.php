<?php
/**
 * API handler for table CRUD operations.
 *
 * Handles GET, POST, PUT, DELETE for mapped database tables.
 *
 * @package KursverwaltungAPI
 * @author -
 * @license MIT
 * @see validate_input.php
 */

// Input validation / helper functions (validateTableData etc.)
include 'validate_input.php';

// Standard response headers for JSON and CORS (simple API)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error display for local development only
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * Handle table API requests (CRUD).
 *
 * Accepts:
 * - GET  /?id=all  -> return all rows
 * - GET  /?id=1    -> return single row by primary key
 * - POST /         -> create new row (JSON body)
 * - PUT  /?id=1    -> update row (JSON body)
 * - DELETE /?id=1  -> delete row
 *
 * Notes:
 * - Expects $_GET['id'] to be set by the front-controller (index.php).
 * - Uses prepared statements and a column whitelist loaded via DESCRIBE.
 *
 * @param string $table Database table name (e.g. 'tbl_lernende')
 * @return void Outputs JSON and exits; sets appropriate HTTP status codes
 * @throws PDOException On database connection / query errors
 */
function handleTableApi(string $table) {
    // Create DB connection using local XAMPP defaults
    $pdo = new PDO("mysql:host=localhost;dbname=kursverwaltung;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $method = $_SERVER['REQUEST_METHOD'];
    // Parse JSON body if present
    $input = json_decode(file_get_contents('php://input'), true);

    // Verify the table exists and fetch column names.
    // Note: DESCRIBE requires a valid table name; do not interpolate user input.
    $columns = $pdo->query("DESCRIBE $table")->fetchAll(PDO::FETCH_COLUMN);
    if (!$columns) {
        http_response_code(400);
        echo json_encode(['error' => "Table '$table' does not exist"]);
        exit;
    }

    // Determine the primary key using INFORMATION_SCHEMA
    $primaryKey = $pdo->query("
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = '$table'
        AND CONSTRAINT_NAME = 'PRIMARY';
    ")->fetchColumn();

    try {
        switch ($method) {
            case 'GET':
                // ID is passed via $_GET['id']; "all" returns all rows
                if (isset($_GET['id'])) {
                    if ($_GET['id'] === 'all') {
                        $stmt = $pdo->prepare("SELECT * FROM $table");
                        $stmt->execute();
                        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        echo json_encode($rows);
                        exit;
                    }

                    // Return single record by primary key
                    $id = (int) $_GET['id'];
                    $stmt = $pdo->prepare("SELECT * FROM $table WHERE $primaryKey = ?");
                    $stmt->execute([$id]);
                    $row = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($row) {
                        echo json_encode($row);
                    } else {
                        http_response_code(404);
                        echo json_encode(['error' => 'Not found']);
                    }
                    exit;
                }

                // Missing id -> Bad Request
                http_response_code(400);
                echo json_encode(['error' => 'id is required']);
                break;

            case 'POST':
                // Validate incoming data (validateTableData implemented in validate_input.php)
                $errors = validateTableData($pdo, $table, $input);
                if (!empty($errors)) {
                    http_response_code(400);
                    echo json_encode(['validation_errors' => $errors]);
                    exit;
                }

                // Build INSERT using allowed columns only (avoid direct key injection)
                $fields = $placeholders = $params = [];
                foreach ($input as $key => $value) {
                    if ($key === $primaryKey) continue; // do not set primary key
                    if (in_array($key, $columns, true)) {
                        $fields[] = "`$key`";
                        $placeholders[] = '?';
                        $params[] = $value;
                    }
                }

                if (empty($fields)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'No valid data provided']);
                    exit;
                }

                $sql = "INSERT INTO $table (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);

                http_response_code(201);
                echo json_encode(['id' => $pdo->lastInsertId(), 'message' => "$table created successfully"]);
                break;

            case 'PUT':
                // ID required to update a record
                if (!isset($_GET['id'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'id is required']);
                    exit;
                }

                $errors = validateTableData($pdo, $table, $input);
                if (!empty($errors)) {
                    http_response_code(400);
                    echo json_encode(['validation_errors' => $errors]);
                    exit;
                }

                // Build dynamic UPDATE using allowed columns only
                $fields = $params = [];
                foreach ($input as $key => $value) {
                    if ($key !== $primaryKey && in_array($key, $columns, true)) {
                        $fields[] = "`$key` = ?";
                        $params[] = $value;
                    }
                }

                if (empty($fields)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'No fields to update']);
                    exit;
                }

                $params[] = (int) $_GET['id'];
                $sql = "UPDATE $table SET " . implode(', ', $fields) . " WHERE $primaryKey = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);

                if ($stmt->rowCount() === 0) {
                    http_response_code(404);
                    echo json_encode(['error' => "$table not found or no changes made"]);
                    exit;
                }

                $stmt = $pdo->prepare("SELECT * FROM $table WHERE $primaryKey = ?");
                $stmt->execute([(int) $_GET['id']]);
                $updated = $stmt->fetch(PDO::FETCH_ASSOC);

                echo json_encode(['message' => "$table updated successfully", 'updated' => $updated]);
                break;

            case 'DELETE':
                // ID required to delete
                if (!isset($_GET['id'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID is required']);
                    exit;
                }

                $stmt = $pdo->prepare("DELETE FROM $table WHERE $primaryKey = ?");
                $stmt->execute([(int) $_GET['id']]);

                if ($stmt->rowCount() === 0) {
                    http_response_code(404);
                    echo json_encode(['error' => "$table not found"]);
                    exit;
                }

                echo json_encode(['message' => "$table deleted successfully"]);
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
        }
    } catch (Exception $e) {
        // Generic error response for API clients (keep details out of production)
        http_response_code(500);
        echo json_encode(['error' => 'Internal server error']);
    }
}
?>