<?php
function get_db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $config = require __DIR__ . '/config.php';
        $c = $config['db'];

        $dsn = "mysql:host={$c['host']};port={$c['port']};dbname={$c['dbname']};charset={$c['charset']}";

        try {
            $pdo = new PDO($dsn, $c['user'], $c['pass'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            ]);
            $pdo->exec("SET time_zone = '+01:00'");
        } catch (PDOException $e) {
            http_response_code(500);
            error_log('DB connection error: ' . $e->getMessage());
            echo json_encode(['error' => 'Ezin izan da datu-basearekin konektatu.']);
            exit;
        }
    }

    return $pdo;
}