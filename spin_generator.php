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
              // --- ৩৯ থেকে ৭৩ নম্বর লাইনের জায়গায় এই কোডটুকু বসান ---
    $win_amount = 0;
    $temp_win_positions = [];

    // প্রতি রো এর জন্য উইন চেক করা (সুপার এস স্টাইল)
    for ($r = 0; $r < 4; $r++) {
        $symbol = $reels[0][$r]['s']; // ১ম কলামের সিম্বল
        $matches = [[0, $r]];

        for ($c = 1; $c < 5; $c++) {
            $found_in_col = false;
            for ($row_idx = 0; $row_idx < 4; $row_idx++) {
                // একই সিম্বল অথবা wild চেক
                if ($reels[$c][$row_idx]['s'] === $symbol || $reels[$c][$row_idx]['s'] === 'wild.png') {
                    $matches[] = [$c, $row_idx];
                    $found_in_col = true;
                }
            }
            if (!$found_in_col) break;
        }

        // ৩টি বা তার বেশি মিললে তবেই উইন ধরবে
        if (count($matches) >= 3) {
            $win_amount += count($matches) * 5; 
            foreach($matches as $m) {
                // ইউনিক আইডি দিয়ে পজিশন সেভ করা যাতে ডুপ্লিকেট না হয়
                $temp_win_positions[$m[0].'-'.$m[1]] = ['c' => $m[0], 'r' => $m[1]];

            }
        }
    }

    $win_positions = array_values($temp_win_positions);
    $current_balance += $win_amount; 
    // --- উইন ক্যালকুলেশন শেষ ---
 

    
    $results[] = [
        'reels' => $reels,
                'bal' => number_format($current_balance, 2, '.', ''),
        'win' => number_format($win_amount, 2, '.', ''),
        'win_pos' => $win_positions // এই লাইনটি যোগ করুন
    ];

}

// ৩. ডাটাবেসে নতুন ব্যালেন্স একবারে আপডেট করা (সিকিউরিটির জন্য)
$conn->query("UPDATE users SET balance = $current_balance WHERE id = $user_id");

echo json_encode(['results' => $results]);
?>
