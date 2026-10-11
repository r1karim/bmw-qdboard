# QdBoard — BMW Production Quality Dashboard

QdBoard is a web-based production quality analytics dashboard designed to support the exploration, monitoring, and investigation of automotive manufacturing defect reports.

The application provides interactive visualizations, defect filtering, statistical outlier detection, VIN consistency checks, and engineering observation tracking. It also includes a Python-based backend for AI-assisted defect investigations.

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- Material UI (MUI)
- Recharts
- React Router

**Backend**
- Python
- FastAPI
- Pydantic
- OpenAI API (`gpt-4.1-mini`)
- python-dotenv

## Features

- **Quality Dashboard:** Overview of production defect metrics, category distributions, resolution statuses, reporting trends, and station-level performance.
- **Defect Explorer:** Search, filter, and inspect individual defect reports.
- **Outlier Detection:** Identify unusual defect patterns using severity thresholds, resolution-time analysis, and repeated reports associated with the same VIN.
- **VIN Anomaly Detection:** Detect conflicting vehicle attributes, including car model, motor type, and design package, across reports sharing a VIN.
- **Engineering Tracking:** Save chart snapshots, record observations, and manage investigation notes.
- **AI-Assisted Investigation:** Use the backend API to support analysis of selected defect reports.

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js and npm
- Python 3
- pip

### Frontend Setup

Clone the repository and navigate to the frontend project directory.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local development URL in the terminal, typically `http://localhost:5173`.

## Backend Setup

The backend is built with Python and FastAPI. It provides an API for generating AI-assisted investigation suggestions based on individual automotive defect reports.

### Installation

Navigate to the backend directory and create a Python virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment.

**Windows (PowerShell):**

```powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

### Environment Configuration

Create a `.env` file in the same directory as `main.py` and add your OpenAI API key:

```dotenv
OPENAI_API_KEY=your_openai_api_key
```

The backend loads this configuration using `python-dotenv`.

**Important:** Keep your API key private and do not commit the `.env` file to version control.

### Running the Backend

From the directory containing `main.py`, start the FastAPI development server:

```bash
uvicorn main:app --reload
```

The backend will be available at:

`http://127.0.0.1:8000`

FastAPI's interactive API documentation is available at:

`http://127.0.0.1:8000/docs`

Run the frontend and backend in separate terminals during development.

## Backend API

The backend exposes two endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns the API health status. |
| `POST` | `/api/investigate` | Generates three AI-assisted investigation suggestions for a selected defect report. |

### AI-Assisted Investigation

The investigation endpoint accepts defect information including its identifier, name, category, production station, vehicle model, severity, resolution status, and reporting date.

The backend uses OpenAI's `gpt-4.1-mini` model to generate **three practical investigation steps** tailored to the selected defect.

The suggestions are intended to support engineering investigations, not to establish confirmed root causes. The backend instructs the model to avoid inventing vehicle-specific facts and to focus on checks engineers can perform.

Defect severity is interpreted on a scale from **1 (most critical) to 10 (least critical)**.

The API returns the generated suggestions as plain text in a JSON response.

The investigation endpoint requires a valid OpenAI API key and access to the OpenAI API. If the key is missing or generation fails, the backend returns an appropriate HTTP error.
## Production Build

To create an optimized frontend production build, run:

```bash
npm run build
```

Vite generates the production-ready frontend files in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

The FastAPI backend runs separately and must be deployed and configured independently for features requiring API access.

## Application Pages

| Route | Description |
|---|---|
| `/` | Production quality dashboard |
| `/defects` | Defect report exploration |
| `/outliers` | Outlier detection and analysis |
| `/anomalies` | VIN attribute inconsistency detection |
| `/tracking` | Saved observations and chart snapshots |

## Data and Persistence

The dashboard analyzes defect report data containing vehicle identifiers, production information, defect classifications, severity ratings, reporting dates, and resolution details.

Chart snapshots are stored locally in the browser using `localStorage`. This persistence is browser-specific and does not provide synchronization across devices.

## Development Notes

The frontend is organized into reusable components, pages, context providers, and analytics utilities. Detection logic is separated from presentation components to support maintainability and future extension.

The application uses React Context for shared defect and tracking state, while FastAPI provides backend functionality for AI-assisted investigations.