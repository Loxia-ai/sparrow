# Vulnerable: String interpolation in where
def vulnerable_search(username)
  # <expect-error>
  User.where("username = '#{username}'")
end

# Vulnerable: Interpolation in find_by_sql
def vulnerable_raw(name)
  # <expect-error>
  User.find_by_sql("SELECT * FROM users WHERE name = '#{name}'")
end

# Vulnerable: Interpolation in select
def vulnerable_select(column)
  # <expect-error>
  User.select("#{column} FROM users")
end

# Vulnerable: Interpolation in order
def vulnerable_order(sort_col)
  # <expect-error>
  User.order("#{sort_col} DESC")
end

# <no-error> - Hash conditions (parameterized)
def safe_hash(username)
  User.where(username: username)
end

# <no-error> - ? placeholder
def safe_placeholder(username)
  User.where('username = ?', username)
end

# <no-error> - Named placeholder
def safe_named(username)
  User.where('username = :name', name: username)
end

# <no-error> - find_by method
def safe_find_by(username)
  User.find_by(username: username)
end

# <no-error> - Static string
def safe_static
  User.where("active = true")
end
