<?php

require_once __DIR__ . '/../ereduak/KatalogoakEredua.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

class KatalogoakKontroladorea
{
    private KatalogoakEredua $model;

    public function __construct(PDO $pdo)
    {
        $this->model = new KatalogoakEredua($pdo);
    }

    public function handle(string $taula, string $metodoa, ?int $id): void
    {
        require_login();

        // CSRF baliozkotzea idazketa-eragiketetan
        if (in_array($metodoa, ['POST', 'DELETE'])) {
            $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            if (!verify_csrf_token($csrfHeader)) {
                json_response(['error' => 'CSRF token baliogabea.'], 403);
            }
        }

        if (!in_array($taula, ['kategoriak', 'gelak'], true)) {
            json_response(['error' => 'Baliabidea ez da onartzen.'], 404);
        }

        switch ($metodoa) {
            case 'GET':
                json_response($this->model->getAll($taula));
                return;

            case 'POST':
                require_admin();
                $d = read_json_body();
                require_fields($d, ['izena']);
                try {
                    $newId = $this->model->create($taula, $d);
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
                    $this->model->delete($taula, $id);
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
