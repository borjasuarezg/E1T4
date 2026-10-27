<?php

require_once __DIR__ . '/../db.php';

class EquiposModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll(): array
    {
        $stmt = $this->pdo->query(
            'SELECT b.id, b.izena AS nombre, b.deskribapena, b.marka, b.modeloa AS modelo, 
                    b.kategoriaId AS categoria_id, k.izena AS categoria_nombre,
                    (SELECT COUNT(*) FROM gailuak g WHERE g.baliabideId = b.id) AS stock
             FROM baliabideak b 
             LEFT JOIN kategoriak k ON k.id = b.kategoriaId
             ORDER BY b.izena'
        );
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, izena AS nombre, deskribapena, marka, modeloa AS modelo, kategoriaId AS categoria_id FROM baliabideak WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public function create(array $d): int
    {
        $stmt = $this->pdo->prepare(
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
        return (int)$this->pdo->lastInsertId();
    }

    public function update(int $id, array $d): bool
    {
        $stmt = $this->pdo->prepare(
            'UPDATE baliabideak 
             SET kategoriaId = :categoria_id, izena = :nombre, deskribapena = :descripcion, marka = :marca, modeloa = :modelo 
             WHERE id = :id'
        );
        return $stmt->execute([
            'categoria_id' => $d['categoria_id'],
            'nombre'       => $d['nombre'],
            'descripcion'  => $d['descripcion'] ?? null,
            'marca'        => $d['marca'] ?? null,
            'modelo'       => $d['modelo'] ?? null,
            'id'           => $id,
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM baliabideak WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
