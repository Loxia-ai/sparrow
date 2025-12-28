// Vulnerable: postMessage with '*' origin
// <expect-error>
iframe.contentWindow.postMessage({ token: secret }, '*');

// Vulnerable: Using '*' with sensitive data
// <expect-error>
window.parent.postMessage(userData, '*');

// Vulnerable: Double-quoted wildcard
// <expect-error>
targetWindow.postMessage(message, "*");

// <no-error> - Specific origin
const TRUSTED_ORIGIN = 'https://trusted.example.com';
iframe.contentWindow.postMessage({ data: info }, TRUSTED_ORIGIN);

// <no-error> - Same origin
window.parent.postMessage(response, window.location.origin);

// <no-error> - Variable origin (assumed validated elsewhere)
iframe.contentWindow.postMessage(data, allowedOrigin);
