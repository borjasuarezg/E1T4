<?php

require_once __DIR__ . '/../db.php';

class EkipamenduakEredua
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll(): array
    {
        $stmt = $this->pdo->query(
            'SELECT b.id, b.izena, b.deskribapena, b.marka, b.modeloa,
                    b.kategoriaId, k.izena AS kategoria_izena,
                    (SELECT COUNT(*) FROM gailuak g WHERE g.baliabideId = b.id) AS stock
             FROM baliabideak b
             LEFT JOIN kategoriak k ON k.id = b.kategoriaId
             ORDER BY b.izena'
        );
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, izena, deskribapena, marka, modeloa, kategoriaId FROM baliabideak WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public function create(array $d): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO baliabideak (kategoriaId, izena, deskribapena, marka, modeloa)
             VALUES (:kategoriaId, :izena, :deskribapena, :marka, :modeloa)'
        );
        $stmt->execute([
            'kategoriaId'   => $d['kategoriaId'],
            'izena'         => $d['izena'],
            'deskribapena'  => $d['deskribapena'] ?? null,
            'marka'         => $d['marka'] ?? null,
            'modeloa'       => $d['modeloa'] ?? null,
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    public function update(int $id, array $d): bool
    {
        $stmt = $this->pdo->prepare(
            'UPDATE baliabideak
             SET kategoriaId = :kategoriaId, izena = :izena, deskribapena = :deskribapena, marka = :marka, modeloa = :modeloa
             WHERE id = :id'
        );
        return $stmt->execute([
            'kategoriaId'  => $d['kategoriaId'],
            'izena'        => $d['izena'],
            'deskribapena' => $d['deskribapena'] ?? null,
            'marka'        => $d['marka'] ?? null,
            'modeloa'      => $d['modeloa'] ?? null,
            'id'           => $id,
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM baliabideak WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
