# BankLoan AI (Express + EJS)

    npm install
    npm start        # http://localhost:8080   login: admin / admin123

## Connect your ML model
Run a Flask/FastAPI service at `http://localhost:5000/predict` (or set `ML_URL`):
- Request:  `{ "features": [..20 numbers..], "columns": ["Applicant_Income", ...] }`
- Response: `{ "approved": true, "probability": 0.87 }`

Feature order is defined in `lib/features.js` (must match `X_train.columns`).
If your dataset has extra columns hidden by "..." add them there.
If the ML service is down, a demo heuristic is used so the UI still works.
