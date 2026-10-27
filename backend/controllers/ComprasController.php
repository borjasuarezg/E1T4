<?php

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

        if ($method === 'POST') {
            require_admin();
            $d = read_json_body();
            require_fields($d, ['baliabideId', 'etiketa']);
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
            // No listado específico en esquema; devolver vacío o resumen básico si se desea
            json_response([]);
            return;
        }

        json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}
