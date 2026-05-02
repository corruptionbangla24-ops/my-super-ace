<?php
include 'db.php';
header('Content-Type: application/json');

$user_id = $_POST['user_id'] ?? 0;
$bet = floatval($_POST['bet'] ?? 0);

$res = $conn->query("SELECT balance FROM users WHERE id = '$user_id'");
$user = $res->fetch_assoc();

if (!$user || ($bet > 0 && $user['balance'] < $bet)) {

    echo json_encode(["status" => "error", "message" => "Insufficient Balance"]);
    exit;
}

       // ১. সিম্বল এবং রীল জেনারেট করা (৫x৪ গ্রিড)
    $symbols = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
    $reels = [];
    for ($i = 0; $i < 5; $i++) {
        $col = [];
        for ($j = 0; $j < 4; $j++) { 
            $col[] = $symbols[array_rand($symbols)]; 
        }
        $reels[] = $col;
    }

    // ২. ১০২৪ ওয়েজ উইনিং লজিক (Professional Ways Calculation)
    $total_win = 0;
    $is_win = false;
    $win_symbol = "";
    
    // প্রথম রীলের ইউনিক সিম্বলগুলো নিয়ে লুপ ঘুরবে
    $first_reel_unique = array_unique($reels[0]);
    
    foreach ($first_reel_unique as $search_sym) {
        if ($search_sym === '9.png') continue; // ৯ নম্বর (Scatter) আলাদা হিসাব হবে

        $match_count = 1;
        $ways = count(array_keys($reels[0], $search_sym));

        // পরবর্তী রীলগুলোতে ধারাবাহিকতা চেক করা
        for ($r = 1; $r < 5; $r++) {
            $count_in_reel = count(array_keys($reels[$r], $search_sym));
            if ($count_in_reel > 0) {
                $match_count++;
                $ways *= $count_in_reel; 
            } else {
                break; // ধারাবাহিকতা ভাঙলে লুপ বন্ধ
            }
        }

        // ৩টি বা তার বেশি রীলে ম্যাচ থাকলে উইন ক্যালকুলেশন
        if ($match_count >= 3) {
            // সিম্বল অনুযায়ী মাল্টিপ্লায়ার (৩, ৪, ৫ রীলের জন্য)
            $multipliers = [3 => 0.2, 4 => 0.8, 5 => 5.0]; 
            $symbol_win = ($bet * $multipliers[$match_count]) * $ways;
            $total_win += $symbol_win;
            $is_win = true;
            $win_symbol = $search_sym;
        }
    }

    // ৩. স্ক্যাটার (৯.পিএনজি) এবং ফ্রি স্পিন লজিক
    $scatter_count = 0;
    foreach ($reels as $col) {
        foreach ($col as $sym) {
            if ($sym === '9.png') $scatter_count++;
        }
    }
    
    $free_spins_won = 0;
    if ($bet > 0 && $scatter_count >= 3) {
        $free_spins_won = 10;
    }

    // ৪. ডাটাবেসে নতুন ব্যালেন্স আপডেট
    $final_win = round($total_win, 2);
    $new_balance = $user['balance'] - $bet + $final_win;
    $conn->query("UPDATE users SET balance = '$new_balance' WHERE id = '$user_id'");

    // ৫. ক্লিন রেজাল্ট পাঠানো
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
 
