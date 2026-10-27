<?php

require_once __DIR__ . '/../db.php';

class EtiquetasModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll(): array
    {
        $stmt = $this->pdo->query(
            "SELECT g.id, g.etiketa, g.egoera, g.erosketaData AS erosketa_data,
                    b.id AS baliabideId, b.izena AS baliabide_izena, b.marka, b.modeloa,
                    k.id AS kategoriaId, k.izena AS kategoria_izena,
                    m.id AS mugimenduId, m.gelaId, ge.izena AS gela_izena
             FROM gailuak g
             JOIN baliabideak b ON b.id = g.baliabideId
             LEFT JOIN kategoriak k ON k.id = b.kategoriaId
             LEFT JOIN mugimenduak m ON m.gailuId = g.id AND m.amaieraData IS NULL
             LEFT JOIN gelak ge ON ge.id = m.gelaId
             ORDER BY g.etiketa"
        );
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            "SELECT g.id, g.etiketa, g.egoera, g.erosketaData AS erosketa_data, g.baliabideId,
                    b.izena AS baliabide_izena, m.gelaId, ge.izena AS gela_izena
             FROM gailuak g
             JOIN baliabideak b ON b.id = g.baliabideId
             LEFT JOIN mugimenduak m ON m.gailuId = g.id AND m.amaieraData IS NULL
             LEFT JOIN gelak ge ON ge.id = m.gelaId
             WHERE g.id = ?"
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public function create(array $d): int
    {
        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare('INSERT INTO gailuak (baliabideId, etiketa, erosketaData, egoera) VALUES (:baliabideId, :etiketa, :erosketaData, :egoera)');
            $stmt->execute([
                'baliabideId' => $d['baliabideId'],
                'etiketa'     => $d['etiketa'],
                'erosketaData'=> $d['erosketaData'] ?? null,
                'egoera'      => $d['egoera'] ?? 'Operatiboa',
            ]);
            $gailuId = (int)$this->pdo->lastInsertId();

            if (!empty($d['gelaId'])) {
                $user = $_SESSION['user'] ?? null;
                $erabiltzaileId = $user['id'] ?? 1;
                $stmtM = $this->pdo->prepare('INSERT INTO mugimenduak (gelaId, gailuId, erabiltzaileId, hasieraData) VALUES (:gelaId, :gailuId, :erabiltzaileId, :hasieraData)');
                $stmtM->execute([
                    'gelaId'        => $d['gelaId'],
                    'gailuId'       => $gailuId,
                    'erabiltzaileId'=> $erabiltzaileId,
                    'hasieraData'   => $d['erosketaData'] ?? date('Y-m-d'),
                ]);
            }

            $this->pdo->commit();
            return $gailuId;
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM gailuak WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function move(array $d): bool
    {
        $this->pdo->beginTransaction();
        try {
            // Cerrar movimiento activo
            $stmtClose = $this->pdo->prepare('UPDATE mugimenduak SET amaieraData = :amaiera WHERE gailuId = :gailuId AND amaieraData IS NULL');
            $stmtClose->execute([
                'amaiera' => $d['hasieraData'] ?? date('Y-m-d'),
                'gailuId' => $d['gailuId'],
            ]);

            // Crear nuevo movimiento
            $user = $_SESSION['user'] ?? null;
            $erabiltzaileId = $user['id'] ?? 1;
            $stmtNew = $this->pdo->prepare('INSERT INTO mugimenduak (gelaId, gailuId, erabiltzaileId, hasieraData) VALUES (:gelaId, :gailuId, :erabiltzaileId, :hasieraData)');
            $stmtNew->execute([
                'gelaId'         => $d['gelaId'],
                'gailuId'        => $d['gailuId'],
                'erabiltzaileId' => $erabiltzaileId,
                'hasieraData'    => $d['hasieraData'] ?? date('Y-m-d'),
            ]);

            $this->pdo->commit();
            return true;
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
