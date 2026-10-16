/**
 * Calls your Python model service (Flask/FastAPI) if available.
 * Expected: POST ML_URL  { features: [..], columns: [..] }  ->  { approved: bool, probability: 0..1 }
 * Falls back to a simple demo heuristic so the UI works without the model.
 */
const ML_URL = process.env.ML_URL || 'http://localhost:5000/predict';

async function predict({ named, vector }, columns) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(ML_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: vector, columns }), signal: ctrl.signal
    });
    clearTimeout(t);
    if (!r.ok) throw new Error('ML service ' + r.status);
    const d = await r.json();
    return { approved: !!d.approved, probability: Number(d.probability ?? (d.approved ? 1 : 0)), source: 'model' };
  } catch (e) {
    return { ...demoScore(named), source: 'demo' };
  }
}

function demoScore(f) {
  let s = 0.5;
  s += (f.Credit_Score - 650) / 600;
  s -= f.DTI_Ratio * 0.8;
  s -= f.Existing_Loans * 0.04;
  s += Math.min((f.Applicant_Income + f.Coapplicant_Income) / Math.max(f.Loan_Amount, 1), 1.5) * 0.12;
  s += Math.min(f.Collateral_Value / Math.max(f.Loan_Amount, 1), 2) * 0.05;
  if (f.Employer_Category_Unemployed) s -= 0.25;
  const p = Math.max(0.02, Math.min(0.98, s));
  return { approved: p >= 0.5, probability: p };
}

module.exports = { predict };
