<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';

class ComprasModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll(): array
    {
        $stmt = $this->pdo->query(
            "SELECT b.id AS equipo_id, b.izena AS equipo_nombre,
                    COALESCE(CAST(g.erosketaData AS CHAR), '—') AS fecha_compra,
                    COUNT(g.id) AS cantidad
             FROM gailuak g
             JOIN baliabideak b ON b.id = g.baliabideId
             GROUP BY b.id, b.izena, g.erosketaData
             ORDER BY g.erosketaData DESC"
        );
        return $stmt->fetchAll();
    }

    public function registrar(array $d): array
    {
        $this->pdo->beginTransaction();
        try {
            $baliabideId = (int)($d['baliabideId'] ?? $d['equipo_id'] ?? 0);
            $fecha = $d['erosketaData'] ?? $d['fecha_compra'] ?? date('Y-m-d');
            $cantidad = max(1, (int)($d['cantidad'] ?? 1));
            $egoera = $d['egoera'] ?? 'Operatiboa';
            $ids = [];

            $stmt = $this->pdo->prepare(
                'INSERT INTO gailuak (baliabideId, etiketa, erosketaData, egoera)
                 VALUES (:baliabideId, :etiketa, :erosketaData, :egoera)'
            );

            for ($i = 0; $i < $cantidad; $i++) {
                if (!empty($d['etiketa']) && $cantidad === 1) {
                    $etiketa = (string)$d['etiketa'];
                } else {
                    $etiketa = sprintf('ETK-%d-%s-%03d-%s', $baliabideId, date('Ymd', strtotime($fecha)), $i + 1, bin2hex(random_bytes(2)));
                }

                $stmt->execute([
                    'baliabideId'  => $baliabideId,
                    'etiketa'      => $etiketa,
                    'erosketaData' => $fecha,
                    'egoera'       => $egoera,
                ]);
                $gailuId = (int)$this->pdo->lastInsertId();
                $ids[] = $gailuId;

                if (!empty($d['gelaId'])) {
                    $user = $_SESSION['user'] ?? null;
                    $erabiltzaileId = $user['id'] ?? 1;
                    $stmtM = $this->pdo->prepare('INSERT INTO mugimenduak (gelaId, gailuId, erabiltzaileId, hasieraData) VALUES (:gelaId, :gailuId, :erabiltzaileId, :hasieraData)');
                    $stmtM->execute([
                        'gelaId'         => $d['gelaId'],
                        'gailuId'        => $gailuId,
                        'erabiltzaileId' => $erabiltzaileId,
                        'hasieraData'    => $fecha,
                    ]);
                }
            }

            $this->pdo->commit();
            return ['ok' => true, 'id' => $ids[0] ?? 0, 'ids' => $ids, 'cantidad' => $cantidad];
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}