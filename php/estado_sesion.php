<?php

declare(strict_types=1);

require_once __DIR__ . '/../configuracion/sesion.php';

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    echo json_encode(['error' => 'Método no permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

iniciarSesionSegura();
$cliente = $_SESSION['cliente'] ?? null;

if (
    !is_array($cliente)
    || !isset($cliente['nombres'], $cliente['apellidos'])
    || !is_string($cliente['nombres'])
    || !is_string($cliente['apellidos'])
) {
    session_write_close();
    echo json_encode(['autenticado' => false], JSON_UNESCAPED_UNICODE);
    exit;
}

$respuesta = [
    'autenticado' => true,
    'nombres' => $cliente['nombres'],
    'apellidos' => $cliente['apellidos'],
];

session_write_close();
echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);
