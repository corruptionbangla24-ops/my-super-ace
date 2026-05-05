<?php
include 'db.php';
header('Content-Type: application/json');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = isset($_GET['bet']) ? floatval($_GET['bet']) : 10.00;

// ১. এডমিন প্যানেল সেটিংস (RTP)
$rtp_percent = 90; // এখান থেকে প্রফিট কন্ট্রোল করবেন

// ২. আপনার দেওয়া কার্ড ভ্যালু (৫টি মিললে কত গুণ পাবে)
$card_paytable = [
    '2.png'  => 100, '5.png'  => 80, '10.png' => 60,
    '7.png'  => 50,  '3.png'  => 40, '4.png'  => 30,
    '1.png'  => 20,  '6.png'  => 10, '8.png'  => 5
];

// ৩. প্রি-স্পিন জেনারেটর (যদি ১০টির কম স্পিন ব্যাকআপ থাকে)
$check = $conn->query("SELECT COUNT(*) as total FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0");
if ($check->fetch_assoc()['total'] < 10) {
    for ($i = 0; $i < 50; $i++) {
        $reels = [];
        $scatter_count = 0;

        // ৫x৪ গ্রিড তৈরি
        for ($col = 0; $col < 5; $col++) {
            $column = [];
            for ($row = 0; $row < 4; $row++) {
                $rand = rand(1, 100);
                if ($rand <= 4) { $img = "9.png"; $scatter_count++; } // Scatter
                elseif ($rand <= 10) { $img = "wild.png"; }           // Wild
                else {
                    $keys = array_keys($card_paytable);
                    $img = $keys[array_rand($keys)];
                }
                $column[] = ['s' => $img, 'g' => (rand(1, 100) < 12)]; // গোল্ডেন কার্ড
            }
            $reels[] = $column;
        }

        // ৪. আরটিপি অনুযায়ী উইন ক্যালকুলেশন
        $win_amount = 0;
        $win_chance = rand(1, 100);
        
        if ($win_chance <= ($rtp_percent - 10)) {
            // কার্ডের ভ্যালু এবং র‍্যান্ডম মাল্টিপ্লায়ার (সর্বোচ্চ ১০০০x পর্যন্ত)
            $hit_multiplier = rand(1, 1000) / 10;
            $random_card = array_rand($card_paytable);
            $win_amount = ($bet * ($card_paytable[$random_card] / 10)) * ($hit_multiplier / 5);
        }

        // ৫. চিরকুট অনুযায়ী ২০টি ফ্রি স্পিন চেক
        $free_spins = ($scatter_count >= 3) ? 20 : 0;

        $spin_json = $conn->real_escape_string(json_encode($reels));
        $conn->query("INSERT INTO fix_pre_spin (user_id, spin_data, win_amount) VALUES ($user_id, '$spin_json', $win_amount)");
    }
}

// ৬. ডাটাবেস থেকে বর্তমান স্পিন ডাটা তুলে আনা
$get = $conn->query("SELECT id, spin_data, win_amount FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0 LIMIT 10");
$results = []; $total_win = 0;

while ($row = $get->fetch_assoc()) {
    $results[] = [
        'reels' => json_decode($row['spin_data'], true), 
        'win' => (float)$row['win_amount']
    ];
    $total_win += (float)$row['win_amount'];
    $conn->query("UPDATE fix_pre_spin SET is_used = 1 WHERE id = " . $row['id']);
}

// ব্যালেন্স আপডেট লজিক
$conn->query("UPDATE users SET balance = balance - $bet + $total_win WHERE id = $user_id");
$new_bal = $conn->query("SELECT balance FROM users WHERE id = $user_id")->fetch_assoc()['balance'];

echo json_encode(['results' => $results, 'balance' => $new_bal, 'win' => $total_win]);
?>
