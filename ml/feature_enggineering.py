
import numpy as np
import pandas as pd

RAW_NUMERIC_COLUMNS = [
    "Applicant_Income",
    "Coapplicant_Income",
    "Age",
    "Dependents",
    "Credit_Score",
    "Existing_Loans",
    "DTI_Ratio",
    "Savings",
    "Collateral_Value",
    "Loan_Amount",
]

CATEGORICAL_COLUMNS = [
    "Education_Level",
    "Employment_Status",
    "Marital_Status",
    "Loan_Purpose",
    "Property_Area",
    "Gender",
    "Employer_Category",
]

NUMERIC_FEATURES = [
    "Coapplicant_Income",
    "Age",
    "Dependents",
    "Existing_Loans",
    "Savings",
    "Collateral_Value",
    "Loan_Amount",
    "DTI_Ratio_sq",
    "Credit_Score_sq",
    "Applicant_Income_log",
]

MODEL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_COLUMNS

RAW_INPUT_COLUMNS = RAW_NUMERIC_COLUMNS + CATEGORICAL_COLUMNS


def engineer_features(data):
    """Convert raw applicant details into the notebook's model features."""

    df = data.copy()

    missing = [c for c in RAW_INPUT_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing input columns: {missing}")

    for col in RAW_NUMERIC_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Same transformations as notebook cell 48
    df["DTI_Ratio_sq"] = df["DTI_Ratio"] ** 2
    df["Credit_Score_sq"] = df["Credit_Score"] ** 2

    # Income must not be negative for log1p.
    if (df["Applicant_Income"].dropna() < 0).any():
        raise ValueError("Applicant income cannot be negative.")

    df["Applicant_Income_log"] = np.log1p(
        df["Applicant_Income"]
    )

    # Same columns dropped in notebook cell 48
    return df[MODEL_FEATURES]
