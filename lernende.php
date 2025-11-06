<?php
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
    switch($method) {
        case 'GET':
            // prefer query ?id=1 (or change to id_lernende if you use that)
            if (isset($_GET['id_lernende'])) {
                $id = (int) $_GET['id_lernende'];
                
                $stmt = $pdo->prepare('SELECT * FROM tbl_lernende WHERE id_lernende = ?'); // sql query wird vorbereitet
                $stmt->execute([$id]);
                $row = $stmt->fetch();
                if ($row) {
                    echo json_encode($row);
                } 
                else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Not found']);
                }
                exit;
            }

            // $stmt = $pdo->query('SELECT * FROM tbl_lernende');
            // echo json_encode($stmt->fetchAll());

            // or require id and return error:
            http_response_code(400);
            echo json_encode(['error' => 'id is required']);
            break;

        case 'POST':
            // Validate required fields
            if (empty($input['nachname']) || empty($input['vorname']) || empty($input['email'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Required fields missing (nachname, vorname, email)']);
                exit;
            }

            $sql = 'INSERT INTO tbl_lernende (nachname, vorname, email, strasse, plz, ort, 
                    nr_land, geschlecht, telefon, handy, email_privat, birthdate) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $input['nachname'],
                $input['vorname'],
                $input['email'],
                $input['strasse'] ?? null,
                $input['plz'] ?? null,
                $input['ort'] ?? null,
                $input['nr_land'] ?? null,
                $input['geschlecht'] ?? null,
                $input['telefon'] ?? null,
                $input['handy'] ?? null,
                $input['email_privat'] ?? null,
                $input['birthdate'] ?? null
            ]);
            
            http_response_code(201);
            echo json_encode([
                'id' => $pdo->lastInsertId(),
                'message' => 'Student created successfully'
            ]);
            break;

        case 'PUT':
            if (empty($input['id_lernende'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit;
            }

            $sql = 'UPDATE tbl_lernende SET 
                    nachname = ?, vorname = ?, email = ?, strasse = ?, 
                    plz = ?, ort = ?, nr_land = ?, geschlecht = ?, 
                    telefon = ?, handy = ?, email_privat = ?, birthdate = ? 
                    WHERE id_lernende = ?';
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $input['nachname'],
                $input['vorname'],
                $input['email'],
                $input['strasse'] ?? null,
                $input['plz'] ?? null,
                $input['ort'] ?? null,
                $input['nr_land'] ?? null,
                $input['geschlecht'] ?? null,
                $input['telefon'] ?? null,
                $input['handy'] ?? null,
                $input['email_privat'] ?? null,
                $input['birthdate'] ?? null,
                $input['id_lernende']
            ]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Student not found']);
                exit;
            }
            
            echo json_encode(['message' => 'Student updated successfully']);
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit;
            }

            $stmt = $pdo->prepare('DELETE FROM tbl_lernende WHERE id_lernende = ?');
            $stmt->execute([$_GET['id']]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Student not found']);
                exit;
            }
            
            echo json_encode(['message' => 'Student deleted successfully']);
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