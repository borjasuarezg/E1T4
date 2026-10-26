<?php
require_once __DIR__ . '/../auth.php';

function usuarios_handle(string $method, ?int $id): void
{
    require_admin();
    $pdo = get_db();

    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare('SELECT id, username, rol FROM erabiltzaileak WHERE id = ?');
                $stmt->execute([$id]);
                $row = $stmt->fetch();
                if (!$row) json_response(['error' => 'Ez da aurkitu.'], 404);
                json_response($row);
            } else {
                json_response($pdo->query('SELECT id, username, rol FROM erabiltzaileak ORDER BY username')->fetchAll());
            }
            break;

        case 'PUT':
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            $d = read_json_body();
            require_fields($d, ['username', 'rol']);

            $sql = 'UPDATE erabiltzaileak SET username=:u, rol=:r WHERE id=:id';
            $params = ['u' => $d['username'], 'r' => $d['rol'], 'id' => $id];

            if (!empty($d['password'])) {
                $sql = 'UPDATE erabiltzaileak SET username=:u, rol=:r, pasahitza=:p WHERE id=:id';
                $params['p'] = password_hash($d['password'], PASSWORD_DEFAULT);
            }

            $pdo->prepare($sql)->execute($params);
            json_response(['ok' => true]);
            break;

        case 'DELETE':
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            $pdo->prepare('DELETE FROM erabiltzaileak WHERE id = ?')->execute([$id]);
            json_response(['ok' => true]);
            break;

        default:
            json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}