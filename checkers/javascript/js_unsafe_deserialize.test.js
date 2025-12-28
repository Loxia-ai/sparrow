// Vulnerable: require node-serialize
// <expect-error>
const serialize = require('node-serialize');

// Vulnerable: using unserialize
app.post('/import', (req, res) => {
    // <expect-error>
    const obj = serialize.unserialize(req.body.data);
    res.json(obj);
});

// Vulnerable: require serialize-javascript
// <expect-error>
const serializeJs = require('serialize-javascript');

// Vulnerable: require funcster
// <expect-error>
const funcster = require('funcster');

// <no-error> - Using JSON.parse (safe)
const safeData = JSON.parse(req.body.data);

// <no-error> - Using built-in JSON
app.post('/import-safe', (req, res) => {
    const data = JSON.parse(req.body.jsonData);
    res.json(data);
});
