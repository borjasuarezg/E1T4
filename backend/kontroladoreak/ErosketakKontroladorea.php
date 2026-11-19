<?php
declare(strict_types=1);

require_once __DIR__ . '/../ereduak/ErosketakEredua.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

class ErosketakKontroladorea
{
    private ErosketakEredua $model;

    public function __construct(PDO $pdo)
    {
        $this->model = new ErosketakEredua($pdo);
    }

    public function handle(string $metodoa, ?int $id): void
    {
        require_login();

        // CSRF baliozkotzea idazketa-eragiketetan
        if (in_array($metodoa, ['POST', 'DELETE'])) {
            $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            if (!verify_csrf_token($csrfHeader)) {
                json_response(['error' => 'CSRF token baliogabea.'], 403);
            }
        }

        if ($metodoa === 'POST') {
            require_admin();
            $d = read_json_body();

            $baliabideId = $d['baliabideId'] ?? null;
            if (!$baliabideId) {
                json_response(['error' => 'Ekipamendua (baliabideId) beharrezkoa da.'], 422);
            }

            try {
                $res = $this->model->erregistratu($d);
                json_response($res, 201);
            } catch (PDOException $e) {
                if ($e->getCode() === '23000') {
                    json_response(['error' => 'Etiketa hori jadanik existitzen da.'], 409);
                }
                json_response(['error' => 'Ezin izan da erosketa erregistratu.'], 500);
            }
            return;
        }

        if ($metodoa === 'GET') {
            json_response($this->model->getAll());
            return;
        }

        json_response(['error' => 'Metodoa ez da onartzen.'], 405);
    }
}
