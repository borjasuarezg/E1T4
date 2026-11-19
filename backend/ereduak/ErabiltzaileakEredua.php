<?php

require_once __DIR__ . '/../db.php';

class ErabiltzaileakEredua
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll(): array
    {
        $stmt = $this->pdo->query('SELECT id, username, rol FROM erabiltzaileak ORDER BY username');
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, username, rol FROM erabiltzaileak WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public function update(int $id, array $d): bool
    {
        if (!empty($d['password'])) {
            $stmt = $this->pdo->prepare('UPDATE erabiltzaileak SET username=:u, rol=:r, pasahitza=:p WHERE id=:id');
            return $stmt->execute([
                'u' => $d['username'],
                'r' => $d['rol'],
                'p' => password_hash($d['password'], PASSWORD_DEFAULT),
                'id' => $id,
            ]);
        }

        $stmt = $this->pdo->prepare('UPDATE erabiltzaileak SET username=:u, rol=:r WHERE id=:id');
        return $stmt->execute([
            'u' => $d['username'],
            'r' => $d['rol'],
            'id' => $id,
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM erabiltzaileak WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
