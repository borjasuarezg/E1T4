<?php

require_once __DIR__ . '/../db.php';

class ComprasModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function registrar(array $d): array
    {
        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare(
                'INSERT INTO gailuak (baliabideId, etiketa, erosketaData, egoera)
                 SELECT :baliabideId, :etiketa, :erosketaData, :egoera
                 WHERE NOT EXISTS (SELECT 1 FROM gailuak WHERE etiketa = :etiketa2)'
            );
            $stmt->execute([
                'baliabideId' => $d['baliabideId'],
                'etiketa'     => $d['etiketa'],
                'etiketa2'    => $d['etiketa'],
                'erosketaData'=> $d['erosketaData'] ?? date('Y-m-d'),
                'egoera'      => $d['egoera'] ?? 'Operatiboa',
            ]);
            if ($stmt->rowCount() === 0) {
                throw new PDOException('Duplicado', '23000');
            }
            $gailuId = (int)$this->pdo->lastInsertId();

            if (!empty($d['gelaId'])) {
                $user = $_SESSION['user'] ?? null;
                $erabiltzaileId = $user['id'] ?? 1;
                $stmtM = $this->pdo->prepare('INSERT INTO mugimenduak (gelaId, gailuId, erabiltzaileId, hasieraData) VALUES (:gelaId, :gailuId, :erabiltzaileId, :hasieraData)');
                $stmtM->execute([
                    'gelaId'         => $d['gelaId'],
                    'gailuId'        => $gailuId,
                    'erabiltzaileId' => $erabiltzaileId,
                    'hasieraData'    => $d['erosketaData'] ?? date('Y-m-d'),
                ]);
            }

            $this->pdo->commit();
            return ['ok' => true, 'id' => $gailuId];
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
