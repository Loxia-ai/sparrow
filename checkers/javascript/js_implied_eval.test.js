// Vulnerable: setTimeout with variable string
const action = req.query.action;
//<expect-error>
setTimeout(action, 1000);

// Vulnerable: setTimeout with member expression
//<expect-error>
setTimeout(req.body.code, 500);

// Vulnerable: setTimeout with concatenation
//<expect-error>
setTimeout("doAction('" + userInput + "')", 1000);

// Vulnerable: setTimeout with template literal
//<expect-error>
setTimeout(`${userInput}()`, 1000);

// Vulnerable: setInterval with variable
//<expect-error>
setInterval(action, 2000);

// Vulnerable: setInterval with dynamic string
//<expect-error>
setInterval(request.params.callback, 1000);

// Vulnerable: window.setTimeout with string
//<expect-error>
window.setTimeout(userInput, 500);

// Vulnerable: window.setInterval with string
//<expect-error>
window.setInterval(action, 1000);

// Vulnerable: Function constructor with variable
//<expect-error>
new Function(userInput);

// Vulnerable: Function constructor with expression
//<expect-error>
new Function(req.body.code);

// Vulnerable: Function constructor with template
//<expect-error>
new Function(`return ${expression}`);

// <no-error> - Arrow function is safe
setTimeout(() => console.log('Safe'), 1000);

// <no-error> - Function reference is safe
function myCallback() {}
setTimeout(myCallback, 1000);

// <no-error> - Inline function is safe
setInterval(function() { doSomething(); }, 1000);

// <no-error> - Static string literal (less risky)
setTimeout("console.log('static')", 1000);

// <no-error> - Arrow function with validated input
setTimeout(() => processData(validatedInput), 500);
