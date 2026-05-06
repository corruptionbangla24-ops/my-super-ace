<?php
// ১. সার্ভারকে পর্যাপ্ত সময় এবং মেমোরি দেওয়া (১০০ স্পিনের জন্য জরুরি)
set_time_limit(180); 
ini_set('memory_limit', '256M');
include 'db.php';
header('Content-Type: text/html; charset=utf-8');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = 10.00;
$card_paytable = ['2.png'=>100,'5.png'=>80,'10.png'=>60,'7.png'=>50,'3.png'=>40,'4.png'=>30,'1.png'=>20,'6.png'=>10,'8.png'=>5];

// ২. পুরাতন টেবিল পুরোপুরি মুছে নতুন করে তৈরি করা
$conn->query("DROP TABLE IF EXISTS fix_pre_spin");
$conn->query("CREATE TABLE fix_pre_spin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    spin_data LONGTEXT,
    win_amount DECIMAL(10,2),
    is_used TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

echo "<h3>🗑️ পুরাতন টেবিল মুছে নতুন টেবিল তৈরি হয়েছে...</h3>";

// ৩. উইন চেক এবং চেইন জেনারেশন ফাংশন (১০২৪ ওয়েজ)
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

function generateRandomReels($card_paytable) {
    $reels = [];
    for ($col = 0; $col < 5; $col++) {
        $column = [];
        for ($row = 0; $row < 4; $row++) {
            $r = rand(1, 100);
            if ($r <= 4) $img = "9.png"; elseif ($r <= 10) $img = "wild.png";
            else $img = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
            $column[] = ['s' => $img];
        } $reels[] = $column;
    }
    return $reels;
}

// ৪. ১০০টি স্পিন তৈরির কোটা (২০ বড় চেইন, ৩০ সাধারণ, ৫০ লস)
echo "<h3>⚙️ ১০০টি স্মার্ট স্পিন জেনারেট হচ্ছে, দয়া করে অপেক্ষা করুন...</h3>";

$total_spins = 100;
$indexes = range(0, $total_spins - 1); shuffle($indexes);
$big_wins = array_slice($indexes, 0, 20);
$small_wins = array_slice($indexes, 20, 30);

for ($i = 0; $i < $total_spins; $i++) {
    $reels = generateRandomReels($card_paytable);
    $sc_count = 0;
    foreach($reels as $col) foreach($col as $row) if($row['s'] === '9.png') $sc_count++;

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
    
    // ২০টি ফ্রি স্পিন লজিক (৩টি ৯ পড়লে)
    if ($sc_count >= 3) $chain['free_spins'] = 20;

    $data = $conn->real_escape_string(json_encode($chain));
    $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount, is_used) VALUES ($user_id, '$data', $final_win, 0)");
}

echo "<h2 style='color:green;'>✅ আলহামদুলিল্লাহ! ১০০টি নতুন স্পিন এখন ডাটাবেসে রেডি।</h2>";
echo "<a href='index.php?uid=$user_id' style='padding:10px 20px; background:gold; color:black; font-weight:bold; text-decoration:none; border-radius:5px;'>গেম শুরু করুন</a>";
?>
