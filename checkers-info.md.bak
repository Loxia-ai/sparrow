# Sparrow Checkers Index

This document provides an index of all security and code quality checkers available in Sparrow SAST tool.

## Checker Format

Each checker consists of:
- **YAML definition file** (`<checker-name>.yml`): Contains the tree-sitter pattern, message, category, severity, and description
- **Test file** (`<checker-name>.test.<ext>`): Contains test cases with `<expect-error>` and `<no-error>` annotations

## Checkers by Language

### Python (30 checkers)

| Checker | Category | Description |
|---------|----------|-------------|
| `app-run-with-bad-host` | security | Detects Flask app.run() with host='0.0.0.0' binding to all interfaces |
| `avoid-marksafe` | security | Warns against using Django's mark_safe() which can lead to XSS |
| `avoid_assert` | security | Detects assert statements that are stripped in production |
| `context-autoescape-off` | security | Detects Django templates with autoescape disabled |
| `csrf-exempt` | security | Detects CSRF exemption decorators |
| `distributed-security-required-encryption` | security | Checks for security requirements in distributed systems |
| `django-class-custom-extends` | security | Detects custom Django class extensions |
| `empty-aes-key` | security | Detects empty AES encryption keys |
| `filter-issafe` | security | Detects Django filter is_safe usage |
| `flask-avoid-direct-app-run` | security | Warns against direct Flask app.run() calls |
| `flask-debug-enabled` | security | Detects Flask debug mode enabled |
| `format-html-param` | security | Detects HTML formatting with user parameters |
| `globals-as-template-context` | security | Detects globals() passed as template context |
| `hashid-with-django-secret` | security | Detects Hashids using Django SECRET_KEY |
| `insecure-cipher` | security | Detects usage of weak ciphers (ARC4, Blowfish, IDEA) |
| `insecure-hash-sha1` | security | Detects usage of SHA1 for security purposes |
| `insufficient-keysize` | security | Detects cryptographic keys with insufficient size |
| `jwt-python-none-alg` | security | Detects JWT with 'none' algorithm |
| `os-system-injection` | security | Detects os.system()/os.popen() with dynamic input (command injection) |
| `path-traversal` | security | Detects file operations with user input enabling directory traversal |
| `post-after-isvalid` | security | Detects POST access after form validation |
| `query-set-extra` | security | Detects Django QuerySet.extra() which can lead to SQL injection |
| `safe-string-extend` | security | Detects unsafe string extensions |
| `ssti-template-injection` | security | Detects server-side template injection vulnerabilities |
| `subprocess-shell-true` | security | Detects subprocess calls with shell=True (command injection) |
| `tainted-pickle-deserialize` | security | Detects pickle deserialization of untrusted data |
| `unsafe-yaml-load` | security | Detects unsafe yaml.load()/unsafe_load() usage (RCE risk) |
| `use-ftp-tls` | security | Warns against using FTP without TLS |
| `weak-ssl-version` | security | Detects usage of weak SSL/TLS versions |

### JavaScript (17 checkers)

| Checker | Category | Description |
|---------|----------|-------------|
| `js_alert_in_prod` | best-practices | Detects alert() calls in production code |
| `js_assigned_undefined` | best-practices | Detects explicit assignment of undefined |
| `js_command_injection` | security | Detects exec/execSync with template literals or spawn with shell:true |
| `js_confirm_in_prod` | best-practices | Detects confirm() calls in production code |
| `js_debugger_in_prod` | best-practices | Detects debugger statements in production code |
| `js_document_write` | security | Detects document.write() which is deprecated and XSS-prone |
| `js_eval_injection` | security | Detects eval() with dynamic input (code injection risk) |
| `js_implied_eval` | security | Detects setTimeout/setInterval/Function with string args |
| `js_innerhtml_xss` | security | Detects innerHTML assignment with dynamic content (XSS risk) |
| `js_prompt_in_prod` | best-practices | Detects prompt() calls in production code |
| `js_prototype_pollution` | security | Detects __proto__/constructor.prototype access (pollution risk) |
| `js_open_redirect` | security | Detects open redirect vulnerabilities |
| `js_postmessage_origin` | security | Detects postMessage with '*' targetOrigin |
| `js_lazy_load_module` | best-practices | Detects lazy loading patterns |

### Go (28 checkers)

