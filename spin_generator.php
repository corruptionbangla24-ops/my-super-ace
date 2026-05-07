<?php
// ১. সার্ভার কনফিগারেশন এবং টাইমআউট প্রটেকশন
set_time_limit(60); 
ini_set('memory_limit', '128M');
include 'db.php';
header('Content-Type: application/json');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = isset($_GET['bet']) ? floatval($_GET['bet']) : 10.00;
$is_free_mode = isset($_GET['mode']) && $_GET['mode'] == 'free';

$card_paytable = ['2.png'=>100,'5.png'=>80,'10.png'=>60,'7.png'=>50,'3.png'=>40,'4.png'=>30,'1.png'=>20,'6.png'=>10,'8.png'=>5];

// ২. ১০২৪ উপায়ে উইন চেক করার লাইটওয়েট লজিক
function calculateWin($reels, $bet, $card_paytable) {
    $win_pos = []; $multiplier = 0;
    for ($r0 = 0; $r0 < 4; $r0++) {
        if (!isset($reels[$r0]['s'])) continue;
        $target = $reels[$r0]['s'];
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
            $val = isset($card_paytable[$target]) ? $card_paytable[$target] : 5;
            $multiplier += ($val / 40) * ($match_count / 3);
        }
    }
    return ['pos' => $win_pos, 'amount' => round($bet * $multiplier, 2)];
}

// ৩. চেইন জেনারেটর (সর্বোচ্চ ৫-৬ বার কম্বো লিমিট এবং ভিন্ন কার্ড ফিক্স)
function generateChain($current_reels, $bet, $card_paytable, $total_win = 0, $depth = 1) {
    if ($depth > 5) { 
        return null; // ৫ বার কম্বো হয়ে গেলে জোরপূর্বক চেইন বন্ধ
    }

    $win_data = calculateWin($current_reels, $bet, $card_paytable);
    if (empty($win_data['pos'])) return null;

    // ভ্যানিশ হওয়া জায়গায় একদম ভিন্ন ও নতুন কার্ড তৈরি করা
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
        'next_win_data' => generateChain($next_reels, $bet, $card_paytable, $total_win, $depth + 1)
    ];
}

// ৪. র্যান্ডম রীল জেনারেটর
function generateRandomReels($card_paytable) {
    $reels = [];
    for ($col = 0; $col < 5; $col++) {
        $column = [];
        for ($row = 0; $row < 4; $row++) {
            $r = rand(1, 100);
            if ($r <= 4) $img = "9.png"; elseif ($r <= 10) $img = "wild.png";
            else $img = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
            $column[] = ['s' => $img];
        }
        $reels[] = $column;
    }
    return $reels;
}

// ৫. অটো-রিফিল চেক: ১০টির নিচে নামলে নতুন ৫০টি তৈরি হবে (২০-৩০-৫০ কোটা)
$check = $conn->query("SELECT COUNT(*) as total FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0");
$count = $check->fetch_assoc()['total'];

if ($count <= 10) {
    $total_spins = 50; 
    $indexes = range(0, $total_spins - 1); shuffle($indexes);
    $big_wins = array_slice($indexes, 0, 10);   
    $small_wins = array_slice($indexes, 10, 15); 

    for ($i = 0; $i < $total_spins; $i++) {
        $reels = generateRandomReels($card_paytable);
        if (in_array($i, $big_wins)) {
            while (calculateWin($reels, $bet, $card_paytable)['amount'] < ($bet * 1.5)) $reels = generateRandomReels($card_paytable);
            $chain = generateChain($reels, $bet, $card_paytable);
            $final_win = $chain ? $chain['total_win_so_far'] : 0;
        } elseif (in_array($i, $small_wins)) {
            while (calculateWin($reels, $bet, $card_paytable)['amount'] == 0 || calculateWin($reels, $bet, $card_paytable)['amount'] > ($bet * 1.2)) $reels = generateRandomReels($card_paytable);
            $w = calculateWin($reels, $bet, $card_paytable);
            $chain = ['reels' => $reels, 'win_pos' => $w['pos'], 'win' => $w['amount'], 'next_win_data' => null];
            $final_win = $w['amount'];
        } else {
            while (calculateWin($reels, $bet, $card_paytable)['amount'] > 0) $reels = generateRandomReels($card_paytable);
            $chain = ['reels' => $reels, 'win_pos' => [], 'win' => 0];
            $final_win = 0;
        }
        $spin_data = $conn->real_escape_string(json_encode($chain));
        $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount, is_used) VALUES ($user_id, '$spin_data', $final_win, 0)");
    }
}

// ==========================================
// ৬. ডাটা পাঠানো ও মেইন ব্যালেন্স ১০০% নিখুঁত সিঙ্ক
// ==========================================
$get = $conn->query("SELECT id, spin_data, win_amount FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0 LIMIT 10");
$results = []; 
$tw = 0;

while ($row = $get->fetch_assoc()) {
    $d = json_decode($row['spin_data'], true);
    
    // 🛡️ মাস্টার প্রটেকশন চেক: যদি ডাটাবেসের ডাটাতে কোনো কি (Key) মিসিং থাকে, তবে জোর করে ফাঁকা অবজেক্ট বসিয়ে দেওয়া হবে যাতে গেম জ্যাম না হয়
    if (!is_array($d)) {
        $d = ['reels' => getQuickReels($card_paytable)];
    }
    if (!isset($d['win_pos'])) $d['win_pos'] = [];
    if (!isset($d['win'])) $d['win'] = 0;
    if (!isset($d['next_combo'])) $d['next_combo'] = $d['reels'];
    
    $d['win'] = (float)$row['win_amount'];
    $results[] = $d; 
    $tw += $d['win'];
    
    // স্পিনটি ব্যবহার হয়েছে হিসেবে ডাটাবেসে আপডেট করা
    $conn->query("UPDATE fix_pre_spin SET is_used = 1 WHERE id = ".$row['id']);
}

// পুরাতন বা বাসি খেলা হয়ে যাওয়া রোগাক্রান্ত রোগুলো ডিলিট করা যাতে ডাটাবেস হালকা থাকে
$conn->query("DELETE FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 1");

// ব্যালেন্স আপডেট লজিক
$cost = $is_free_mode ? 0 : ($bet * count($results));
$conn->query("UPDATE users SET balance = balance - $cost + $tw WHERE id = $user_id");

// ডাটাবেস থেকে একদম টাটকা রিয়েল-টাইম ব্যালেন্স তুলে আনা
$nb_res = $conn->query("SELECT balance FROM users WHERE id = $user_id");
$user_bal_data = $nb_res->fetch_assoc();
$new_balance = isset($user_bal_data['balance']) ? (float)$user_bal_data['balance'] : 0.00;

// চূড়ান্ত ক্লিন JSON আউটপুট যা জাভাস্ক্রিপ্ট মাখনের মতো পড়তে পারবে
echo json_encode([
    'results' => $results, 
    'balance' => $new_balance, 
    'win' => $tw
]);
$conn->close();
?>
