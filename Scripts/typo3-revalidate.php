#!/usr/bin/env php
<?php

declare(strict_types=1);

function loadEnvFile(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        [$key, $value] = array_pad(explode('=', $trimmed, 2), 2, '');
        $key = trim($key);
        $value = trim($value);

        if ($key === '' || getenv($key) !== false) {
            continue;
        }

        putenv(sprintf('%s=%s', $key, $value));
        $_ENV[$key] = $value;
    }
}

function envValue(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }

    return $value;
}

function stderr(string $message): never
{
    fwrite(STDERR, $message . PHP_EOL);
    exit(1);
}

$rootDir = dirname(__DIR__);
$envFile = envValue('NPCH_ENV_FILE', $rootDir . '/.env');
if ($envFile !== null) {
    loadEnvFile($envFile);
}

$scope = $argv[1] ?? 'all';
$uid = $argv[2] ?? null;
$locales = $argv[3] ?? null;

$secret = envValue('REVALIDATE_SECRET');
if ($secret === null) {
    stderr('[NPCHWEB Starter] REVALIDATE_SECRET is not configured.');
}

$endpointBase = envValue('REVALIDATE_BASE_URL');
if ($endpointBase === null) {
    $webPort = envValue('WEB_PORT', '3000');
    $endpointBase = sprintf('http://localhost:%s', $webPort);
}

$payload = ['scope' => $scope];

if ($uid !== null && $uid !== '') {
    if (!ctype_digit($uid) || (int) $uid <= 0) {
        stderr('[NPCHWEB Starter] UID must be a positive integer.');
    }

    $payload['uid'] = (int) $uid;
}

if ($locales !== null && trim($locales) !== '') {
    $payload['locales'] = array_values(array_filter(array_map(
        static fn(string $locale): string => trim($locale),
        explode(',', $locales)
    )));
}

$endpoint = rtrim($endpointBase, '/') . '/api/revalidate';
$body = json_encode($payload, JSON_THROW_ON_ERROR);
$timestamp = (string) round(microtime(true) * 1000);
$signature = hash_hmac('sha256', $timestamp . '.' . $body, $secret);

$ch = curl_init($endpoint);
if ($ch === false) {
    stderr('[NPCHWEB Starter] Failed to initialize cURL.');
}

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'content-type: application/json',
        'x-revalidate-secret: ' . $secret,
        'x-revalidate-timestamp: ' . $timestamp,
        'x-revalidate-signature: ' . $signature,
    ],
    CURLOPT_POSTFIELDS => $body,
]);

$response = curl_exec($ch);
if ($response === false) {
    $error = curl_error($ch);
    stderr('[NPCHWEB Starter] Revalidation request failed: ' . $error);
}

$statusCode = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);

if ($statusCode < 200 || $statusCode >= 300) {
    stderr(sprintf('[NPCHWEB Starter] Revalidation request failed with HTTP %d: %s', $statusCode, $response));
}

fwrite(STDOUT, (string) $response . PHP_EOL);
