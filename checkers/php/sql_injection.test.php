<?php
// Vulnerable: mysqli->query with interpolated string
$id = $_GET['id'];
// <expect-error>
$result = $mysqli->query("SELECT * FROM users WHERE id = $id");

// Vulnerable: concatenation in query
$username = $_POST['username'];
// <expect-error>
$conn->query("SELECT * FROM users WHERE username = '$username'");

// Vulnerable: mysql_query with variable
// <expect-error>
mysql_query("SELECT * FROM products WHERE name = '$name'");

// Vulnerable: mysqli_query function
// <expect-error>
mysqli_query($db, "DELETE FROM users WHERE id = $id");

// Vulnerable: PDO query with interpolation
// <expect-error>
$pdo->query("SELECT * FROM orders WHERE user_id = $userId");

// <no-error> - Prepared statement with mysqli
$stmt = $mysqli->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();

// <no-error> - Prepared statement with PDO
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
$stmt->execute(['id' => $id]);

// <no-error> - Static query
$result = $mysqli->query("SELECT COUNT(*) FROM users");

// <no-error> - Query with constant
$result = $db->query(USERS_QUERY);
?>
