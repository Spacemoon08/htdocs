<?php
// Validate required fields

function validate_email($input, $name): array
{
    $errors = [];
    if ($input && !filter_var($input, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Column '$name' must be a valid email address.";
    }
    return $errors;
}

function validateTableData(PDO $pdo, string $table, array $data): array
{
    if (empty($data)) return [];

    // Fetch column metadata from INFORMATION_SCHEMA
    $sql = "
        SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_TYPE, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$table]);
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $fksql = "    SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL";
    $fkstmt = $pdo->prepare($fksql);
    $fkstmt->execute([$table]);
    $foreignKeys = $fkstmt->fetchAll(PDO::FETCH_ASSOC);
    $fkMap = [];
    foreach ($foreignKeys as $fk) {
        $fkMap[$fk['COLUMN_NAME']] = [
            'table' => $fk['REFERENCED_TABLE_NAME'],
            'column' => $fk['REFERENCED_COLUMN_NAME']
        ];
    }

    $errors = [];

    foreach ($columns as $col) {
        // Extract column details
        $name = $col['COLUMN_NAME'];
        $type = strtolower($col['DATA_TYPE']);
        $max = $col['CHARACTER_MAXIMUM_LENGTH'];
        $nullable = ($col['IS_NULLABLE'] === 'YES');
        $value = $data[$name] ?? null;
        $autoIncrement = ($col['EXTRA'] === 'auto_increment');
        // --- 0. Skip auto-increment columns ---
        if ($autoIncrement) {
            continue; // Skip auto-increment columns
        }
        // --- 2. Skip further checks if null is allowed and the value is null ---
        if ($nullable && ($value === null || $value === '')) {
            continue;
        }
        // --- 3. Type-based checks ---
        switch ($type) {
            case 'varchar':
            case 'char':
                if ($max && strlen($value) > $max) {
                    $errors[] = "Value for '$name' exceeds VARCHAR($max) limit (length: " . strlen($value) . ").";
                }
                break;
            case 'int':
            case 'tinyint':
            case 'smallint':
            case 'mediumint':
            case 'bigint':
                if (!is_numeric($value)) {
                    $errors[] = "Value for '$name' must be a number.";
                }
                break;
            case 'date':
                $d = DateTime::createFromFormat('Y-m-d', $value);
                if (!$d || $d->format('Y-m-d') !== $value) {
                    $errors[] = "Column '$name' must be a valid date (YYYY-MM-DD).";
                }
                break;
            case 'enum':
                // Parse allowed enum values from COLUMN_TYPE
                preg_match_all("/'([^']+)'/", $col['COLUMN_TYPE'], $matches);
                $allowed = $matches[1] ?? [];
                if (!in_array($value, $allowed)) {
                    $errors[] = "Invalid value for '$name'. Allowed: " . implode(", ", $allowed);
                }
                break;
        }
        // --- 4. email vailidation ---
        if (str_contains($name, 'email')) {
            $errors = array_merge($errors, validate_email($value, $name));
        }
        // --- 5. Foreign key checks ---
        if (isset($fkMap[$name])) {
            $ref = $fkMap[$name];
            $checkSql = "SELECT COUNT(*) FROM {$ref['table']} WHERE {$ref['column']} = ?";
            $checkStmt = $pdo->prepare($checkSql);
            $checkStmt->execute([$value]);
            $exists = $checkStmt->fetchColumn();
            if ($exists == 0) {
                $errors[] = "Foreign key constraint failed: No matching record in '{$ref['table']}' for '$name' = $value.";
            }
        }
    }
    return $errors;
}
?>
