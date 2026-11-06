<?php
declare(strict_types=1);

require_once __DIR__ . '/../models/ComprasModel.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

class ComprasController
{
    private ComprasModel $model;

    public function __construct(PDO $pdo)
    {
        $this->model = new ComprasModel($pdo);
    }

    public function handle(string $method, ?int $id): void
    {
        require_login();

        // Validación CSRF para operaciones de escritura
        if (in_array($method, ['POST', 'DELETE'])) {
            $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            if (!verify_csrf_token($csrfHeader)) {
                json_response(['error' => 'Token CSRF inválido.'], 403);
            }
        }

        if ($method === 'POST') {
            require_admin();
            $d = read_json_body();
            
            $equipoId = $d['baliabideId'] ?? $d['equipo_id'] ?? null;
            if (!$equipoId) {
                json_response(['error' => 'Ekipoa (baliabideId edo equipo_id) beharrezkoa da.'], 422);
            }

            try {
                $res = $this->model->registrar($d);
                json_response($res, 201);
            } catch (PDOException $e) {
                if ($e->getCode() === '23000') {
                    json_response(['error' => 'Etiketa hori jadanik existitzen da.'], 409);
                }
                json_response(['error' => 'Ezin izan da erosketa erregistratu.'], 500);
            }
            return;
        }

        if ($method === 'GET') {
            json_response($this->model->getAll());
            return;
        }

        json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}
