<?php
require_once __DIR__ . '/../../php/Database.php';
require_once __DIR__ . '/../../php/F1ApiClient.php';

$season = (int)($_GET['season'] ?? date('Y'));

$constructors = F1ApiClient::constructors($season);
$standings    = F1ApiClient::constructorStandings($season);

$standingsMap = [];
foreach ($standings as $s) {
    $standingsMap[$s['Constructor']['constructorId']] = [
        'position' => $s['position'],
        'points'   => $s['points'],
        'wins'     => $s['wins'],
    ];
}

$teamColors = [
    'red_bull'    => '#3671C6', 'ferrari'     => '#E8002D',
    'mercedes'    => '#27F4D2', 'mclaren'     => '#FF8000',
    'aston_martin'=> '#229971', 'alpine'      => '#FF87BC',
    'williams'    => '#64C4FF', 'rb'          => '#6692FF',
    'haas'        => '#B6BABD', 'sauber'      => '#52E252',
];

// Strategy profiles
$strategies = [
    'red_bull'    => ['primary'=>'1-stop','tires'=>['Medium','Hard'],'avgPit'=>2.4,'strength'=>'Undercut master'],
    'ferrari'     => ['primary'=>'2-stop','tires'=>['Soft','Medium','Hard'],'avgPit'=>2.6,'strength'=>'Overcut specialist'],
    'mercedes'    => ['primary'=>'1-stop','tires'=>['Medium','Hard'],'avgPit'=>2.3,'strength'=>'Tire management'],
    'mclaren'     => ['primary'=>'2-stop','tires'=>['Soft','Medium'],'avgPit'=>2.5,'strength'=>'Aggressive offense'],
    'aston_martin'=> ['primary'=>'1-stop','tires'=>['Hard','Hard'],'avgPit'=>2.7,'strength'=>'Conservative long stint'],
    'alpine'      => ['primary'=>'2-stop','tires'=>['Soft','Medium','Hard'],'avgPit'=>2.8,'strength'=>'Strategic flexibility'],
    'williams'    => ['primary'=>'1-stop','tires'=>['Medium','Hard'],'avgPit'=>2.9,'strength'=>'Track position'],
    'rb'          => ['primary'=>'2-stop','tires'=>['Soft','Medium'],'avgPit'=>2.6,'strength'=>'Reactive strategy'],
    'haas'        => ['primary'=>'1-stop','tires'=>['Hard','Hard'],'avgPit'=>2.7,'strength'=>'Tire conservation'],
    'sauber'      => ['primary'=>'2-stop','tires'=>['Soft','Medium','Hard'],'avgPit'=>3.0,'strength'=>'Risk-taking'],
];

$result = [];
foreach ($constructors as $c) {
    $id  = $c['constructorId'];
    $std = $standingsMap[$id] ?? [];
    $result[] = [
        'constructorId' => $id,
        'name'          => $c['name'],
        'nationality'   => $c['nationality'],
        'url'           => $c['url'] ?? '',
        'position'      => $std['position'] ?? '-',
        'points'        => $std['points']   ?? '0',
        'wins'          => $std['wins']     ?? '0',
        'teamColor'     => $teamColors[$id] ?? '#888888',
        'strategy'      => $strategies[$id] ?? ['primary'=>'N/A','tires'=>[],'avgPit'=>0,'strength'=>'Unknown'],
    ];
}

usort($result, fn($a,$b) => (int)$a['position'] <=> (int)$b['position']);

echo json_encode(['constructors' => $result, 'season' => $season]);
