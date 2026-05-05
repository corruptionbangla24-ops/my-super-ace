<?php
include 'db.php';
header('Content-Type: application/json');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = isset($_GET['bet']) ? floatval($_GET['bet']) : 10.00;
$rtp = 90;

$card_paytable = [
    '2.png'=>100, '5.png'=>80, '10.png'=>60, '7.png'=>50, 
    '3.png'=>40, '4.png'=>30, '1.png'=>20, '6.png'=>10, '8.png'=>5
];

$check = $conn->query("SELECT COUNT(*) as total FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0");
if ($check->fetch_assoc()['total'] < 10) {
    for ($i = 0; $i < 50; $i++) {
        $reels = []; $sc = 0;
        for ($col = 0; $col < 5; $col++) {
            $column = [];
            for ($row = 0; $row < 4; $row++) {
                $r = rand(1, 100);
                if ($r <= 5) { $img = "9.png"; $sc++; }
                elseif ($r <= 12) { $img = "wild.png"; }
                else { $keys = array_keys($card_paytable); $img = $keys[array_rand($keys)]; }
                $column[] = ['s' => $img, 'g' => (rand(1, 100) < 15)];
            }
            $reels[] = $column;
        }

        $win = (rand(1, 100) <= $rtp) ? ($bet * (rand(1, 100)/10)) : 0;
        $spin_data = $conn->real_escape_string(json_encode([
            'reels' => $reels,
            'next_combo' => $reels, // সিম্পল ফিলআপ ডাটা
            'win_pos' => ($win > 0 ? ["0,1", "1,1", "2,1"] : []),
            'free_spins' => ($sc >= 3 ? 20 : 0)
        ]));
        $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount) VALUES ($user_id, '$spin_data', $win)");
    }
}

$get = $conn->query("SELECT id, spin_data, win_amount FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0 LIMIT 10");
$results = []; $tw = 0;
while ($row = $get->fetch_assoc()) {
    $d = json_decode($row['spin_data'], true);
    $d['win'] = (float)$row['win_amount'];
    $results[] = $d; $tw += $d['win'];
    $conn->query("UPDATE fix_pre_spin SET is_used = 1 WHERE id = ".$row['id']);
}

$conn->query("UPDATE users SET balance = balance - $bet + $tw WHERE id = $user_id");
$nb = $conn->query("SELECT balance FROM users WHERE id = $user_id")->fetch_assoc()['balance'];

echo json_encode(['results' => $results, 'balance' => $nb, 'win' => $tw]);
