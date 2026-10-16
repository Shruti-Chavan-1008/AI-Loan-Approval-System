# Example model service. pip install flask joblib numpy
from flask import Flask, request, jsonify
import joblib, numpy as np
app = Flask(__name__)
model = joblib.load("model.pkl")          # your trained model
# scaler = joblib.load("scaler.pkl")      # if you scaled X_train

@app.post("/predict")
def predict():
    x = np.array(request.json["features"]).reshape(1, -1)
    # x = scaler.transform(x)
    p = float(model.predict_proba(x)[0][1])
    return jsonify(approved=p >= 0.5, probability=p)

app.run(port=5000)
