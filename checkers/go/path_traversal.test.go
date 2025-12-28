package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const uploadDir = "/var/uploads"

// Vulnerable: os.ReadFile with variable
func vulnerableRead(filename string) error {
	// <expect-error>
	data, err := os.ReadFile(filename)
	_ = data
	return err
}

// Vulnerable: os.Open with variable
func vulnerableOpen(path string) error {
	// <expect-error>
	file, err := os.Open(path)
	if file != nil {
		file.Close()
	}
	return err
}

// Vulnerable: http.ServeFile
func vulnerableServe(w http.ResponseWriter, r *http.Request) {
	filename := r.URL.Query().Get("file")
	// <expect-error>
	http.ServeFile(w, r, uploadDir+"/"+filename)
}

// <no-error> - Validates path is within directory
func secureRead(filename string) ([]byte, error) {
	cleanPath := filepath.Clean(filename)
	fullPath := filepath.Join(uploadDir, cleanPath)

	absUpload, _ := filepath.Abs(uploadDir)
	absFile, _ := filepath.Abs(fullPath)

	if !strings.HasPrefix(absFile, absUpload) {
		return nil, fmt.Errorf("invalid path")
	}

	return os.ReadFile(fullPath)
}

// <no-error> - Static file path
func readConfig() ([]byte, error) {
	return os.ReadFile("/etc/app/config.yaml")
}
