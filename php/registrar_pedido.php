<?php

declare(strict_types=1);

require_once __DIR__ . '/../configuracion/conexion.php';
require_once __DIR__ . '/../configuracion/sesion.php';

/**
 * Envía una respuesta JSON y finaliza la petición.
 */
function responderJson(int $estadoHttp, array $datos): never
{
    http_response_code($estadoHttp);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    responderJson(405, ['error' => 'Método no permitido.']);
}

iniciarSesionSegura();
$cliente = $_SESSION['cliente'] ?? null;
$idCliente = is_array($cliente) ? ($cliente['id_cliente'] ?? null) : null;
session_write_close();

if (!is_int($idCliente) || $idCliente <= 0) {
    responderJson(401, ['error' => 'Debes iniciar sesión antes de finalizar el pedido.']);
}

$contenido = file_get_contents('php://input');

try {
    $pedido = json_decode($contenido ?: '', true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException) {
    responderJson(400, ['error' => 'La solicitud del pedido no es válida.']);
}

if (!is_array($pedido)) {
    responderJson(400, ['error' => 'La solicitud del pedido no es válida.']);
}

$totalUnidades = $pedido['total_unidades'] ?? null;
$montoRecibido = $pedido['monto'] ?? null;

if (
    !is_int($totalUnidades)
    || $totalUnidades <= 0
    || $totalUnidades > 10000
    || (!is_int($montoRecibido) && !is_float($montoRecibido))
) {
    responderJson(422, ['error' => 'La cantidad o el monto del pedido no son válidos.']);
}

$monto = round((float) $montoRecibido, 2);

if (!is_finite($monto) || $monto <= 0 || $monto > 99999999.99) {
    responderJson(422, ['error' => 'La cantidad o el monto del pedido no son válidos.']);
}

try {
    $conexion = obtenerConexion();
    $insertarPedido = $conexion->prepare(
        'INSERT INTO pedidos (id_cliente, total_unidades, monto) '
        . 'VALUES (:id_cliente, :total_unidades, :monto)'
    );
    $insertarPedido->bindValue(':id_cliente', $idCliente, PDO::PARAM_INT);
    $insertarPedido->bindValue(':total_unidades', $totalUnidades, PDO::PARAM_INT);
    $insertarPedido->bindValue(':monto', number_format($monto, 2, '.', ''), PDO::PARAM_STR);
    $insertarPedido->execute();

    responderJson(201, [
        'exito' => true,
        'id_pedido' => (int) $conexion->lastInsertId(),
    ]);
} catch (Throwable $error) {
    error_log('Error al registrar pedido: ' . $error->getMessage());
    responderJson(500, ['error' => 'No se pudo registrar el pedido. Inténtalo nuevamente.']);
}
