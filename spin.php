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
    // ৩৪ নম্বর লাইন থেকে এটি বসানো শুরু করুন
    $current_bet_val = floatval($_POST['current_bet_val'] ?? 10);

    foreach ($symbols as $s) {
        if ($s === '9.png') continue;

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
                break; 
            }
        }

        if ($match_count >= 3) {
            // ফ্রি স্পিন হলে (বেট ০) অরিজিনাল বেট ভ্যালু দিয়ে উইন গুণ হবে
            $actual_bet = ($bet > 0) ? $bet : $current_bet_val;
            $multipliers = [3 => 0.5, 4 => 2.0, 5 => 10.0]; 
            
            $total_win += ($actual_bet * $multipliers[$match_count]) * $ways;
            $is_win = true;
            $win_symbol = $s;
        }
    }

    // ৬৯ নম্বর লাইন থেকে এটি বসানো শুরু করুন
$scatter_roll = rand(1, 1000);
$scatter_count = 0;

// ২% সম্ভাবনা (১০০০ এর মধ্যে ২০) সেট করা হলো
if ($bet > 0 && $scatter_roll <= 20) {
    foreach ($reels as $col) {
        foreach ($col as $sym) {
            if ($sym === '9.png') $scatter_count++;
        }
    }
}



$free_spins_won = ($bet > 0 && $scatter_count >= 3) ? 10 : 0;
// ৭৯ নম্বর লাইন থেকে এটি বসানো শুরু করুন
$final_win = round($total_win, 2);

if ($bet > 0) {
    // সাধারণ স্পিনে টাকা কাটবে এবং উইন যোগ হবে
    $new_balance = $user['balance'] - $bet + $final_win;
} else {
    // ক্যাসকেড স্পিনে (বেট ০) টাকা কাটবে না, শুধু উইন যোগ হবে
    $new_balance = $user['balance'] + $final_win;
}

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
