<?php
set_time_limit(120); 
ini_set('memory_limit', '256M');
include 'db.php';
header('Content-Type: text/html; charset=utf-8');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = 10.00;
$card_paytable = ['2.png'=>100,'5.png'=>80,'10.png'=>60,'7.png'=>50,'3.png'=>40,'4.png'=>30,'1.png'=>20,'6.png'=>10,'8.png'=>5];

// A. পুরাতন টেবিল মুছে নতুন করে তৈরি
$conn->query("DROP TABLE IF EXISTS fix_pre_spin");
$sql = "CREATE TABLE fix_pre_spin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    spin_data LONGTEXT,
    win_amount DECIMAL(10,2),
    is_used TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($sql);
echo "<h3>🗑️ টেবিল রিসেট সম্পন্ন...</h3>";

// B. ১০২৪ উপায়ে উইন চেক ফাংশন
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
            $val = $card_paytable[$target] ?? 5;
            $multiplier += ($val / 50) * ($match_count / 3);
        }
    }
    return ['pos' => $win_pos, 'amount' => round($bet * $multiplier, 2)];
}

// C. চেইন জেনারেটর (Recursive)
function generateChain($current_reels, $bet, $card_paytable, $total_win = 0) {
    $win_data = calculateWin($current_reels, $bet, $card_paytable);
    if (empty($win_data['pos'])) return null;
    $next_reels = $current_reels;
    foreach ($win_data['pos'] as $pos) {
        list($r, $c) = explode(',', $pos);
        $next_reels[$r][$c] = ['s' => array_keys($card_paytable)[array_rand(array_keys($card_paytable))]];
    }
    $total_win += $win_data['amount'];
    return [
        'reels' => $current_reels, 'next_combo' => $next_reels, 'win_pos' => $win_data['pos'],
        'win' => $win_data['amount'], 'total_win_so_far' => $total_win,
        'next_win_data' => generateChain($next_reels, $bet, $card_paytable, $total_win)
    ];
}

// D. র্যান্ডম রীল জেনারেটর
function generateRandomReels($card_paytable) {
    $reels = [];
    for ($col = 0; $col < 5; $col++) {
        $column = [];
        for ($row = 0; $row < 4; $row++) {
            $r = rand(1, 100);
            if ($r <= 5) $img = "9.png"; // ৫% স্ক্যাটার চান্স
            elseif ($r <= 12) $img = "wild.png";
            else $img = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
            $column[] = ['s' => $img];
        }
        $reels[] = $column;
    }
    return $reels;
}

// E. ৫০টি স্পিন তৈরির কোটা (১০ বড়, ১৫ ছোট, ২৫ লস)
$total_spins = 50;
$indexes = range(0, $total_spins - 1); shuffle($indexes);
$big_wins = array_slice($indexes, 0, 10);
$small_wins = array_slice($indexes, 10, 15);

echo "<h3>⚙️ ১০২৪ উপায়ে ৫০টি স্পিন জেনারেট হচ্ছে...</h3>";

for ($i = 0; $i < $total_spins; $i++) {
    $reels = generateRandomReels($card_paytable);

    // বড় উইন বা ছোট উইন সেট করার কুয়েরি মেইনটেন্যান্স
    if (in_array($i, $big_wins)) {
        while (calculateWin($reels, $bet, $card_paytable)['amount'] < ($bet * 1.5)) $reels = generateRandomReels($card_paytable);
        $chain = generateChain($reels, $bet, $card_paytable);
        $final_win = $chain['total_win_so_far'];
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

    // স্কাটার পজিশন কাউন্টার (যা গেম অফ হওয়া বাঁচাবে)
    $scatter_pos = []; $sc_count = 0;
    for ($c = 0; $c < 5; $c++) {
        for ($r = 0; $r < 4; $r++) {
            if (isset($reels[$c][$r]['s']) && $reels[$c][$r]['s'] === '9.png') {
                $scatter_pos[] = "$c,$r"; $sc_count++;
            }
        }
    }
    
    $chain['free_spins'] = ($sc_count >= 3) ? 20 : 0;
    $chain['scatter_pos'] = ($sc_count >= 3) ? $scatter_pos : null;

    $spin_data = $conn->real_escape_string(json_encode($chain));
    $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount, is_used) VALUES ($user_id, '$spin_data', $final_win, 0)");
}

echo "<h2 style='color:green;'>✅ আলহামদুলিল্লাহ! ৫০টি স্পিন এখন ১০২৪ উপায়ে ডাটাবেসে রেডি।</h2>";
echo "<a href='index.php?uid=$user_id' style='padding:10px; background:gold; font-weight:bold; text-decoration:none;'>গেম খেলুন</a>";
?>
