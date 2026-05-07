<?php
include 'db.php';
header('Content-Type: application/json');

$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
$win = isset($_GET['win']) ? floatval($_GET['win']) : 0.00;

if ($win > 0) {
    // ইউজারের ব্যালেন্সে জয়ের টাকা সাথে সাথে যোগ করা
    $conn->query("UPDATE users SET balance = balance + $win WHERE id = $user_id");
    echo json_encode(['status' => 'success', 'added' => $win]);
} else {
    echo json_encode(['status' => 'ignored']);
}
$conn->close();
?>
