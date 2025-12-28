const crypto = require('crypto');

// Vulnerable: Math.random() for token
// <expect-error>
const token = Math.random().toString(36);

// Vulnerable: Math.random() for ID generation
// <expect-error>
const id = Math.random() * 1000000;

// Vulnerable: Math.random() in security context
function generateWeakToken() {
    // <expect-error>
    return Math.random().toString(36).substr(2);
}

// <no-error> - Using crypto.randomBytes
const secureToken = crypto.randomBytes(32).toString('hex');

// <no-error> - Using crypto.randomUUID
const uuid = crypto.randomUUID();

// <no-error> - Using crypto.randomInt
const secureInt = crypto.randomInt(1000);

// <no-error> - Math operations that aren't random
const mathResult = Math.floor(10.5);
const mathMax = Math.max(1, 2, 3);
