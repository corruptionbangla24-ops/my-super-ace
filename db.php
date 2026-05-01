<?php
$host = 'mysql-8138310-corruptionbangla24-843b.l.aivencloud.com';
$user = 'avnadmin';
$pass = 'AVNS_PsYa4FE9fJvITOf4u0Z';
$db   = 'defaultdb';
$port = '15225';

$conn = mysqli_init();
// Aiven থেকে ডাউনলোড করা ca.pem ফাইলটি আপনার গিটহাবে রেখে এখানে লিঙ্ক দিতে হবে
mysqli_ssl_set($conn, NULL, NULL, "ca.pem", NULL, NULL); 
mysqli_real_connect($conn, $host, $user, $pass, $db, $port);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>
