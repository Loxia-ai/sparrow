package main

import (
	"context"
	"os/exec"
)

// Vulnerable: exec.Command with sh -c
func vulnerableShell(userInput string) {
	// <expect-error>
	exec.Command("sh", "-c", "ping -c 4 "+userInput)
}

// Vulnerable: exec.Command with bash -c
func vulnerableBash(cmd string) {
	// <expect-error>
	exec.Command("bash", "-c", cmd)
}

// Vulnerable: exec.CommandContext with sh -c
func vulnerableContext(ctx context.Context, userInput string) {
	// <expect-error>
	exec.CommandContext(ctx, "sh", "-c", "ls "+userInput)
}

// Vulnerable: Windows cmd /c
func vulnerableCmd(command string) {
	// <expect-error>
	exec.Command("cmd", "-c", command)
}

// Vulnerable: PowerShell
func vulnerablePowershell(script string) {
	// <expect-error>
	exec.Command("powershell", "-c", script)
}

// <no-error> - Direct command with separate args (safe)
func safeCommand(host string) {
	exec.Command("/usr/bin/ping", "-c", "4", host)
}

// <no-error> - CommandContext with separate args
func safeContext(ctx context.Context, ip string) {
	exec.CommandContext(ctx, "/usr/bin/ping", "-c", "4", ip)
}

// <no-error> - Using argument array
func safeArgs(args []string) {
	exec.Command("/usr/bin/curl", args...)
}
