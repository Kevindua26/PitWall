<?php
require_once __DIR__ . '/../../php/Database.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

function jsonOut(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

// ── Register ─────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'register') {
    $body = json_decode(file_get_contents('php://input'), true);
    $username = trim($body['username'] ?? '');
    $email    = trim($body['email']    ?? '');
    $password = trim($body['password'] ?? '');

    if (!$username || !$email || !$password)
        jsonOut(['error' => 'All fields required'], 400);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL))
        jsonOut(['error' => 'Invalid email'], 400);
    if (strlen($password) < 6)
        jsonOut(['error' => 'Password must be at least 6 characters'], 400);

    $db   = Database::get();
    $hash = password_hash($password, PASSWORD_BCRYPT);
    try {
        $db->prepare("INSERT INTO users (username,email,password) VALUES (?,?,?)")
           ->execute([$username, $email, $hash]);
        $id = $db->lastInsertId();
        session_start();
        $_SESSION['user_id']  = $id;
        $_SESSION['username'] = $username;
        jsonOut(['success' => true, 'user' => ['id' => $id, 'username' => $username, 'email' => $email]]);
    } catch (PDOException $e) {
        jsonOut(['error' => 'Username or email already exists'], 409);
    }
}

// ── Login ─────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'login') {
    $body = json_decode(file_get_contents('php://input'), true);
    $email    = trim($body['email']    ?? '');
    $password = trim($body['password'] ?? '');

    if (!$email || !$password) jsonOut(['error' => 'Email and password required'], 400);

    $db   = Database::get();
    $stmt = $db->prepare("SELECT * FROM users WHERE email=?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password']))
        jsonOut(['error' => 'Invalid credentials'], 401);

    session_start();
    $_SESSION['user_id']  = $user['id'];
    $_SESSION['username'] = $user['username'];
    jsonOut(['success' => true, 'user' => ['id' => $user['id'], 'username' => $user['username'], 'email' => $user['email']]]);
}

// ── Me (session check) ────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'me') {
    session_start();
    if (!isset($_SESSION['user_id'])) jsonOut(['user' => null]);
    $db   = Database::get();
    $stmt = $db->prepare("SELECT id,username,email FROM users WHERE id=?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    jsonOut(['user' => $user ?: null]);
}

// ── Logout ────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'logout') {
    session_start();
    session_destroy();
    jsonOut(['success' => true]);
}

jsonOut(['error' => 'Invalid action'], 400);
