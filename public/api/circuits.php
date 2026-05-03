<?php
require_once __DIR__ . '/../../php/Database.php';
require_once __DIR__ . '/../../php/F1ApiClient.php';

$season = (int)($_GET['season'] ?? date('Y'));

$circuits = F1ApiClient::circuits($season);

echo json_encode([
    'circuits' => $circuits,
    'season'  => $season,
    'total'   => count($circuits),
]);
