<?php
/**
 * /api/usuarios - Solo accesible por admin
 * ("Admin rola duten erabiltzaileak izango dira erabiltzaile taula kudeatu
 *  dezaketen bakarrak").
 */
require_once __DIR__ . '/../auth.php';

function usuarios_handle(string $method, ?int $id): void
{
    require_admin();
    $pdo = get_db();

    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare(
                    'SELECT id, username, email, rol, activo, creado_en FROM usuarios WHERE id = ?'
                );
                $stmt->execute([$id]);
                $row = $stmt->fetch();
                if (!$row) json_response(['error' => 'Ez da aurkitu.'], 404);
                json_response($row);
            } else {
                json_response($pdo->query(
                    'SELECT id, username, email, rol, activo, creado_en FROM usuarios ORDER BY username'
                )->fetchAll());
            }
            break;

        case 'PUT':
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            $d = read_json_body();
            require_fields($d, ['username', 'email', 'rol']);

            $sql = 'UPDATE usuarios SET username=:u, email=:e, rol=:r, activo=:a WHERE id=:id';
            $params = [
                'u' => $d['username'], 'e' => $d['email'], 'r' => $d['rol'],
                'a' => $d['activo'] ?? 1, 'id' => $id,
            ];

            // Si se envía nueva contraseña, se rehashea (nunca se guarda en texto plano)
            if (!empty($d['password'])) {
                $sql = 'UPDATE usuarios SET username=:u, email=:e, rol=:r, activo=:a, password_hash=:p WHERE id=:id';
                $params['p'] = password_hash($d['password'], PASSWORD_DEFAULT);
            }

            $pdo->prepare($sql)->execute($params);
            json_response(['ok' => true]);
            break;

        case 'DELETE':
            if (!$id) json_response(['error' => 'ID beharrezkoa da.'], 400);
            $pdo->prepare('UPDATE usuarios SET activo = 0 WHERE id = ?')->execute([$id]);
            json_response(['ok' => true]);
            break;

        default:
            json_response(['error' => 'Metodoa ez da onartzen. Erabili /api/auth/register erabiltzaile berriak sortzeko.'], 405);
    }
}
