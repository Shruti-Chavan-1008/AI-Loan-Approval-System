/**
 * Builds the feature vector in EXACTLY the same column order as your X_train.
 * Columns hidden behind "..." in your sample are NOT known to me - if your
 * model has more columns (e.g. Loan_Term), add them in FEATURE_ORDER and in
 * buildFeatures() below, in the same position as in X_train.columns.
 */
const FEATURE_ORDER = [
  'Applicant_Income', 'Coapplicant_Income', 'Age', 'Dependents', 'Credit_Score',
  'Existing_Loans', 'DTI_Ratio', 'Savings', 'Collateral_Value', 'Loan_Amount',
  // ---- add any hidden columns from "..." here ----
  'Loan_Purpose_Education', 'Loan_Purpose_Home', 'Loan_Purpose_Personal',
  'Property_Area_Semiurban', 'Property_Area_Urban',
  'Gender_Male',
  'Employer_Category_Government', 'Employer_Category_MNC',
  'Employer_Category_Private', 'Employer_Category_Unemployed'
];

const num = (v) => (v === undefined || v === '' ? 0 : Number(v));
const flag = (cond) => (cond ? 1.0 : 0.0);

function buildFeatures(b) {
  const f = {
    Applicant_Income: num(b.applicant_income),
    Coapplicant_Income: num(b.coapplicant_income),
    Age: num(b.age),
    Dependents: num(b.dependents),
    Credit_Score: num(b.credit_score),
    Existing_Loans: num(b.existing_loans),
    DTI_Ratio: num(b.dti_ratio),
    Savings: num(b.savings),
    Collateral_Value: num(b.collateral_value),
    Loan_Amount: num(b.loan_amount),
    // One-hot (drop_first style): Business = baseline purpose, Rural = baseline area
    Loan_Purpose_Education: flag(b.loan_purpose === 'Education'),
    Loan_Purpose_Home: flag(b.loan_purpose === 'Home'),
    Loan_Purpose_Personal: flag(b.loan_purpose === 'Personal'),
    Property_Area_Semiurban: flag(b.property_area === 'Semiurban'),
    Property_Area_Urban: flag(b.property_area === 'Urban'),
    Gender_Male: flag(b.gender === 'Male'),
    Employer_Category_Government: flag(b.employer_category === 'Government'),
    Employer_Category_MNC: flag(b.employer_category === 'MNC'),
    Employer_Category_Private: flag(b.employer_category === 'Private'),
    Employer_Category_Unemployed: flag(b.employer_category === 'Unemployed')
  };
  return { named: f, vector: FEATURE_ORDER.map((k) => f[k]) };
}

module.exports = { FEATURE_ORDER, buildFeatures };
