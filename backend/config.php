<?php
return [
    'db' => [
        'host'    => '127.0.0.1',
        'port'    => 3306,
        'dbname'  => 'e1inbentarioa',
        'user'    => 'app_user',
        'pass'    => 'app_password',
        'charset' => 'utf8mb4',
    ],
    'session' => [
        'name'     => 'INVSESSID',
        'lifetime' => 0,
        'secure'   => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ],
    'cors_origin' => 'https://www.talde4.edu',
];