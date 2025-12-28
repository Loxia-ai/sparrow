# Vulnerable: subprocess.run with shell=True
import subprocess

hostname = request.args.get('hostname')
# <expect-error>
subprocess.run(f"ping {hostname}", shell=True)

# Vulnerable: subprocess.call with shell=True
# <expect-error>
subprocess.call("ls -la " + user_dir, shell=True)

# Vulnerable: subprocess.Popen with shell=True
# <expect-error>
subprocess.Popen(command_string, shell=True)

# Vulnerable: subprocess.check_output with shell=True
# <expect-error>
subprocess.check_output(f"cat {filename}", shell=True)

# Vulnerable: subprocess.check_call with shell=True
# <expect-error>
subprocess.check_call("echo " + message, shell=True)

# Vulnerable: shell=True in middle of arguments
# <expect-error>
subprocess.run(cmd, shell=True, capture_output=True)

# Vulnerable: shell=True at end of arguments
# <expect-error>
subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)

# <no-error> - List of arguments without shell
subprocess.run(['ping', '-c', '4', hostname])

# <no-error> - shell=False explicitly
subprocess.run(cmd, shell=False)

# <no-error> - No shell argument (defaults to False)
subprocess.run(['ls', '-la'])

# <no-error> - Popen with list arguments
subprocess.Popen(['cat', filename], stdout=subprocess.PIPE)

# <no-error> - check_output with list
output = subprocess.check_output(['git', 'status'])
