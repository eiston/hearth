# Infrastructure Deployment

## Prerequisites

1.  **Google Cloud Project**: You need a Google Cloud project.
2.  **gcloud CLI**: Installed and authenticated (`gcloud auth login`, `gcloud auth application-default login`).
3.  **Terraform**: Installed.
4.  **Enabled APIs**:
    ```bash
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com iam.googleapis.com
    ```

## 1. Initial Setup

Initialize Terraform:

```bash
cd infra
terraform init
```

Create a `terraform.tfvars` file from the example:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set your `project_id`. Leave `container_image` as is for now, or set it to a dummy value if you haven't built the image yet (Terraform might fail if it tries to deploy a non-existent image immediately, so usually we create the repo first).

**Recommendation**: First run Terraform to create the Artifact Registry repo, *then* build/push the image, *then* run Terraform again to deploy the service.

## 2. Create Artifact Registry

In `terraform.tfvars`, set your `project_id`.

Run plan/apply to create the repository:

```bash
terraform apply -target=google_artifact_registry_repository.repo
```

## 3. Build and Push Image

Navigate to the `api` directory:

```bash
cd ../api
```

Build and push the image (replace `PROJECT_ID` and `REGION` with your values):

```bash
# Example
export PROJECT_ID=your-project-id
export REGION=us-central1
export REPO=hearth-repo
export IMAGE=api
export TAG=latest

# Authenticate Docker to Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build
docker build --platform linux/amd64 -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:${TAG} .

# Push
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:${TAG}
```

## 4. Deploy Cloud Run Service

Update `terraform.tfvars` with the full `container_image` path you just pushed.

```hcl
container_image = "us-central1-docker.pkg.dev/your-project-id/hearth-repo/api:latest"
```

Run Terraform apply:

```bash
cd ../infra
terraform apply
```

The output will show the `service_url`.
