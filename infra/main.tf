terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "supabase" {
  access_token = var.supabase_token
}

# Artifact Registry Repository
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = var.repository_name
  description   = "Docker repository for Hearth API"
  format        = "DOCKER"

  depends_on = [google_project_service.artifact_registry]
}

# Supabase Project (Database)
# Note: Supabase free tier usually requires creating project in specific regions.
# We'll use us-east-1 as it is the most common default, but this might need adjustment based on user availability.
resource "supabase_project" "db" {
  organization_id   = var.supabase_org_id
  name              = var.service_name
  database_password = var.db_password
  region            = "us-east-1"

  lifecycle {
    ignore_changes = [database_password]
  }
}

# Cloud Run Service
resource "google_cloud_run_v2_service" "default" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  deletion_protection = false

  depends_on = [google_project_service.cloud_run]

  template {
    containers {
      image = var.container_image
      ports {
        container_port = 8080
      }

      # Inject Database Connection Details
      env {
        name  = "DB_HOST"
        value = "db.${supabase_project.db.id}.supabase.co"
      }
      env {
        name  = "DB_PORT"
        value = "5432" # Standard Postgres port
      }
      env {
        name  = "DB_USER"
        value = "postgres"
      }
      env {
        name  = "DB_PASSWORD"
        value = var.db_password
      }
      env {
        name  = "DB_NAME"
        value = "postgres"
      }
      env {
        name  = "ALLOWED_ORIGINS"
        value = "https://hearth-web-ycdzfnenuq-uc.a.run.app,https://hearth-web-1073169483760.us-central1.run.app"
      }
    }
  }
}

# Allow unauthenticated invocations
resource "google_cloud_run_service_iam_member" "public" {
  location = google_cloud_run_v2_service.default.location
  service  = google_cloud_run_v2_service.default.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Frontend Cloud Run Service
resource "google_cloud_run_v2_service" "frontend" {
  name     = "hearth-web"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  deletion_protection = false

  depends_on = [google_project_service.cloud_run]

  template {
    containers {
      image = var.frontend_container_image
      ports {
        container_port = 8080
      }

      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = google_cloud_run_v2_service.default.uri
      }
    }
  }
}

# Allow unauthenticated invocations for frontend
resource "google_cloud_run_service_iam_member" "frontend_public" {
  location = google_cloud_run_v2_service.frontend.location
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "frontend_url" {
  value = google_cloud_run_v2_service.frontend.uri
}
