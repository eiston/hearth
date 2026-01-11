variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "The Google Cloud region to deploy resources"
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "The name of the Cloud Run service"
  type        = string
  default     = "hearth-api"
}

variable "repository_name" {
  description = "The name of the Artifact Registry repository"
  type        = string
  default     = "hearth-repo"
}

variable "container_image" {
  description = "The full path to the container image to deploy (backend)"
  type        = string
}

variable "frontend_container_image" {
  description = "The full path to the container image to deploy (frontend)"
  type        = string
}

variable "supabase_token" {
  description = "Supabase Personal Access Token"
  type        = string
  sensitive   = true
}

variable "supabase_org_id" {
  description = "Supabase Organization ID"
  type        = string
}

variable "db_password" {
  description = "Password for the database user"
  type        = string
  sensitive   = true
}

variable "frontend_bucket_name" {
  description = "Name of the GCS bucket for the frontend"
  type        = string
}
