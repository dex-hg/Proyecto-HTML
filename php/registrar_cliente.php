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
    $destino = '../html/registro.html?resultado=' . rawurlencode($resultado);
    header('Location: ' . $destino, true, 303);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Método no permitido.');
}

$nombres = obtenerCampo('nombres');
$apellidos = obtenerCampo('apellidos');
$fechaNacimiento = obtenerCampo('fecha_nacimiento');
$residencia = obtenerCampo('residencia');
$correo = strtolower(obtenerCampo('correo'));
$password = $_POST['password'] ?? '';
$aceptoTerminos = isset($_POST['terminos']);

if (!is_string($password)) {
    $password = '';
}

if (
    $nombres === ''
    || $apellidos === ''
    || $fechaNacimiento === ''
    || $residencia === ''
    || $correo === ''
    || $password === ''
) {
    redirigirAlFormulario('campos_incompletos');
}

if (
    mb_strlen($nombres) > 255
    || mb_strlen($apellidos) > 255
    || mb_strlen($residencia) > 255
    || mb_strlen($correo) > 255
) {
    redirigirAlFormulario('campos_extensos');
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    redirigirAlFormulario('correo_invalido');
}

if (strlen($password) < 8 || strlen($password) > 72) {
    redirigirAlFormulario('password_invalido');
}

$fecha = DateTimeImmutable::createFromFormat('!Y-m-d', $fechaNacimiento);

if (
    $fecha === false
    || $fecha->format('Y-m-d') !== $fechaNacimiento
    || $fecha > new DateTimeImmutable('today')
) {
    redirigirAlFormulario('fecha_invalida');
}

if (!$aceptoTerminos) {
    redirigirAlFormulario('terminos_requeridos');
}

try {
    $conexion = obtenerConexion();

    $consultaCorreo = $conexion->prepare(
        'SELECT id_cliente FROM clientes WHERE correo = :correo LIMIT 1'
    );
    $consultaCorreo->execute(['correo' => $correo]);

    if ($consultaCorreo->fetch() !== false) {
        redirigirAlFormulario('correo_registrado');
    }

    $passwordSeguro = password_hash($password, PASSWORD_DEFAULT);

    if ($passwordSeguro === false) {
        throw new RuntimeException('No se pudo proteger la contraseña.');
    }

    $insertarCliente = $conexion->prepare(
        'INSERT INTO clientes '
        . '(nombres, apellidos, fecha_nacimiento, residencia, correo, `password`) '
        . 'VALUES (:nombres, :apellidos, :fecha_nacimiento, :residencia, :correo, :password)'
    );

    $insertarCliente->execute([
        'nombres' => $nombres,
        'apellidos' => $apellidos,
        'fecha_nacimiento' => $fechaNacimiento,
        'residencia' => $residencia,
        'correo' => $correo,
        'password' => $passwordSeguro,
    ]);

    redirigirAlFormulario('exito');
} catch (Throwable $error) {
    error_log('Error al registrar cliente: ' . $error->getMessage());
    redirigirAlFormulario('error_servidor');
}
