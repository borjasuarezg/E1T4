<?php

require_once __DIR__ . '/../db.php';

class CatalogosModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll(string $tabla): array
    {
        if ($tabla === 'gelas') {
            $stmt = $this->pdo->query("SELECT id, izena AS nombre, taldea FROM gelak ORDER BY izena");
        } else {
            $stmt = $this->pdo->query("SELECT id, izena AS nombre FROM kategoriak ORDER BY izena");
        }
        return $stmt->fetchAll();
    }

    public function create(string $tabla, array $d): int
    {
        if ($tabla === 'gelas') {
            $stmt = $this->pdo->prepare('INSERT INTO gelak (izena, taldea) VALUES (:n, :t)');
            $stmt->execute(['n' => $d['nombre'], 't' => $d['taldea'] ?? null]);
        } else {
            $stmt = $this->pdo->prepare('INSERT INTO kategoriak (izena) VALUES (:n)');
            $stmt->execute(['n' => $d['nombre']]);
        }
        return (int)$this->pdo->lastInsertId();
    }

    public function delete(string $tabla, int $id): bool
    {
        $tReal = ($tabla === 'gelas') ? 'gelak' : 'kategoriak';
        $stmt = $this->pdo->prepare("DELETE FROM `$tReal` WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
