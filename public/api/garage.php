<?php
require_once __DIR__ . '/../../php/Database.php';
require_once __DIR__ . '/../../php/F1ApiClient.php';

$season = (int)($_GET['season'] ?? 2025);
$db     = Database::get();

$constructors = F1ApiClient::constructors($season);
$conMap = [];
foreach ($constructors as $c) $conMap[$c['constructorId']] = $c['name'];

$stmt = $db->prepare("SELECT * FROM garage_specs WHERE season=? ORDER BY constructor_id");
$stmt->execute([$season]);
$specs = $stmt->fetchAll();

$teamColors = [
    'red_bull'=>'#3671C6','ferrari'=>'#E8002D','mercedes'=>'#27F4D2',
    'mclaren'=>'#FF8000','aston_martin'=>'#229971','alpine'=>'#FF87BC',
    'williams'=>'#64C4FF','rb'=>'#6692FF','haas'=>'#B6BABD','sauber'=>'#52E252',
];

// Performance radar data (0-100 scale) per constructor
$radar = [
    'red_bull'    =>['Aero'=>95,'Power'=>90,'Reliability'=>88,'TireMgmt'=>92,'Quali'=>93],
    'ferrari'     =>['Aero'=>88,'Power'=>93,'Reliability'=>82,'TireMgmt'=>80,'Quali'=>87],
    'mercedes'    =>['Aero'=>82,'Power'=>92,'Reliability'=>90,'TireMgmt'=>88,'Quali'=>84],
    'mclaren'     =>['Aero'=>90,'Power'=>89,'Reliability'=>85,'TireMgmt'=>86,'Quali'=>91],
    'aston_martin'=>['Aero'=>78,'Power'=>89,'Reliability'=>87,'TireMgmt'=>84,'Quali'=>76],
    'alpine'      =>['Aero'=>72,'Power'=>75,'Reliability'=>80,'TireMgmt'=>78,'Quali'=>74],
    'williams'    =>['Aero'=>68,'Power'=>89,'Reliability'=>83,'TireMgmt'=>72,'Quali'=>70],
    'rb'          =>['Aero'=>74,'Power'=>90,'Reliability'=>79,'TireMgmt'=>76,'Quali'=>75],
    'haas'        =>['Aero'=>70,'Power'=>93,'Reliability'=>78,'TireMgmt'=>73,'Quali'=>71],
    'sauber'      =>['Aero'=>65,'Power'=>93,'Reliability'=>76,'TireMgmt'=>70,'Quali'=>67],
];

$result = [];
foreach ($specs as $s) {
    $id = $s['constructor_id'];
    $result[] = [
        'constructorId' => $id,
        'name'          => $conMap[$id] ?? ucfirst($id),
        'teamColor'     => $teamColors[$id] ?? '#888',
        'season'        => $s['season'],
        'carName'       => $s['car_name'],
        'powerUnit'     => $s['power_unit'],
        'chassis'       => $s['chassis'],
        'weightKg'      => $s['weight_kg'],
        'downforceLevel'=> $s['downforce_level'],
        'ersType'       => $s['ers_type'],
        'tireStrategy'  => $s['tire_strategy'],
        'notes'         => $s['notes'],
        'radar'         => $radar[$id] ?? [],
    ];
}

echo json_encode(['garage' => $result, 'season' => $season, 'availableSeasons' => range(2015,2025)]);
