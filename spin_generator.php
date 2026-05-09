<?php
// ১. সার্ভার কনফিগারেশন ও অপ্টিমাইজেশন
set_time_limit(60); 
ini_set('memory_limit', '128M');
include 'db.php';
header('Content-Type: application/json');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = isset($_GET['bet']) ? floatval($_GET['bet']) : 10.00;
$is_free_mode = isset($_GET['mode']) && $_GET['mode'] == 'free';

$card_paytable = ['2.png'=>100,'5.png'=>80,'10.png'=>60,'7.png'=>50,'3.png'=>40,'4.png'=>30,'1.png'=>20,'6.png'=>10,'8.png'=>5];

// ২. ১০২৪ উপায়ে উইন চেক করার নির্ভুল লজিক (Way to Win)
function calculateWin($reels, $bet, $card_paytable) {
    $win_pos = []; $multiplier = 0;
    for ($r0 = 0; $r0 < 4; $r0++) {
        if (!isset($reels[0][$r0]['s'])) continue;
        $target = $reels[0][$r0]['s'];
        if ($target === '9.png' || $target === 'wild.png') continue;
        
        $match_count = 1; $temp_pos = ["0,$r0"];
        for ($c = 1; $c < 5; $c++) {
            $found = false;
            for ($r = 0; $r < 4; $r++) {
                if (isset($reels[$c][$r]['s']) && ($reels[$c][$r]['s'] === $target || $reels[$c][$r]['s'] === 'wild.png')) {
                    $temp_pos[] = "$c,$r"; $found = true;
                }
            }
            if ($found) $match_count++; else break;
        }
        if ($match_count >= 3) {
            foreach ($temp_pos as $p) { if (!in_array($p, $win_pos)) $win_pos[] = $p; }
            $val = $card_paytable[$target] ?? 5;
            $multiplier += ($val / 40) * ($match_count / 3);
        }
    }
    return ['pos' => $win_pos, 'amount' => round($bet * $multiplier, 2)];
}

// ৩. চেইন জেনারেটর (Recursive - আনলিমিটেড কম্বো উইন)
function generateChain($current_reels, $bet, $card_paytable, $total_win = 0) {
    $win_data = calculateWin($current_reels, $bet, $card_paytable);
    if (empty($win_data['pos'])) return null;

    $next_reels = $current_reels;
    foreach ($win_data['pos'] as $pos) {
        list($c, $r) = explode(',', $pos);
        $next_reels[$c][$r] = ['s' => array_keys($card_paytable)[array_rand(array_keys($card_paytable))]];
    }

    $total_win += $win_data['amount'];
    return [
        'reels' => $current_reels,
        'next_combo' => $next_reels,
        'win_pos' => $win_data['pos'],
        'win' => $win_data['amount'],
        'total_win_so_far' => $total_win,
        'next_win_data' => generateChain($next_reels, $bet, $card_paytable, $total_win)
    ];
}

// ৪. অটো-রিফিল চেক: ১৫টির নিচে নামলে নতুন ৪০টি স্পিন তৈরি হবে
$check = $conn->query("SELECT COUNT(*) as total FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0");
$total_left = $check->fetch_assoc()['total'];

if ($total_left <= 15) {
    $total_spins = 40; 
    $indexes = range(0, $total_spins - 1); shuffle($indexes);
    $big_wins = array_slice($indexes, 0, 8);   // ২০% বড় চেইন উইন
    $small_wins = array_slice($indexes, 8, 12); // ৩০% ছোট সাধারণ উইন

    for ($i = 0; $i < $total_spins; $i++) {
        // র্যান্ডম রীল জেনারেশন
        $reels = [];
        for($c=0;$c<5;$c++){ $col=[]; for($r=0;$r<4;$r++){ 
            $rand = rand(1,100);
            $img = ($rand <= 5) ? "9.png" : (($rand <= 12) ? "wild.png" : array_keys($card_paytable)[array_rand(array_keys($card_paytable))]);
            $col[] = ['s' => $img]; 
        } $reels[] = $col; }

        if (in_array($i, $big_wins)) {
            while (calculateWin($reels, $bet, $card_paytable)['amount'] < ($bet * 1.5)) {
                for($c=0;$c<5;$c++) for($r=0;$r<4;$r++) $reels[$c][$r]['s'] = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
            }
            $chain = generateChain($reels, $bet, $card_paytable);
            $final_win = $chain['total_win_so_far'];
        } elseif (in_array($i, $small_wins)) {
            while (calculateWin($reels, $bet, $card_paytable)['amount'] == 0) {
                for($c=0;$c<5;$c++) for($r=0;$r<4;$r++) $reels[$c][$r]['s'] = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
            }
            $w = calculateWin($reels, $bet, $card_paytable);
            $chain = ['reels' => $reels, 'win_pos' => $w['pos'], 'win' => $w['amount'], 'next_win_data' => null];
            $final_win = $w['amount'];
        } else {
            while (calculateWin($reels, $bet, $card_paytable)['amount'] > 0) {
                for($c=0;$c<5;$c++) for($r=0;$r<4;$r++) $reels[$c][$r]['s'] = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
            }
            $chain = ['reels' => $reels, 'win_pos' => [], 'win' => 0];
            $final_win = 0;
        }

        $json = $conn->real_escape_string(json_encode($chain));
        $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount, is_used) VALUES ($user_id, '$json', $final_win, 0)");
    }
}

// ৫. ডাটা ডেলিভারি এবং রিয়েল-টাইম ব্যালেন্স আপডেট
$get = $conn->query("SELECT id, spin_data, win_amount FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0 LIMIT 10");
$results = []; $tw = 0;

while ($row = $get->fetch_assoc()) {
    $d = json_decode($row['spin_data'], true);
    $d['win'] = (float)$row['win_amount'];
    $results[] = $d; $tw += $d['win'];
    $conn->query("UPDATE fix_pre_spin SET is_used = 1 WHERE id = ".$row['id']);
}

$cost = $is_free_mode ? 0 : ($bet * count($results));
$conn->query("UPDATE users SET balance = balance - $cost + $tw WHERE id = $user_id");

$nb_res = $conn->query("SELECT balance FROM users WHERE id = $user_id");
$new_balance = (float)$nb_res->fetch_assoc()['balance'];

echo json_encode(['results' => $results, 'balance' => $new_balance, 'win' => $tw]);
?>
