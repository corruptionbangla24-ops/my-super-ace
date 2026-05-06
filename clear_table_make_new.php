<?php
// ১. সার্ভার কনফিগারেশন (রেন্ডার সার্ভারের জন্য টাইমআউট বাড়ানো হলো)
set_time_limit(180); 
ini_set('memory_limit', '256M');
include 'db.php';
header('Content-Type: text/html; charset=utf-8');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = 10.00;
$card_paytable = ['2.png'=>100,'5.png'=>80,'10.png'=>60,'7.png'=>50,'3.png'=>40,'4.png'=>30,'1.png'=>20,'6.png'=>10,'8.png'=>5];

// ২. ডাটাবেস টেবিল রিসেট (DROP & CREATE)
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
echo "<h3 style='color:red;'>🗑️ পুরাতন ডাটা মুছে নতুন টেবিল তৈরি করা হয়েছে।</h3>";

// ৩. ১০২৪ উপায়ে উইন চেক ফাংশন
function calculateWin($reels, $bet, $card_paytable) {
    $win_pos = []; $multiplier = 0;
    for ($r = 0; $r < 4; $r++) { // প্রতিটি সারি চেক
        if (!isset($reels[0][$r]['s'])) continue;
        $target = $reels[0][$r]['s'];
        if ($target === '9.png' || $target === 'wild.png') continue;
        
        $match_count = 1; $temp_pos = ["0,$r"];
        for ($c = 1; $c < 5; $c++) { // কলামে কলামে মিল খোঁজা
            $found = false;
            for ($row = 0; $row < 4; $row++) {
                if ($reels[$c][$row]['s'] === $target || $reels[$c][$row]['s'] === 'wild.png') {
                    $temp_pos[] = "$c,$row"; $found = true;
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

// ৪. চেইন জেনারেটর (Recursive)
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
        'reels' => $current_reels, 'next_combo' => $next_reels, 'win_pos' => $win_data['pos'],
        'win' => $win_data['amount'], 'total_win_so_far' => $total_win,
        'next_win_data' => generateChain($next_reels, $bet, $card_paytable, $total_win)
    ];
}

// ৫. ১০০টি স্পিন তৈরি (২০ বড় উইন, ৩০ ছোট উইন, ৫০ লস)
echo "<h3>⚙️ ১০০টি স্মার্ট স্পিন জেনারেট হচ্ছে, দয়া করে অপেক্ষা করুন...</h3>";
$indexes = range(0, 99); shuffle($indexes);
$big_wins = array_slice($indexes, 0, 20);
$small_wins = array_slice($indexes, 20, 30);

for ($i = 0; $i < 100; $i++) {
    // র্যান্ডম রীল তৈরি
    $reels = [];
    for ($c=0; $c<5; $c++) { $col = []; for ($r=0; $r<4; $r++) { 
        $rand = rand(1,100);
        $img = ($rand <= 5) ? "9.png" : (($rand <= 12) ? "wild.png" : array_keys($card_paytable)[array_rand(array_keys($card_paytable))]);
        $col[] = ['s' => $img]; 
    } $reels[] = $col; }

    if (in_array($i, $big_wins)) { // বড় চেইন উইন
        while (calculateWin($reels, $bet, $card_paytable)['amount'] < ($bet * 1.5)) { 
            // পুনরায় রীল জেনারেট যতক্ষণ না বড় উইন মেলে
            for($c=0;$c<5;$c++) for($r=0;$r<4;$r++) $reels[$c][$r]['s'] = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
        }
        $chain = generateChain($reels, $bet, $card_paytable);
        $final_win = $chain['total_win_so_far'];
    } elseif (in_array($i, $small_wins)) { // ছোট সাধারণ উইন
        while (calculateWin($reels, $bet, $card_paytable)['amount'] == 0 || calculateWin($reels, $bet, $card_paytable)['amount'] > ($bet * 1.2)) {
            for($c=0;$c<5;$c++) for($r=0;$r<4;$r++) $reels[$c][$r]['s'] = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
        }
        $w = calculateWin($reels, $bet, $card_paytable);
        $chain = ['reels' => $reels, 'win_pos' => $w['pos'], 'win' => $w['amount'], 'next_win_data' => null];
        $final_win = $w['amount'];
    } else { // লস স্পিন
        while (calculateWin($reels, $bet, $card_paytable)['amount'] > 0) {
            for($c=0;$c<5;$c++) for($r=0;$r<4;$r++) $reels[$c][$r]['s'] = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
        }
        $chain = ['reels' => $reels, 'win_pos' => [], 'win' => 0];
        $final_win = 0;
    }

    $json = $conn->real_escape_string(json_encode($chain));
    $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount, is_used) VALUES ($user_id, '$json', $final_win, 0)");
}

echo "<h2 style='color:green;'>✅ আলহামদুলিল্লাহ! টেবিল রিসেট এবং ১০০টি নতুন স্পিন তৈরি সম্পন্ন হয়েছে।</h2>";
echo "<a href='index.php?uid=$user_id' style='padding:12px 25px; background:gold; color:black; text-decoration:none; font-weight:bold; border-radius:8px;'>এখন গেম খেলুন</a>";
?>
