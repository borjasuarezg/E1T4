<?php
require_once __DIR__ . '/../auth.php';

function catalogo_handle(string $tabla, string $method, ?int $id): void
{
    require_login();
    $pdo = get_db();

    if (!in_array($tabla, ['categorias', 'gelas'], true)) {
        json_response(['error' => 'Baliabidea ez da onartzen.'], 404);
    }

    switch ($method) {
        case 'GET':
            if ($tabla === 'gelas') {
                json_response($pdo->query("SELECT id, izena AS nombre, taldea FROM gelak ORDER BY izena")->fetchAll());
            } else {
                json_response($pdo->query("SELECT id, izena AS nombre FROM kategoriak ORDER BY izena")->fetchAll());
            }
            break;

        case 'POST':
            require_admin();
            $d = read_json_body();
            require_fields($d, ['nombre']);

            if ($tabla === 'gelas') {
                $stmt = $pdo->prepare('INSERT INTO gelak (izena, taldea) VALUES (:n, :t)');
                $stmt->execute(['n' => $d['nombre'], 't' => $d['taldea'] ?? null]);
            } else {
                $stmt = $pdo->prepare('INSERT INTO kategoriak (izena) VALUES (:n)');
                $stmt->execute(['n' => $d['nombre']]);
            }
            json_response(['ok' => true, 'id' => $pdo->lastInsertId()], 201);
            break;

        case 'DELETE':
            require_admin();
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            $tReal = ($tabla === 'gelas') ? 'gelak' : 'kategoriak';
            try {
                $pdo->prepare("DELETE FROM `$tReal` WHERE id = ?")->execute([$id]);
                json_response(['ok' => true]);
            } catch (PDOException $e) {
                json_response(['error' => 'Ezin da ezabatu erlazionatutako datuak daudelako.'], 409);
            }
            break;

        default:
            json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}