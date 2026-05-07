<?php
include 'db.php';
header('Content-Type: application/json');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$bet = isset($_GET['bet']) ? floatval($_GET['bet']) : 1.00; // সর্বনিম্ন ১ টাকা ফিক্সড
$is_free_mode = isset($_GET['mode']) && $_GET['mode'] == 'free';

$card_paytable = ['2.png'=>100,'5.png'=>80,'10.png'=>60,'7.png'=>50,'3.png'=>40,'4.png'=>30,'1.png'=>20,'6.png'=>10,'8.png'=>5];

// ১. মাত্র ১ মিলিসেকেন্ডে ফ্রেশ ৫x৪ রীল গ্রিড তৈরি
$reels = [];
for ($col = 0; $col < 5; $col++) {
    $column = [];
    for ($row = 0; $row < 4; $row++) {
        $r = rand(1, 100);
        if ($r <= 5) $img = "9.png"; // Scatter
        elseif ($r <= 12) $img = "wild.png"; // Wild
        else $img = array_keys($card_paytable)[array_rand(array_keys($card_paytable))];
        $column[] = ['s' => $img];
    }
    $reels[] = $column;
}

// ২. মেইন ব্যালেন্স থেকে বেটের টাকা কাটা (ফ্রি মোড হলে ১ টাকাও কাটবে না 🛡️)
if (!$is_free_mode) {
    $conn->query("UPDATE users SET balance = balance - $bet WHERE id = $user_id");
}

// ৩. টাটকা ব্যালেন্স তুলে আনা
$nb_res = $conn->query("SELECT balance FROM users WHERE id = $user_id");
$new_balance = (float)$nb_res->fetch_assoc()['balance'];

// ৪. আউটপুট পাঠানো
echo json_encode([
    'reels' => $reels,
    'balance' => $new_balance
]);
$conn->close();
?>
