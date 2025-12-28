const { exec, execSync, spawn, execFile } = require('child_process');

// Vulnerable: exec with template literal
app.get('/api/ping', (req, res) => {
    // <expect-error>
    exec(`ping -c 4 ${req.query.host}`, (error, stdout) => {
        res.send(stdout);
    });
});

// Vulnerable: execSync with template literal
function runCommand(userInput) {
    // <expect-error>
    const output = execSync(`ls -la ${userInput}`);
    return output.toString();
}

// Vulnerable: child_process.exec with template literal
const cp = require('child_process');
function vulnerable(input) {
    // <expect-error>
    cp.exec(`cat ${input}`, callback);
}

// Vulnerable: execSync from require
function vulnerableSync(file) {
    // <expect-error>
    return require('child_process').execSync(`rm ${file}`);
}

// Vulnerable: spawn with shell: true
function vulnerableSpawn(cmd) {
    // <expect-error>
    spawn('sh', ['-c', cmd], { shell: true });
}

// Vulnerable: spawn with shell: true and other options
function vulnerableSpawnOptions(input) {
    // <expect-error>
    spawn('ls', [input], { cwd: '/tmp', shell: true });
}

// <no-error> - execFile is safe (no shell)
function safePing(host) {
    execFile('ping', ['-c', '4', host], (error, stdout) => {
        console.log(stdout);
    });
}

// <no-error> - spawn without shell option
function safeSpawn(args) {
    spawn('ping', ['-c', '4', args]);
}

// <no-error> - spawn with shell: false
function explicitSafeSpawn(args) {
    spawn('ping', ['-c', '4', args], { shell: false });
}

// <no-error> - exec with static string
function safeStaticExec() {
    exec('uptime', callback);
}

// <no-error> - execFile with array arguments
function safeExecFile(filename) {
    execFile('/usr/bin/cat', [filename], callback);
}
