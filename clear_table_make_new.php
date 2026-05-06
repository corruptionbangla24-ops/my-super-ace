<?php
set_time_limit(120);
include 'db.php';
header('Content-Type: text/html; charset=utf-8');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = 10.00;
$card_paytable = ['2.png'=>100,'5.png'=>80,'10.png'=>60,'7.png'=>50,'3.png'=>40,'4.png'=>30,'1.png'=>20,'6.png'=>10,'8.png'=>5];

// ১. টেবিল একদম ফ্রেশ করা
$conn->query("DROP TABLE IF EXISTS fix_pre_spin");
$conn->query("CREATE TABLE fix_pre_spin (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, spin_data LONGTEXT, win_amount DECIMAL(10,2), is_used TINYINT DEFAULT 0)");

echo "<h3>🗑️ টেবিল রিসেট সম্পন্ন...</h3>";

// ২. র্যান্ডম ছবি তৈরির ছোট ফাংশন
function getRandomImg($paytable) {
    return array_keys($paytable)[array_rand(array_keys($paytable))];
}

// ৩. ৫০টি স্পিন জেনারেশন
for ($i = 0; $i < 50; $i++) {
    $reels = [];
    for($c=0;$c<5;$c++) {
        $col=[];
        for($r=0;$r<4;$r++) { $col[]=['s'=>getRandomImg($card_paytable)]; }
        $reels[]=$col;
    }

    $win_pos = [];
    $win_amount = 0;

    // ২০% স্পিনকে "বড় উইন" বানানো (নিশ্চিত ৩টি কার্ড মিলবে)
    if ($i < 10) { 
        $target = getRandomImg($card_paytable);
        $reels[0][1]['s'] = $target;
        $reels[1][1]['s'] = $target;
        $reels[2][1]['s'] = $target;
        $win_pos = ["0,1", "1,1", "2,1"];
        $win_amount = ($card_paytable[$target] / 10) * $bet;
    }

    // ডাটা স্ট্রাকচারে reels এবং next_combo দুটোই থাকছে
    $spin_data = json_encode([
        'reels' => $reels,
        'next_combo' => $reels, // পরের ধাপের জন্য ব্যাকআপ ডাটা
        'win_pos' => $win_pos,
        'win' => $win_amount
    ]);

    $data = $conn->real_escape_string($spin_data);
    $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount, is_used) VALUES ($user_id, '$data', $win_amount, 0)");
}

echo "<h2 style='color:green;'>✅ আলহামদুলিল্লাহ! ৫০টি স্পিন এখন ডাটাবেসে নির্ভুলভাবে জমা হয়েছে।</h2>";
echo "<a href='index.php?uid=$user_id' style='padding:10px; background:gold; color:black; text-decoration:none; font-weight:bold;'>এখন গেম খেলুন</a>";
?>
