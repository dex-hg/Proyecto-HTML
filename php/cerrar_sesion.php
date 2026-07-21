<?php

declare(strict_types=1);

require_once __DIR__ . '/../configuracion/sesion.php';

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['error' => 'Método no permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

iniciarSesionSegura();
$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $parametros = session_get_cookie_params();
    $opcionesCookie = [
        'expires' => time() - 42000,
        'path' => $parametros['path'],
        'secure' => $parametros['secure'],
        'httponly' => $parametros['httponly'],
        'samesite' => $parametros['samesite'] ?? 'Lax',
    ];

    if ($parametros['domain'] !== '') {
        $opcionesCookie['domain'] = $parametros['domain'];
    }

    setcookie(session_name(), '', $opcionesCookie);
}

session_destroy();
echo json_encode(['exito' => true], JSON_UNESCAPED_UNICODE);
