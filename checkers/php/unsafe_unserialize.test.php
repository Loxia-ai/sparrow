<?php
// Vulnerable: unserialize with no restrictions
$data = $_POST['data'];
// <expect-error>
$obj = unserialize($data);

// Vulnerable: unserialize from cookie
// <expect-error>
$session = unserialize($_COOKIE['session']);

// Vulnerable: unserialize from GET parameter
// <expect-error>
$config = unserialize($_GET['config']);

// Vulnerable: unserialize with variable (could be user input)
// <expect-error>
$result = unserialize($userInput);

// <no-error> - Using json_decode instead
$data = json_decode($_POST['data'], true);

// <no-error> - unserialize with allowed_classes = false
$safe = unserialize($input, ['allowed_classes' => false]);

// <no-error> - unserialize with specific allowed classes
$obj = unserialize($input, [
    'allowed_classes' => ['App\DTO\UserDTO']
]);
?>
