<?php

require_once __DIR__ . '/../models/EquiposModel.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

class EquiposController
{
    private EquiposModel $model;

    public function __construct(PDO $pdo)
    {
        $this->model = new EquiposModel($pdo);
    }

    public function handle(string $method, ?int $id): void
    {
        require_login();

        // Validación CSRF para operaciones de escritura
        if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
            $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            if (!verify_csrf_token($csrfHeader)) {
                json_response(['error' => 'Token CSRF inválido.'], 403);
            }
        }

        switch ($method) {
            case 'GET':
                if ($id !== null) {
                    $row = $this->model->getById($id);
                    if (!$row) {
                        json_response(['error' => 'Ez da aurkitu.'], 404);
                    }
                    json_response($row);
                    return;
                }
                json_response($this->model->getAll());
                return;

            case 'POST':
                require_admin();
                $d = read_json_body();
                require_fields($d, ['nombre', 'categoria_id']);
                try {
                    $newId = $this->model->create($d);
                    json_response(['ok' => true, 'id' => $newId], 201);
                } catch (PDOException $e) {
                    json_response(['error' => 'Ezin izan da sortu.'], 500);
                }
                return;

            case 'PUT':
                require_admin();
                if ($id === null) {
                    json_response(['error' => 'ID beharrezkoa da.'], 400);
                }
                $d = read_json_body();
                require_fields($d, ['nombre', 'categoria_id']);
                try {
                    $this->model->update($id, $d);
                    json_response(['ok' => true]);
                } catch (PDOException $e) {
                    json_response(['error' => 'Ezin izan da eguneratu.'], 500);
                }
                return;

            case 'DELETE':
                require_admin();
                if ($id === null) {
                    json_response(['error' => 'ID beharrezkoa da.'], 400);
                }
                try {
                    $this->model->delete($id);
                    json_response(['ok' => true]);
                } catch (PDOException $e) {
                    json_response(['error' => 'Ezin da ezabatu: gailu inbentariatuak ditu.'], 409);
                }
                return;

            default:
                json_response(['error' => 'Metodoa ez da onartzen.'], 405);
                return;
        }
    }
}
