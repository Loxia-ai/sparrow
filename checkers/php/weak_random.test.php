<?php
// Vulnerable: rand() for token generation
// <expect-error>
$token = rand();

// Vulnerable: mt_rand() for security
// <expect-error>
$sessionId = md5(mt_rand());

// Vulnerable: uniqid() for token
// <expect-error>
$resetToken = uniqid();

// Vulnerable: array_rand for password
$chars = str_split('abc123');
// <expect-error>
$char = $chars[array_rand($chars)];

// <no-error> - Using random_bytes
$secureToken = bin2hex(random_bytes(32));

// <no-error> - Using random_int
$secureNumber = random_int(100000, 999999);

// <no-error> - Static rand for non-security use
// Note: This would still flag, but in practice
// rand() should only be used for non-security
?>
