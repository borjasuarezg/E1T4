<?php
/**
 * CRUD genérico para tablas de catálogo sencillas: categorias y gelas.
 * /api/categorias  y  /api/gelas
 */
require_once __DIR__ . '/../auth.php';

function catalogo_handle(string $tabla, string $method, ?int $id): void
{
    require_login();
    $pdo = get_db();
    $tablasPermitidas = ['categorias', 'gelas'];
    if (!in_array($tabla, $tablasPermitidas, true)) {
        json_response(['error' => 'Baliabidea ez da onartzen.'], 404);
    }

    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM `$tabla` WHERE id = ?");
                $stmt->execute([$id]);
                $row = $stmt->fetch();
                if (!$row) json_response(['error' => 'Ez da aurkitu.'], 404);
                json_response($row);
            } else {
                json_response($pdo->query("SELECT * FROM `$tabla` ORDER BY nombre")->fetchAll());
            }
            break;

        case 'POST':
            require_admin(); // solo administradores gestionan catálogos
            $d = read_json_body();
            require_fields($d, ['nombre']);

            if ($tabla === 'gelas') {
                $stmt = $pdo->prepare(
                    'INSERT INTO gelas (nombre, tipo, ubicacion_fisica) VALUES (:n, :t, :u)'
                );
                $stmt->execute([
                    'n' => $d['nombre'],
                    't' => $d['tipo'] ?? 'beste',
                    'u' => $d['ubicacion_fisica'] ?? null,
                ]);
            } else {
                $stmt = $pdo->prepare('INSERT INTO categorias (nombre, descripcion) VALUES (:n, :d)');
                $stmt->execute(['n' => $d['nombre'], 'd' => $d['descripcion'] ?? null]);
            }
            json_response(['ok' => true, 'id' => $pdo->lastInsertId()], 201);
            break;

        case 'PUT':
            require_admin();
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            $d = read_json_body();
            require_fields($d, ['nombre']);

            if ($tabla === 'gelas') {
                $stmt = $pdo->prepare(
                    'UPDATE gelas SET nombre=:n, tipo=:t, ubicacion_fisica=:u WHERE id=:id'
                );
                $stmt->execute([
                    'n' => $d['nombre'], 't' => $d['tipo'] ?? 'beste',
                    'u' => $d['ubicacion_fisica'] ?? null, 'id' => $id,
                ]);
            } else {
                $stmt = $pdo->prepare('UPDATE categorias SET nombre=:n, descripcion=:d WHERE id=:id');
                $stmt->execute(['n' => $d['nombre'], 'd' => $d['descripcion'] ?? null, 'id' => $id]);
            }
            json_response(['ok' => true]);
            break;

        case 'DELETE':
            require_admin();
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            try {
                $pdo->prepare("DELETE FROM `$tabla` WHERE id = ?")->execute([$id]);
                json_response(['ok' => true]);
            } catch (PDOException $e) {
                json_response(['error' => 'Ezin da ezabatu: erregistro erlazionatuak daude.'], 409);
            }
            break;

        default:
            json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}
