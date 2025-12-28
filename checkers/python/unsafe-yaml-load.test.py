import yaml

# Vulnerable: yaml.load without Loader
def vulnerable_load(content):
    # <expect-error>
    return yaml.load(content)

# Vulnerable: yaml.load with only data argument
def vulnerable_load_single_arg(data):
    # <expect-error>
    config = yaml.load(data)
    return config

# Vulnerable: yaml.unsafe_load
def vulnerable_unsafe_load(content):
    # <expect-error>
    return yaml.unsafe_load(content)

# Vulnerable: yaml.full_load
def vulnerable_full_load(content):
    # <expect-error>
    return yaml.full_load(content)

# <no-error> - yaml.safe_load is safe
def safe_load(content):
    return yaml.safe_load(content)

# <no-error> - yaml.load with SafeLoader is safe
def safe_load_explicit(content):
    return yaml.load(content, Loader=yaml.SafeLoader)

# <no-error> - yaml.load with BaseLoader is safe
def safe_load_base(content):
    return yaml.load(content, Loader=yaml.BaseLoader)

# <no-error> - yaml.safe_load_all is safe
def safe_load_all(content):
    return list(yaml.safe_load_all(content))