| Checker | Category | Description |
|---------|----------|-------------|
| `cgi_import` | security | Detects usage of deprecated net/http/cgi package |
| `des_weak_crypto` | security | Detects usage of weak DES encryption |
| `fmt_print_in_prod` | best-practices | Detects fmt.Print statements in production |
| `grpc_client_insecure_tls` | security | Detects insecure gRPC client TLS configuration |
| `grpc_server_insecure_tls` | security | Detects insecure gRPC server TLS configuration |
| `html_req_template_injection` | security | Detects HTML template injection vulnerabilities |
| `http_file_server` | security | Detects http.FileServer usage exposing directories |
| `insecure_cookie` | security | Detects cookies without Secure flag |
| `jwt_harcoded_signing_key` | security | Detects hardcoded JWT signing keys |
| `jwt_none_algorithm` | security | Detects JWT with 'none' algorithm |
| `math_rand` | security | Detects usage of math/rand for cryptographic purposes |
| `md5_weak_hash` | security | Detects usage of weak MD5 hashing |
| `missing_error_file_open` | security | Detects unchecked file open errors |
| `mysql_conn_raw_passwd` | security | Detects hardcoded MySQL passwords |
| `net_bind_all_interfaces` | security | Detects binding to 0.0.0.0 |
| `os_create_file_default_permission` | security | Detects os.Create with default permissions |
| `postgres_config_raw_passwd` | security | Detects hardcoded Postgres config passwords |
| `postgres_conn_raw_passwd` | security | Detects hardcoded Postgres connection passwords |
| `pprof_endpoint_automatic_exposure` | security | Detects automatic pprof endpoint exposure |
| `shell_command_injection` | security | Detects exec.Command with shell interpreters (sh/bash -c) |
| `reflect_pkg` | security | Warns about reflect package usage |
| `samesite_cookie` | security | Detects cookies without SameSite attribute |
| `sha1_weak_hash` | security | Detects usage of weak SHA1 hashing |
| `tls_config_minver` | security | Detects TLS config with weak minimum version |
| `tls_insecure` | security | Detects InsecureSkipVerify in TLS config |
| `unsafe_pkg` | security | Warns about unsafe package usage |

### Ruby (16 checkers)

| Checker | Category | Description |
|---------|----------|-------------|
| `blowfish_weak_crypto` | security | Detects usage of weak Blowfish encryption |
| `dsa_weak_crypto` | security | Detects usage of weak DSA cryptography |
| `eval_method` | security | Detects eval() method usage |
| `header_injection` | security | Detects HTTP header injection / CRLF injection |
| `md5_weak_hash` | security | Detects usage of weak MD5 hashing |
| `rails_force_ssl` | security | Checks for force_ssl configuration |
| `rails_http_hardcoded_passwd` | security | Detects hardcoded HTTP passwords |
| `rails_httponly_cookie` | security | Detects cookies without HttpOnly flag |
| `rails_insecure_smtp` | security | Detects insecure SMTP configuration |
| `rails_samesite_cookie` | security | Detects cookies without SameSite attribute |
| `rails_unsafe_direct_assignment` | security | Detects unsafe mass assignment |
| `rsa_weak_crypto` | security | Detects weak RSA key sizes |
| `sha1_weak_hash` | security | Detects usage of weak SHA1 hashing |
| `skip_authorization` | security | Detects skipped authorization checks |
| `ssl_no_verify` | security | Detects SSL verification disabled |

### Java (14 checkers)

| Checker | Category | Description |
|---------|----------|-------------|
| `cbc-padding-oracle` | security | Detects CBC mode vulnerable to padding oracle attacks |
| `custom-digests` | security | Detects custom digest implementations |
| `deprecated-default-httpclient` | security | Detects deprecated DefaultHttpClient usage |
| `deprecated-des` | security | Detects usage of deprecated DES encryption |
| `ecb-cipher` | security | Detects ECB mode which is insecure |
| `jndi-injection` | security | Detects JNDI lookup with dynamic input (Log4Shell-type) |
| `no-null-cipher` | security | Detects NullCipher usage |
| `rsa-no-padding` | security | Detects RSA without padding |
| `runtime-exec-injection` | security | Detects Runtime.exec() with string concatenation (command injection) |
| `sha224-usage` | security | Warns about SHA-224 usage |
| `unsafe_path_traversal` | security | Detects path traversal vulnerabilities |
| `weak-ssl-context` | security | Detects weak SSL context configuration |
| `xxe-injection` | security | Detects XML parser without XXE protection |

### Rust (2 checkers)

| Checker | Category | Description |
|---------|----------|-------------|
| `avoid_unwrap` | best-practices | Warns against using unwrap() in production code |
| `shell_command_injection` | security | Detects shell interpreter (sh/bash -c) with dynamic input |

### Docker (4 checkers)

| Checker | Category | Description |
|---------|----------|-------------|
| `avoid_add` | security | Recommends COPY over ADD instruction |
| `avoid_latest` | security | Warns against using :latest tag |
| `avoid_sudo` | security | Warns against sudo usage in containers |

