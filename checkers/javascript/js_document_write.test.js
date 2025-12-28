// Vulnerable: document.write with user input
const comment = req.body.comment;
// <expect-error>
document.write('<p>' + comment + '</p>');

// Vulnerable: document.writeln
// <expect-error>
document.writeln('<div>' + userContent + '</div>');

// Vulnerable: document.write with template literal
// <expect-error>
document.write(`<span>${userName}</span>`);

// Vulnerable: Even static content is deprecated
// <expect-error>
document.write('<script src="analytics.js"></script>');

// <no-error> - Using createElement and textContent
const p = document.createElement('p');
p.textContent = comment;
document.body.appendChild(p);

// <no-error> - Using innerHTML with sanitization
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(htmlContent);

// <no-error> - Using insertAdjacentHTML
container.insertAdjacentHTML('beforeend', sanitizedHtml);
