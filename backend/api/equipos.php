<?php
require_once __DIR__ . '/../auth.php';

function equipos_handle(string $method, ?int $id): void
{
    require_login();
    $pdo = get_db();

    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare('SELECT id, izena AS nombre, deskribapena, marka, modeloa AS modelo, kategoriaId AS categoria_id FROM baliabideak WHERE id = ?');
                $stmt->execute([$id]);
                $row = $stmt->fetch();
                if (!$row) json_response(['error' => 'Ez da aurkitu.'], 404);
                json_response($row);
            } else {
                $rows = $pdo->query(
                    'SELECT b.id, b.izena AS nombre, b.deskribapena, b.marka, b.modeloa AS modelo, 
                            b.kategoriaId AS categoria_id, k.izena AS categoria_nombre,
                            (SELECT COUNT(*) FROM gailuak g WHERE g.baliabideId = b.id) AS stock
                     FROM baliabideak b 
                     LEFT JOIN kategoriak k ON k.id = b.kategoriaId
                     ORDER BY b.izena'
                )->fetchAll();
                json_response($rows);
            }
            break;

        case 'POST':
            require_admin();
            $d = read_json_body();
            require_fields($d, ['nombre', 'categoria_id']);

            $stmt = $pdo->prepare(
                'INSERT INTO baliabideak (kategoriaId, izena, deskribapena, marka, modeloa)
                 VALUES (:categoria_id, :nombre, :descripcion, :marca, :modelo)'
            );
            $stmt->execute([
                'categoria_id' => $d['categoria_id'],
                'nombre'       => $d['nombre'],
                'descripcion'  => $d['descripcion'] ?? null,
                'marca'        => $d['marca'] ?? null,
                'modelo'       => $d['modelo'] ?? null,
            ]);
            json_response(['ok' => true, 'id' => $pdo->lastInsertId()], 201);
            break;

        case 'PUT':
            require_admin();
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            $d = read_json_body();
            require_fields($d, ['nombre', 'categoria_id']);

            $stmt = $pdo->prepare(
                'UPDATE baliabideak 
                 SET kategoriaId = :categoria_id, izena = :nombre, deskribapena = :descripcion, marka = :marca, modeloa = :modelo 
                 WHERE id = :id'
            );
            $stmt->execute([
                'categoria_id' => $d['categoria_id'],
                'nombre'       => $d['nombre'],
                'descripcion'  => $d['descripcion'] ?? null,
                'marca'        => $d['marca'] ?? null,
                'modelo'       => $d['modelo'] ?? null,
                'id'           => $id,
            ]);
            json_response(['ok' => true]);
            break;

        case 'DELETE':
            require_admin();
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            try {
                $stmt = $pdo->prepare('DELETE FROM baliabideak WHERE id = ?');
                $stmt->execute([$id]);
                json_response(['ok' => true]);
            } catch (PDOException $e) {
                json_response(['error' => 'Ezin da ezabatu: gailu inbentariatuak ditu.'], 409);
            }
            break;

        default:
            json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}