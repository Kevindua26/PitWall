<?php
class Database {
    private static ?PDO $instance = null;
    private static string $dbPath = __DIR__ . '/../database/f1_cache.db';

    public static function get(): PDO {
        if (self::$instance === null) {
            $dir = dirname(self::$dbPath);
            if (!is_dir($dir)) mkdir($dir, 0755, true);

            self::$instance = new PDO('sqlite:' . self::$dbPath);
            self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            self::$instance->exec('PRAGMA journal_mode=WAL');
            self::migrate(self::$instance);
        }
        return self::$instance;
    }

    private static function migrate(PDO $db): void {
        $db->exec("
            CREATE TABLE IF NOT EXISTS api_cache (
                cache_key   TEXT PRIMARY KEY,
                data        TEXT NOT NULL,
                expires_at  INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                username    TEXT UNIQUE NOT NULL,
                email       TEXT UNIQUE NOT NULL,
                password    TEXT NOT NULL,
                created_at  INTEGER DEFAULT (strftime('%s','now'))
            );

            CREATE TABLE IF NOT EXISTS predictions (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id         INTEGER NOT NULL,
                race_round      INTEGER NOT NULL,
                season          INTEGER NOT NULL,
                p1_driver       TEXT NOT NULL,
                p2_driver       TEXT NOT NULL,
                p3_driver       TEXT NOT NULL,
                created_at      INTEGER DEFAULT (strftime('%s','now')),
                FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS garage_specs (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                constructor_id  TEXT NOT NULL,
                season          INTEGER NOT NULL,
                car_name        TEXT,
                power_unit      TEXT,
                chassis         TEXT,
                weight_kg       REAL,
                downforce_level TEXT,
                ers_type        TEXT,
                tire_strategy   TEXT,
                notes           TEXT,
                UNIQUE(constructor_id, season)
            );
        ");
        self::seedGarageSpecs($db);
    }

    private static function seedGarageSpecs(PDO $db): void {
        $specs = [
            ['red_bull',    2025,'RB21',         'Honda RBPT',   'RB21',    798, 'High',    'MGU-H+MGU-K', 'C3-C5', 'Dominant floor concept; minimal drag DRS'],
            ['ferrari',     2025,'SF-25',         'Ferrari',      'SF-25',   798, 'High',    'MGU-H+MGU-K', 'C2-C4', 'Revised sidepods; improved tyre deg'],
            ['mercedes',    2025,'W16',           'Mercedes',     'W16',     798, 'Medium',  'MGU-H+MGU-K', 'C2-C4', 'Zero sidepod concept v3; enhanced cooling'],
            ['mclaren',     2025,'MCL39',         'Mercedes',     'MCL39',   798, 'High',    'MGU-H+MGU-K', 'C3-C5', 'Papaya power; strong mechanical grip'],
            ['aston_martin',2025,'AMR25',         'Mercedes',     'AMR25',   798, 'Medium',  'MGU-H+MGU-K', 'C3-C5', 'Cognizant aerodynamic suite'],
            ['alpine',      2025,'A525',          'Renault',      'A525',    798, 'Medium',  'MGU-H+MGU-K', 'C3-C5', 'Renault E-tech RE25 unit'],
            ['williams',    2025,'FW47',          'Mercedes',     'FW47',    798, 'Low',     'MGU-H+MGU-K', 'C3-C5', 'Rebuilt aerodynamic platform'],
            ['rb',          2025,'VCARB 02',      'Honda RBPT',   'VCARB02', 798, 'Medium',  'MGU-H+MGU-K', 'C3-C5', 'Sister team to Red Bull'],
            ['haas',        2025,'VF-25',         'Ferrari',      'VF-25',   798, 'Low',     'MGU-H+MGU-K', 'C3-C5', 'Ferrari power, independent aero'],
            ['sauber',      2025,'C45',           'Ferrari',      'C45',     798, 'Low',     'MGU-H+MGU-K', 'C3-C5', 'Pre-Audi era; transition season'],
        ];

        $stmt = $db->prepare("INSERT OR IGNORE INTO garage_specs 
            (constructor_id,season,car_name,power_unit,chassis,weight_kg,downforce_level,ers_type,tire_strategy,notes)
            VALUES (?,?,?,?,?,?,?,?,?,?)");
        foreach ($specs as $s) $stmt->execute($s);
    }

    // ── Cache helpers ────────────────────────────────────────────────────────

    public static function cacheGet(string $key): mixed {
        $db  = self::get();
        $now = time();
        $row = $db->prepare("SELECT data FROM api_cache WHERE cache_key=? AND expires_at>?");
        $row->execute([$key, $now]);
        $r = $row->fetch();
        return $r ? json_decode($r['data'], true) : null;
    }

    public static function cacheSet(string $key, mixed $data, int $ttl = 3600): void {
        $db = self::get();
        $db->prepare("INSERT OR REPLACE INTO api_cache (cache_key,data,expires_at) VALUES (?,?,?)")
           ->execute([$key, json_encode($data), time() + $ttl]);
    }
}
