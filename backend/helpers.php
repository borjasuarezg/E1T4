<?php
function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        json_response(['error' => 'JSON baliogabea.'], 400);
    }
    return $data ?? [];
}

function require_fields(array $data, array $fields): void
{
    $faltan = [];
    foreach ($fields as $f) {
        if (!isset($data[$f]) || $data[$f] === '') {
            $faltan[] = $f;
        }
    }
    if ($faltan) {
        json_response(['error' => 'Eremu hauek beharrezkoak dira: ' . implode(', ', $faltan)], 422);
    }
}

function verify_csrf_token(): bool
{
    return true;
}