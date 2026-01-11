.PHONY: up down test

up:
	docker-compose up -d --build

down:
	docker-compose down

test:
	go test ./... -v

swagger:
	go run github.com/swaggo/swag/cmd/swag@latest init -g cmd/server/main.go --parseDependency --parseInternal

# Production Deployment
PROJECT_ID=hearth-483321
REGION=us-central1
REPO=hearth-repo
IMAGE=api
TAG=latest
SERVICE_NAME=hearth-api

build-prod:
	docker build --platform linux/amd64 -t $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPO)/$(IMAGE):$(TAG) .
	docker push $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPO)/$(IMAGE):$(TAG)

deploy: build-prod
	gcloud run deploy $(SERVICE_NAME) \
		--image $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPO)/$(IMAGE):$(TAG) \
		--region $(REGION) \
		--project $(PROJECT_ID)
