<?php
include 'db.php';
header('Content-Type: application/json');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet_amount = 10.00; // প্রতিটি স্পিনের বেট
$batch_size = 50;    // একবারে ৫০টি স্পিন জেনারেট হবে

// ১. ইউজারের বর্তমান ব্যালেন্স চেক
$res = $conn->query("SELECT balance FROM users WHERE id = $user_id");
$user = $res->fetch_assoc();

if (!$user || $user['balance'] < ($bet_amount * $batch_size)) {
    echo json_encode(['error' => 'Insufficient Balance']);
    exit;
}

$results = [];
$current_balance = $user['balance'];

// ২. ৫০টি স্পিন জেনারেট করার লুপ
for ($s = 0; $s < $batch_size; $s++) {
    $current_balance -= $bet_amount; // প্রতি স্পিনে বেট কাটা হচ্ছে
    
    $reels = [];
    for ($i = 0; $i < 5; $i++) {
        $column = [];
        for ($j = 0; $j < 4; $j++) {
            $symbol = rand(1, 10) . ".png";
            $is_golden = (rand(1, 100) <= 15); // ১৫% চান্স গোল্ডেন হওয়ার
            
            $column[] = [
                's' => $symbol,    // Symbol image
                'g' => $is_golden  // Is Golden
            ];
        }
        $reels[] = $column;
    }

    // উইন ক্যালকুলেশন (আপাতত র‍্যান্ডম উইন দিচ্ছি, পরে আমরা অরিজিনাল লজিক বসাবো)
    $win_amount = (rand(1, 100) > 80) ? rand(20, 100) : 0; 
    $current_balance += $win_amount;

    $results[] = [
        'reels' => $reels,
        'bal' => number_format($current_balance, 2, '.', ''),
        'win' => number_format($win_amount, 2, '.', '')
    ];
}

// ৩. ডাটাবেসে নতুন ব্যালেন্স একবারে আপডেট করা (সিকিউরিটির জন্য)
$conn->query("UPDATE users SET balance = $current_balance WHERE id = $user_id");

echo json_encode(['results' => $results]);
?>
