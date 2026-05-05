<?php
include 'db.php';
header('Content-Type: text/html; charset=utf-8');

// ১. এডমিন সেটিংস (RTP এবং কার্ড ভ্যালু)
$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = 10.00;
$rtp = 90; 
$card_paytable = [
    '2.png'=>100, '5.png'=>80, '10.png'=>60, '7.png'=>50, 
    '3.png'=>40, '4.png'=>30, '1.png'=>20, '6.png'=>10, '8.png'=>5
];

// ২. টেবিল ক্লিয়ার করা (পুরনো স্পিন মুছে ফেলা)
$conn->query("DELETE FROM fix_pre_spin WHERE user_id = $user_id");
echo "<h3 style='color: red;'>🗑️ পুরনো সব স্পিন মুছে ফেলা হয়েছে...</h3>";

// ৩. নতুন নিয়মে ১০০টি স্পিন তৈরি করা
echo "<h3>⚙️ নতুন ১০০টি স্পিন তৈরি হচ্ছে, দয়া করে অপেক্ষা করুন...</h3>";

for ($i = 0; $i < 100; $i++) {
    $reels = []; $sc_count = 0;
    
    // ৫x৪ গ্রিড তৈরি
    for ($col = 0; $col < 5; $col++) {
        $column = [];
        for ($row = 0; $row < 4; $row++) {
            $rand = rand(1, 100);
            if ($rand <= 5) { $img = "9.png"; $sc_count++; } 
            elseif ($rand <= 12) { $img = "wild.png"; }      
            else { 
                $keys = array_keys($card_paytable);
                $img = $keys[array_rand($keys)]; 
            }
            $column[] = ['s' => $img, 'g' => (rand(1, 100) < 15)];
        }
        $reels[] = $column;
    }

    // ফিলআপের জন্য নেক্সট কম্বো তৈরি
    $next_reels = [];
    for ($col = 0; $col < 5; $col++) {
        $next_col = [];
        for ($row = 0; $row < 4; $row++) {
            $next_img = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
            $next_col[] = ['s' => $next_img];
        }
        $next_reels[] = $next_col;
    }

    // ৪. আপনার সেই "১০২৪ উপায়ে জয়" (Ways to Win) লজিক
    $win_pos = [];
    $total_multiplier = 0;

    for ($r0 = 0; $r0 < 4; $r0++) {
        $target = $reels[0][$r0]['s'];
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
            $val = $card_paytable[$target];
            $total_multiplier += ($val / 30) * ($match_count / 3);
        }
    }

    $win_amount = $bet * $total_multiplier;
    $spin_data = $conn->real_escape_string(json_encode([
        'reels' => $reels,
        'next_combo' => $next_reels,
        'win_pos' => $win_pos,
        'free_spins' => ($sc_count >= 3 ? 20 : 0)
    ]));

    $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount, is_used) VALUES ($user_id, '$spin_data', $win_amount, 0)");
}

echo "<h2 style='color: green;'>✅ আলহামদুলিল্লাহ! ১০০টি নতুন স্পিন তৈরি সম্পন্ন হয়েছে।</h2>";
echo "<a href='index.php?uid=$user_id' style='padding: 10px 20px; background: gold; border-radius: 5px; text-decoration: none; color: #000; font-weight: bold;'>গেম শুরু করুন</a>";
?>
