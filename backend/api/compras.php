<?php
require_once __DIR__ . '/../auth.php';

function compras_handle(string $method, ?int $id): void
{
    require_login();
    $pdo = get_db();

    switch ($method) {
        case 'GET':
            $rows = $pdo->query(
                'SELECT g.id, g.baliabideId AS equipo_id, g.erosketaData AS fecha_compra, 1 AS cantidad, 
                        b.izena AS equipo_nombre
                 FROM gailuak g 
                 JOIN baliabideak b ON b.id = g.baliabideId
                 ORDER BY g.erosketaData DESC'
            )->fetchAll();
            json_response($rows);
            break;

        case 'POST':
            $d = read_json_body();
            require_fields($d, ['equipo_id', 'fecha_compra', 'cantidad']);

            $pdo->beginTransaction();
            try {
                $ins = $pdo->prepare(
                    'INSERT INTO gailuak (baliabideId, etiketa, erosketaData, egoera) VALUES (:b, :e, :f, :eg)'
                );

                $cantidad = (int)$d['cantidad'];
                for ($i = 0; $i < $cantidad; $i++) {
                    $codigoTemporal = 'AUTO-' . time() . '-' . rand(100, 999);
                    $ins->execute([
                        'b'  => $d['equipo_id'],
                        'e'  => $codigoTemporal,
                        'f'  => $d['fecha_compra'],
                        'eg' => 'Operatiboa',
                    ]);
                }

                $pdo->commit();
                json_response(['ok' => true], 201);
            } catch (Exception $e) {
                $pdo->rollBack();
                json_response(['error' => 'Ezin izan da erosketa gorde.'], 500);
            }
            break;

        default:
            json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}