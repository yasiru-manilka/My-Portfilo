<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function pf_out($payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function pf_fail(string $message, int $code = 400): void
{
    pf_out(['data' => null, 'error' => ['message' => $message]], $code);
}

function pf_require_admin(): void
{
    if (empty($_SESSION['pf_admin'])) {
        pf_fail('permission denied: sign in to the admin panel first.', 401);
    }
}

function pf_cols(string $table): array
{
    if (!isset(PF_TABLES[$table])) {
        pf_fail('Unknown table.');
    }
    return PF_TABLES[$table];
}

function pf_where(array $filters, array $cols, array &$params): string
{
    $parts = [];
    foreach ($filters as $f) {
        if (!is_array($f) || count($f) !== 2 || !isset($cols[$f[0]])) {
            pf_fail('Invalid filter.');
        }
        $parts[] = '`' . $f[0] . '` = ?';
        $params[] = pf_to_db($cols[$f[0]], $f[1]);
    }
    return $parts ? ' WHERE ' . implode(' AND ', $parts) : '';
}

function pf_select(PDO $db, string $table, array $filters, ?array $order = null): array
{
    $cols = pf_cols($table);
    $params = [];
    $sql = 'SELECT * FROM `' . $table . '`' . pf_where($filters, $cols, $params);
    if ($order && in_array($order['column'] ?? '', ['sort', 'created_at'], true) && isset($cols[$order['column']])) {
        $sql .= ' ORDER BY `' . $order['column'] . '` ' . (!empty($order['ascending']) ? 'ASC' : 'DESC');
        if ($order['column'] === 'sort') {
            $sql .= ', `created_at` ASC';
        }
    }
    $st = $db->prepare($sql);
    $st->execute($params);
    return array_map(function ($r) use ($table) {
        return pf_from_db($table, $r);
    }, $st->fetchAll());
}

function pf_insert_row(PDO $db, string $table, array $row): array
{
    $cols = pf_cols($table);
    if ($table !== 'profile') {
        $row['id'] = pf_uuid();
        $row['created_at'] = gmdate('c');
    }
    $names = [];
    $params = [];
    foreach ($row as $k => $v) {
        if (isset($cols[$k])) {
            $names[] = '`' . $k . '`';
            $params[] = pf_to_db($cols[$k], $v);
        }
    }
    if (!$names) {
        pf_fail('Nothing to save.');
    }
    $st = $db->prepare('INSERT INTO `' . $table . '` (' . implode(', ', $names) . ') VALUES (' .
        implode(', ', array_fill(0, count($names), '?')) . ')');
    $st->execute($params);
    return pf_select($db, $table, [['id', $row['id']]])[0] ?? [];
}

function pf_update_rows(PDO $db, string $table, array $values, array $filters): array
{
    $cols = pf_cols($table);
    if (!$filters) {
        pf_fail('An update needs a filter.');
    }
    $sets = [];
    $params = [];
    foreach ($values as $k => $v) {
        if (isset($cols[$k]) && $k !== 'id' && $k !== 'created_at') {
            $sets[] = '`' . $k . '` = ?';
            $params[] = pf_to_db($cols[$k], $v);
        }
    }
    if ($sets) {
        $where = pf_where($filters, $cols, $params);
        $db->prepare('UPDATE `' . $table . '` SET ' . implode(', ', $sets) . $where)->execute($params);
    }
    return pf_select($db, $table, $filters);
}

pf_start_session();

$action = (string) ($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST' && ($_SERVER['HTTP_X_PORTFOLIO'] ?? '') !== '1') {
    pf_fail('Request blocked.', 403);
}

$body = [];
if ($method === 'POST' && stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') === 0) {
    $decoded = json_decode((string) file_get_contents('php://input'), true);
    $body = is_array($decoded) ? $decoded : [];
}

if ($action === 'session') {
    pf_out(['data' => ['user' => empty($_SESSION['pf_admin']) ? null : ['email' => $_SESSION['pf_admin']]], 'error' => null]);
}

if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    pf_out(['data' => true, 'error' => null]);
}

try {
    $db = pf_pdo();
} catch (Throwable $e) {
    pf_fail('Could not connect to MySQL. Start MySQL in the XAMPP Control Panel, then open server/setup.php once.', 500);
}

