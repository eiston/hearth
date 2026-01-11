package integration

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"
)

func TestHealthCheck(t *testing.T) {
	// Base URL of the API. Default to localhost:8080 if not set.
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	// Retry mechanism to wait for the server to be up
	var resp *http.Response
	var err error
	maxRetries := 20
	for i := 0; i < maxRetries; i++ {
		resp, err = http.Get(baseURL + "/health")
		if err == nil {
			break
		}
		time.Sleep(1 * time.Second)
		fmt.Println("Waiting for server to be clean ready...")
	}

	if err != nil {
		t.Fatalf("Failed to connect to server after %d attempts: %v", maxRetries, err)
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status OK, got %v", resp.Status)
	}

	// Check JSON response
	var body map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if body["status"] != "ok" {
		t.Errorf("Expected status 'ok', got '%s'", body["status"])
	}
	if body["db"] != "connected" {
		t.Errorf("Expected db 'connected', got '%s'", body["db"])
	}
}
