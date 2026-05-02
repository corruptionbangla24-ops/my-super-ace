<?php
include 'db.php';
session_start();

header('Content-Type: application/json');

// ১. ইনপুট ডাটা নেওয়া
$user_id = $_POST['user_id'] ?? 0;
$bet_amount = floatval($_POST['bet'] ?? 0);

if ($user_id <= 0 || $bet_amount <= 0) {
    echo json_encode(["status" => "error", "message" => "Invalid Request"]);
    exit();
}

// ২. ডাটাবেস থেকে ইউজারের ব্যালেন্স চেক করা
$stmt = $conn->prepare("SELECT balance FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || $user['balance'] < $bet_amount) {
    echo json_encode(["status" => "error", "message" => "Insufficient Balance"]);
    exit();
}

// ৩. সিম্বল এবং রীল সেটিংস
$symbols = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
$reels = [];
for ($i = 0; $i < 5; $i++) {
    $column = [];
    for ($j = 0; $j < 4; $j++) {
        $column[] = $symbols[array_rand($symbols)];
    }
    $reels[] = $column;
}

// ৪. স্মার্ট উইনিং লজিক (ক্যাসিনো অ্যালগরিদম)
$win_chance = rand(1, 100);
$win_amount = 0;
$is_win = false;
$win_symbol = "";

$initial_balance = 1000; // শুরুর ব্যালেন্স
$current_balance = $user['balance'];

// লজিক ১: ব্যালেন্স ১০% এর নিচে নামলে বড় জয়ের সুযোগ (Big Win)
if ($current_balance <= ($initial_balance * 0.10) && $win_chance <= 15) {
    $multipliers = [10, 20, 50, 100]; 
    $rand_mult = $multipliers[array_rand($multipliers)];
    $win_amount = $bet_amount * $rand_mult;
    $is_win = true;
} 
// লজিক ২: ঘন ঘন ছোট জয় (৪০% সম্ভাবনা)
elseif ($win_chance <= 40) {
    $multipliers = [0.2, 0.5, 1, 1.5, 2]; 
    $rand_mult = $multipliers[array_rand($multipliers)];
    $win_amount = $bet_amount * $rand_mult;
    $is_win = true;
} 
// লজিক ৩: মাঝে মাঝে মিডিয়াম জয় (৫% সম্ভাবনা)
elseif ($win_chance >= 95) {
    $multipliers = [5, 10, 15, 20];
    $rand_mult = $multipliers[array_rand($multipliers)];
    $win_amount = $bet_amount * $rand_mult;
    $is_win = true;
}

// বিজয়ী সিম্বল নির্ধারণ (এনিমেশনের জন্য)
if ($is_win) {
    $win_symbol = $symbols[array_rand($symbols)];
    // রীলে অন্তত একটি বিজয়ী সিম্বল থাকা নিশ্চিত করা (এনিমেশন দেখানোর জন্য)
    $reels[rand(0,4)][rand(0,3)] = $win_symbol;
}

// ৫. ডাটাবেস আপডেট (টাকা কাটা ও উইন যোগ করা)
$new_balance = $user['balance'] - $bet_amount + $win_amount;
$update_stmt = $conn->prepare("UPDATE users SET balance = ? WHERE id = ?");
$update_stmt->bind_param("di", $new_balance, $user_id);
$update_stmt->execute();

// ৬. রেজাল্ট পাঠানো
echo json_encode([
    "status" => "success",
    "reels" => $reels,
    "win" => number_format($win_amount, 2, '.', ''),
    "new_balance" => number_format($new_balance, 2, '.', ''),
    "is_win" => $is_win,
    "win_symbol" => $win_symbol
]);
?>
