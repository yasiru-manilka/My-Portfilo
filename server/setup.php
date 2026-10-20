<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

function h($v): string
{
    return htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
}

$errors = [];
$filledNow = [];
$notice = '';
$step = 'error';
$adminEmail = '';

try {
    $server = pf_pdo(false);
    $server->exec('CREATE DATABASE IF NOT EXISTS `' . str_replace('`', '', PF_DB['name']) .
        '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $db = pf_pdo(true);

    pf_create_tables($db);

    $count = (int) $db->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();

    if ($count === 0 && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $password = (string) ($_POST['password'] ?? '');
        $confirm = (string) ($_POST['confirm'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Enter a valid email address.';
        }
        if (strlen($password) < 8) {
            $errors[] = 'Use a password with at least 8 characters.';
        }
        if ($password !== $confirm) {
            $errors[] = 'The two passwords don\'t match.';
        }
        if (!$errors) {
            $st = $db->prepare('INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)');
            $st->execute([$email, password_hash($password, PASSWORD_DEFAULT), gmdate('c')]);
            $count = 1;
            $notice = 'Your admin account is ready.';
            $filledNow = pf_fill_starting_content($db);
        }
        $adminEmail = $email;
    }

    if ($count === 0) {
        $step = 'create';
    } else {
        if (empty($filledNow)) {
            $filledNow = pf_fill_starting_content($db, true);
        }
        $step = 'done';
        $adminEmail = $adminEmail ?: (string) $db->query('SELECT email FROM admin_users ORDER BY id LIMIT 1')->fetchColumn();
    }
} catch (Throwable $e) {
    $errors[] = $e->getMessage();
}

$uploadsWritable = is_dir(dirname(__DIR__) . '/uploads') && is_writable(dirname(__DIR__) . '/uploads');
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Portfolio setup</title>
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="setup.css">
  <style>
    .panel { width: min(100%, 30rem); }
    .steps { margin: 0; padding-left: 1.2rem; color: var(--ink-soft); }
    .steps li { margin: .3rem 0; }
    .ok { color: #1F7A45; font-weight: 600; }
    .bad { color: var(--danger); font-weight: 600; }
    .err { background: #FDECEA; color: var(--danger); border-radius: 8px; padding: .8rem 1rem; }
    .err p + p { margin-top: .4rem; }
  </style>
</head>
<body>
<main class="center">
  <div class="panel">
    <span class="badge-mark">YM</span>

    <?php if ($step === 'error'): ?>
      <h1>Setup couldn't connect to MySQL</h1>
      <div class="err"><?php foreach ($errors as $e): ?><p><?= h($e) ?></p><?php endforeach; ?></div>
      <ol class="steps">
        <li>Open the <b>XAMPP Control Panel</b> and click <b>Start</b> next to <b>Apache</b> and <b>MySQL</b>.</li>
        <li>If you set a MySQL password, put it in <code>server/config.php</code>.</li>
        <li>Then reload this page.</li>
      </ol>

    <?php elseif ($step === 'create'): ?>
      <h1>Create your admin account</h1>
      <p class="muted">The database <code><?= h(PF_DB['name']) ?></code> and its tables are ready. Now choose the email and password you'll use to sign in to the admin panel.</p>
      <?php if ($errors): ?><div class="err"><?php foreach ($errors as $e): ?><p><?= h($e) ?></p><?php endforeach; ?></div><?php endif; ?>
      <form method="post" style="display:grid; gap:1rem">
        <label>Email
          <input type="email" name="email" value="<?= h($adminEmail ?: 'yasirumanilkaidw@gmail.com') ?>" required autocomplete="username">
        </label>
        <label>Password
          <input type="password" name="password" minlength="8" required autocomplete="new-password">
        </label>
        <label>Type the password again
          <input type="password" name="confirm" minlength="8" required autocomplete="new-password">
        </label>
        <button class="btn btn-solid" type="submit">Create admin account</button>
      </form>

    <?php else: ?>
      <h1><?= $notice ? h($notice) : 'Setup is complete' ?></h1>
      <ol class="steps">
        <li><span class="ok">✓</span> Connected to MySQL</li>
        <li><span class="ok">✓</span> Database <code><?= h(PF_DB['name']) ?></code> and tables ready</li>
        <li><span class="ok">✓</span> Admin account: <b><?= h($adminEmail) ?></b></li>
        <?php if ($filledNow): ?><li><span class="ok">✓</span> Starting content added: <?= h(implode(', ', $filledNow)) ?></li><?php endif; ?>
        <li><?php if ($uploadsWritable): ?><span class="ok">✓</span> Photo uploads folder is writable<?php else: ?><span class="bad">✗</span> The <code>uploads</code> folder is missing or not writable, so photo uploads won't work<?php endif; ?></li>
      </ol>
      <a class="btn btn-solid" href="../admin/">Go to the admin panel</a>
      <p class="muted small">Forgot your password? Open phpMyAdmin, go to the <code><?= h(PF_DB['name']) ?></code> database, empty the <code>admin_users</code> table, then reload this page to create the account again.</p>
    <?php endif; ?>

    <a class="link small" href="../">Back to the website</a>
  </div>
</main>
</body>
</html>
