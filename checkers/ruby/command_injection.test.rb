# Vulnerable: system() with interpolation
def convert_image(filename)
  # <expect-error>
  system("convert #{filename} output.png")
end

# Vulnerable: backticks with interpolation
def list_files(directory)
  # <expect-error>
  `ls #{directory}`
end

# Vulnerable: exec with interpolation
def run_command(cmd)
  # <expect-error>
  exec("#{cmd}")
end

# <no-error> - Array form (no shell)
def safe_convert(filename)
  system('convert', filename, 'output.png')
end

# <no-error> - Open3 with array
require 'open3'
def safe_capture(cmd, arg)
  Open3.capture3(cmd, arg)
end

# <no-error> - Static command
def list_home
  system('ls', '/home')
end
