<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/auth.php';

// Permitir cualquier origen dinámicamente (IP o dominio)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

header("Access-Control-Allow-Origin: {$origin}");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(204);
    exit;
}

$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$path = preg_replace('#^api/#', '', $path);
$segments = array_values(array_filter(explode('/', $path)));

$recurso = $segments[0] ?? '';
$id      = isset($segments[1]) && ctype_digit($segments[1]) ? (int)$segments[1] : null;
$accion  = $segments[2] ?? null;
$method  = $_SERVER['REQUEST_METHOD'];

try {
    switch ($recurso) {
        case 'auth':
            $sub = $segments[1] ?? '';
            match (true) {
                $sub === 'login'    && $method === 'POST' => action_login(),
                $sub === 'logout'   && $method === 'POST' => action_logout(),
                $sub === 'me'       && $method === 'GET'  => action_me(),
                $sub === 'register' && $method === 'POST' => action_register(),
                default => json_response(['error' => 'Bide baliogabea.'], 404),
            };
            break;

        case 'equipos':
            require_once __DIR__ . '/api/equipos.php';
            break;

        case 'etiquetas':
            require_once __DIR__ . '/api/etiquetas.php';
            break;

        case 'categorias':
        case 'gelas':
            require_once __DIR__ . '/api/catalogos.php';
            break;

        case 'compras':
            require_once __DIR__ . '/api/compras.php';
            break;

        case 'usuarios':
            require_once __DIR__ . '/api/usuarios.php';
            break;

        case 'taldeak':
            require_once __DIR__ . '/api/taldeak.php';
            break;

        case 'partaideak':
            require_once __DIR__ . '/api/partaideak.php';
            break;

        default:
            json_response(['error' => 'Baliabidea ez da aurkitu.'], 404);
    }
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_response(['error' => 'Zerbitzariaren barne errorea.'], 500);
}