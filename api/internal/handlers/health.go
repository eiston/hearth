package handlers

import (
	"net/http"

	"hearth/api/internal/database"

	"github.com/gin-gonic/gin"
)

// HealthCheck checks if the server and database are up
// @Summary      Health Check
// @Description  Checks if the server and database are up
// @Tags         health
// @ID           healthCheck
// @Produce      json
// @Success      200  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /health [get]
func HealthCheck(c *gin.Context) {
	err := database.DB.Ping()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"db":     "disconnected",
			"error":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"db":     "connected",
	})
}
