package main

import (
	"database/sql"
	"fmt"
)

// Vulnerable: fmt.Sprintf with SQL query
func vulnerableQuery(db *sql.DB, userID string) error {
	// <expect-error>
	query := fmt.Sprintf("SELECT * FROM users WHERE id = %s", userID)
	_, err := db.Query(query)
	return err
}

// Vulnerable: String concatenation
func vulnerableConcat(db *sql.DB, name string) error {
	// <expect-error>
	query := "SELECT * FROM users WHERE name = '" + name + "'"
	_, err := db.Query(query)
	return err
}

// Vulnerable: fmt.Sprintf with INSERT
func vulnerableInsert(db *sql.DB, name, email string) error {
	// <expect-error>
	query := fmt.Sprintf("INSERT INTO users (name, email) VALUES ('%s', '%s')", name, email)
	_, err := db.Exec(query)
	return err
}

// <no-error> - Parameterized query with $1
func secureQueryPostgres(db *sql.DB, userID string) error {
	query := "SELECT * FROM users WHERE id = $1"
	_, err := db.QueryRow(query, userID)
	return err
}

// <no-error> - Parameterized query with ?
func secureQueryMySQL(db *sql.DB, userID string) error {
	query := "SELECT * FROM users WHERE id = ?"
	_, err := db.QueryRow(query, userID)
	return err
}

// <no-error> - Prepared statement
func securePrepared(db *sql.DB, userID string) error {
	stmt, _ := db.Prepare("SELECT * FROM users WHERE id = $1")
	defer stmt.Close()
	_, err := stmt.Query(userID)
	return err
}
