<?php
// ১. ডাটাবেস কানেকশন ফাইল ইনক্লুড করুন
include 'db.php'; 

// ২. টেবিল তৈরির SQL কুয়েরি
$sql = "CREATE TABLE IF NOT EXISTS fix_pre_spin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    spin_data LONGTEXT NOT NULL,        /* ৫x৪ রীলের পুরো কার্ডের লিস্ট */
    win_amount DECIMAL(10, 2) DEFAULT 0.00,
    multiplier INT DEFAULT 1,           /* x1, x2, x3, x5 লজিকের জন্য */
    is_used TINYINT DEFAULT 0,          /* ০ = নতুন, ১ = খেলা শেষ */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id),
    INDEX (is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

// ৩. টেবিল তৈরি করার চেষ্টা
if ($conn->query($sql) === TRUE) {
    echo "<h2 style='color: green; text-align: center; margin-top: 50px;'>
            ✅ মাশাআল্লাহ! fix_pre_spin টেবিলটি সফলভাবে তৈরি হয়েছে।
          </h2>";
    echo "<p style='text-align: center;'>এখন আপনি গেমের ডাটা জেনারেট করার কাজ শুরু করতে পারেন।</p>";
} else {
    echo "<h2 style='color: red; text-align: center; margin-top: 50px;'>
            ❌ টেবিল তৈরি করতে সমস্যা হয়েছে: " . $conn->error . "
          </h2>";
}

$conn->close();
?>
