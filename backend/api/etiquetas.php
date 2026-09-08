<?php
/**
 * CRUD de /api/etiquetas
 * Al dar de alta una etiqueta (inventariar una unidad):
 *  - Se comprueba que el equipo tenga stock disponible (stock no puede pasar de negativo).
 *  - Se descuenta 1 del stock del equipo.
 *  - Se crea el primer registro de ubicación (sala) para esa etiqueta.
 * Al cambiar de sala (PATCH /api/etiquetas/{id}/ubicacion):
 *  - Se cierra la ubicación anterior (fecha_fin = hoy) y se abre una nueva.
 */
require_once __DIR__ . '/../auth.php';

function etiquetas_handle(string $method, ?int $id, array $extra = []): void
{
    require_login();
    $pdo = get_db();

    // Cambio de ubicación: PATCH /api/etiquetas/{id}/ubicacion { gela_id }
    if ($method === 'PATCH' && ($extra['action'] ?? null) === 'ubicacion') {
        etiquetas_cambiar_ubicacion($pdo, $id);
        return;
    }

    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare(
                    'SELECT et.*, eq.nombre AS equipo_nombre, v.gela_nombre, v.gela_id
                     FROM etiquetas et
                     JOIN equipos eq ON eq.id = et.equipo_id
                     LEFT JOIN v_ubicacion_actual v ON v.etiqueta_id = et.id
                     WHERE et.id = ?'
                );
                $stmt->execute([$id]);
                $row = $stmt->fetch();
                if (!$row) json_response(['error' => 'Ez da aurkitu.'], 404);
                json_response($row);
            } else {
                $rows = $pdo->query(
                    'SELECT et.*, eq.nombre AS equipo_nombre, v.gela_nombre, v.gela_id
                     FROM etiquetas et
                     JOIN equipos eq ON eq.id = et.equipo_id
                     LEFT JOIN v_ubicacion_actual v ON v.etiqueta_id = et.id
                     ORDER BY et.id DESC'
                )->fetchAll();
                json_response($rows);
            }
            break;

        case 'POST':
            $d = read_json_body();
            require_fields($d, ['codigo', 'equipo_id', 'gela_id']);

            // Comprobar que la etiqueta no existe ya (requisito: "ez bada existitzen alta eman")
            $chk = $pdo->prepare('SELECT id FROM etiquetas WHERE codigo = ?');
            $chk->execute([$d['codigo']]);
            if ($chk->fetch()) {
                json_response(['error' => 'Etiketa hori dagoeneko existitzen da.'], 409);
            }

            $pdo->beginTransaction();
            try {
                // Bloquear la fila del equipo para comprobar/descontar stock de forma segura
                $stmt = $pdo->prepare('SELECT stock FROM equipos WHERE id = ? FOR UPDATE');
                $stmt->execute([$d['equipo_id']]);
                $equipo = $stmt->fetch();
                if (!$equipo) {
                    throw new RuntimeException('Ekipoa ez da existitzen.');
                }
                if ($equipo['stock'] <= 0) {
                    throw new RuntimeException('Ez dago stock-ik ekipo hori inbentariatzeko.');
                }

                $ins = $pdo->prepare(
                    'INSERT INTO etiquetas (codigo, equipo_id, fecha_alta) VALUES (:c, :e, :f)'
                );
                $ins->execute([
                    'c' => $d['codigo'],
                    'e' => $d['equipo_id'],
                    'f' => $d['fecha_alta'] ?? date('Y-m-d'),
                ]);
                $etiquetaId = $pdo->lastInsertId();

                $pdo->prepare('UPDATE equipos SET stock = stock - 1 WHERE id = ?')
                    ->execute([$d['equipo_id']]);

                $pdo->prepare(
                    'INSERT INTO ubicaciones (etiqueta_id, gela_id, fecha_inicio) VALUES (?, ?, ?)'
                )->execute([$etiquetaId, $d['gela_id'], $d['fecha_alta'] ?? date('Y-m-d')]);

                $pdo->commit();
                json_response(['ok' => true, 'id' => $etiquetaId], 201);
            } catch (Throwable $e) {
                $pdo->rollBack();
                json_response(['error' => $e->getMessage()], 422);
            }
            break;

        case 'DELETE':
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            $pdo->prepare('UPDATE etiquetas SET activa = 0 WHERE id = ?')->execute([$id]);
            json_response(['ok' => true]);
            break;

        default:
            json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}

function etiquetas_cambiar_ubicacion(PDO $pdo, ?int $id): void
{
    if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
    $d = read_json_body();
    require_fields($d, ['gela_id']);
    $hoy = date('Y-m-d');

    $pdo->beginTransaction();
    try {
        $pdo->prepare(
            'UPDATE ubicaciones SET fecha_fin = ? WHERE etiqueta_id = ? AND fecha_fin IS NULL'
        )->execute([$hoy, $id]);

        $pdo->prepare(
            'INSERT INTO ubicaciones (etiqueta_id, gela_id, fecha_inicio) VALUES (?, ?, ?)'
        )->execute([$id, $d['gela_id'], $hoy]);

        $pdo->commit();
        json_response(['ok' => true]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_response(['error' => $e->getMessage()], 422);
    }
}
