<?php

require_once "../config_agenda_db.php";

header('Content-Type: application/json; charset=utf-8');

/**
 * Convierte pathFotografia (relativo en BD, p. ej. ../../storage/...) en URL absoluta del mismo sitio.
 */
function api_public_url_fotografia($pathRelativo)
{
    $pathRelativo = trim((string) $pathRelativo);
    if ($pathRelativo === '') {
        return '';
    }
    if (preg_match('#^https?://#i', $pathRelativo)) {
        return $pathRelativo;
    }
    $normalized = preg_replace('#^(\.\./|\./)+#', '', str_replace('\\', '/', $pathRelativo));
    $normalized = ltrim($normalized, '/');

    $docRoot = !empty($_SERVER['DOCUMENT_ROOT']) ? realpath($_SERVER['DOCUMENT_ROOT']) : false;
    $projRoot = realpath(dirname(__DIR__));
    $basePath = '';
    if ($docRoot && $projRoot) {
        $docNorm = str_replace('\\', '/', $docRoot);
        $projNorm = str_replace('\\', '/', $projRoot);
        if (stripos($projNorm, $docNorm) === 0) {
            $basePath = substr($projNorm, strlen($docNorm));
            $basePath = '/' . trim($basePath, '/');
            if ($basePath === '/') {
                $basePath = '';
            }
        }
    }

    $scheme = 'http';
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        $scheme = 'https';
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string) $_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') {
        $scheme = 'https';
    } elseif (isset($_SERVER['REQUEST_SCHEME'])) {
        $scheme = strtolower((string) $_SERVER['REQUEST_SCHEME']);
    } elseif (!empty($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443) {
        $scheme = 'https';
    }

    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : (isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'localhost');

    $prefix = $basePath !== '' ? rtrim($basePath, '/') : '';
    $urlPath = ($prefix !== '' ? $prefix . '/' : '/') . $normalized;
    $urlPath = '/' . ltrim(preg_replace('#/+#', '/', $urlPath), '/');

    return $scheme . '://' . $host . $urlPath;
}

$raw = file_get_contents('php://input');
$datos = json_decode($raw, true);

if ($datos === null && json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'success' => false,
        'mensaje' => 'JSON inválido: ' . json_last_error_msg(),
        'eventos' => [],
    ]);
    exit;
}

if (!is_array($datos) || empty($datos)) {
    echo json_encode([
        'success' => false,
        'mensaje' => 'No se recibieron datos. Envíe un JSON con fecha_inicio, fecha_fin, idRepositorio, idEntidad e idCategoria (0 = sin filtrar).',
        'eventos' => [],
    ]);
    exit;
}

$fecha_inicio = isset($datos['fecha_inicio']) ? trim((string) $datos['fecha_inicio']) : '';
$fecha_fin = isset($datos['fecha_fin']) ? trim((string) $datos['fecha_fin']) : '';
$idRepositorioFiltro = isset($datos['idRepositorio']) ? (int) $datos['idRepositorio'] : 0;
$idEntidadFiltro = isset($datos['idEntidad']) ? (int) $datos['idEntidad'] : 0;
$idCategoriaFiltro = isset($datos['idCategoria']) ? (int) $datos['idCategoria'] : 0;

$validar_fecha_ymd = function ($s) {
    if ($s === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $s)) {
        return false;
    }
    $d = DateTime::createFromFormat('Y-m-d', $s);
    return $d && $d->format('Y-m-d') === $s;
};

if (!$validar_fecha_ymd($fecha_inicio) || !$validar_fecha_ymd($fecha_fin)) {
    echo json_encode([
        'success' => false,
        'mensaje' => 'fecha_inicio y fecha_fin son obligatorias y deben tener formato YYYY-MM-DD.',
        'eventos' => [],
    ]);
    exit;
}

if ($fecha_inicio > $fecha_fin) {
    echo json_encode([
        'success' => false,
        'mensaje' => 'fecha_inicio no puede ser posterior a fecha_fin.',
        'eventos' => [],
    ]);
    exit;
}

global $link;

$fi = mysqli_real_escape_string($link, $fecha_inicio);
$ff = mysqli_real_escape_string($link, $fecha_fin);

$condiciones = [
    "`fecha` >= '$fi'",
    "`fecha` <= '$ff'",
];
if ($idRepositorioFiltro !== 0) {
    $condiciones[] = '`idRepositorio` = ' . $idRepositorioFiltro;
}
if ($idEntidadFiltro !== 0) {
    $condiciones[] = '`idEntidad` = ' . $idEntidadFiltro;
}
if ($idCategoriaFiltro !== 0) {
    $condiciones[] = '`idCategoria` = ' . $idCategoriaFiltro;
}

