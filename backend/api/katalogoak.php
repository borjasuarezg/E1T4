<?php

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../kontroladoreak/KatalogoakKontroladorea.php';

$metodoa = $_SERVER['REQUEST_METHOD'];
$pdo = get_db();
$controller = new KatalogoakKontroladorea($pdo);

$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$path = preg_replace('#^api/#', '', $path);
$segments = array_values(array_filter(explode('/', $path)));

$taula = $segments[0] ?? '';
$id = isset($segments[1]) && ctype_digit($segments[1]) ? (int)$segments[1] : null;

try {
    $controller->handle($taula, $metodoa, $id);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_response(['error' => 'Zerbitzariaren barne errorea.'], 500);
}
