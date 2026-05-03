<?php
require_once __DIR__ . '/../../php/Database.php';
require_once __DIR__ . '/../../php/F1ApiClient.php';

$season = (int)($_GET['season'] ?? date('Y'));

// Driver standings already contains all we need (driver info + points)
$standings = F1ApiClient::driverStandings($season);

// Team color map
$teamColors = [
    'red_bull'     => '#3671C6',
    'ferrari'      => '#E8002D',
    'mercedes'     => '#27F4D2',
    'mclaren'      => '#FF8000',
    'aston_martin' => '#229971',
    'alpine'       => '#FF87BC',
    'williams'     => '#64C4FF',
    'rb'           => '#6692FF',
    'haas'         => '#B6BABD',
    'sauber'       => '#52E252',
    'kick_sauber'  => '#52E252',
];

$result = [];
foreach ($standings as $s) {
    $d   = $s['Driver']        ?? [];
    $c   = $s['Constructors'][0] ?? [];
    $cid = $c['constructorId']   ?? '';
    $result[] = [
        'driverId'      => $d['driverId']        ?? '',
        'code'          => $d['code']            ?? strtoupper(substr($d['driverId'] ?? 'UNK', 0, 3)),
        'number'        => $d['permanentNumber'] ?? '',
        'forename'      => $d['givenName']       ?? '',
        'surname'       => $d['familyName']      ?? '',
        'nationality'   => $d['nationality']     ?? '',
        'dateOfBirth'   => $d['dateOfBirth']     ?? '',
        'url'           => $d['url']             ?? '',
        'position'      => $s['position']        ?? '-',
        'points'        => $s['points']          ?? '0',
        'wins'          => $s['wins']            ?? '0',
        'constructor'   => $c['name']            ?? '',
        'constructorId' => $cid,
        'teamColor'     => $teamColors[$cid]     ?? '#888888',
    ];
}

echo json_encode([
    'drivers' => $result,
    'season'  => $season,
    'total'   => count($result),
]);
