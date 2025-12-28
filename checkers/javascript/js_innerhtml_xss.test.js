// Vulnerable: innerHTML with variable
const userComment = req.body.comment;
//<expect-error>
document.getElementById('comments').innerHTML = userComment;

// Vulnerable: innerHTML with member expression
//<expect-error>
container.innerHTML = response.data.html;

// Vulnerable: innerHTML with concatenation
//<expect-error>
element.innerHTML = '<div>' + userInput + '</div>';

// Vulnerable: innerHTML with template literal
//<expect-error>
element.innerHTML = `<p>${comment.content}</p>`;

// Vulnerable: innerHTML with function result
//<expect-error>
commentDiv.innerHTML = formatComment(data);

// Vulnerable: innerHTML compound assignment
//<expect-error>
container.innerHTML += userComment;

// Vulnerable: innerHTML += with template
//<expect-error>
list.innerHTML += `<li>${item.name}</li>`;

// Vulnerable: outerHTML assignment
//<expect-error>
element.outerHTML = userContent;

// Vulnerable: outerHTML with expression
//<expect-error>
row.outerHTML = buildRowHTML(data);

// <no-error> - Static string literal
element.innerHTML = '<div class="container"></div>';

// <no-error> - textContent is safe
element.textContent = userInput;

// <no-error> - innerText is generally safe
element.innerText = userComment;

// <no-error> - createElement/appendChild is safe
const p = document.createElement('p');
p.textContent = userInput;
container.appendChild(p);

// <no-error> - DOMPurify sanitization
element.innerHTML = DOMPurify.sanitize(userInput);
