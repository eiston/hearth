package main

import (
	"log"

	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

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
	connStr := database.Connect()

	// Run Migrations
	runMigrations(connStr)

	r := gin.Default()

	// CORS Configuration
	config := cors.DefaultConfig()
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins != "" {
		config.AllowOrigins = strings.Split(allowedOrigins, ",")
	} else {
		config.AllowOrigins = []string{"http://localhost:3000"} // Next.js default port
	}
	r.Use(cors.New(config))

	r.GET("/health", handlers.HealthCheck)

	// Auth Routes
	r.POST("/auth/google", handlers.GoogleLogin)

	// Swagger URL
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	log.Println("Server starting on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Server failed to start: ", err)
	}
}

func runMigrations(connStr string) {
	m, err := migrate.New(
		"file://migrations",
		connStr,
	)
	if err != nil {
		log.Println("Migration initialization failed/skipped (might be due to relative path or missing folder):", err)
		return
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal("Migration failed:", err)
	}
	log.Println("Database migrations applied successfully!")
}
