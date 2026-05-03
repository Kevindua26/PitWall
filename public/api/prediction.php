<?php
require_once __DIR__ . '/../../php/Database.php';
require_once __DIR__ . '/../../php/F1ApiClient.php';

session_start();
$db     = Database::get();
$method = $_SERVER['REQUEST_METHOD'];

// ── GET: fetch model prediction + user predictions ────────────────────────────
if ($method === 'GET') {
    $season = (int)($_GET['season'] ?? 2025);
    $round  = (int)($_GET['round']  ?? 0);

    $races = F1ApiClient::schedule($season);
    if (!$round) {
        // Find upcoming round
        $now = time();
        foreach ($races as $r) {
            if (strtotime($r['date']) >= $now) { $round = (int)$r['round']; break; }
        }
        if (!$round && $races) $round = (int)end($races)['round'];
    }

    $raceInfo = null;
    foreach ($races as $r) { if ((int)$r['round'] === $round) { $raceInfo = $r; break; } }

    // Standings-based model: top 3 by current points = predicted podium
    $standings  = F1ApiClient::driverStandings($season);
    $qualiOrder = F1ApiClient::qualifyingResults($season, max(1, $round - 1));

    // Weight: 60% standings, 40% quali
    $scores = [];
    foreach ($standings as $i => $s) {
        $dId = $s['Driver']['driverId'];
        $scores[$dId] = ['driver' => $s['Driver'], 'constructor' => $s['Constructors'][0] ?? [],
                         'score' => (100 - $i) * 0.6, 'points' => $s['points']];
    }
    foreach ($qualiOrder as $i => $q) {
        $dId = $q['Driver']['driverId'];
        if (isset($scores[$dId])) $scores[$dId]['score'] += (20 - $i) * 0.4 * 2;
    }
    usort($scores, fn($a,$b) => $b['score'] <=> $a['score']);
    $podium = array_slice($scores, 0, 3);

    // User predictions for this race
    $userPreds = [];
    if (isset($_SESSION['user_id'])) {
        $stmt = $db->prepare("SELECT p.*,u.username FROM predictions p 
                              JOIN users u ON u.id=p.user_id 
                              WHERE p.season=? AND p.race_round=?
                              ORDER BY p.created_at DESC LIMIT 50");
        $stmt->execute([$season, $round]);
        $userPreds = $stmt->fetchAll();
    }

    $myPred = null;
    if (isset($_SESSION['user_id'])) {
        $stmt = $db->prepare("SELECT * FROM predictions WHERE user_id=? AND season=? AND race_round=?");
        $stmt->execute([$_SESSION['user_id'], $season, $round]);
        $myPred = $stmt->fetch() ?: null;
    }

    echo json_encode([
        'season'      => $season,
        'round'       => $round,
        'race'        => $raceInfo,
        'model'       => $podium,
        'community'   => $userPreds,
        'myPrediction'=> $myPred,
        'loggedIn'    => isset($_SESSION['user_id']),
    ]);
    exit();
}

// ── POST: submit user prediction ──────────────────────────────────────────────
if ($method === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Login required']);
        exit();
    }

    $body   = json_decode(file_get_contents('php://input'), true);
    $season = (int)($body['season'] ?? 2025);
    $round  = (int)($body['round']  ?? 0);
    $p1     = trim($body['p1'] ?? '');
    $p2     = trim($body['p2'] ?? '');
    $p3     = trim($body['p3'] ?? '');

    if (!$round || !$p1 || !$p2 || !$p3) {
        http_response_code(400);
        echo json_encode(['error' => 'round, p1, p2, p3 required']);
        exit();
    }

    $db->prepare("INSERT OR REPLACE INTO predictions (user_id,race_round,season,p1_driver,p2_driver,p3_driver)
                  VALUES (?,?,?,?,?,?)")
       ->execute([$_SESSION['user_id'], $round, $season, $p1, $p2, $p3]);

    echo json_encode(['success' => true, 'message' => 'Prediction saved!']);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
