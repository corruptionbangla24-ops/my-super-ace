<?php
include 'db.php';
header('Content-Type: application/json');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$is_free_mode = isset($_GET['mode']) && $_GET['mode'] == 'free';
$bet = isset($_GET['bet']) ? floatval($_GET['bet']) : 10.00;
$rtp = 90;

$card_paytable = [
    '2.png'=>100, '5.png'=>80, '10.png'=>60, '7.png'=>50, 
    '3.png'=>40, '4.png'=>30, '1.png'=>20, '6.png'=>10, '8.png'=>5
];

// ১. চেক করা কয়টি স্পিন বাকি আছে
$check = $conn->query("SELECT COUNT(*) as total FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0");
$count = $check->fetch_assoc()['total'];

// ২. ১০টির কম থাকলে নতুন ৫০টি স্পিন তৈরি করা
if ($count < 10) {
    for ($i = 0; $i < 50; $i++) {
        $reels = []; $sc_count = 0;
        for ($col = 0; $col < 5; $col++) {
            $column = [];
            for ($row = 0; $row < 4; $row++) {
                $rand = rand(1, 100);
                if ($rand <= 5) { $img = "9.png"; $sc_count++; }
                elseif ($rand <= 12) { $img = "wild.png"; }
                else { $keys = array_keys($card_paytable); $img = $keys[array_rand($keys)]; }
                $column[] = ['s' => $img, 'g' => (rand(1, 100) < 15)];
            }
            $reels[] = $column;
        }

        $next_reels = [];
        for ($col = 0; $col < 5; $col++) {
            $next_col = [];
            for ($row = 0; $row < 4; $row++) {
                $next_img = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
                $next_col[] = ['s' => $next_img];
            }
            $next_reels[] = $next_col;
        }

        $win_pos = []; $total_multiplier = 0;
        for ($r0 = 0; $r0 < 4; $r0++) {
            $target = $reels[$r0]['s'];
            if ($target === '9.png' || $target === 'wild.png') continue;
            $match_count = 1; $temp_pos = ["0,$r0"];
            for ($c = 1; $c < 5; $c++) {
                $found = false;
                for ($r = 0; $r < 4; $r++) {
                    if ($reels[$c][$r]['s'] === $target || $reels[$c][$r]['s'] === 'wild.png') {
                        $temp_pos[] = "$c,$r"; $found = true;
                    }
                }
                if ($found) $match_count++; else break;
            }
            if ($match_count >= 3) {
                foreach ($temp_pos as $p) { if (!in_array($p, $win_pos)) $win_pos[] = $p; }
                $total_multiplier += ($card_paytable[$target] / 30) * ($match_count / 3);
            }
        }

        $wa = $bet * $total_multiplier;
        $spin_data = $conn->real_escape_string(json_encode([
            'reels' => $reels, 'next_combo' => $next_reels, 'win_pos' => $win_pos, 'free_spins' => ($sc_count >= 3 ? 20 : 0)
        ]));
        $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount, is_used) VALUES ($user_id, '$spin_data', $wa, 0)");
    }
}

// ৩. ডাটা পাঠানো ও ব্যালেন্স আপডেট
$get = $conn->query("SELECT id, spin_data, win_amount FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0 LIMIT 10");
$results = []; $tw = 0;
while ($row = $get->fetch_assoc()) {
    $d = json_decode($row['spin_data'], true);
    $d['win'] = (float)$row['win_amount'];
    $results[] = $d; $tw += $d['win'];
    $conn->query("UPDATE fix_pre_spin SET is_used = 1 WHERE id = ".$row['id']);
}

if ($is_free_mode) {
    $conn->query("UPDATE users SET balance = balance + $tw WHERE id = $user_id");
} else {
    $conn->query("UPDATE users SET balance = balance - $bet + $tw WHERE id = $user_id");
}

$nb = $conn->query("SELECT balance FROM users WHERE id = $user_id")->fetch_assoc()['balance'];
echo json_encode(['results' => $results, 'balance' => $nb, 'win' => $tw]);
?>
