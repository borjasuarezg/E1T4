<?php
/**
 * /api/compras
 * Registrar una compra guarda la fecha de compra y actualiza el stock
 * del equipo automáticamente (vía trigger trg_compras_after_insert,
 * ver database/schema.sql). Si el equipo no existe todavía, primero
 * hay que darlo de alta en /api/equipos ("ez bada existitzen alta eman").
 */
require_once __DIR__ . '/../auth.php';

function compras_handle(string $method, ?int $id): void
{
    require_login();
    $pdo = get_db();

    switch ($method) {
        case 'GET':
            $rows = $pdo->query(
                'SELECT c.*, e.nombre AS equipo_nombre
                 FROM compras c JOIN equipos e ON e.id = c.equipo_id
                 ORDER BY c.fecha_compra DESC'
            )->fetchAll();
            json_response($rows);
            break;

        case 'POST':
            $d = read_json_body();
            require_fields($d, ['equipo_id', 'fecha_compra', 'cantidad']);

            if (!ctype_digit((string)$d['cantidad']) || (int)$d['cantidad'] <= 0) {
                json_response(['error' => 'Kantitateak zenbaki positiboa izan behar du.'], 422);
            }
            $chk = $pdo->prepare('SELECT id FROM equipos WHERE id = ?');
            $chk->execute([$d['equipo_id']]);
            if (!$chk->fetch()) {
                json_response(['error' => 'Ekipo hori ez da existitzen. Lehenengo alta eman.'], 404);
            }

            $user = current_user();
            $stmt = $pdo->prepare(
                'INSERT INTO compras (equipo_id, fecha_compra, cantidad, proveedor, precio_unitario, usuario_id)
                 VALUES (:eq, :f, :c, :p, :pu, :u)'
            );
            $stmt->execute([
                'eq' => $d['equipo_id'],
                'f'  => $d['fecha_compra'],
                'c'  => $d['cantidad'],
                'p'  => $d['proveedor'] ?? null,
                'pu' => $d['precio_unitario'] ?? null,
                'u'  => $user['id'] ?? null,
            ]);
            json_response(['ok' => true, 'id' => $pdo->lastInsertId()], 201);
            break;

        default:
            json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}
