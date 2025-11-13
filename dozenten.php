<?php
include 'validate_input.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
// Database connection
$pdo = new PDO("mysql:host=localhost;dbname=kursverwaltung;charset=utf8mb4", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
// Get request method and body
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
try {
    switch ($method) {
        case 'GET':
            // prefer query ?id=1 (or change to id_dozenten if you use that)
            if (isset($_GET['id'])) {
                $id = (int) $_GET['id'];
                $stmt = $pdo->prepare('SELECT * FROM tbl_dozenten WHERE id_dozent = ?');
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
            // or require id and return error:
            http_response_code(400);
            echo json_encode(['error' => 'id is required']);
            break;
        case 'POST':
            $errors = validateTableData($pdo, 'tbl_dozenten', $input);
            if (!empty($errors)) {
                http_response_code(400);
                echo json_encode(['errors' => $errors]);
                exit;
            }
            $sql = 'INSERT INTO tbl_dozenten (nachname, vorname, strasse, plz, ort,
                    nr_land, geschlecht, telefon, handy, email, birthdate)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $input['nachname'],
                $input['vorname'],
                $input['strasse'] ?? null,
                $input['plz'] ?? null,
                $input['ort'] ?? null,
                $input['nr_land'] ?? null,
                $input['geschlecht'] ?? null,
                $input['telefon'] ?? null,
                $input['handy'] ?? null,
                $input['email'] ?? null,
                $input['birthdate'] ?? null
            ]);
            http_response_code(201);
            echo json_encode([
                'id' => $pdo->lastInsertId(),
                'message' => 'Dozent created successfully'
            ]);
            break;
        case 'PUT':
            // Require the dozents ID
            $errors = validateTableData($pdo, 'tbl_dozenten', $input);
            if (!empty($errors)) {
                http_response_code(400);
                echo json_encode(['errors' => $errors]);
                exit;
            }
            $fields = [];
            $params = [];
            // Dynamically build the query based on provided fields
            foreach ($input as $key => $value) {
                if ($key !== 'id') {
                    $fields[] = "$key = ?";
                    $params[] = $value;
                }
            }
            // No fields to update
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                exit;
            }
            // Build and execute SQL
            $sql = 'UPDATE tbl_dozenten SET ' . implode(', ', $fields) . ' WHERE id_dozent = ?';
            $params[] = $input['id_dozent'];
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            // If no rows were affected
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Dozent not found or no changes made']);
                exit;
            }
            // Fetch and return the updated record
            $stmt = $pdo->prepare('SELECT * FROM tbl_dozenten WHERE id_dozent = ?');
            $stmt->execute([$input['id_dozent']]);
            $updated = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode([
                'message' => 'Dozent updated successfully',
                'updated_dozent' => $updated
            ]);
            break;
        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit;
            }
            $stmt = $pdo->prepare('DELETE FROM tbl_dozenten WHERE id_dozent = ?');
            $stmt->execute([$_GET['id']]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Dozent not found']);
                exit;
            }
            echo json_encode(['message' => 'Dozent deleted successfully']);
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
?>