.PHONY: deploy-frontend

FRONTEND_BUCKET=hearth-483321-frontend

deploy-frontend:
	cd clients/web && npm install && npm run build
	gcloud storage rsync -r clients/web/dist gs://$(FRONTEND_BUCKET)
