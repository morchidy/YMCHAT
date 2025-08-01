#!/bin/bash

# Créer le répertoire badges s'il n'existe pas
mkdir -p badges

# Générer un badge pour le statut du pipeline
anybadge --label="Pipeline" --value="Passing" --color="green" --file="badges/pipeline.svg"

# Générer un badge pour la couverture des tests
COVERAGE=$(grep -oP 'All files\s*\|\s*\K[\d.]+' coverage/lcov-report/index.html)
anybadge --label="Coverage" --value="${COVERAGE}%" --file="badges/coverage.svg"

# Générer un badge pour la version
VERSION="1.0.0"
anybadge --label="Version" --value="${VERSION}" --file="badges/version.svg"

# Générer un badge pour le statut du projet
anybadge --label="Status" --value="In Progress" --color="orange" --file="badges/status.svg"

echo "Badges générés dans le dossier badges/"