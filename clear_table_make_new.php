<?php
// ১. টাইম আউট এবং মেমোরি ফিক্স
set_time_limit(120); 
ini_set('memory_limit', '256M');
include 'db.php';
header('Content-Type: text/html; charset=utf-8');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = 10.00;
$card_paytable = ['2.png'=>100,'5.png'=>80,'10.png'=>60,'7.png'=>50,'3.png'=>40,'4.png'=>30,'1.png'=>20,'6.png'=>10,'8.png'=>5];

// ২. টেবিল রিসেট (পুরাতন ডাটা ক্লিন)
$conn->query("DROP TABLE IF EXISTS fix_pre_spin");
$conn->query("CREATE TABLE fix_pre_spin (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, spin_data LONGTEXT, win_amount DECIMAL(10,2), is_used TINYINT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

echo "<h3>🗑️ টেবিল রিসেট সম্পন্ন...</h3>";

// ৩. র্যান্ডম রীল বানানোর ফাংশন
function getReels($paytable) {
    $res = [];
    for($c=0;$c<5;$c++){ $col=[]; for($r=0;$r<4;$r++){ $col[]=['s'=>array_keys($paytable)[array_rand(array_keys($paytable))]]; } $res[]=$col; }
    return $res;
}

// ৪. মাত্র ৫০টি স্পিন তৈরি (যাতে সার্ভার ক্রাশ না করে)
echo "<h3>⚙️ ৫০টি প্রো-লেভেল স্পিন জেনারেট হচ্ছে...</h3>";

for ($i = 0; $i < 50; $i++) {
    $reels = getReels($card_paytable);
    
    // ২০% স্পিন হবে চেইন উইন (সহজ লজিক যাতে দ্রুত রান হয়)
    if ($i < 10) { 
        $win_pos = ["0,1", "1,1", "2,1"]; // ৩টি ঘর মিলানো
        $win_amount = $bet * 2.5;
        $spin_data = json_encode([
            'reels' => $reels,
            'next_combo' => getReels($card_paytable),
            'win_pos' => $win_pos,
            'win' => $win_amount,
            'total_win_so_far' => $win_amount,
            'next_win_data' => null // এখানে আনলিমিটেড লুপটা আপাতত অফ রাখলাম যাতে রান হয়
        ]);
    } 
    // ৩০% হবে সাধারণ ছোট উইন
    elseif ($i < 25) {
        $win_pos = ["0,0", "1,0", "2,0"];
        $win_amount = $bet * 1.2;
        $spin_data = json_encode(['reels' => $reels, 'win_pos' => $win_pos, 'win' => $win_amount]);
    }
    // ৫০% লস স্পিন
    else {
        $spin_data = json_encode(['reels' => $reels, 'win_pos' => [], 'win' => 0]);
        $win_amount = 0;
    }

    $data = $conn->real_escape_string($spin_data);
    $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount, is_used) VALUES ($user_id, '$data', $win_amount, 0)");
}

echo "<h2 style='color:green;'>✅ আলহামদুলিল্লাহ! ৫০টি স্পিন এখন ডাটাবেসে রেডি।</h2>";
echo "<a href='index.php?uid=$user_id' style='padding:10px; background:gold; color:black; text-decoration:none; font-weight:bold; border-radius:5px;'>গেম শুরু করুন</a>";
?>