### PHP (8 checkers)

| Checker | Category | Description |
|---------|----------|-------------|
| `command_injection` | security | Detects exec/shell_exec/system/passthru with user input |
| `dangerous_eval` | security | Detects eval() with dynamic inputs (RCE risk) |
| `ldap_injection` | security | Detects LDAP queries with unsanitized user input |
| `sql_injection` | security | Detects SQL queries with concatenated user input |
| `type_juggling` | security | Detects loose comparison (==) with hashes/passwords |
| `unsafe_unserialize` | security | Detects unserialize() with untrusted data |
| `weak_random` | security | Detects rand()/mt_rand() for security purposes |

---

## Adding New Checkers

New checkers added from sample analysis will be documented below.

---

## New Checkers (Added from Samples)

### JavaScript Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `js_eval_injection` | snyklearn_codeinjection_javascript_eval | Detects eval() with dynamic input for code injection prevention |
| `js_implied_eval` | snyklearn_codeinjection_nodejs_settimeout | Detects setTimeout/setInterval/Function with string arguments |
| `js_innerhtml_xss` | upguard_xss_javascript | Detects innerHTML/outerHTML assignment with dynamic content |
| `js_prototype_pollution` | cwe_top25_prototype_pollution | Detects __proto__/constructor.prototype manipulation |
| `js_open_redirect` | express_official_open_redirect | Detects open redirect with user-controlled URLs |

### Python Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `subprocess-shell-true` | upguard_command_injection | Detects subprocess calls with shell=True enabling command injection |
| `os-system-injection` | upguard_command_injection | Detects os.system()/os.popen() with dynamic input |
| `unsafe-yaml-load` | cwe_top25_insecure_deserialization_yaml | Detects unsafe yaml.load()/unsafe_load() usage |
| `ssti-template-injection` | cwe_top25_template_injection | Detects server-side template injection |

### Java Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `runtime-exec-injection` | snyklearn_codeinjection_java_runtimeexec | Detects Runtime.exec() with string concatenation |
| `jndi-injection` | snyklearn_codeinjection_java_jndi | Detects JNDI lookup with dynamic input (Log4Shell-type) |

### Rust Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `shell_command_injection` | snyklearn_codeinjection_rust_shell | Detects shell interpreter (sh/bash -c) with dynamic input |

### Ruby Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `header_injection` | upguard_crlf_injection_ruby | Detects HTTP header/CRLF injection in Rails |

### Go Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `shell_command_injection` | commix_cmd_injection_go | Detects exec.Command with shell interpreters |

### PHP Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `command_injection` | commix_cmd_injection_php_exec_family | Detects exec/shell_exec/system/passthru with user input |
| `sql_injection` | acunetix_php_sql_injection | Detects SQL queries with concatenated input |
| `unsafe_unserialize` | deserialization_security | Detects unserialize() with untrusted data |

---

## Additional Checkers (Batch 2)

### JavaScript Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `js_document_write` | javascript_dom_vulnerabilities | Detects document.write() usage (deprecated, XSS risk) |
| `js_postmessage_origin` | javascript_postmessage_security | Detects postMessage with '*' targetOrigin |

### Python Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `path-traversal` | cwe_top25_path_traversal | Detects file operations with unsanitized user input |

### Java Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `xxe-injection` | cwe_top25_xxe_injection | Detects XML parsers without XXE protection |
| `unsafe-deserialization` | java_deserialization | Detects ObjectInputStream.readObject() without filtering |

---

## Additional Checkers (Batch 3)

### Python Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `weak-random` | cryptomg_weak_random | Detects random module usage for security purposes |

### JavaScript Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `js_weak_random` | cryptomg_weak_random | Detects Math.random() for security purposes |
| `js_redos_pattern` | cwe_top25_regex_dos | Detects regex with nested quantifiers (ReDoS risk) |
| `js_unsafe_deserialize` | dvna_insecure_deserialization | Detects node-serialize/funcster (RCE risk) |

### PHP Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `weak_random` | dvwa_weak_session_ids | Detects rand()/mt_rand() for security purposes |

### Go Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `sql_injection` | go_sql_injection_prevention | Detects fmt.Sprintf/concatenation in SQL queries |
| `path_traversal` | go_path_traversal | Detects file operations with unvalidated paths |

### Ruby Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `command_injection` | rails_command_injection | Detects system() with string interpolation |

### Docker Security Checkers

| Checker | Source Sample | Description |
|---------|---------------|-------------|
| `run_as_root` | docker_dockerfile_security | Detects containers running as root (no USER instruction) |
