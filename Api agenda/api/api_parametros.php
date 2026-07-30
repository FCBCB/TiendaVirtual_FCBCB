<?php

require_once "../config_agenda_db.php";

header('Content-Type: application/json; charset=utf-8');

$datos = json_decode(file_get_contents('php://input'), true);
if (empty($datos)) {
    echo json_encode([
        'success' => false,
        'mensaje' => 'No se recibieron datos',
        'repositorios' => [],
        'entidades' => [],
        'categorias' => [],
    ]);
    exit;
}

$consulta = isset($datos['consulta']) ? trim((string) $datos['consulta']) : '';

global $link;

if ($consulta === 'repositorios') {
    $repositorios = [];
    $res = mysqli_query($link, "SELECT `idRepositorio`, `nombreRepositorio`, `descripcionRepositorio` FROM `repositorios` ORDER BY `nombreRepositorio` ASC") or die(mysqli_error($link));
    while ($row = mysqli_fetch_assoc($res)) {
        $repositorios[] = [
            'idRepositorio' => isset($row['idRepositorio']) ? $row['idRepositorio'] : null,
            'nombreRepositorio' => isset($row['nombreRepositorio']) ? $row['nombreRepositorio'] : '',
            'descripcionRepositorio' => isset($row['descripcionRepositorio']) ? $row['descripcionRepositorio'] : '',
        ];
    }
    echo json_encode([
        'success' => true,
        'repositorios' => $repositorios,
    ]);
    exit;
}

if ($consulta === 'entidades') {
    $entidades = [];
    $res = mysqli_query($link, "SELECT `idEntidad`, `nombreEntidad`, `descripcionEntidad` FROM `entidades` ORDER BY `nombreEntidad` ASC") or die(mysqli_error($link));
    while ($row = mysqli_fetch_assoc($res)) {
        $entidades[] = [
            'idEntidad' => isset($row['idEntidad']) ? $row['idEntidad'] : null,
            'nombreEntidad' => isset($row['nombreEntidad']) ? $row['nombreEntidad'] : '',
            'descripcionEntidad' => isset($row['descripcionEntidad']) ? $row['descripcionEntidad'] : '',
        ];
    }
    echo json_encode([
        'success' => true,
        'entidades' => $entidades,
    ]);
    exit;
}

if ($consulta === 'categorias') {
    $categorias = [];
    $res = mysqli_query($link, "SELECT `idCategoria`, `nombreCategoria`, `descripcionCategoria` FROM `categorias` ORDER BY `nombreCategoria` ASC") or die(mysqli_error($link));
    while ($row = mysqli_fetch_assoc($res)) {
        $categorias[] = [
            'idCategoria' => isset($row['idCategoria']) ? $row['idCategoria'] : null,
            'nombreCategoria' => isset($row['nombreCategoria']) ? $row['nombreCategoria'] : '',
            'descripcionCategoria' => isset($row['descripcionCategoria']) ? $row['descripcionCategoria'] : '',
        ];
    }
    echo json_encode([
        'success' => true,
        'categorias' => $categorias,
    ]);
    exit;
}

echo json_encode([
    'success' => false,
    'mensaje' => 'Indique "consulta": "repositorios", "entidades" o "categorias" en el JSON.',
    'repositorios' => [],
    'entidades' => [],
    'categorias' => [],
]);
