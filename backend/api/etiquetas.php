<?php

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../controllers/EtiquetasController.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = get_db();
$controller = new EtiquetasController($pdo);

$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$path = preg_replace('#^api/#', '', $path);
$segments = array_values(array_filter(explode('/', $path)));

$id = isset($segments[1]) && ctype_digit($segments[1]) ? (int)$segments[1] : null;
$accion = $segments[2] ?? null;

try {
    $controller->handle($method, $id, ['action' => $accion]);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_response(['error' => 'Zerbitzariaren barne errorea.'], 500);
}
