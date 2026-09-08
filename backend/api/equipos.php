<?php
/**
 * CRUD de /api/equipos
 * Todas las operaciones de escritura validan de nuevo en el servidor
 * aunque el cliente ya haya validado (validación por duplicado, requisito del reto).
 */
require_once __DIR__ . '/../auth.php';

function equipos_validate(array $d, PDO $pdo, ?int $ignoreId = null): array
{
    $errores = [];
    if (empty($d['nombre']) || mb_strlen($d['nombre']) > 120) {
        $errores[] = 'Izena beharrezkoa da (gehienez 120 karaktere).';
    }
    if (empty($d['marca'])) $errores[] = 'Marka beharrezkoa da.';
    if (empty($d['modelo'])) $errores[] = 'Modeloa beharrezkoa da.';
    if (empty($d['categoria_id']) || !ctype_digit((string)$d['categoria_id'])) {
        $errores[] = 'Kategoria baliozkoa aukeratu behar da.';
    } else {
        $stmt = $pdo->prepare('SELECT id FROM categorias WHERE id = ?');
        $stmt->execute([$d['categoria_id']]);
        if (!$stmt->fetch()) $errores[] = 'Kategoria hori ez da existitzen.';
    }
    if (isset($d['stock']) && (!is_numeric($d['stock']) || $d['stock'] < 0)) {
        $errores[] = 'Stock-a zenbaki positiboa izan behar da.';
    }
    return $errores;
}

function equipos_handle(string $method, ?int $id): void
{
    require_login();
    $pdo = get_db();

    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare('SELECT * FROM equipos WHERE id = ?');
                $stmt->execute([$id]);
                $row = $stmt->fetch();
                if (!$row) json_response(['error' => 'Ez da aurkitu.'], 404);
                json_response($row);
            } else {
                $rows = $pdo->query(
                    'SELECT e.*, c.nombre AS categoria_nombre
                     FROM equipos e JOIN categorias c ON c.id = e.categoria_id
                     ORDER BY e.nombre'
                )->fetchAll();
                json_response($rows);
            }
            break;

        case 'POST':
            $d = read_json_body();
            $errores = equipos_validate($d, $pdo);
            if ($errores) json_response(['errores' => $errores], 422);

            $stmt = $pdo->prepare(
                'INSERT INTO equipos (nombre, descripcion, marca, modelo, categoria_id, es_fungible, stock)
                 VALUES (:nombre, :descripcion, :marca, :modelo, :categoria_id, :es_fungible, :stock)'
            );
            $stmt->execute([
                'nombre'       => $d['nombre'],
                'descripcion'  => $d['descripcion'] ?? null,
                'marca'        => $d['marca'],
                'modelo'       => $d['modelo'],
                'categoria_id' => $d['categoria_id'],
                'es_fungible'  => !empty($d['es_fungible']) ? 1 : 0,
                'stock'        => $d['stock'] ?? 0,
            ]);
            json_response(['ok' => true, 'id' => $pdo->lastInsertId()], 201);
            break;

        case 'PUT':
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            $d = read_json_body();
            $errores = equipos_validate($d, $pdo, $id);
            if ($errores) json_response(['errores' => $errores], 422);

            $stmt = $pdo->prepare(
                'UPDATE equipos SET nombre=:nombre, descripcion=:descripcion, marca=:marca,
                 modelo=:modelo, categoria_id=:categoria_id, es_fungible=:es_fungible, stock=:stock
                 WHERE id=:id'
            );
            $stmt->execute([
                'nombre'       => $d['nombre'],
                'descripcion'  => $d['descripcion'] ?? null,
                'marca'        => $d['marca'],
                'modelo'       => $d['modelo'],
                'categoria_id' => $d['categoria_id'],
                'es_fungible'  => !empty($d['es_fungible']) ? 1 : 0,
                'stock'        => $d['stock'] ?? 0,
                'id'           => $id,
            ]);
            json_response(['ok' => true]);
            break;

        case 'DELETE':
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            $stmt = $pdo->prepare('DELETE FROM equipos WHERE id = ?');
            $stmt->execute([$id]);
            json_response(['ok' => true]);
            break;

        default:
            json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}
