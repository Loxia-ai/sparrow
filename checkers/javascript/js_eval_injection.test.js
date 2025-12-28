// Vulnerable: eval with variable input
const userInput = req.query.code;
//<expect-error>
eval(userInput);

// Vulnerable: eval with object property
//<expect-error>
eval(request.body.expression);

// Vulnerable: eval with concatenation
//<expect-error>
eval("var x = " + userInput + ";");

// Vulnerable: eval with template literal
//<expect-error>
eval(`${userInput}.toUpperCase()`);

// Vulnerable: eval with function call result
//<expect-error>
eval(getData());

// Vulnerable: window.eval
//<expect-error>
window.eval(userInput);

// Vulnerable: window.eval with expression
//<expect-error>
window.eval(req.params.code);

// <no-error> - Static string literal (less dangerous, but still not recommended)
eval("console.log('static')");

// <no-error> - JSON.parse is safe alternative
JSON.parse(userInput);

// <no-error> - Safe object lookup pattern
const operations = {
    add: (a, b) => a + b,
    sub: (a, b) => a - b
};
const result = operations[operation](a, b);
