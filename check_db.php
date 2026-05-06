<?php
include 'db.php';

// ১. ইউজারের বাকি থাকা স্পিন সংখ্যা চেক
$user_id = 1; // আপনার টেস্ট ইউজার আইডি
$res = $conn->query("SELECT COUNT(*) as total FROM fix_pre_spin WHERE user_id = $user_id AND is_used = 0");
$count = $res->fetch_assoc()['total'];

echo "<h2>📊 ডাটাবেস রিপোর্ট</h2>";
echo "<p>বাকি থাকা স্পিন সংখ্যা: <strong>$count</strong></p>";

if ($count == 0) {
    echo "<p style='color:red;'>⚠️ সতর্কবার্তা: আপনার ডাটাবেসে কোনো স্পিন বাকি নেই! spin_generator.php নতুন স্পিন তৈরি করতে পারছে না।</p>";
} else {
    echo "<p style='color:green;'>✅ ডাটাবেসে স্পিন আছে। সমস্যা অন্য কোথাও।</p>";
}

// ২. শেষ ৫টি স্পিনের ডাটা ফরম্যাট ঠিক আছে কি না চেক
$res2 = $conn->query("SELECT spin_data FROM fix_pre_spin WHERE user_id = $user_id ORDER BY id DESC LIMIT 1");
$row = $res2->fetch_assoc();
echo "<h3>সর্বশেষ স্পিন ডাটা (নমুনা):</h3>";
echo "<pre>" . print_r(json_decode($row['spin_data'], true), true) . "</pre>";
?>