$where_sql = implode(' AND ', $condiciones);

$eventos = array();

$sql_eventos = "SELECT `idEvento`, `fecha`, `horaInicio`, `horaFin`, `descripcion`, `lugar`, `idCategoria`, `objetivoEsperado`, `observaciones`, `color`, `idRepositorio`, 
`idUnidad`, `idPersonal`, `idEntidad`, `idContacto`, `participantes`, `id_usuario`, `fechaRegistro`, `horaRegistro`, `estado`, `obsConclusion` 
FROM `eventos` WHERE $where_sql ORDER BY `fecha` DESC";

$conEventos = mysqli_query($link, $sql_eventos) or die(mysqli_error($link));
if(mysqli_num_rows($conEventos) > 0){
    while($rowEventos = mysqli_fetch_array($conEventos)){

        $idEvento = isset($rowEventos["idEvento"]) ? $rowEventos["idEvento"] : null;
        $fecha = isset($rowEventos["fecha"]) ? $rowEventos["fecha"] : "";
        $horaInicio = isset($rowEventos["horaInicio"]) ? $rowEventos["horaInicio"] : "";
        $horaFin = isset($rowEventos["horaFin"]) ? $rowEventos["horaFin"] : "";
        $descripcion = isset($rowEventos["descripcion"]) ? $rowEventos["descripcion"] : "";
        $lugar = isset($rowEventos["lugar"]) ? $rowEventos["lugar"] : "";
        $idCategoria = isset($rowEventos["idCategoria"]) ? $rowEventos["idCategoria"] : null;
        $objetivoEsperado = isset($rowEventos["objetivoEsperado"]) ? $rowEventos["objetivoEsperado"] : "";
        $observaciones = isset($rowEventos["observaciones"]) ? $rowEventos["observaciones"] : "";
        $color = isset($rowEventos["color"]) ? $rowEventos["color"] : "";
        $idRepositorio = isset($rowEventos["idRepositorio"]) ? $rowEventos["idRepositorio"] : null;
        $idUnidad = isset($rowEventos["idUnidad"]) ? $rowEventos["idUnidad"] : null;
        $idPersonal = isset($rowEventos["idPersonal"]) ? $rowEventos["idPersonal"] : null;
        $idEntidad = isset($rowEventos["idEntidad"]) ? $rowEventos["idEntidad"] : null;
        $idContacto = isset($rowEventos["idContacto"]) ? $rowEventos["idContacto"] : null;
        $participantes = isset($rowEventos["participantes"]) ? $rowEventos["participantes"] : "";
        $id_usuario = isset($rowEventos["id_usuario"]) ? $rowEventos["id_usuario"] : null;
        $fechaRegistro = isset($rowEventos["fechaRegistro"]) ? $rowEventos["fechaRegistro"] : "";
        $horaRegistro = isset($rowEventos["horaRegistro"]) ? $rowEventos["horaRegistro"] : "";
        $estado = isset($rowEventos["estado"]) ? $rowEventos["estado"] : "";
        $obsConclusion = isset($rowEventos["obsConclusion"]) ? $rowEventos["obsConclusion"] : "";

        $nombreCategoria = "";
        $descripcionCategoria = "";
        
        $conCategorias = mysqli_query($link, "SELECT `idCategoria`, `nombreCategoria`, `descripcionCategoria` FROM `categorias` WHERE `idCategoria` = '$idCategoria'")or die(mysqli_error($link));
        if(mysqli_num_rows($conCategorias) > 0){
            $rowCategoria = mysqli_fetch_array($conCategorias);
            $nombreCategoria = isset($rowCategoria["nombreCategoria"]) ? $rowCategoria["nombreCategoria"] : "";
            $descripcionCategoria = isset($rowCategoria["descripcionCategoria"]) ? $rowCategoria["descripcionCategoria"] : "";
        }

        $nombreRepositorio = "";
        $descripcionRepositorio = "";
        $conRepositorios = mysqli_query($link, "SELECT `idRepositorio`, `nombreRepositorio`, `descripcionRepositorio` FROM `repositorios` WHERE `idRepositorio` = '$idRepositorio'")or die(mysqli_error($link));
        if(mysqli_num_rows($conRepositorios) > 0){
            $rowRepositorio = mysqli_fetch_array($conRepositorios);
            $nombreRepositorio = isset($rowRepositorio["nombreRepositorio"]) ? $rowRepositorio["nombreRepositorio"] : "";
            $descripcionRepositorio = isset($rowRepositorio["descripcionRepositorio"]) ? $rowRepositorio["descripcionRepositorio"] : "";
        }

        $nombreUnidad = "";
        $descripcionUnidad = "";
        //SELECT `idUnidad`, `idRepositorio`, `nombreUnidad`, `descripcionUnidad` FROM `unidades` WHERE `idUnidad` = ''
        $conUnidades = mysqli_query($link, "SELECT `idUnidad`, `idRepositorio`, `nombreUnidad`, `descripcionUnidad` FROM `unidades` WHERE `idUnidad` = '$idUnidad'")or die(mysqli_error($link));
        if(mysqli_num_rows($conUnidades) > 0){
            $rowUnidad = mysqli_fetch_array($conUnidades);
            $nombreUnidad = isset($rowUnidad["nombreUnidad"]) ? $rowUnidad["nombreUnidad"] : "";
            $descripcionUnidad = isset($rowUnidad["descripcionUnidad"]) ? $rowUnidad["descripcionUnidad"] : "";
        }

        $nombrePersonal = "";
        $cargoPersonal = "";
        //SELECT `idPersonal`, `idRepositorio`, `idUnidad`, `nombrePersonal`, `cargoPersonal` FROM `personal` WHERE `idPersonal` = ''
        $conPersonal = mysqli_query($link, "SELECT `idPersonal`, `idRepositorio`, `idUnidad`, `nombrePersonal`, `cargoPersonal` FROM `personal` WHERE `idPersonal` = '$idPersonal'")or die(mysqli_error($link));
        if(mysqli_num_rows($conPersonal) > 0){
            $rowPersonal = mysqli_fetch_array($conPersonal);
            $nombrePersonal = isset($rowPersonal["nombrePersonal"]) ? $rowPersonal["nombrePersonal"] : "";
            $cargoPersonal = isset($rowPersonal["cargoPersonal"]) ? $rowPersonal["cargoPersonal"] : "";
        }

        $nombreEntidad = "";
        $descripcionEntidad = "";
        //SELECT `idEntidad`, `nombreEntidad`, `descripcionEntidad` FROM `entidades` WHERE `idEntidad` = ''
        $conEntidades = mysqli_query($link, "SELECT `idEntidad`, `nombreEntidad`, `descripcionEntidad` FROM `entidades` WHERE `idEntidad` = '$idEntidad'")or die(mysqli_error($link));
        if(mysqli_num_rows($conEntidades) > 0){
            $rowEntidad = mysqli_fetch_array($conEntidades);
            $nombreEntidad = isset($rowEntidad["nombreEntidad"]) ? $rowEntidad["nombreEntidad"] : "";
            $descripcionEntidad = isset($rowEntidad["descripcionEntidad"]) ? $rowEntidad["descripcionEntidad"] : "";
        }

        $nombreContacto = "";
        $primerApContacto = "";
        $segundoApContacto = "";
        $ciContacto = "";
        $direccionContacto = "";
        $emailContacto = "";
        $telefonoContacto = "";
        $ocupacionContacto = "";
        //SELECT `idContacto`, `nombreContacto`, `primerApContacto`, `segundoApContacto`, `ciContacto`, `direccionContacto`, `emailContacto`, `telefonoContacto`, `idEntidad`, `ocupacionContacto` FROM `contactos` WHERE `idContacto` = ''
        $conContactos = mysqli_query($link, "SELECT `idContacto`, `nombreContacto`, `primerApContacto`, `segundoApContacto`, `ciContacto`, `direccionContacto`, `emailContacto`, `telefonoContacto`, `idEntidad`, `ocupacionContacto` FROM `contactos` WHERE `idContacto` = '$idContacto'")or die(mysqli_error($link));
        if(mysqli_num_rows($conContactos) > 0){
            $rowContacto = mysqli_fetch_array($conContactos);
            $nombreContacto = isset($rowContacto["nombreContacto"]) ? $rowContacto["nombreContacto"] : "";
            $primerApContacto = isset($rowContacto["primerApContacto"]) ? $rowContacto["primerApContacto"] : "";
            $segundoApContacto = isset($rowContacto["segundoApContacto"]) ? $rowContacto["segundoApContacto"] : "";
            $ciContacto = isset($rowContacto["ciContacto"]) ? $rowContacto["ciContacto"] : "";
            $direccionContacto = isset($rowContacto["direccionContacto"]) ? $rowContacto["direccionContacto"] : "";
            $emailContacto = isset($rowContacto["emailContacto"]) ? $rowContacto["emailContacto"] : "";
            $telefonoContacto = isset($rowContacto["telefonoContacto"]) ? $rowContacto["telefonoContacto"] : "";
            $ocupacionContacto = isset($rowContacto["ocupacionContacto"]) ? $rowContacto["ocupacionContacto"] : "";
        }

        $nombreUsuario = "";
        $apPatUsuario = "";
        $apMatUsuario = "";
        $usuario_usuario = "";
        $ciUsuario = "";
        $celUsuario = "";
        $correoUsuario = "";
        $funcionUsuario = "";
        $estadoUsuario = "";
        //SELECT `id_usuario`, `nom_usuario`, `ap_pat_usuario`, `ap_mat_usuario`, `ci_usuario`, `comp_usuario`, `fecha_nac_usuario`, `cel_usuario`, `correo_usuario`, `usuario_usuario`, `pss_usuario`, `funcion_usuario`, `estado_usuario`, `permisos` FROM `usuarios` WHERE `id_usuario` = ''
        $conUsuarios = mysqli_query($link, "SELECT `id_usuario`, `nom_usuario`, `ap_pat_usuario`, `ap_mat_usuario`, `ci_usuario`, `comp_usuario`, `fecha_nac_usuario`, `cel_usuario`, `correo_usuario`, `usuario_usuario`, `pss_usuario`, `funcion_usuario`, `estado_usuario`, `permisos` FROM `usuarios` WHERE `id_usuario` = '$id_usuario'")or die(mysqli_error($link));
        if(mysqli_num_rows($conUsuarios) > 0){
            $rowUsuario = mysqli_fetch_array($conUsuarios);
            $nombreUsuario = isset($rowUsuario["nom_usuario"]) ? $rowUsuario["nom_usuario"] : "";
            $apPatUsuario = isset($rowUsuario["ap_pat_usuario"]) ? $rowUsuario["ap_pat_usuario"] : "";
            $apMatUsuario = isset($rowUsuario["ap_mat_usuario"]) ? $rowUsuario["ap_mat_usuario"] : "";
            $usuario_usuario = isset($rowUsuario["usuario_usuario"]) ? $rowUsuario["usuario_usuario"] : "";
            $ciUsuario = isset($rowUsuario["ci_usuario"]) ? $rowUsuario["ci_usuario"] : "";
            $celUsuario = isset($rowUsuario["cel_usuario"]) ? $rowUsuario["cel_usuario"] : "";
            $correoUsuario = isset($rowUsuario["correo_usuario"]) ? $rowUsuario["correo_usuario"] : "";
            $funcionUsuario = isset($rowUsuario["funcion_usuario"]) ? $rowUsuario["funcion_usuario"] : "";
            $estadoUsuario = isset($rowUsuario["estado_usuario"]) ? $rowUsuario["estado_usuario"] : "";
        }


        $fotografias = array();
        $fotografiasEvento = mysqli_query($link, "SELECT `idFotografia`, `idEvento`, `pathFotografia` FROM `fotografias_evento` WHERE `idEvento` = '$idEvento' ORDER BY `idFotografia` ASC")or die(mysqli_error($link));
        if(mysqli_num_rows($fotografiasEvento) > 0){
            while($rowFotografiaEvento = mysqli_fetch_array($fotografiasEvento)){
                $idFotografia = isset($rowFotografiaEvento["idFotografia"]) ? $rowFotografiaEvento["idFotografia"] : null;
                $pathFotografia = isset($rowFotografiaEvento["pathFotografia"]) ? $rowFotografiaEvento["pathFotografia"] : "";
                $fotografias[] = array(
                    "idFotografia" => $idFotografia,
                    "pathFotografia" => api_public_url_fotografia($pathFotografia)
                );
            }
        }

        $equipamiento = array();
        $conEquipamientoEvento = mysqli_query($link, "SELECT equipamiento_evento.idEquipamientoEvento, equipamiento_evento.idEvento, equipamiento_evento.idEquipamiento, equipamiento_evento.cantidadSolicitada,
                                                        equipamiento.nombreEquipamiento, equipamiento.detalleEquipamiento, equipamiento.cantidadEquipamiento
                                                        FROM equipamiento_evento, equipamiento
                                                        WHERE equipamiento_evento.idEquipamiento = equipamiento.idEquipamiento
                                                        AND equipamiento_evento.idEvento = '$idEvento'")or die(mysqli_error($link));
        if(mysqli_num_rows($conEquipamientoEvento) > 0){
            while($rowEquipamientoEvento = mysqli_fetch_array($conEquipamientoEvento)){
                $idEquipamientoEvento = isset($rowEquipamientoEvento["idEquipamientoEvento"]) ? $rowEquipamientoEvento["idEquipamientoEvento"] : null;
                $idEquipamiento = isset($rowEquipamientoEvento["idEquipamiento"]) ? $rowEquipamientoEvento["idEquipamiento"] : null;
                $cantidadSolicitada = isset($rowEquipamientoEvento["cantidadSolicitada"]) ? $rowEquipamientoEvento["cantidadSolicitada"] : 0;
                $nombreEquipamiento = isset($rowEquipamientoEvento["nombreEquipamiento"]) ? $rowEquipamientoEvento["nombreEquipamiento"] : "";
                $detalleEquipamiento = isset($rowEquipamientoEvento["detalleEquipamiento"]) ? $rowEquipamientoEvento["detalleEquipamiento"] : "";
                $cantidadEquipamiento = isset($rowEquipamientoEvento["cantidadEquipamiento"]) ? $rowEquipamientoEvento["cantidadEquipamiento"] : 0;
                $equipamiento[] = array(
                    "idEquipamientoEvento" => $idEquipamientoEvento,
                    "idEquipamiento" => $idEquipamiento,
                    "cantidadSolicitada" => $cantidadSolicitada,
                    "nombreEquipamiento" => $nombreEquipamiento,
                    "detalleEquipamiento" => $detalleEquipamiento,
                    "cantidadEquipamiento" => $cantidadEquipamiento
                );
            }
        }

        $eventos[] = array(
            "idEvento" => $idEvento,
            "fecha" => $fecha,
            "horaInicio" => $horaInicio,
            "horaFin" => $horaFin,
            "descripcion" => $descripcion,
            "lugar" => $lugar,
            "objetivoEsperado" => $objetivoEsperado,
            "observaciones" => $observaciones,
            "color" => $color,
            "participantes" => $participantes,
            "fechaRegistro" => $fechaRegistro,
            "horaRegistro" => $horaRegistro,
            "estado" => $estado,
            "obsConclusion" => $obsConclusion,
            "categoria" => array(
                "idCategoria" => $idCategoria,
                "nombreCategoria" => $nombreCategoria,
                "descripcionCategoria" => $descripcionCategoria,
            ),
            "repositorio" => array(
                "idRepositorio" => $idRepositorio,
                "nombreRepositorio" => $nombreRepositorio,
                "descripcionRepositorio" => $descripcionRepositorio,
            ),
            "unidad" => array(
                "idUnidad" => $idUnidad,
                "nombreUnidad" => $nombreUnidad,
                "descripcionUnidad" => $descripcionUnidad,
            ),
            "personal" => array(
                "idPersonal" => $idPersonal,
                "nombrePersonal" => $nombrePersonal,
                "cargoPersonal" => $cargoPersonal,
            ),
            "entidad" => array(
                "idEntidad" => $idEntidad,
                "nombreEntidad" => $nombreEntidad,
                "descripcionEntidad" => $descripcionEntidad,
            ),
            "contacto" => array(
                "idContacto" => $idContacto,
                "nombreContacto" => $nombreContacto,
                "primerApContacto" => $primerApContacto,
                "segundoApContacto" => $segundoApContacto,
                "ciContacto" => $ciContacto,
                "direccionContacto" => $direccionContacto,
                "emailContacto" => $emailContacto,
                "telefonoContacto" => $telefonoContacto,
                "ocupacionContacto" => $ocupacionContacto,
            ),
            "usuarioRegistro" => array(
                "id_usuario" => $id_usuario,
                "nom_usuario" => $nombreUsuario,
                "ap_pat_usuario" => $apPatUsuario,
                "ap_mat_usuario" => $apMatUsuario,
                "ci_usuario" => $ciUsuario,
                "cel_usuario" => $celUsuario,
                "correo_usuario" => $correoUsuario,
                "usuario_usuario" => $usuario_usuario,
                "funcion_usuario" => $funcionUsuario,
                "estado_usuario" => $estadoUsuario,
            ),
            "fotografias" => $fotografias,
            "equipamiento" => $equipamiento,
        );

    }
    echo json_encode(array(
        "success" => true,
        "eventos" => $eventos,
    ));
}
else{
    echo json_encode([
        'success' => true,
        'eventos' => [],
        'mensaje' => 'No se encontraron eventos'
    ]);
}