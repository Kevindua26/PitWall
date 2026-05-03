<?php
class F1ApiClient {
    private const JOLPICA = 'https://api.jolpi.ca/ergast/f1';
    private const OPENF1  = 'https://api.openf1.org/v1';

    private static function fetch(string $url): array|null {
        $ctx = stream_context_create(['http' => [
            'timeout' => 10,
            'header'  => "User-Agent: F1Nexus/1.0\r\n",
        ]]);
        $raw = @file_get_contents($url, false, $ctx);
        return $raw ? json_decode($raw, true) : null;
    }

    // ── Jolpica ──────────────────────────────────────────────────────────────

    public static function schedule(int $season): array {
        require_once __DIR__ . '/Database.php';
        $key = "schedule_{$season}";
        if ($cached = Database::cacheGet($key)) return $cached;

        $data = self::fetch(self::JOLPICA . "/{$season}.json?limit=25");
        if (!$data) return [];
        $races = $data['MRData']['RaceTable']['Races'] ?? [];
        Database::cacheSet($key, $races, 3600);
        return $races;
    }

    public static function raceResults(int $season, int $round): array {
        require_once __DIR__ . '/Database.php';
        $key = "results_{$season}_{$round}";
        if ($cached = Database::cacheGet($key)) return $cached;

        $data = self::fetch(self::JOLPICA . "/{$season}/{$round}/results.json");
        if (!$data) return [];
        $results = $data['MRData']['RaceTable']['Races'][0]['Results'] ?? [];
        Database::cacheSet($key, $results, 3600);
        return $results;
    }

    public static function driverStandings(int $season): array {
        require_once __DIR__ . '/Database.php';
        $key = "driver_standings_{$season}";
        if ($cached = Database::cacheGet($key)) return $cached;

        $data = self::fetch(self::JOLPICA . "/{$season}/driverstandings.json");
        if (!$data) return [];
        $standings = $data['MRData']['StandingsTable']['StandingsLists'][0]['DriverStandings'] ?? [];
        Database::cacheSet($key, $standings, 3600);
        return $standings;
    }

    public static function constructorStandings(int $season): array {
        require_once __DIR__ . '/Database.php';
        $key = "constructor_standings_{$season}";
        if ($cached = Database::cacheGet($key)) return $cached;

        $data = self::fetch(self::JOLPICA . "/{$season}/constructorstandings.json");
        if (!$data) return [];
        $standings = $data['MRData']['StandingsTable']['StandingsLists'][0]['ConstructorStandings'] ?? [];
        Database::cacheSet($key, $standings, 3600);
        return $standings;
    }

    public static function drivers(int $season): array {
        require_once __DIR__ . '/Database.php';
        $key = "drivers_{$season}";
        if ($cached = Database::cacheGet($key)) return $cached;

        $data = self::fetch(self::JOLPICA . "/{$season}/drivers.json?limit=30");
        if (!$data) return [];
        $drivers = $data['MRData']['DriverTable']['Drivers'] ?? [];
        Database::cacheSet($key, $drivers, 86400);
        return $drivers;
    }

    public static function constructors(int $season): array {
        require_once __DIR__ . '/Database.php';
        $key = "constructors_{$season}";
        if ($cached = Database::cacheGet($key)) return $cached;

        $data = self::fetch(self::JOLPICA . "/{$season}/constructors.json?limit=15");
        if (!$data) return [];
        $cons = $data['MRData']['ConstructorTable']['Constructors'] ?? [];
        Database::cacheSet($key, $cons, 86400);
        return $cons;
    }

    public static function circuits(int $season): array {
        require_once __DIR__ . '/Database.php';
        $key = "circuits_{$season}";
        if ($cached = Database::cacheGet($key)) return $cached;

        $data = self::fetch(self::JOLPICA . "/{$season}/circuits.json?limit=30");
        if (!$data) return [];
        $circuits = $data['MRData']['CircuitTable']['Circuits'] ?? [];
        Database::cacheSet($key, $circuits, 86400);
        return $circuits;
    }

    public static function qualifyingResults(int $season, int $round): array {
        require_once __DIR__ . '/Database.php';
        $key = "quali_{$season}_{$round}";
        if ($cached = Database::cacheGet($key)) return $cached;

        $data = self::fetch(self::JOLPICA . "/{$season}/{$round}/qualifying.json");
        if (!$data) return [];
        $results = $data['MRData']['RaceTable']['Races'][0]['QualifyingResults'] ?? [];
        Database::cacheSet($key, $results, 3600);
        return $results;
    }

    // ── OpenF1 ───────────────────────────────────────────────────────────────

    public static function pitStops(int $meetingKey): array {
        require_once __DIR__ . '/Database.php';
        $key = "pitstops_{$meetingKey}";
        if ($cached = Database::cacheGet($key)) return $cached;

        $data = self::fetch(self::OPENF1 . "/pit?meeting_key={$meetingKey}");
        if (!$data) return [];
        Database::cacheSet($key, $data, 3600);
        return $data;
    }
}
