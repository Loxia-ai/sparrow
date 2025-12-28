// Test file for js_timing_attack_comparison checker

// VULNERABLE: Direct comparison of secrets
function verifyApiKey(providedKey, storedKey) {
    return providedKey === storedKey;  // Should trigger warning
}

function checkPassword(inputPassword, userPassword) {
    if (inputPassword === userPassword) {  // Should trigger warning
        return true;
    }
    return false;
}

function verifyToken(token, expectedToken) {
    return token == expectedToken;  // Should trigger warning (loose equality)
}

class AuthService {
    verifySecret(providedSecret, storedSecret) {
        return providedSecret === storedSecret;  // Should trigger warning
    }

    checkHash(hash1, hash2) {
        return hash1 === hash2;  // Should trigger warning
    }
}

// VULNERABLE: Comparison in return
function authenticate(user) {
    return user.password === storedPassword;  // Should trigger warning
}

// SECURE: Using crypto.timingSafeEqual()
const crypto = require('crypto');

function secureCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }

    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');

    if (bufA.length !== bufB.length) {
        crypto.timingSafeEqual(bufA, bufA);
        return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);  // No warning - secure!
}

function secureVerifyApiKey(providedKey, storedKey) {
    return secureCompare(providedKey, storedKey);  // No warning - uses secure function
}

// OK: Non-sensitive comparisons
function checkUsername(name1, name2) {
    return name1 === name2;  // No warning - not a secret
}

function validateEmail(email, confirmedEmail) {
    return email === confirmedEmail;  // No warning - not a secret
}
