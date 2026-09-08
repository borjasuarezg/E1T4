<?php
/**
 * Configuración del entorno.
 * En producción, mover estos valores a variables de entorno
 * (o a un fichero fuera del document root) en vez de dejarlos en el código.
 */
return [
    'db' => [
        'host'    => '127.0.0.1',
        'port'    => 3306,
        'dbname'  => 'inventario_ethazi',
        'user'    => 'inventario_app',      // usuario de MySQL con permisos limitados a esta BD
        'pass'    => 'CAMBIA_ESTA_CONTRASENA',
        'charset' => 'utf8mb4',
    ],
    'session' => [
        'name'     => 'INVSESSID',
        'lifetime' => 0,        // cookie de sesión (se cierra al cerrar el navegador)
        'secure'   => true,     // solo por HTTPS
        'httponly' => true,     // no accesible desde JavaScript
        'samesite' => 'Strict',
    ],
    // Origen permitido para CORS si frontend y backend van en dominios distintos
    'cors_origin' => 'https://www.talde4.edu',
];
