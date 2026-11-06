<?php

require_once __DIR__ . '/../models/CatalogosModel.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

class CatalogosController
{
    private CatalogosModel $model;

    public function __construct(PDO $pdo)
    {
        $this->model = new CatalogosModel($pdo);
    }

    public function handle(string $tabla, string $method, ?int $id): void
    {
        require_login();

        // Validación CSRF para operaciones de escritura
        if (in_array($method, ['POST', 'DELETE'])) {
            $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            if (!verify_csrf_token($csrfHeader)) {
                json_response(['error' => 'Token CSRF inválido.'], 403);
            }
        }

        if (!in_array($tabla, ['categorias', 'gelas'], true)) {
            json_response(['error' => 'Baliabidea ez da onartzen.'], 404);
        }

        switch ($method) {
            case 'GET':
                json_response($this->model->getAll($tabla));
                return;

            case 'POST':
                require_admin();
                $d = read_json_body();
                require_fields($d, ['nombre']);
                try {
                    $newId = $this->model->create($tabla, $d);
                    json_response(['ok' => true, 'id' => $newId], 201);
                } catch (PDOException $e) {
                    json_response(['error' => 'Ezin izan da sortu.'], 500);
                }
                return;

            case 'DELETE':
                require_admin();
                if ($id === null) {
                    json_response(['error' => 'ID beharrezkoa da.'], 400);
                }
                try {
                    $this->model->delete($tabla, $id);
                    json_response(['ok' => true]);
                } catch (PDOException $e) {
                    json_response(['error' => 'Ezin da ezabatu erlazionatutako datuak daudelako.'], 409);
                }
                return;

            default:
                json_response(['error' => 'Metodoa ez da onartzen.'], 405);
                return;
        }
    }
}
