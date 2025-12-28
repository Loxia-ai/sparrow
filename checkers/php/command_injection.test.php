<?php
// Vulnerable: exec with variable
$cmd = $_GET['cmd'];
// <expect-error>
exec($cmd);

// Vulnerable: shell_exec with interpolation
$file = $_POST['file'];
// <expect-error>
$output = shell_exec("cat $file");

// Vulnerable: system with concatenation
$host = $_GET['host'];
// <expect-error>
system("ping " . $host);

// Vulnerable: passthru with variable
$input = $_REQUEST['input'];
// <expect-error>
passthru($input);

// Vulnerable: popen with dynamic input
// <expect-error>
$handle = popen("grep $pattern file.txt", "r");

// Vulnerable: backtick with variable
// <expect-error>
$result = `ls $directory`;

// <no-error> - Static command
exec("ls -la /var/log");

// <no-error> - Properly escaped
$safe_file = escapeshellarg($_GET['file']);
exec("/bin/cat " . $safe_file);

// <no-error> - Constant command
define('BACKUP_CMD', 'tar czf backup.tar.gz /data');
exec(BACKUP_CMD);
?>
