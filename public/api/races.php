<?php
require_once __DIR__ . '/../../php/Database.php';
require_once __DIR__ . '/../../php/F1ApiClient.php';

$season = (int)($_GET['season'] ?? date('Y'));
$type   = $_GET['type'] ?? 'schedule';
$round  = (int)($_GET['round'] ?? 0);

switch ($type) {
    case 'schedule':
        $races = F1ApiClient::schedule($season);
        // Find current/next/last race
        $now = time();
        $current = null; $upcoming = null; $past = [];
        foreach ($races as $r) {
            $raceTs = strtotime($r['date'] . ' ' . ($r['time'] ?? '12:00:00'));
            if ($raceTs < $now - 7200) { $past[] = $r; }
            elseif (!$current && $raceTs >= $now - 7200) { $current = $r; }
            elseif ($current && !$upcoming) { $upcoming = $r; }
        }
        echo json_encode([
            'races'    => $races,
            'current'  => $current  ?? end($past),
            'upcoming' => $upcoming ?? null,
            'past'     => $past,
            'season'   => $season,
        ]);
        break;

    case 'results':
        if ($round < 1) { http_response_code(400); echo json_encode(['error'=>'round required']); break; }
        echo json_encode(['results' => F1ApiClient::raceResults($season, $round), 'round' => $round, 'season' => $season]);
        break;

    case 'qualifying':
        if ($round < 1) { http_response_code(400); echo json_encode(['error'=>'round required']); break; }
        echo json_encode(['results' => F1ApiClient::qualifyingResults($season, $round), 'round' => $round, 'season' => $season]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown type']);
}
