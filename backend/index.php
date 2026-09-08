<?php
/**
 * Punto de entrada único de la API.
 * Apache reescribe todas las peticiones a /api/... hacia este fichero
 * (ver docs/04-apache-vhosts.md para la configuración del VirtualHost backend).
 *
 * Rutas soportadas:
 *   POST   /api/auth/login
 *   POST   /api/auth/logout
 *   GET    /api/auth/me
 *   POST   /api/auth/register        (solo admin)
 *
 *   GET|POST /api/equipos            GET|PUT|DELETE /api/equipos/{id}
 *   GET|POST /api/etiquetas          GET|DELETE     /api/etiquetas/{id}
 *   PATCH    /api/etiquetas/{id}/ubicacion
 *   GET|POST /api/categorias         PUT|DELETE     /api/categorias/{id}
 *   GET|POST /api/gelas              PUT|DELETE     /api/gelas/{id}
 *   GET|POST /api/compras
 *   GET      /api/usuarios           PUT|DELETE     /api/usuarios/{id}   (solo admin)
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/auth.php';

// --- CORS: solo se permite el origen del frontend, con credenciales (cookies de sesión) ---
$config = require __DIR__ . '/config.php';
header('Access-Control-Allow-Origin: ' . $config['cors_origin']);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- Enrutado simple basado en PATH_INFO: /api/{recurso}/{id}/{accion} ---
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$path = preg_replace('#^api/#', '', $path); // quita el prefijo /api si el vhost lo incluye
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
            equipos_handle($method, $id);
            break;

        case 'etiquetas':
            require_once __DIR__ . '/api/etiquetas.php';
            etiquetas_handle($method, $id, ['action' => $accion]);
            break;

        case 'categorias':
        case 'gelas':
            require_once __DIR__ . '/api/catalogos.php';
            catalogo_handle($recurso, $method, $id);
            break;

        case 'compras':
            require_once __DIR__ . '/api/compras.php';
            compras_handle($method, $id);
            break;

        case 'usuarios':
            require_once __DIR__ . '/api/usuarios.php';
            usuarios_handle($method, $id);
            break;

        default:
            json_response(['error' => 'Baliabidea ez da aurkitu.'], 404);
    }
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_response(['error' => 'Zerbitzariaren barne errorea.'], 500);
}
