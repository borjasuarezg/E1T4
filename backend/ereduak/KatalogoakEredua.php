<?php

require_once __DIR__ . '/../db.php';

class KatalogoakEredua
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll(string $taula): array
    {
        if ($taula === 'gelak') {
            $stmt = $this->pdo->query('SELECT id, izena, taldea FROM gelak ORDER BY izena');
        } else {
            $stmt = $this->pdo->query('SELECT id, izena FROM kategoriak ORDER BY izena');
        }
        return $stmt->fetchAll();
    }

    public function create(string $taula, array $d): int
    {
        if ($taula === 'gelak') {
            $stmt = $this->pdo->prepare('INSERT INTO gelak (izena, taldea) VALUES (:n, :t)');
            $stmt->execute(['n' => $d['izena'], 't' => $d['taldea'] ?? null]);
        } else {
            $stmt = $this->pdo->prepare('INSERT INTO kategoriak (izena) VALUES (:n)');
            $stmt->execute(['n' => $d['izena']]);
        }
        return (int)$this->pdo->lastInsertId();
    }

    public function delete(string $taula, int $id): bool
    {
        $taulaBenetakoa = ($taula === 'gelak') ? 'gelak' : 'kategoriak';
        $stmt = $this->pdo->prepare("DELETE FROM `$taulaBenetakoa` WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
