<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

/**
 * Obtiene la IP del cliente (soporta proxy con X-Forwarded-For).
 */
function getClientIp(): string
{
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', (string) $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim($parts[0]);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        $ip = trim((string) $_SERVER['HTTP_X_REAL_IP']);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '';
}

/**
 * Rangos internos: 172.25.1.x y 192.168.2.x (red /24).
 */
function isInternalClientIp(string $ip): bool
{
    if ($ip === '' || !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        return false;
    }

    $internalPrefixes = [
        '172.25.1.',
        '192.168.2.',
        '192.168.1.',
    ];

    foreach ($internalPrefixes as $prefix) {
        if (strncmp($ip, $prefix, strlen($prefix)) === 0) {
            return true;
        }
    }

    return false;
}

$clientIp = getClientIp();
$upstreamBase = isInternalClientIp($clientIp)
    ? 'http://agendacultural.fcbcb.gob.bo/api/api_public.php'
    : 'http://agendacultural.fcbcb.gob.bo/api/api_public.php';

$jsonIn = isset($_GET['json']) ? (string) $_GET['json'] : '';
if ($jsonIn === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Falta el parámetro json'], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode($jsonIn, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'JSON inválido'], JSON_UNESCAPED_UNICODE);
    exit;
}

$jsonOut = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($jsonOut === false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No se pudo serializar el JSON'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'cURL no está disponible en PHP'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Igual que: curl -X GET URL --header 'Content-Type: application/json' --data '{...}'
// La API lee el JSON desde el cuerpo, no desde ?json= en la query.
$ch = curl_init($upstreamBase);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 45,
    CURLOPT_CUSTOMREQUEST => 'GET',
    CURLOPT_POSTFIELDS => $jsonOut,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json',
    ],
]);

if (stripos($upstreamBase, 'https://') === 0) {
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
}

$body = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($body === false || $curlErr !== '') {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'error' => 'No se pudo contactar la API',
        'detail' => $curlErr,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($httpCode >= 200 && $httpCode < 600) {
    http_response_code($httpCode);
} else {
    http_response_code(200);
}

echo $body;
