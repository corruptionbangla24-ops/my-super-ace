<?php
include 'db.php';
header('Content-Type: application/json');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
// ৬ নম্বর লাইনে এটি বসান
$bet = isset($_GET['bet']) ? floatval($_GET['bet']) : 10.00;


$res = $conn->query("SELECT balance FROM users WHERE id = $user_id");
if ($res && $res->num_rows > 0) {
    $user = $res->fetch_assoc();
    $balance = (float)$user['balance'];
} else {
    echo json_encode(['error' => 'User not found']); exit;
}

$results = [];
for ($s = 0; $s < 10; $s++) {
    if ($balance < $bet) break;
    $balance -= $bet;
    
    $reels = [];
    for ($i = 0; $i < 5; $i++) {
        $col = [];
        for ($j = 0; $j < 4; $j++) {
            $col[] = ['s' => rand(1, 10) . ".png", 'g' => (rand(1, 100) < 15)];
        }
        $reels[] = $col;
    }

    // Wild & Scatter Logic
    if (rand(1, 100) <= 10) $reels[rand(2, 4)][rand(0, 3)] = ['s' => 'wild.png', 'g' => false];
    if (rand(1, 400) <= 1) {
        $scCols = array_rand(range(0, 4), 3);
        foreach ($scCols as $sc) $reels[$sc][rand(0, 3)] = ['s' => '9.png', 'g' => false];
    }

    $results[] = ['reels' => $reels, 'win' => 0, 'bal' => $balance];
}

$conn->query("UPDATE users SET balance = $balance WHERE id = $user_id");
echo json_encode(['results' => $results, 'balance' => $balance]);
?>
