<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/auth.php';

// IP lokala eta domeinua baimendutakoen zerrendan gehitu dira
$baimendutakoak = [
    'https://www.talde4.edu',
    'http://www.talde4.edu',
    'http://192.168.207.34',
    'https://192.168.207.34'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Jatorria zerrendan badago edo tokiko saretik badator, itzulitako jatorria bidaltzen dugu
if (in_array($origin, $baimendutakoak, true) || preg_match('#^https?://192\.168\.207\.\d+#', $origin)) {
    header("Access-Control-Allow-Origin: {$origin}");
} else if (!empty($origin)) {
    header("Access-Control-Allow-Origin: {$origin}");
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Authorization, X-Requested-With, Accept');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // 200 OK jarri da nabigatzaileak goiburuak behar bezala balioztatzeko
    exit;
}

$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$path = preg_replace('#^api/#', '', $path);
$segments = array_values(array_filter(explode('/', $path)));

$baliabidea = $segments[0] ?? '';
$id         = isset($segments[1]) && ctype_digit($segments[1]) ? (int)$segments[1] : null;
$ekintza    = $segments[2] ?? null;
$metodoa    = $_SERVER['REQUEST_METHOD'];

try {
    switch ($baliabidea) {
        case 'auth':
            $sub = $segments[1] ?? '';
            match (true) {
                $sub === 'login'    && $metodoa === 'POST' => action_login(),
                $sub === 'logout'   && $metodoa === 'POST' => action_logout(),
                $sub === 'me'       && $metodoa === 'GET'  => action_me(),
                $sub === 'register' && $metodoa === 'POST' => action_register(),
                default => json_response(['error' => 'Bide baliogabea.'], 404),
            };
            break;

        case 'ekipamenduak':
            require_once __DIR__ . '/api/ekipamenduak.php';
            break;

        case 'etiketak':
            require_once __DIR__ . '/api/etiketak.php';
            break;

        case 'kategoriak':
        case 'gelak':
            require_once __DIR__ . '/api/katalogoak.php';
            break;

        case 'erosketak':
            require_once __DIR__ . '/api/erosketak.php';
            break;

        case 'erabiltzaileak':
            require_once __DIR__ . '/api/erabiltzaileak.php';
            break;

        case 'taldeak':
            require_once __DIR__ . '/api/taldeak.php';
            break;

        case 'partaideak':
            require_once __DIR__ . '/api/partaideak.php';
            break;

        default:
            json_response(['error' => 'Baliabidea ez da aurkitu.'], 404);
    }
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_response(['error' => 'Zerbitzariaren barne errorea.'], 500);
}
