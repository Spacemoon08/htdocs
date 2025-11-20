<?php
include 'validate_input.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);




function handleTableApi(string $table) {
    // Database connection
    $pdo = new PDO("mysql:host=localhost;dbname=kursverwaltung;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate table exists
    $columns = $pdo->query("DESCRIBE $table")->fetchAll(PDO::FETCH_COLUMN);
    if (!$columns) {
        http_response_code(400);
        echo json_encode(['error' => "Table '$table' does not exist"]);
        exit;
    }

    // Get primary key
    $primaryKey = $pdo->query("
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = '$table'
        AND CONSTRAINT_NAME = 'PRIMARY';
    ")->fetchColumn();

    try {
        switch ($method) {
            case 'GET':
                if (isset($_GET['id'])) {
                    $id = (int)$_GET['id'];
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
                http_response_code(400);
                echo json_encode(['error' => 'id is required']);
                break;

            case 'POST':
                $errors = validateTableData($pdo, $table, $input);
                $fields = $placeholders = $params = [];
                foreach ($input as $key => $value) {
                    if ($key === $primaryKey) continue;
                    if (in_array($key, $columns)) {
                        $fields[] = $key;
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
                if (!isset($_GET['id'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'id is required']);
                    exit;
                }
                $errors = validateTableData($pdo, $table, $input);
                $fields = $params = [];
                foreach ($input as $key => $value) {
                    if ($key !== $primaryKey && in_array($key, $columns)) {
                        $fields[] = "$key = ?";
                        $params[] = $value;
                    }
                }
                if (empty($fields)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'No fields to update']);
                    exit;
                }
                $params[] = $_GET['id'];
                $sql = "UPDATE $table SET " . implode(', ', $fields) . " WHERE $primaryKey = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                if ($stmt->rowCount() === 0) {
                    http_response_code(404);
                    echo json_encode(['error' => "$table not found or no changes made"]);
                    exit;
                }
                $stmt = $pdo->prepare("SELECT * FROM $table WHERE $primaryKey = ?");
                $stmt->execute([$_GET['id']]);
                $updated = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode(['message' => "$table updated successfully", 'updated' => $updated]);
                break;

            case 'DELETE':
                if (!isset($_GET['id'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID is required']);
                    exit;
                }
                $stmt = $pdo->prepare("DELETE FROM $table WHERE $primaryKey = ?");
                $stmt->execute([$_GET['id']]);
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
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>