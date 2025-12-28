use std::process::Command;

// Vulnerable: Using sh -c with user input
fn vulnerable_shell(user_input: &str) {
    // <expect-error>
    Command::new("sh")
        .arg("-c")
        .arg(format!("ping -c 4 {}", user_input))
        .output()
        .expect("failed");
}

// Vulnerable: Using bash -c
fn vulnerable_bash(command: &str) {
    // <expect-error>
    Command::new("bash")
        .arg("-c")
        .arg(command)
        .output()
        .expect("failed");
}

// Vulnerable: Windows cmd /c
fn vulnerable_cmd(user_input: &str) {
    // <expect-error>
    Command::new("cmd")
        .arg("/c")
        .arg(format!("ping {}", user_input))
        .output()
        .expect("failed");
}

// Vulnerable: PowerShell
fn vulnerable_powershell(script: &str) {
    // <expect-error>
    Command::new("powershell")
        .arg("-Command")
        .arg(script)
        .output()
        .expect("failed");
}

// <no-error> - Direct command with separate args (safe)
fn safe_command(host: &str) {
    Command::new("ping")
        .arg("-c")
        .arg("4")
        .arg(host)  // Treated as literal string
        .output()
        .expect("failed");
}

// <no-error> - Static shell command (less risky)
fn safe_static_shell() {
    Command::new("sh")
        .arg("-c")
        .arg("echo hello")  // Static string, no user input
        .output()
        .expect("failed");
}

// <no-error> - Using args array
fn safe_args_array(validated_host: &str) {
    Command::new("curl")
        .args(&["-s", "-o", "/dev/null", validated_host])
        .output()
        .expect("failed");
}
