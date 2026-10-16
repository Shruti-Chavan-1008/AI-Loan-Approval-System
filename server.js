const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { buildFeatures, FEATURE_ORDER } = require('./lib/features');
const { predict } = require('./lib/predict');

const app = express();
const PORT = process.env.PORT || 8080;
const DB = path.join(__dirname, 'data', 'applications.json');
const readDB = () => { try { return JSON.parse(fs.readFileSync(DB, 'utf8')); } catch { return []; } };
const writeDB = (rows) => fs.writeFileSync(DB, JSON.stringify(rows, null, 2));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'bankloan-ai-secret', resave: false, saveUninitialized: false }));
app.use((req, res, next) => { res.locals.user = req.session.user || null; next(); });

const auth = (req, res, next) => (req.session.user ? next() : res.redirect('/login'));

// ---------- Auth (demo: admin / admin123) ----------
app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    req.session.user = { name: 'Admin' };
    return res.redirect('/dashboard');
  }
  res.render('login', { error: 'Invalid username or password' });
});
app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));

// ---------- Pages ----------
app.get('/dashboard', auth, (req, res) => {
  const rows = readDB();
  const approved = rows.filter((r) => r.approved).length;
  res.render('dashboard', {
    active: 'dashboard',
    stats: { total: rows.length, approved, rejected: rows.length - approved,
      rate: rows.length ? Math.round((approved / rows.length) * 100) : 0 },
    recent: rows.slice(-5).reverse()
  });
});

app.get('/apply', auth, (req, res) => res.render('apply', { active: 'apply', error: null }));

app.post('/apply', auth, async (req, res) => {
  const b = req.body;
  const required = ['full_name', 'age', 'gender', 'dependents', 'applicant_income', 'loan_amount',
    'credit_score', 'dti_ratio', 'loan_purpose', 'property_area', 'employer_category'];
  if (required.some((k) => !b[k] && b[k] !== 0)) {
    return res.render('apply', { active: 'apply', error: 'Please fill in all required fields.' });
  }
  const feats = buildFeatures(b);
  const result = await predict(feats, FEATURE_ORDER);
  const rows = readDB();
  const record = {
    id: rows.length + 1, date: new Date().toISOString(), name: b.full_name,
    loan_amount: Number(b.loan_amount), purpose: b.loan_purpose,
    credit_score: Number(b.credit_score), approved: result.approved,
    probability: result.probability, source: result.source, features: feats.named
  };
  rows.push(record); writeDB(rows);
  res.render('result', { active: 'apply', r: record });
});

app.get('/application', auth, (req, res) => res.render('application', { active: 'application', rows: readDB().reverse() }));
app.get('/insights', auth, (req, res) => res.render('insights', {
  active: 'insights',
  importance: [ ['Credit_Score', 92], ['DTI_Ratio', 78], ['Applicant_Income', 64], ['Loan_Amount', 55],
    ['Collateral_Value', 41], ['Existing_Loans', 36], ['Savings', 30], ['Employer_Category', 22], ['Age', 14] ]
}));

// JSON API (for testing with Postman)
app.post('/api/predict', async (req, res) => {
  const feats = buildFeatures(req.body);
  res.json({ ...(await predict(feats, FEATURE_ORDER)), vector: feats.vector, columns: FEATURE_ORDER });
});

app.listen(PORT, () => console.log(`BankLoan AI running at http://localhost:${PORT}`));
