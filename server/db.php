<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

const PF_TABLES = [
    'profile' => [
        'id' => 'int', 'name' => 'text', 'role_line' => 'text', 'university' => 'text',
        'university_url' => 'text', 'university_logo_url' => 'text', 'intro' => 'text',
        'about' => 'text', 'location' => 'text', 'email' => 'text', 'phone' => 'text',
        'linkedin' => 'text', 'github' => 'text', 'cv_url' => 'text', 'photo_url' => 'text',
        'avatar_url' => 'text', 'status' => 'text', 'show_status' => 'bool',
        'contact_heading' => 'text', 'sections' => 'json', 'updated_at' => 'text',
    ],
    'experience' => [
        'id' => 'text', 'role' => 'text', 'org' => 'text', 'logo_url' => 'text',
        'start_label' => 'text', 'end_label' => 'text', 'current' => 'bool',
        'summary' => 'text', 'tags' => 'list', 'sort' => 'int', 'created_at' => 'text',
    ],
    'projects' => [
        'id' => 'text', 'title' => 'text', 'tagline' => 'text', 'role' => 'text',
        'year' => 'text', 'status' => 'text', 'summary' => 'text', 'highlights' => 'list',
        'stack' => 'list', 'images' => 'list', 'link' => 'text', 'repo' => 'text',
        'other_links' => 'list', 'sort' => 'int', 'created_at' => 'text',
    ],
    'certificates' => [
        'id' => 'text', 'title' => 'text', 'issuer' => 'text', 'issued' => 'text',
        'image_url' => 'text', 'sort' => 'int', 'created_at' => 'text',
    ],
    'recognition' => [
        'id' => 'text', 'title' => 'text', 'org' => 'text', 'date_label' => 'text',
        'note' => 'text', 'image_url' => 'text', 'sort' => 'int', 'created_at' => 'text',
    ],
    'skills' => [
        'id' => 'text', 'name' => 'text', 'category' => 'text', 'sort' => 'int', 'created_at' => 'text',
    ],
    'education' => [
        'id' => 'text', 'school' => 'text', 'degree' => 'text', 'logo_url' => 'text',
        'start_label' => 'text', 'end_label' => 'text', 'note' => 'text',
        'courses' => 'list', 'sort' => 'int', 'created_at' => 'text',
    ],
];

function pf_pdo(bool $withDatabase = true): PDO
{
    $c = PF_DB;
    $dsn = 'mysql:host=' . $c['host'] . ';port=' . (int) $c['port'] . ';charset=utf8mb4';
    if ($withDatabase) {
        $dsn .= ';dbname=' . $c['name'];
    }
    return new PDO($dsn, $c['user'], $c['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

function pf_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_name('pf_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'secure' => $https,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function pf_uuid(): string
{
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}

function pf_to_db(string $type, $value)
{
    switch ($type) {
        case 'int':
            return (int) $value;
        case 'bool':
            return $value ? 1 : 0;
        case 'list':
            if (is_string($value)) {
                $value = preg_split('/\r?\n/', $value);
            }
            $items = [];
            foreach ((array) $value as $v) {
                if (is_scalar($v) && trim((string) $v) !== '') {
                    $items[] = trim((string) $v);
                }
            }
            return json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        case 'json':
            return json_encode(is_array($value) || is_object($value) ? $value : new stdClass(),
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        default:
            return is_scalar($value) ? (string) $value : '';
    }
}

function pf_from_db(string $table, array $row): array
{
    $out = [];
    foreach (PF_TABLES[$table] as $col => $type) {
        $v = $row[$col] ?? null;
        switch ($type) {
            case 'int':
                $out[$col] = (int) $v;
                break;
            case 'bool':
                $out[$col] = (bool) (int) $v;
                break;
            case 'list':
                $d = $v ? json_decode((string) $v, true) : [];
                $out[$col] = is_array($d) ? array_values($d) : [];
                break;
            case 'json':
                $d = $v ? json_decode((string) $v) : null;
                $out[$col] = is_object($d) ? $d : new stdClass();
                break;
            default:
                $out[$col] = $v === null ? '' : (string) $v;
        }
    }
    return $out;
}

function pf_fill_starting_content(PDO $db, bool $onlyIfAllEmpty = false): array
{
    $file = __DIR__ . '/seed.json';
    $seed = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;
    if (!is_array($seed)) {
        return [];
    }
    $lists = ['experience', 'projects', 'certificates', 'recognition', 'skills', 'education'];
    $counts = [];
    foreach ($lists as $t) {
        $counts[$t] = (int) $db->query('SELECT COUNT(*) FROM `' . $t . '`')->fetchColumn();
    }
    if ($onlyIfAllEmpty && array_sum($counts) > 0) {
        return [];
    }
    $filled = [];
    $db->beginTransaction();
    try {
        $hasProfile = (int) $db->query('SELECT COUNT(*) FROM profile WHERE id = 1')->fetchColumn() > 0;
        if (!$hasProfile && is_array($seed['profile'] ?? null)) {
            pf_insert_seed_row($db, 'profile', ['id' => 1] + $seed['profile']);
            $filled[] = 'profile';
        }
        foreach ($lists as $t) {
            if ($counts[$t] > 0 || empty($seed[$t]) || !is_array($seed[$t])) {
                continue;
            }
            foreach (array_values($seed[$t]) as $i => $row) {
                $row = (array) $row;
                $row['id'] = pf_uuid();
                $row['sort'] = ($i + 1) * 10;
                $row['created_at'] = gmdate('c');
                pf_insert_seed_row($db, $t, $row);
            }
            $filled[] = $t;
        }
        $db->commit();
    } catch (Throwable $e) {
        $db->rollBack();
        throw $e;
    }
    return $filled;
}

function pf_insert_seed_row(PDO $db, string $table, array $row): void
{
    $cols = PF_TABLES[$table];
    $names = [];
    $params = [];
    foreach ($row as $k => $v) {
        if (isset($cols[$k])) {
            $names[] = '`' . $k . '`';
            $params[] = pf_to_db($cols[$k], $v);
        }
    }
    $db->prepare('INSERT INTO `' . $table . '` (' . implode(', ', $names) . ') VALUES (' .
        implode(', ', array_fill(0, count($names), '?')) . ')')->execute($params);
}

function pf_create_tables(PDO $db): void
{
    $sql = file_get_contents(__DIR__ . '/database.sql');
    $sql = preg_replace('/^\s*--.*$/m', '', (string) $sql);
    foreach (array_filter(array_map('trim', explode(';', (string) $sql))) as $statement) {
        $db->exec($statement);
    }
}
