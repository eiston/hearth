# Production Deployment
PROJECT_ID=hearth-483321
REGION=us-central1
REPO=hearth-repo
IMAGE=web
TAG=latest
SERVICE_NAME=hearth-web
NEXT_PUBLIC_API_URL=https://hearth-api-ycdzfnenuq-uc.a.run.app

build-prod:
	docker build --platform linux/amd64 \
		--build-arg NEXT_PUBLIC_API_URL=$(NEXT_PUBLIC_API_URL) \
		-t $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPO)/$(IMAGE):$(TAG) .
	docker push $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPO)/$(IMAGE):$(TAG)

deploy: build-prod
	gcloud run deploy $(SERVICE_NAME) \
		--image $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPO)/$(IMAGE):$(TAG) \
		--region $(REGION) \
		--project $(PROJECT_ID) \
		--set-env-vars NEXT_PUBLIC_API_URL=$(NEXT_PUBLIC_API_URL) \
		--allow-unauthenticated
