# V-Interview Backend

[English](#english) | [Français](#français)

---

## English

### Overview
**V-Interview** is an AI-powered interview simulation platform designed to help candidates practice for technical and behavioral interviews. This repository contains the backend API built with Django and integrated with Google Gemini AI.

### Features
- **User Authentication**: Secure sign-up, sign-in, and profile management using Token Authentication.
- **AI Question Generation**: Generates 10 personalized interview questions based on job title, experience level, and skills using **Gemini 1.5 Flash**.
- **Answer Submission**: Record and store candidate responses with time-tracking.
- **AI Evaluation**: Provides a detailed performance report including an overall score, strengths, areas for improvement, and specific feedback for each question.

### Tech Stack
- **Framework**: Django & Django REST Framework (DRF)
- **Database**: PostgreSQL (Production/Dev), SQLite (Fallback)
- **AI Engine**: Google Gemini 1.5 Flash
- **Secret Management**: Python-Decouple

### Getting Started

#### Prerequisites
- Python 3.10+
- PostgreSQL
- Gemini API Key ([Get it here](https://aistudio.google.com/app/apikey))

#### Installation
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd PFA_S2_Back_dev
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/scripts/activate # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install django djangorestframework django-cors-headers google-generativeai python-decouple psycopg2
   ```

4. **Environment Configuration**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Database Setup**:
   ```bash
   python manage.py migrate
   ```

6. **Run the server**:
   ```bash
   python manage.py runserver
   ```

---

## Français

### Aperçu
**V-Interview** est une plateforme de simulation d'entretien alimentée par l'IA, conçue pour aider les candidats à s'entraîner aux entretiens techniques et comportementaux. Ce dépôt contient l'API backend construite avec Django et intégrée à l'IA Google Gemini.

### Fonctionnalités
- **Authentification Utilisateur**: Inscription, connexion et gestion de profil sécurisées via Token Authentication.
- **Génération de Questions par IA**: Génère 10 questions d'entretien personnalisées basées sur l'intitulé du poste, le niveau d'expérience et les compétences via **Gemini 1.5 Flash**.
- **Soumission des Réponses**: Enregistre et stocke les réponses des candidats avec suivi du temps passé.
- **Évaluation par IA**: Fournit un rapport de performance détaillé incluant un score global, les points forts, les axes d'amélioration et des commentaires spécifiques pour chaque question.

### Technologies
- **Framework**: Django & Django REST Framework (DRF)
- **Base de données**: PostgreSQL (Prod/Dev), SQLite (Secours)
- **Moteur IA**: Google Gemini 1.5 Flash
- **Gestion des Secrets**: Python-Decouple

### Guide de Démarrage

#### Prérequis
- Python 3.10+
- PostgreSQL
- Clé API Gemini ([Obtenez-la ici](https://aistudio.google.com/app/apikey))

#### Installation
1. **Cloner le dépôt**:
   ```bash
   git clone <repository-url>
   cd PFA_S2_Back_dev
   ```

2. **Créer un environnement virtuel**:
   ```bash
   python -m venv venv
   source venv/bin/scripts/activate # Windows: venv\Scripts\activate
   ```

3. **Installer les dépendances**:
   ```bash
   pip install django djangorestframework django-cors-headers google-generativeai python-decouple psycopg2
   ```

4. **Configuration de l'environnement**:
   Créez un fichier `.env` à la racine :
   ```env
   GEMINI_API_KEY=votre_cle_api_gemini
   ```

5. **Configuration de la base de données**:
   ```bash
   python manage.py migrate
   ```

6. **Lancer le serveur**:
   ```bash
   python manage.py runserver
   ```
