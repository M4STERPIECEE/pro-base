Projet pour gérer des **étudiants**/**notes**/**journal d’audit**

## Architecture

Backend suit une architecture simple en couches :

- **Controller** 
- **Service**
- **Repository** 
- **Model / Entity**
- **DTO**
- **Exception**

## Stack

- Java 25
- Spring Boot
- PostgreSQL
- Springdoc OpenAPI / Swagger UI
- Docker Compose

## Prérequis

- Docker et Docker Compose
- ou, pour un lancement local :
  - Java
  - PostgreSQL

## Lancer le projet avec Docker

Depuis racine du dépôt :

```bash
docker compose up --build
```

Fichier `docker-compose.yaml` démarre :

- PostgreSQL sur `localhost:5432`
- le backend sur `localhost:8080`

## Lancer Backend en local

Depuis dossier `backend/` :

```bash
./gradlew bootRun
```

Par défaut, l’app utilise :

- `http://localhost:8080/api`
- Swagger UI : `http://localhost:8080/api/swagger-ui.html`
- OpenAPI JSON/YAML : `http://localhost:8080/api/v3/api-docs`

## Structure global

```text
BDA/
├── docker-compose.yaml
├── backend/
│   ├── build.gradle.kts
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/bda/bda/
│       └── resources/
├── frontend/
└── README.md
```

## Remarque

API documentée via Swagger/OpenAPI

