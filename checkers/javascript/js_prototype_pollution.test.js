// Vulnerable: Direct __proto__ access
function vulnerable_direct(obj, value) {
    // <expect-error>
    obj.__proto__.isAdmin = value;
}

// Vulnerable: Property access on __proto__
function vulnerable_property(target) {
    // <expect-error>
    const proto = target.__proto__;
    return proto;
}

// Vulnerable: Setting value via __proto__
function vulnerable_set(obj) {
    // <expect-error>
    obj.__proto__ = { polluted: true };
}

// Vulnerable: String subscript access to __proto__
function vulnerable_subscript(obj, value) {
    // <expect-error>
    obj["__proto__"]["isAdmin"] = value;
}

// Vulnerable: constructor.prototype access
function vulnerable_constructor(obj, key, value) {
    // <expect-error>
    obj.constructor.prototype[key] = value;
}

// Vulnerable: Nested constructor.prototype
function vulnerable_nested_constructor(obj) {
    // <expect-error>
    Object.constructor.prototype.polluted = true;
}

// <no-error> - Safe property access
function safe_property(obj) {
    return obj.name;
}

// <no-error> - Using Object.create(null)
function safe_dict() {
    const dict = Object.create(null);
    dict.key = "value";
    return dict;
}

// <no-error> - Using Map for user data
function safe_map(userKey, userValue) {
    const map = new Map();
    map.set(userKey, userValue);
    return map;
}

// <no-error> - Checking for dangerous keys
function safe_merge(target, source) {
    const dangerous = ['__proto__', 'constructor', 'prototype'];
    for (const key of Object.keys(source)) {
        if (!dangerous.includes(key)) {
            target[key] = source[key];
        }
    }
    return target;
}

// <no-error> - Object.getPrototypeOf is safer
function safe_get_prototype(obj) {
    return Object.getPrototypeOf(obj);
}
