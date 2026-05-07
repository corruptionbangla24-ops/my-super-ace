<?php
// ১. সার্ভার কনফিগারেশন এবং টাইমআউট প্রটেকশন
set_time_limit(30); 
ini_set('memory_limit', '64M');
include 'db.php';
header('Content-Type: application/json');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = isset($_GET['bet']) ? floatval($_GET['bet']) : 10.00;
$is_free_mode = isset($_GET['mode']) && $_GET['mode'] == 'free';

$card_paytable = ['2.png'=>100,'5.png'=>80,'10.png'=>60,'7.png'=>50,'3.png'=>40,'4.png'=>30,'1.png'=>20,'6.png'=>10,'8.png'=>5];

// ২. ১০২৪ উপায়ে উইন চেক করার লাইটওয়েট লজিক
function checkWaysToWin($reels, $bet, $paytable) {
    $win_pos = [];
    $total_multiplier = 0;
    for ($r = 0; $r < 4; $r++) {
        if (!isset($reels[0][$r]['s'])) continue;
        $target = $reels[0][$r]['s'];
        if ($target === '9.png') continue;
        $match_count = 1; $temp_pos = ["0,$r"];
        for ($c = 1; $c < 5; $c++) {
            $found = false;
            for ($row = 0; $row < 4; $row++) {
                if (isset($reels[$c][$row]['s']) && ($reels[$c][$row]['s'] === $target || $reels[$c][$row]['s'] === 'wild.png')) {
                    $temp_pos[] = "$c,$row"; $found = true;
                }
            }
            if ($found) $match_count++; else break;
        }
        if ($match_count >= 3) {
            foreach ($temp_pos as $p) { if (!in_array($p, $win_pos)) $win_pos[] = $p; }
            $payout = $paytable[$target] ?? 5;
            $total_multiplier += ($payout / 50) * ($match_count / 3);
        }
    }
    return ['pos' => $win_pos, 'amount' => round($bet * $total_multiplier, 2)];
}

// ৩. র্যান্ডম রীল তৈরির ফাস্ট ফাংশن
function getQuickReels($card_paytable) {
    $reels = [];
    for ($c=0; $c<5; $c++) { $col = []; for ($r=0; $r<4; $r++) { $col[] = ['s' => array_keys($card_paytable)[array_rand(array_keys($card_paytable))]]; } $reels[] = $col; }
    return $reels;
}

// ৪. অটো-রিফিল চেক: ডাটাবেসে ১০টির কম স্পিন থাকলে কেবল তখনই রিফিল হবে
$check = $conn->query("SELECT COUNT(*) as total FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0");
$total_left = $check->fetch_assoc()['total'];

if ($total_left <= 10) {
    $total_spins = 40; // সার্ভার ক্রাশ এড়াতে ৪০টি নিরাপদ কোটা
    for ($i = 0; $i < $total_spins; $i++) {
        $reels = getQuickReels($card_paytable);
        
        // ২০% বড় উইন, ৩০% ছোট উইন, ৫০% লস (লুপ ছাড়া দ্রুত জেনারেশন)
        if ($i < 8) { // বড় উইন (জোরপূর্বক ৩টি ম্যাচিং কার্ড বসানো)
            $target = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
            $reels[0][1]['s'] = $target; $reels[1][1]['s'] = $target; $reels[2][1]['s'] = $target;
            $win_data = checkWaysToWin($reels, $bet, $card_paytable);
        } elseif ($i < 20) { // ছোট উইন
            $target = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
            $reels[0][0]['s'] = $target; $reels[1][0]['s'] = $target; $reels[2][0]['s'] = $target;
            $win_data = checkWaysToWin($reels, $bet, $card_paytable);
        } else { // নিশ্চিত লস স্পিন
            $win_data = ['pos' => [], 'amount' => 0];
        }

        $spin_data = json_encode(['reels' => $reels, 'next_combo' => $reels, 'win_pos' => $win_data['pos'], 'win' => $win_data['amount']]);
        $data = $conn->real_escape_string($spin_data);
        $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount, is_used) VALUES ($user_id, '$data', ".$win_data['amount'].", 0)");
    }
}

// ৫. ডাটা ডেলিভারি ও রিয়েল-টাইম ব্যালেন্স সিঙ্ক
$get = $conn->query("SELECT id, spin_data, win_amount FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0 LIMIT 10");
$results = []; $tw = 0;

while ($row = $get->fetch_assoc()) {
    $d = json_decode($row['spin_data'], true);
    $d['win'] = (float)$row['win_amount'];
    $results[] = $d; $tw += $d['win'];
    $conn->query("UPDATE fix_pre_spin SET is_used = 1 WHERE id = ".$row['id']);
}

// পুরনো খেলা হয়ে যাওয়া ডাটা ডিলিট করা যাতে ডাটাবেস হালকা থাকে
$conn->query("DELETE FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 1");

$cost = $is_free_mode ? 0 : ($bet * count($results));
$conn->query("UPDATE users SET balance = balance - $cost + $tw WHERE id = $user_id");

$nb_res = $conn->query("SELECT balance FROM users WHERE id = $user_id");
$new_balance = (float)$nb_res->fetch_assoc()['balance'];

echo json_encode(['results' => $results, 'balance' => $new_balance, 'win' => $tw]);
$conn->close();
?>
