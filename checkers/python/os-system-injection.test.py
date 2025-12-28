# Vulnerable: os.system with variable
import os

filename = request.args.get('file')
# <expect-error>
os.system(command)

# Vulnerable: os.system with f-string
# <expect-error>
os.system(f"ping {hostname}")

# Vulnerable: os.system with concatenation
# <expect-error>
os.system("cat " + filename)

# Vulnerable: os.system with format
# <expect-error>
os.system("rm {}".format(path))

# Vulnerable: os.system with subscript
# <expect-error>
os.system(commands[0])

# Vulnerable: os.system with function call result
# <expect-error>
os.system(build_command(user_input))

# Vulnerable: os.popen with variable
# <expect-error>
os.popen(command)

# Vulnerable: os.popen with f-string
# <expect-error>
os.popen(f"ls {directory}")

# Vulnerable: os.popen with concatenation
# <expect-error>
os.popen("grep " + pattern + " file.txt")

# <no-error> - Static string literal (still not recommended but less risky)
os.system("ls -la")

# <no-error> - subprocess with list is safe
import subprocess
subprocess.run(['cat', filename])

# <no-error> - subprocess.Popen with list is safe
subprocess.Popen(['ping', '-c', '4', hostname])
