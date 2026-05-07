<?php
// ১. সার্ভার সেফটি কনফিগারেশন
set_time_limit(30); 
ini_set('memory_limit', '128M');
include 'db.php';
header('Content-Type: text/html; charset=utf-8');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = 10.00;
$card_paytable = ['2.png'=>100,'5.png'=>80,'10.png'=>60,'7.png'=>50,'3.png'=>40,'4.png'=>30,'1.png'=>20,'6.png'=>10,'8.png'=>5];

// ২. ডাটাবেস টেবিল একদম নতুন করে রি-বিল্ড করা
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
echo "<h3>🗑️ পুরাতন অকেজো টেবিল মুছে নতুন টেবিল তৈরি করা হয়েছে।</h3>";

// ৩. ১০২৪ উপায়ের একদম নির্ভুল উইন চেক ফাংশন
function calculateWin($reels, $bet, $card_paytable) {
    $win_pos = []; $multiplier = 0;
    
    // ১ম কলামের (Index 0) ৪টি সারির প্রতিটি কার্ড ধরে বাকি কলামের সাথে মিল চেক
    for ($r0 = 0; $r0 < 4; $r0++) {
        if (!isset($reels[0][$r0]['s'])) continue;
        $target = $reels[0][$r0]['s']; // ১ম কলামের কার্ড ফিক্স করা হলো
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

// ৪. চেইন জেনারেটর লুপ (সর্বোচ্চ ৫ বার কম্বো লিমিট)
function generateChain($current_reels, $bet, $card_paytable, $total_win = 0, $depth = 1) {
    if ($depth > 5) return null; // ৫ বার এর বেশি মিললে চেইন বন্ধ

    $win_data = calculateWin($current_reels, $bet, $card_paytable);
    if (empty($win_data['pos'])) return null;

    $next_reels = $current_reels;
    foreach ($win_data['pos'] as $pos) {
        list($c, $r) = explode(',', $pos);
        // একদম ভিন্ন ও আনকোরা নতুন ছবি রিফিল করা হচ্ছে
        $next_reels[$c][$r] = ['s' => array_keys($card_paytable)[array_rand(array_keys($card_paytable))]];
    }

    $total_win += $win_data['amount'];
    return [
        'reels' => $current_reels, 'next_combo' => $next_reels, 'win_pos' => $win_data['pos'],
        'win' => $win_data['amount'], 'total_win_so_far' => $total_win,
        'next_win_data' => generateChain($next_reels, $bet, $card_paytable, $total_win, $depth + 1)
    ];
}

// ৫. র্যান্ডম ৫x৪ গ্রিড রীল জেনারেটর
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

// ৬. ৫০টি স্মার্ট স্পিন তৈরির কোটা (১০ বড় চেইন, ১৫ ছোট সাধারণ, ২৫ লস)
echo "<h3>⚙️ ১০২৪ উপায়ের ৫০টি প্রো-স্পিন জেনারেট হচ্ছে...</h3>";
$indexes = range(0, 49); shuffle($indexes);
$big_wins = array_slice($indexes, 0, 10);
$small_wins = array_slice($indexes, 10, 15);

for ($i = 0; $i < 50; $i++) {
    $reels = generateRandomReels($card_paytable);
    if (in_array($i, $big_wins)) {
        // জোরপূর্বক চেইন উইন তৈরি (১ম কলাম ফিক্স করে ম্যাচিং নিশ্চিত করা)
        $target = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
        $reels[0][0]['s'] = $target; $reels[1][0]['s'] = $target; $reels[2][0]['s'] = $target;
        $chain = generateChain($reels, $bet, $card_paytable);
        $final_win = $chain ? $chain['total_win_so_far'] : 0;
    } elseif (in_array($i, $small_wins)) {
        // ছোট সাধারণ উইন
        $target = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
        $reels[0][1]['s'] = $target; $reels[1][1]['s'] = $target; $reels[2][1]['s'] = $target;
        $w = calculateWin($reels, $bet, $card_paytable);
        $chain = ['reels' => $reels, 'win_pos' => $w['pos'], 'win' => $w['amount'], 'next_win_data' => null];
        $final_win = $w['amount'];
    } else {
        // নিশ্চিত হারানো স্পিন (১ম কলামে সব ভিন্ন কার্ড দিয়ে উইন ০ করা হলো)
        $keys = array_keys($card_paytable); shuffle($keys);
        for($r=0;$r<4;$r++) { $reels[0][$r]['s'] = $keys[$r]; }
        $chain = ['reels' => $reels, 'win_pos' => [], 'win' => 0];
        $final_win = 0;
    }
    $spin_data = $conn->real_escape_string(json_encode($chain));
    $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount, is_used) VALUES ($user_id, '$spin_data', $final_win, 0)");
}

echo "<h2 style='color:green;'>✅ আলহামদুলিল্লাহ! টেবিল রিসেট এবং ৫০টি নতুন স্পিন তৈরি সম্পন্ন হয়েছে।</h2>";
echo "<a href='index.php?uid=$user_id' style='padding:10px 20px; background:gold; color:black; text-decoration:none; font-weight:bold; border-radius:5px;'>গেম শুরু করুন</a>";
?>