try {
    switch ($action) {
        case 'login':
            $email = strtolower(trim((string) ($body['email'] ?? '')));
            $password = (string) ($body['password'] ?? '');
            $st = $db->prepare('SELECT email, password_hash FROM admin_users WHERE email = ?');
            $st->execute([$email]);
            $user = $st->fetch();
            if (!$user || !password_verify($password, $user['password_hash'])) {
                usleep(600000);
                pf_fail('Invalid login credentials', 401);
            }
            session_regenerate_id(true);
            $_SESSION['pf_admin'] = $user['email'];
            pf_out(['data' => ['user' => ['email' => $user['email']]], 'error' => null]);

        case 'select':
            $table = (string) ($body['table'] ?? '');
            pf_out(['data' => pf_select($db, $table, (array) ($body['filters'] ?? []), $body['order'] ?? null), 'error' => null]);

        case 'insert':
            pf_require_admin();
            $table = (string) ($body['table'] ?? '');
            $rows = $body['rows'] ?? [];
            $rows = isset($rows[0]) ? $rows : [$rows];
            $db->beginTransaction();
            $saved = [];
            foreach ($rows as $row) {
                $saved[] = pf_insert_row($db, $table, (array) $row);
            }
            $db->commit();
            pf_out(['data' => $saved, 'error' => null]);

        case 'update':
            pf_require_admin();
            $table = (string) ($body['table'] ?? '');
            pf_out(['data' => pf_update_rows($db, $table, (array) ($body['values'] ?? []), (array) ($body['filters'] ?? [])), 'error' => null]);

        case 'upsert':
            pf_require_admin();
            $table = (string) ($body['table'] ?? '');
            $row = (array) ($body['row'] ?? []);
            if (!isset($row['id'])) {
                pf_out(['data' => [pf_insert_row($db, $table, $row)], 'error' => null]);
            }
            $exists = pf_select($db, $table, [['id', $row['id']]]);
            if ($exists) {
                pf_out(['data' => pf_update_rows($db, $table, $row, [['id', $row['id']]]), 'error' => null]);
            }
            pf_out(['data' => [pf_insert_row($db, $table, $row)], 'error' => null]);

        case 'delete':
            pf_require_admin();
            $table = (string) ($body['table'] ?? '');
            $cols = pf_cols($table);
            $filters = (array) ($body['filters'] ?? []);
            if (!$filters) {
                pf_fail('A delete needs a filter.');
            }
            $params = [];
            $db->prepare('DELETE FROM `' . $table . '`' . pf_where($filters, $cols, $params))->execute($params);
            pf_out(['data' => [], 'error' => null]);

        case 'upload':
            pf_require_admin();
            if (empty($_FILES['file']) || !is_array($_FILES['file'])) {
                pf_fail('No file arrived. It may be larger than PHP allows (upload_max_filesize in php.ini).');
            }
            $file = $_FILES['file'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                pf_fail($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE
                    ? 'This file is larger than PHP allows. Raise upload_max_filesize in php.ini or use a smaller file.'
                    : 'The upload failed. Try again.');
            }
            if ($file['size'] > PF_MAX_UPLOAD_MB * 1024 * 1024) {
                pf_fail('This file is larger than ' . PF_MAX_UPLOAD_MB . ' MB. Use a smaller file.');
            }
            $path = strtolower((string) ($_POST['path'] ?? ''));
            if (!preg_match('~^[a-z0-9_-]{1,40}/[a-z0-9][a-z0-9._-]{0,150}$~', $path) || strpos($path, '..') !== false) {
                pf_fail('Invalid file name.');
            }
            $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $images = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (in_array($ext, $images, true)) {
                if (@getimagesize($file['tmp_name']) === false) {
                    pf_fail('That file is not a valid image.');
                }
            } elseif ($ext === 'pdf') {
                $head = (string) file_get_contents($file['tmp_name'], false, null, 0, 5);
                if ($head !== '%PDF-') {
                    pf_fail('That file is not a valid PDF.');
                }
            } else {
                pf_fail('Only JPG, PNG, GIF, WEBP images and PDF files can be uploaded.');
            }
            $target = dirname(__DIR__) . '/uploads/' . $path;
            if (!is_dir(dirname($target)) && !mkdir(dirname($target), 0775, true)) {
                pf_fail('Could not create the uploads folder. Check that the portfolio folder is writable.');
            }
            if (!move_uploaded_file($file['tmp_name'], $target)) {
                pf_fail('Could not save the file into the uploads folder.');
            }
            pf_out(['data' => ['path' => $path], 'error' => null]);

        default:
            pf_fail('Unknown action.', 404);
    }
} catch (PDOException $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    if ($e->getCode() === '42S02') {
        pf_fail('The database tables are missing. Open server/setup.php once to create them.', 500);
    }
    pf_fail('Database error: ' . $e->getMessage(), 500);
}
