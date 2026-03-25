# 130 Kathleen Road | Premium Property Brochure

This project is a modern, high-conversion property brochure for **130 Kathleen Road, Southampton (SO19 8LN)**. It combines premium web design with an automated lead generation funnel.

## 🚀 Key Features

- **Interactive Experience**: 
  - Glassmorphism-based UI for a fresh, summer-inspired aesthetic.
  - Interactive floorplan with immersive room "fly-through" transitions.
  - Full-screen lightbox gallery for high-resolution property photography.
- **Conversion Funnel**:
  - **Booking Modal**: A prominent success modal replaces simple toasts to ensure users see the next steps.
  - **Lead Management**: Automated "Request Viewing" system that captures user details and site-wide state.
  - **Eligibility Questionnaire**: A dedicated workflow to qualify potential buyers, pre-filling data from the booking step.
- **Automation**:
  - **Dynamic Gallery**: A PowerShell-based generator that rebuilds the `gallery.html` page based on the contents of the `/images` folder.

## 🛠️ Technology Stack

- **Frontend**: Standard HTML5, Vanilla CSS, and modular Vanilla JS. Focuses on performance and smooth animations (Intersection Observer, custom transitions).
- **Backend**: Node.js & Express server.
- **Infrastructure**: Hosted on **Google Cloud App Engine** for scalable, server-side dynamic handling.

## 📂 Project Structure

- `scripts/`: All administrative PowerShell scripts (Deployment, Setup, Gallery Generation).
- `docs/`: Historical documentation and setup guides.
- `images/`: Property photography organized by room/category.
- `legacy/`: Archive of the previous static-only deployment infrastructure.

## 🏁 Getting Started

### 1. Local Development
Ensure you have Node.js installed.
```bash
npm install
npm start
```
The server will run on `http://localhost:8080`.

### 2. Deployment (Google App Engine)

#### Step A: Setup (First Time)
Initialize your GCP project and billing:
```powershell
.\scripts\setup_gcp_project.ps1 -ProjectId YOUR_PROJECT_ID
```

#### Step B: Environment Config
Create a `.env` file from `.env.example`. This is crucial for handling email notifications and booking data.

#### Step C: Deploy
Run the unified deployment script which automatically generates the latest gallery and pushes to the cloud:
```powershell
.\scripts\deploy_app_engine.ps1
```

---
*Powered by OpenMover*
