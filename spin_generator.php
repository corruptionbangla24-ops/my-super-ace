<?php
include 'db.php';
header('Content-Type: application/json');
$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = 10.00;
$res = $conn->query("SELECT balance FROM users WHERE id = $user_id");
$user = $res->fetch_assoc();
$balance = $user['balance'];

$results = [];
for ($s = 0; $s < 50; $s++) {
    if ($balance < $bet) break;
    $balance -= $bet;
    $reels = [];
    
    $reels = [];
    for ($i = 0; $i < 5; $i++) {
        $col = [];
        for ($j = 0; $j < 4; $j++) {
            $col[] = ['s' => rand(1, 10).".png", 'g' => (rand(1, 100) <= 15)];
        }
        $reels[] = $col;
    }

    // ৩, ৪, ৫ কলামে ওয়াইল্ড বিস্ফোরণ লজিক
    if (rand(1, 100) <= 20) { // ২০% সম্ভাবনা
        for ($k = 0; $k < 3; $k++) {
            $reels[rand(2, 4)][rand(0, 3)] = ['s' => 'wild.png', 'g' => false];
        }
    }

    $win_amount = 0; $win_pos = [];
    for ($r = 0; $r < 4; $r++) {
        $sym = $reels[0][$r]['s']; $match = [[0, $r]];
        for ($c = 1; $c < 5; $c++) {
            $found = false;
            for ($row = 0; $row < 4; $row++) {
                if ($reels[$c][$row]['s'] === $sym || $reels[$c][$row]['s'] === 'wild.png') { $match[] = [$c, $row]; $found = true; }
            }
            if (!$found) break;
        }
        if (count($match) >= 3) {
            $win_amount += count($match) * 5;
            foreach($match as $m) $win_pos[$m[0].'-'.$m[1]] = ['c' => $m[0], 'r' => $m[1]];
        }
    }
    $balance += $win_amount;
    $results[] = ['reels' => $reels, 'win_pos' => array_values($win_pos), 'win' => number_format($win_amount, 2, '.', ''), 'bal' => number_format($balance, 2, '.', '')];
}
$conn->query("UPDATE users SET balance = $balance WHERE id = $user_id");
echo json_encode(['results' => $results]);
