<?php

require_once __DIR__ . '/../models/UsuariosModel.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

class UsuariosController
{
    private UsuariosModel $model;

    public function __construct(PDO $pdo)
    {
        $this->model = new UsuariosModel($pdo);
    }

    public function handle(string $method, ?int $id): void
    {
        require_admin();

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

            case 'PUT':
                if ($id === null) {
                    json_response(['error' => 'ID beharrezkoa da.'], 400);
                }
                $d = read_json_body();
                require_fields($d, ['username', 'rol']);
                try {
                    $this->model->update($id, $d);
                    json_response(['ok' => true]);
                } catch (PDOException $e) {
                    if ($e->getCode() === '23000') {
                        json_response(['error' => 'Erabiltzaile hori jadanik existitzen da.'], 409);
                    }
                    json_response(['error' => 'Ezin izan da eguneratu.'], 500);
                }
                return;

            case 'DELETE':
                if ($id === null) {
                    json_response(['error' => 'ID beharrezkoa da.'], 400);
                }
                try {
                    $this->model->delete($id);
                    json_response(['ok' => true]);
                } catch (PDOException $e) {
                    json_response(['error' => 'Ezin izan da ezabatu.'], 500);
                }
                return;

            default:
                json_response(['error' => 'Metodoa ez da onartzen.'], 405);
                return;
        }
    }
}
