<?php

require_once __DIR__ . '/../models/EtiquetasModel.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

class EtiquetasController
{
    private EtiquetasModel $model;

    public function __construct(PDO $pdo)
    {
        $this->model = new EtiquetasModel($pdo);
    }

    public function handle(string $method, ?int $id, array $opts = []): void
    {
        require_login();
        $accion = $opts['action'] ?? null;

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
                if ($accion === 'mugitu') {
                    $d = read_json_body();
                    require_fields($d, ['gailuId', 'gelaId']);
                    try {
                        $this->model->move($d);
                        json_response(['ok' => true]);
                    } catch (PDOException $e) {
                        json_response(['error' => 'Ezin izan da mugitu.'], 500);
                    }
                    return;
                }

                $d = read_json_body();
                require_fields($d, ['baliabideId', 'etiketa']);
                try {
                    $newId = $this->model->create($d);
                    json_response(['ok' => true, 'id' => $newId], 201);
                } catch (PDOException $e) {
                    if ($e->getCode() === '23000') {
                        json_response(['error' => 'Etiketa hori jadanik existitzen da.'], 409);
                    }
                    json_response(['error' => 'Ezin izan da sortu.'], 500);
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
                    json_response(['error' => 'Ezin da ezabatu erlazionatutako datuak daudelako.'], 409);
                }
                return;

            default:
                json_response(['error' => 'Metodoa ez da onartzen.'], 405);
                return;
        }
    }
}
