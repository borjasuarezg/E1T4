<?php

require_once __DIR__ . '/../ereduak/ErabiltzaileakEredua.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

class ErabiltzaileakKontroladorea
{
    private ErabiltzaileakEredua $model;

    public function __construct(PDO $pdo)
    {
        $this->model = new ErabiltzaileakEredua($pdo);
    }

    public function handle(string $metodoa, ?int $id): void
    {
        // CSRF baliozkotzea idazketa-eragiketetan (saioa badago soilik)
        if (isset($_SESSION['user']) && in_array($metodoa, ['POST', 'PUT', 'DELETE'])) {
            $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            if (!verify_csrf_token($csrfHeader)) {
                json_response(['error' => 'CSRF token baliogabea.'], 403);
            }
        }

        require_admin();

        switch ($metodoa) {
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
