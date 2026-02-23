package handlers

import (
	"context"
	"log"
	"net/http"
	"os"

	"hearth/api/internal/database"

	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
)

type GoogleLoginRequest struct {
	IDToken string `json:"id_token"`
}

func GoogleLogin(c *gin.Context) {
	var req GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	payload, err := idtoken.Validate(context.Background(), req.IDToken, clientID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid ID token"})
		return
	}

	// Extract user info
	googleID := payload.Subject
	email := payload.Claims["email"].(string)
	name := payload.Claims["name"].(string)
	picture := payload.Claims["picture"].(string)

	// Upsert User
	var userID string
	err = database.DB.QueryRow(`
		INSERT INTO users (email, name, google_id, avatar_url)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (email) DO UPDATE 
		SET name = EXCLUDED.name, 
            google_id = EXCLUDED.google_id,
            avatar_url = EXCLUDED.avatar_url,
            updated_at = NOW()
		RETURNING id
	`, email, name, googleID, picture).Scan(&userID)

	if err != nil {
		// If conflict on google_id (rare if email matches), handle it or generic error
		log.Println("Failed to upsert user:", err) // Added log statement
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create/update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user_id": userID,
		"email":   email,
		"name":    name,
	})
}
