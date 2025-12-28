const express = require('express');
const app = express();

// Vulnerable: Direct redirect with query parameter
app.get('/redirect', (req, res) => {
    // <expect-error>
    res.redirect(req.query.url);
});

// Vulnerable: redirect with body parameter
app.post('/redirect', (req, res) => {
    // <expect-error>
    res.redirect(req.body.redirectUrl);
});

// Vulnerable: redirect with params
app.get('/go/:target', (req, res) => {
    // <expect-error>
    res.redirect(req.params.target);
});

// Vulnerable: response.redirect with request.query
app.get('/redir', (request, response) => {
    // <expect-error>
    response.redirect(request.query.destination);
});

// <no-error> - Static redirect
app.get('/home', (req, res) => {
    res.redirect('/dashboard');
});

// <no-error> - Validated redirect with allowlist
app.get('/safe-redirect', (req, res) => {
    const ALLOWED = ['/home', '/profile', '/settings'];
    const target = req.query.url;
    if (ALLOWED.includes(target)) {
        res.redirect(target);
    }
});

// <no-error> - Redirect to constructed URL
app.get('/internal', (req, res) => {
    res.redirect(`/user/${req.params.id}`);
});
