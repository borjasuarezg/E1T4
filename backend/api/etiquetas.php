<?php
require_once __DIR__ . '/../auth.php';

function etiquetas_handle(string $method, ?int $id, array $extra = []): void
{
    require_login();
    $pdo = get_db();
    $action = $extra['action'] ?? null;

    switch ($method) {
        case 'GET':
            $rows = $pdo->query(
                'SELECT g.id, g.etiketa AS codigo, g.erosketaData AS fecha_alta, g.egoera, 
                        b.izena AS equipo_nombre, m.gelaId AS gela_id
                 FROM gailuak g
                 JOIN baliabideak b ON b.id = g.baliabideId
                 LEFT JOIN mugimenduak m ON m.gailuId = g.id AND m.amaieraData IS NULL
                 ORDER BY g.id DESC'
            )->fetchAll();
            json_response($rows);
            break;

        case 'POST':
            $d = read_json_body();
            require_fields($d, ['codigo', 'equipo_id', 'gela_id']);

            $pdo->beginTransaction();
            try {
                $ins = $pdo->prepare(
                    'INSERT INTO gailuak (baliabideId, etiketa, erosketaData, egoera) VALUES (:b, :e, :f, :eg)'
                );
                $ins->execute([
                    'b'  => $d['equipo_id'],
                    'e'  => $d['codigo'],
                    'f'  => $d['fecha_alta'] ?? date('Y-m-d'),
                    'eg' => $d['egoera'] ?? 'Operatiboa',
                ]);
                $gailuId = (int)$pdo->lastInsertId();

                $user = current_user();
                $insMug = $pdo->prepare(
                    'INSERT INTO mugimenduak (gelaId, gailuId, erabiltzaileId, hasieraData) VALUES (:gela, :gailu, :erab, :f)'
                );
                $insMug->execute([
                    'gela'  => $d['gela_id'],
                    'gailu' => $gailuId,
                    'erab'  => $user['id'] ?? 1,
                    'f'     => date('Y-m-d')
                ]);

                $pdo->commit();
                json_response(['ok' => true, 'id' => $gailuId], 201);
            } catch (Exception $e) {
                $pdo->rollBack();
                json_response(['error' => 'Ezin izan da etiketa gorde.'], 500);
            }
            break;

        case 'PATCH':
            if ($action === 'ubicacion' && $id) {
                $d = read_json_body();
                require_fields($d, ['gela_id']);

                $pdo->beginTransaction();
                try {
                    $upd = $pdo->prepare('UPDATE mugimenduak SET amaieraData = :f WHERE gailuId = :g AND amaieraData IS NULL');
                    $upd->execute(['f' => date('Y-m-d'), 'g' => $id]);

                    $user = current_user();
                    $ins = $pdo->prepare('INSERT INTO mugimenduak (gelaId, gailuId, erabiltzaileId, hasieraData) VALUES (:gela, :gailu, :erab, :f)');
                    $ins->execute([
                        'gela'  => $d['gela_id'],
                        'gailu' => $id,
                        'erab'  => $user['id'] ?? 1,
                        'f'     => date('Y-m-d')
                    ]);

                    $pdo->commit();
                    json_response(['ok' => true]);
                } catch (Exception $e) {
                    $pdo->rollBack();
                    json_response(['error' => 'Ezin izan da kokapena aldatu.'], 500);
                }
            } else {
                json_response(['error' => 'Akzio baliogabea.'], 400);
            }
            break;

        case 'DELETE':
            require_admin();
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            $pdo->prepare('DELETE FROM gailuak WHERE id = ?')->execute([$id]);
            json_response(['ok' => true]);
            break;

        default:
            json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}