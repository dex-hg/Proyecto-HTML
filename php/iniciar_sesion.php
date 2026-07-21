<?php

declare(strict_types=1);

require_once __DIR__ . '/../configuracion/conexion.php';

/**
 * Obtiene un campo de texto enviado por POST sin aceptar arreglos.
 */
function obtenerCampo(string $nombre): string
{
    $valor = $_POST[$nombre] ?? '';

    return is_string($valor) ? trim($valor) : '';
}

/**
 * Regresa al formulario mediante Post/Redirect/Get.
 */
function redirigirAlFormulario(string $resultado): never
{
    $destino = '../html/inicioSesion.html?resultado=' . rawurlencode($resultado);
    header('Location: ' . $destino, true, 303);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Método no permitido.');
}

$correo = strtolower(obtenerCampo('correo'));
$password = $_POST['password'] ?? '';

if (!is_string($password)) {
    $password = '';
}

if ($correo === '' || $password === '') {
    redirigirAlFormulario('campos_incompletos');
}

if (mb_strlen($correo) > 255 || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    redirigirAlFormulario('correo_invalido');
}

if (strlen($password) > 72) {
    redirigirAlFormulario('credenciales_invalidas');
}

try {
    $conexion = obtenerConexion();
    $consultaCliente = $conexion->prepare(
        'SELECT id_cliente, nombres, apellidos, correo, `password` '
        . 'FROM clientes WHERE correo = :correo LIMIT 1'
    );
    $consultaCliente->execute(['correo' => $correo]);
    $cliente = $consultaCliente->fetch();

    if (
        $cliente === false
        || !is_string($cliente['password'])
        || !password_verify($password, $cliente['password'])
    ) {
        redirigirAlFormulario('credenciales_invalidas');
    }

    session_set_cookie_params([
        'httponly' => true,
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
        'path' => '/',
    ]);
    session_start();
    session_regenerate_id(true);

    $_SESSION['cliente'] = [
        'id_cliente' => (int) $cliente['id_cliente'],
        'nombres' => (string) $cliente['nombres'],
        'apellidos' => (string) $cliente['apellidos'],
        'correo' => (string) $cliente['correo'],
    ];

    redirigirAlFormulario('exito');
} catch (Throwable $error) {
    error_log('Error al iniciar sesión: ' . $error->getMessage());
    redirigirAlFormulario('error_servidor');
}
