<?php
include 'db.php';
header('Content-Type: application/json');

// ১. ইনপুট ডাটা নেওয়া
$user_id = $_POST['user_id'] ?? 0;
$bet = floatval($_POST['bet'] ?? 0);

// ২. ইউজার ব্যালেন্স চেক করা
$res = $conn->query("SELECT balance FROM users WHERE id = '$user_id'");
$user = $res->fetch_assoc();

if (!$user || ($bet > 0 && $user['balance'] < $bet)) {
    echo json_encode(["status" => "error", "message" => "Insufficient Balance"]);
    exit;
}

// ৩. সিম্বল এবং রীল জেনারেট করা (৫x৪ গ্রিড)
$symbols = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
$reels = [];
for ($i = 0; $i < 5; $i++) {
    $col = [];
    for ($j = 0; $j < 4; $j++) { 
        $col[] = $symbols[array_rand($symbols)]; 
    }
    $reels[] = $col;
}

// ৪. অল-ওয়েজ উইনিং লজিক (১০২৪ ওয়েজ - আপনার দেখানো আঁকাবাঁকা দাগে উইন দিবে)
$total_win = 0;
$is_win = false;
$win_symbol = "";

foreach ($symbols as $s) {
    if ($s === '9.png') continue; // ৯ নম্বর স্ক্যাটার আলাদা হিসাব হবে

    $match_count = 0;
    $ways = 1;

    for ($r = 0; $r < 5; $r++) {
        $count_in_reel = 0;
        foreach ($reels[$r] as $sym_in_box) {
            if ($sym_in_box === $s) $count_in_reel++;
        }
        
        if ($count_in_reel > 0) {
            $match_count++;
            $ways *= $count_in_reel;
        } else {
            break; // ধারাবাহিকতা না থাকলে থামবে
        }
    }

    // অন্তত ৩টি রীলে ধারাবাহিকভাবে থাকলে উইন
    if ($match_count >= 3) {
        $multipliers = [3 => 0.4, 4 => 1.5, 5 => 8.0]; // ৫টি মিললে বড় উইন
        $total_win += ($bet * $multipliers[$match_count]) * $ways;
        $is_win = true;
        $win_symbol = $s;
    }
}

// ৫. স্ক্যাটার এবং ফ্রি স্পিন লজিক
$scatter_count = 0;
foreach ($reels as $c) { 
    foreach ($c as $sm) { 
        if ($sm === '9.png') $scatter_count++; 
    } 
}
$free_spins_won = ($bet > 0 && $scatter_count >= 3) ? 10 : 0;

// ৬. ব্যালেন্স আপডেট এবং রেজাল্ট পাঠানো
$final_win = round($total_win, 2);
$new_balance = $user['balance'] - $bet + $final_win;
$conn->query("UPDATE users SET balance = '$new_balance' WHERE id = '$user_id'");

echo json_encode([
    "status" => "success", 
    "reels" => $reels, 
    "win" => number_format($final_win, 2, '.', ''),
    "new_balance" => number_format($new_balance, 2, '.', ''), 
    "is_win" => $is_win, 
    "win_symbol" => $win_symbol, 
    "free_spins" => $free_spins_won, 
    "scatter_count" => $scatter_count
]);
?>
