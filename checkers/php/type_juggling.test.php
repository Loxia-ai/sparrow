<?php
// Vulnerable: md5 with loose comparison
function vulnerableMd5($password, $hash) {
    // <expect-error>
    if (md5($password) == $hash) {
        return true;
    }
    return false;
}

// Vulnerable: sha1 with loose comparison
function vulnerableSha1($input, $expected) {
    // <expect-error>
    if (sha1($input) == $expected) {
        return true;
    }
    return false;
}

// Vulnerable: hash function with loose comparison
function vulnerableHash($data, $stored) {
    // <expect-error>
    if (hash('sha256', $data) == $stored) {
        return true;
    }
    return false;
}

// Vulnerable: password variable with loose comparison
function vulnerablePasswordCheck($password_hash, $input) {
    // <expect-error>
    if ($password_hash == $input) {
        return true;
    }
    return false;
}

// Vulnerable: token variable with loose comparison
function vulnerableTokenCheck($user_token, $valid) {
    // <expect-error>
    if ($user_token == $valid) {
        return true;
    }
    return false;
}

// Vulnerable: in_array without strict mode
function vulnerableInArray($role, $allowed) {
    // <expect-error>
    if (in_array($role, $allowed)) {
        return true;
    }
    return false;
}

// <no-error> - Strict comparison with md5
function safeMd5($password, $hash) {
    if (md5($password) === $hash) {
        return true;
    }
    return false;
}

// <no-error> - Using hash_equals
function safeHashEquals($password, $stored) {
    if (hash_equals($stored, md5($password))) {
        return true;
    }
    return false;
}

// <no-error> - Using password_verify
function safePasswordVerify($password, $hash) {
    if (password_verify($password, $hash)) {
        return true;
    }
    return false;
}

// <no-error> - in_array with strict mode
function safeInArray($role, $allowed) {
    if (in_array($role, $allowed, true)) {
        return true;
    }
    return false;
}

// <no-error> - Regular variable comparison (not security-sensitive)
function normalComparison($count, $limit) {
    if ($count == $limit) {
        return true;
    }
    return false;
}
