<?php
include 'db.php';
session_start();
header('Content-Type: application/json');

// ১. ইনপুট ডাটা নেওয়া
$user_id = $_POST['user_id'] ?? 0;
$bet_amount = floatval($_POST['bet'] ?? 0);

if ($user_id <= 0 || ($bet_amount <= 0 && !isset($_POST['is_free']))) {
    echo json_encode(["status" => "error", "message" => "Invalid Request"]); exit();
}

// ২. ডাটাবেস থেকে ইউজারের ব্যালেন্স চেক করা
$stmt = $conn->prepare("SELECT balance FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || ($user['balance'] < $bet_amount && $bet_amount > 0)) {
    echo json_encode(["status" => "error", "message" => "Insufficient Balance"]); exit();
}

// ৩. সিম্বল সেটিংস ও ভ্যালু (২.png সবচেয়ে দামী)
$symbols = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
$symbol_values = [
    '2.png' => 50,  // সবচেয়ে দামী কার্ড
    '10.png' => 30, // দ্বিতীয় দামী
    '9.png' => 0,   // স্কাটার (এর আলাদা ভ্যালু নেই, শুধু ফ্রি স্পিন দেয়)
    '1.png' => 10, '3.png' => 8, '4.png' => 5, '5.png' => 4, '6.png' => 3, '7.png' => 2, '8.png' => 1
];

// ৪. ৫x৪ রিল জেনারেট করা
$reels = [];
for ($i = 0; $i < 5; $i++) {
    for ($j = 0; $j < 4; $j++) {
        $reels[$i][$j] = $symbols[array_rand($symbols)];
    }
}

// ৫. স্কাটার চেক (পুরো বক্সে ৩টি ৯.png থাকলে ১০ ফ্রি স্পিন)
$scatter_count = 0;
$free_spins = 0;
if ($bet_amount > 0.01) { // শুধুমাত্র পেইড স্পিনে নতুন ফ্রি স্পিন মিলবে
    foreach ($reels as $column) {
        foreach ($column as $symbol) {
            if ($symbol === '9.png') $scatter_count++;
        }
    }
    if ($scatter_count >= 3) {
        $free_spins = 10;
    }
}

// ৬. পে-লাইন উইনিং লজিক (১, ২, ৩ কলামে মিললে উইন)
$win_amount = 0;
$is_win = false;
$win_symbol = "";

// স্মার্ট কন্ট্রোল: ব্যালেন্স ১০% এর নিচে নামলে জেতার চান্স বাড়ানো
$initial_balance = 1000;
$win_chance = rand(1, 100);
$is_lucky = ($user['balance'] <= ($initial_balance * 0.10)) ? 40 : 25;

if ($win_chance <= $is_lucky) {
    foreach ($symbol_values as $sym => $val) {
        if ($sym === '9.png') continue;

        // চেক করা ১, ২, ৩ কলামে একই সিম্বল আছে কি না
        if (in_array($sym, $reels[0]) && in_array($sym, $reels[1]) && in_array($sym, $reels[2])) {
            $is_win = true;
            $win_symbol = $sym;
            
            // জয়ের পরিমাণ হিসাব (১০২৪ ওয়েজ স্টাইল)
            $c1 = count(array_keys($reels[0], $sym));
            $c2 = count(array_keys($reels[1], $sym));
            $c3 = count(array_keys($reels[2], $sym));
            $c4 = in_array($sym, $reels[3]) ? count(array_keys($reels[3], $sym)) : 0;
            $c5 = in_array($sym, $reels[4]) ? count(array_keys($reels[4], $sym)) : 0;

            $ways = $c1 * $c2 * $c3;
            $mult = 1.5;
            if ($c4 > 0) { $ways *= $c4; $mult = 4; if ($c5 > 0) { $ways *= $c5; $mult = 10; } }

            $win_amount = ($bet_amount > 0 ? $bet_amount : 10) / 20 * $val * $ways * $mult;
            break; // একটি উইন সিম্বল পেলেই যথেষ্ট
        }
    }
}

// ৭. ডাটাবেস আপডেট (ব্যালেন্স সমন্বয়)
$new_balance = $user['balance'] - $bet_amount + $win_amount;
$update_stmt = $conn->prepare("UPDATE users SET balance = ? WHERE id = ?");
$update_stmt->bind_param("di", $new_balance, $user_id);
$update_stmt->execute();

// ৮. রেজাল্ট পাঠানো
echo json_encode([
    "status" => "success",
    "reels" => $reels,
    "win" => number_format($win_amount, 2, '.', ''),
    "new_balance" => number_format($new_balance, 2, '.', ''),
    "is_win" => $is_win,
    "win_symbol" => $win_symbol,
    "free_spins" => $free_spins,
    "scatters" => $scatter_count
]);
?>
