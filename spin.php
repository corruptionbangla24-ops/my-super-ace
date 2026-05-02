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

    // ১. রীল জেনারেট করা
    $symbols = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
    $reels = [];
    for ($i = 0; $i < 5; $i++) {
        $col = [];
        for ($j = 0; $j < 4; $j++) { $col[] = $symbols[array_rand($symbols)]; }
        $reels[] = $col;
    }

    // ২. অল-ওয়েজ পে-লাইন লজিক (আপনার আঁকা দাগের মতো উইন দেবে)
    $total_win = 0;
    $is_win = false;
    $win_symbol = "";

    // প্রতিটি সিম্বল চেক করা (৯ বাদে)
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
                break; // ধারাবাহিকতা না থাকলে থামবে
            }
        }

        // ৩টি রীল বা তার বেশি মিললে আপনার দেখানো দাগের মতো উইন হবে
        if ($match_count >= 3) {
            $multipliers = [3 => 0.5, 4 => 2.0, 5 => 15.0]; // ৫টি মিললে ১৫ গুণ!
            $total_win += ($bet * $multipliers[$match_count]) * $ways;
            $is_win = true;
            $win_symbol = $s;
        }
    }

    // ৩. স্ক্যাটার এবং ব্যালেন্স আপডেট
    $scatter_count = 0;
    foreach ($reels as $c) { foreach ($c as $sm) { if ($sm === '9.png') $scatter_count++; } }
    $free_spins_won = ($bet > 0 && $scatter_count >= 3) ? 10 : 0;

    $final_win = round($total_win, 2);
    $new_balance = $user['balance'] - $bet + $final_win;
    $conn->query("UPDATE users SET balance = '$new_balance' WHERE id = '$user_id'");

    echo json_encode([
        "status" => "success", "reels" => $reels, "win" => number_format($final_win, 2, '.', ''),
        "new_balance" => number_format($new_balance, 2, '.', ''), "is_win" => $is_win, 
        "win_symbol" => $win_symbol, "free_spins" => $free_spins_won, "scatter_count" => $scatter_count
    ]);
?>

    
