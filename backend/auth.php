<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

/** Arranca la sesión con parámetros de cookie seguros (una sola vez). */
function start_secure_session(): void
{
    static $started = false;
    if ($started) return;

    $config = require __DIR__ . '/config.php';
    $s = $config['session'];

    session_name($s['name']);
    session_set_cookie_params([
        'lifetime' => $s['lifetime'],
        'path'     => '/',
        'secure'   => $s['secure'],
        'httponly' => $s['httponly'],
        'samesite' => $s['samesite'],
    ]);
    session_start();
    $started = true;
}

/** Devuelve el usuario autenticado (array) o null si no hay sesión. */
function current_user(): ?array
{
    start_secure_session();
    return $_SESSION['user'] ?? null;
}

/** Corta la ejecución con 401 si no hay usuario autenticado. */
function require_login(): array
{
    $user = current_user();
    if (!$user) {
        json_response(['error' => 'Ez zaude saioa hasita.'], 401);
    }
    return $user;
}

/** Corta la ejecución con 403 si el usuario autenticado no es admin. */
function require_admin(): array
{
    $user = require_login();
    if ($user['rol'] !== 'admin') {
        json_response(['error' => 'Baimenik ez. Administratzailea izan behar duzu.'], 403);
    }
    return $user;
}

/**
 * POST /api/auth/login  { username, password }
 * Valida credenciales en el SERVIDOR (nunca en el cliente) y crea la sesión.
 */
function action_login(): void
{
    start_secure_session();
    $data = read_json_body();
    require_fields($data, ['username', 'password']);

    $pdo = get_db();
    $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE username = :u AND activo = 1 LIMIT 1');
    $stmt->execute(['u' => $data['username']]);
    $user = $stmt->fetch();

    // password_verify compara con el hash; nunca se compara texto plano.
    if (!$user || !password_verify($data['password'], $user['password_hash'])) {
        json_response(['error' => 'Erabiltzailea edo pasahitza okerrak dira.'], 401);
    }

    session_regenerate_id(true); // evita session fixation
    unset($user['password_hash']);
    $_SESSION['user'] = $user;

    json_response(['user' => $user]);
}

/** POST /api/auth/logout */
function action_logout(): void
{
    start_secure_session();
    $_SESSION = [];
    session_destroy();
    json_response(['ok' => true]);
}

/** GET /api/auth/me */
function action_me(): void
{
    $user = current_user();
    json_response(['user' => $user]);
}

/**
 * POST /api/auth/register { username, email, password, rol }
 * SOLO un admin puede dar de alta usuarios (requisito del reto:
 * "alta administradoreak soilik egin dezake").
 */
function action_register(): void
{
    require_admin();
    $data = read_json_body();
    require_fields($data, ['username', 'email', 'password', 'rol']);

    if (!in_array($data['rol'], ['admin', 'user'], true)) {
        json_response(['error' => 'Rol baliogabea.'], 422);
    }
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        json_response(['error' => 'Emaila ez da baliozkoa.'], 422);
    }
    if (strlen($data['password']) < 8) {
        json_response(['error' => 'Pasahitzak gutxienez 8 karaktere izan behar ditu.'], 422);
    }

    $pdo = get_db();
    $hash = password_hash($data['password'], PASSWORD_DEFAULT); // bcrypt/argon2 según config del servidor

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO usuarios (username, email, password_hash, rol) VALUES (:u, :e, :p, :r)'
        );
        $stmt->execute([
            'u' => $data['username'],
            'e' => $data['email'],
            'p' => $hash,
            'r' => $data['rol'],
        ]);
    } catch (PDOException $e) {
        json_response(['error' => 'Erabiltzaile edo email hori jadanik existitzen da.'], 409);
    }

    json_response(['ok' => true, 'id' => $pdo->lastInsertId()], 201);
}
