# Job Assistant

Job Assistant est un projet d’assistant de candidature composé progressivement de :

- une extension navigateur Chrome et Firefox ;
- un backend Java Spring Boot ;
- une base de données PostgreSQL ;
- une application web Angular.

## Objectif

Permettre à un candidat de capturer une offre d’emploi, préremplir certains champs répétitifs et suivre ses candidatures.

L’utilisateur conserve toujours le contrôle de l’envoi de sa candidature.

## État du projet


La première version fonctionnelle de l’extension permet déjà de :

- détecter certaines offres d’emploi et formulaires de candidature ;
- extraire le titre du poste, l’entreprise et l’URL lorsqu’ils sont disponibles ;
- détecter les actions de candidature comme `Postuler` ou `Apply` ;
- remplir automatiquement plusieurs champs simples du candidat ;
- conserver le contexte pendant une redirection vers un autre domaine ou ATS ;
- détecter automatiquement certaines confirmations d’envoi ;
- enregistrer localement une candidature envoyée ;
- synchroniser une candidature avec le backend via un service worker.

Le remplissage final et l’envoi du formulaire restent sous le contrôle de l’utilisateur.

### Backend Spring Boot

Le backend est opérationnel avec :

- Java 21 ;
- Spring Boot 4 ;
- API REST ;
- Spring Data JPA ;
- PostgreSQL ;
- Docker ;
- Flyway ;
- Jakarta Validation ;
- JUnit, MockMvc et Mockito.

Endpoints disponibles :

- `GET /api/health`
- `GET /api/applications`
- `POST /api/applications`

Les candidatures sont enregistrées dans PostgreSQL avec notamment :

- un UUID ;
- le titre du poste ;
- l’entreprise ;
- l’URL de l’offre ;
- le statut ;
- la date de candidature ;
- les dates de création et de modification.

Statuts actuellement disponibles :

`SAVED`, `APPLIED`, `INTERVIEW`, `REJECTED`, `OFFER`, `WITHDRAWN`.

### Architecture actuelle

```text
Extension Chrome
      ↓
Content Script
      ↓
Service Worker
      ↓
API REST Spring Boot
      ↓
PostgreSQL
