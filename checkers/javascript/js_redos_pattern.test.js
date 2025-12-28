// Vulnerable: Nested quantifiers (a+)+
// <expect-error>
const vulnerable1 = /^(a+)+$/;

// Vulnerable: Grouped character class with outer quantifier
// <expect-error>
const vulnerable2 = /^([a-zA-Z]+)*$/;

// Vulnerable: Repeated groups
// <expect-error>
const vulnerable3 = /^(.*a){20}$/;

// Vulnerable: Email with nested quantifiers
// <expect-error>
const vulnerableEmail = /^([a-zA-Z0-9._-]+)*@/;

// <no-error> - Simple pattern without nesting
const safe1 = /^[a-zA-Z0-9]+$/;

// <no-error> - Safe email pattern
const safeEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// <no-error> - Bounded quantifier
const safe2 = /^[a-zA-Z]{1,100}$/;

// <no-error> - Simple URL pattern
const safeUrl = /^https?:\/\/[^\s]+$/;
