<?php
// Vulnerable: ldap_search with interpolated variable
function vulnerableSearch($conn, $username) {
    // <expect-error>
    ldap_search($conn, "dc=example,dc=com", "(uid={$username})");
}

// Vulnerable: ldap_search with direct $_POST
function vulnerableDirectPost($conn) {
    // <expect-error>
    ldap_search($conn, "dc=example,dc=com", "(uid=" . $_POST['user']);
}

// Vulnerable: ldap_list with variable
function vulnerableList($conn, $input) {
    // <expect-error>
    ldap_list($conn, "dc=example,dc=com", "(cn={$input})");
}

// Vulnerable: ldap_read with concatenation
function vulnerableRead($conn, $user) {
    // <expect-error>
    ldap_read($conn, "dc=example,dc=com", "(sAMAccountName=" . $user);
}

// <no-error> - Using ldap_escape
function safeLdapSearch($conn, $username) {
    $escaped = ldap_escape($username, "", LDAP_ESCAPE_FILTER);
    ldap_search($conn, "dc=example,dc=com", "(uid={$escaped})");
}

// <no-error> - Static filter
function safeStaticSearch($conn) {
    ldap_search($conn, "dc=example,dc=com", "(objectClass=person)");
}

// <no-error> - Parameterized with escape
function safeParameterized($conn, $input) {
    $filter = sprintf("(uid=%s)", ldap_escape($input, "", LDAP_ESCAPE_FILTER));
    ldap_search($conn, "dc=example,dc=com", $filter);
}
