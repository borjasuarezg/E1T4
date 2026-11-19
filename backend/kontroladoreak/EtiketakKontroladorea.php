<?php

require_once __DIR__ . '/../ereduak/EtiketakEredua.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

class EtiketakKontroladorea
{
    private EtiketakEredua $model;

    public function __construct(PDO $pdo)
    {
        $this->model = new EtiketakEredua($pdo);
    }

    public function handle(string $metodoa, ?int $id, array $opts = []): void
    {
        require_login();

        $ekintza = $opts['ekintza'] ?? null;

        if (in_array($metodoa, ['POST', 'PUT', 'DELETE', 'PATCH'])) {
            $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            if (!verify_csrf_token($csrfHeader)) {
                json_response(['error' => 'CSRF token baliogabea.'], 403);
            }
        }

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

            case 'POST':
                require_admin();
                if ($ekintza === 'mugitu') {
                    $d = read_json_body();
                    require_fields($d, ['gailuId']);
                    try {
                        $this->model->move($d);
                        json_response(['ok' => true]);
                    } catch (PDOException $e) {
                        json_response(['error' => 'Ezin izan da mugitu: ' . $e->getMessage()], 500);
                    }
                    return;
                }

                $d = read_json_body();

                $data = [
                    'baliabideId'  => $d['baliabideId'] ?? $d['ekipoId'] ?? null,
                    'etiketa'      => $d['etiketa'] ?? $d['kodea'] ?? null,
                    'erosketaData' => $d['erosketaData'] ?? date('Y-m-d'),
                    'egoera'       => $d['egoera'] ?? 'Operatiboa',
                    'gelaId'       => $d['gelaId'] ?? $d['hasierakoGela'] ?? null,
                ];

                if (!$data['baliabideId'] || !$data['etiketa']) {
                    json_response(['error' => 'Eremu hauek beharrezkoak dira: baliabideId, etiketa'], 422);
                }

                try {
                    $newId = $this->model->create($data);
                    json_response(['ok' => true, 'id' => $newId], 201);
                } catch (PDOException $e) {
                    if ($e->getCode() === '23000') {
                        json_response(['error' => 'Etiketa kode hori jadanik existitzen da edo gela baliogabea da.'], 409);
                    }
                    json_response(['error' => 'Ezin izan da sortu: ' . $e->getMessage()], 500);
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

            case 'PATCH':
                require_admin();
                if ($id === null || $ekintza !== 'kokapena') {
                    json_response(['error' => 'ID edo ekintza okerra.'], 400);
                }
                $d = read_json_body();
                $rawGela = $d['gelaId'] ?? $d['gela'] ?? null;
                $gelaId = ($rawGela === '' || $rawGela === null || (int)$rawGela === 0) ? null : (int)$rawGela;

                try {
                    $this->model->move([
                        'gailuId' => $id,
                        'gelaId'  => $gelaId,
                    ]);
                    json_response(['ok' => true]);
                } catch (PDOException $e) {
                    json_response(['error' => 'Ezin izan da mugitu: ' . $e->getMessage()], 500);
                }
                return;

            default:
                json_response(['error' => 'Metodoa ez da onartzen.'], 405);
                return;
        }
    }
}
