<?php
include 'db.php';
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    balance DECIMAL(10,2) DEFAULT 1000.00
)";
$conn->query($sql);
$conn->query("INSERT INTO users (id, username, balance) VALUES (1, 'TestUser', 1000.00)");
echo "Database Table & Test User Ready!";
?>
