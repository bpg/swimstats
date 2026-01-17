package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// APIClient is a helper for making API requests in tests.
type APIClient struct {
	t          *testing.T
	handler    http.Handler
	accessLevel string
}

// NewAPIClient creates a new API test client.
func NewAPIClient(t *testing.T, handler http.Handler) *APIClient {
	return &APIClient{
		t:          t,
		handler:    handler,
		accessLevel: "full",
	}
}

// SetMockUser sets the mock user access level ("full" or "view_only").
func (c *APIClient) SetMockUser(accessLevel string) {
	c.accessLevel = accessLevel
}

// Get performs a GET request.
func (c *APIClient) Get(path string) *httptest.ResponseRecorder {
	return c.doRequest("GET", path, nil)
}

// Post performs a POST request with JSON body.
func (c *APIClient) Post(path string, body interface{}) *httptest.ResponseRecorder {
	return c.doRequest("POST", path, body)
}

// Put performs a PUT request with JSON body.
func (c *APIClient) Put(path string, body interface{}) *httptest.ResponseRecorder {
	return c.doRequest("PUT", path, body)
}

// Delete performs a DELETE request.
func (c *APIClient) Delete(path string) *httptest.ResponseRecorder {
	return c.doRequest("DELETE", path, nil)
}

func (c *APIClient) doRequest(method, path string, body interface{}) *httptest.ResponseRecorder {
	c.t.Helper()

	var reqBody *bytes.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			c.t.Fatalf("Failed to marshal request body: %v", err)
		}
		reqBody = bytes.NewReader(jsonBody)
	}

	var req *http.Request
	var err error
	if reqBody != nil {
		req, err = http.NewRequest(method, path, reqBody)
	} else {
		req, err = http.NewRequest(method, path, nil)
	}
	if err != nil {
		c.t.Fatalf("Failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Mock-User", c.accessLevel)

	rr := httptest.NewRecorder()
	c.handler.ServeHTTP(rr, req)
	return rr
}

// AssertJSONBody unmarshals the response body into target.
func AssertJSONBody(t *testing.T, rr *httptest.ResponseRecorder, target interface{}) {
	t.Helper()
	if err := json.Unmarshal(rr.Body.Bytes(), target); err != nil {
		t.Fatalf("Failed to unmarshal response: %v\nBody: %s", err, rr.Body.String())
	}
}

// SetupTestDB creates a test database connection.
// Uses the local Docker PostgreSQL instance.
func SetupTestDB(ctx interface{}, t *testing.T) *TestDB {
	t.Helper()
	return NewTestDB(t)
}

// ClearTables truncates all tables.
func (db *TestDB) ClearTables(ctx interface{}, t *testing.T) {
	t.Helper()
	db.CleanTables(t)
}

// TeardownTestDB closes the database connection.
func (db *TestDB) TeardownTestDB(ctx interface{}, t *testing.T) {
	t.Helper()
	db.Close()
}

// setupTestHandler creates the API handler for testing.
// This is a placeholder that will be implemented when the handlers are created.
func setupTestHandler(t *testing.T, testDB *TestDB) http.Handler {
	t.Helper()
	
	// TODO: This will be implemented when the API handlers are created.
	// For now, return a simple placeholder that returns 501 Not Implemented.
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotImplemented)
		w.Write([]byte(`{"error":"API not implemented yet"}`))
	})
}
