<?php
include 'db.php';
header('Content-Type: application/json');

// ১. ইনপুট প্যারামিটার
$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = 10.00;

// ২. বর্তমান ব্যালেন্স চেক
$res = $conn->query("SELECT balance FROM users WHERE id = $user_id");
if (!$res || $res->num_rows == 0) {
    echo json_encode(['error' => 'User not found']);
    exit;
}
$user = $res->fetch_assoc();
$balance = (float)$user['balance'];

$results = [];

// ২০ থেকে ২৩ নম্বর লাইনের জায়গায় এটি বসান
$mode = isset($_GET['mode']) ? $_GET['mode'] : 'normal';

for ($s = 0; $s < 50; $s++) {
    // যদি ফ্রি মোড না হয়, তবেই টাকা কাটবে
    if ($mode !== 'free') {
        if ($balance < $bet) break;
        $balance -= $bet;
    }


    // রীল জেনারেশন
    $reels = [];
    for ($i = 0; $i < 5; $i++) {
        $col = [];
        for ($j = 0; $j < 4; $j++) {
            $col[] = [
                's' => rand(1, 10) . ".png",
                'g' => (rand(1, 100) <= 15) // ১৫% সোনালী কার্ড (উইন হলে wild হবে)
            ];
        }
        $reels[] = $col;
    }

    // ৪. ৩, ৪, ৫ নম্বর কলামে র্যান্ডম ওয়াইল্ড বিস্ফোরণ (১০% চান্স)
    if (rand(1, 100) <= 10) {
        for ($k = 0; $k < 3; $k++) {
            $reels[rand(2, 4)][rand(0, 3)] = ['s' => 'wild.png', 'g' => false];
        }
    }
// spin_generator.php এর ৪৪ নম্বর লাইনের আশেপাশে
if (rand(1, 100) <= 1) { // ৩ এর জায়গায় ১ করে দিন
    $scatterCols = array_rand(range(0, 4), 3);
    foreach ($scatterCols as $sc) {
        $sr = rand(0, 3);
        $reels[$sc][$sr] = ['s' => '9.png', 'g' => false];
    }
}


    // ৫. উইন ক্যালকুলেশন
    $win_amount = 0;
    $win_pos = [];

    for ($r = 0; $r < 4; $r++) {
        $sym = $reels[0][$r]['s'];
        $match = [['c' => 0, 'r' => $r]];

        for ($c = 1; $c < 5; $c++) {
            $found_in_col = false;
            for ($row = 0; $row < 4; $row++) {
                $curr = $reels[$c][$row]['s'];
                // ওয়াইল্ড অথবা একই সিম্বল ম্যাচিং লজিক
                if ($curr === $sym || $curr === 'wild.png' || $sym === 'wild.png') {
                    $match[] = ['c' => $c, 'r' => $row];
                    $found_in_col = true;
                }
            }
            if (!$found_in_col) break;
        }

        if (count($match) >= 3) {
            $win_amount += count($match) * 5; // সিম্পল পে-আউট লজিক
            foreach ($match as $m) {
                $win_pos[$m['c'] . '-' . $m['r']] = $m;
            }
        }
    }

    $balance += $win_amount;

    // রেজাল্ট পুশ করা
    $results[] = [
        'reels' => $reels,
        'win_pos' => array_values($win_pos),
        'win' => number_format($win_amount, 2, '.', ''),
        'bal' => number_format($balance, 2, '.', '')
    ];
}

// ৬. ডাটাবেসে ব্যালেন্স আপডেট
$conn->query("UPDATE users SET balance = $balance WHERE id = $user_id");

// ৭. আউটপুট
echo json_encode(['results' => $results]);
