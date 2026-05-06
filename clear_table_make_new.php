<?php
include 'db.php';
header('Content-Type: text/html; charset=utf-8');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = 10.00; // আপনার ডিফল্ট বেট

function calculateWin($reels, $bet, $card_paytable) {
    $win_pos = []; 
    $multiplier = 0;
    
    // ১. প্রথম কলামের কার্ডগুলো নিয়ে লুপ শুরু
    for ($r0 = 0; $r0 < 4; $r0++) {
        // রীল ডাটা পড়ার সময় সঠিক কি (key) ব্যবহার করা
        if (!isset($reels[0][$r0]['s'])) continue;
        
        $target = $reels[0][$r0]['s'];
        if ($target === '9.png' || $target === 'wild.png') continue;
        
        $match_count = 1; 
        $temp_pos = ["0,$r0"];
        
        // ২. পরের কলামগুলোতে মিল চেক করা
        for ($c = 1; $c < 5; $c++) {
            $found = false;
            for ($r = 0; $r < 4; $r++) {
                if (isset($reels[$c][$r]['s']) && ($reels[$c][$r]['s'] === $target || $reels[$c][$r]['s'] === 'wild.png')) {
                    $temp_pos[] = "$c,$r"; 
                    $found = true;
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


// ২. আনলিমিটেড চেইন জেনারেটর (Recursive)
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

// ৩. র্যান্ডম রীল জেনারেটর
function generateRandomReels($card_paytable) {
    $reels = [];
    for ($col = 0; $col < 5; $col++) {
        $column = [];
        for ($row = 0; $row < 4; $row++) {
            $r = rand(1, 100);
            if ($r <= 4) $img = "9.png"; 
            elseif ($r <= 10) $img = "wild.png";
            else $img = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
            $column[] = ['s' => $img];
        }
        $reels[] = $column;
    }
    return $reels;
}

$card_paytable = ['2.png'=>100,'5.png'=>80,'10.png'=>60,'7.png'=>50,'3.png'=>40,'4.png'=>30,'1.png'=>20,'6.png'=>10,'8.png'=>5];

// ৪. টেবিল পরিষ্কার করা
$conn->query("DELETE FROM fix_pre_spin WHERE user_id = $user_id");
echo "<h3 style='color:red;'>🗑️ পুরনো ডাটা মুছে ফেলা হয়েছে...</h3>";

// ৫. ১০০টি স্পিন তৈরি (২০-৩০-৫০ কোটা)
$total_spins = 100;
$indexes = range(0, $total_spins - 1);
shuffle($indexes);
$big_wins = array_slice($indexes, 0, 20);
$small_wins = array_slice($indexes, 20, 30);

for ($i = 0; $i < $total_spins; $i++) {
    $reels = generateRandomReels($card_paytable);
    if (in_array($i, $big_wins)) {
        while (calculateWin($reels, $bet, $card_paytable)['amount'] < ($bet * 2)) $reels = generateRandomReels($card_paytable);
        $chain = generateChain($reels, $bet, $card_paytable);
        $final_win = $chain['total_win_so_far'];
    } elseif (in_array($i, $small_wins)) {
        while (calculateWin($reels, $bet, $card_paytable)['amount'] == 0 || calculateWin($reels, $bet, $card_paytable)['amount'] > ($bet * 1.5)) $reels = generateRandomReels($card_paytable);
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

echo "<h2 style='color:green;'>✅ ১০০টি নতুন প্রো-লেভেল স্পিন তৈরি হয়েছে!</h2>";
echo "<a href='index.php?uid=$user_id' style='padding:10px 20px; background:gold; color:black; text-decoration:none; font-weight:bold; border-radius:5px;'>গেম খেলুন</a>";
?>
