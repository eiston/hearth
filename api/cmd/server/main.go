package main

import (
	"log"

	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "hearth/api/docs"
	"hearth/api/internal/database"
	"hearth/api/internal/handlers"
)

// @title           Hearth API
// @version         1.0
// @description     This is the Hearth API server.
// @host            localhost:8080
// @BasePath        /
func main() {
	// Initialize Database
	database.Connect()

	r := gin.Default()

	// CORS Configuration
	config := cors.DefaultConfig()
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins != "" {
		config.AllowOrigins = strings.Split(allowedOrigins, ",")
	} else {
		config.AllowOrigins = []string{"http://localhost:5173"} // Vite default port
	}
	r.Use(cors.New(config))

	r.GET("/health", handlers.HealthCheck)

	// Swagger URL
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	log.Println("Server starting on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Server failed to start: ", err)
	}
}
