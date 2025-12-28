import random
import secrets

# Vulnerable: random.random() for token
# <expect-error>
token = str(random.random())

# Vulnerable: random.choices for password
# <expect-error>
password = ''.join(random.choices('abc123', k=16))

# Vulnerable: random.randint for security
# <expect-error>
code = random.randint(100000, 999999)

# Vulnerable: from random import
# <expect-error>
from random import choice, randrange

# <no-error> - Using secrets module
secure_token = secrets.token_hex(32)

# <no-error> - secrets.randbelow
secure_int = secrets.randbelow(1000)

# <no-error> - secrets.choice
secure_choice = secrets.choice(['a', 'b', 'c'])

# <no-error> - os.urandom
import os
key = os.urandom(32)
