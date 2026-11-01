"""
Synthetic Placement Dataset Generator for AI Career Intelligence Platform.
Generates a realistic, statistically grounded dataset of 4,000 engineering student placement records
reflecting Indian university hiring patterns, tier distributions, and multi-factor elimination criteria.
"""

import os
import numpy as np
import pandas as pd

def generate_placement_dataset(n_samples: int = 4000, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)

    # 1. CGPA: Truncated normal distribution between 5.0 and 10.0 (mean ~7.35, std ~1.15)
    cgpa_raw = np.random.normal(loc=7.35, scale=1.15, size=n_samples)
    cgpa = np.clip(np.round(cgpa_raw, 2), 5.0, 10.0)

    # 2. Backlogs: ~72% have 0 backlogs, ~17% have 1, ~7% have 2, ~4% have 3+
    backlog_weights = [0.72, 0.17, 0.07, 0.025, 0.015]
    backlogs = np.random.choice([0, 1, 2, 3, 4], size=n_samples, p=backlog_weights)
    # If CGPA is very high (>= 8.5), backlogs are virtually zero
    backlogs = np.where(cgpa >= 8.5, np.random.choice([0, 1], size=n_samples, p=[0.97, 0.03]), backlogs)

    # 3. Internships: 0 to 4
    # Correlated slightly with CGPA
    internship_lambda = np.clip((cgpa - 5.0) * 0.35, 0.2, 1.8)
    internships_count = np.clip(np.random.poisson(lam=internship_lambda), 0, 4)

    # 4. Projects: 0 to 6
    projects_lambda = np.clip(1.5 + (cgpa - 5.0) * 0.25, 1.0, 4.0)
    projects_count = np.clip(np.random.poisson(lam=projects_lambda), 0, 6)

    # 5. Coding Assessment Score (0 - 100):
    # Base normal distribution + slight correlation with CGPA and projects
    coding_base = np.random.normal(loc=65.0, scale=16.0, size=n_samples)
    coding_score = np.clip(np.round(coding_base + (cgpa - 7.0) * 4.0 + projects_count * 2.5, 1), 10.0, 100.0)

    # 6. Quantitative & Logical Aptitude Score (0 - 100):
    aptitude_base = np.random.normal(loc=68.0, scale=15.0, size=n_samples)
    aptitude_score = np.clip(np.round(aptitude_base + (cgpa - 7.0) * 3.5, 1), 15.0, 100.0)

    # 7. Communication Score (0 - 100):
    comm_base = np.random.normal(loc=72.0, scale=13.0, size=n_samples)
    communication_score = np.clip(np.round(comm_base, 1), 20.0, 100.0)

    # 8. Certifications Count (0 - 5):
    cert_weights = [0.35, 0.32, 0.20, 0.09, 0.03, 0.01]
    certifications_count = np.random.choice([0, 1, 2, 3, 4, 5], size=n_samples, p=cert_weights)

    # 9. Core Domain Skills Count (2 - 18):
    core_skills_base = np.random.poisson(lam=6.5, size=n_samples)
    core_skills_count = np.clip(core_skills_base + projects_count, 2, 18)

    # 10. Hackathons Participated:
    hackathons_count = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.60, 0.25, 0.10, 0.05])

    # 11. Degree Branch Tier:
    # 1: CSE / IT / AI-DS (55%)
    # 2: ECE / EEE / Data (30%)
    # 3: Mechanical / Civil / Other (15%)
    degree_tier = np.random.choice(['Tier 1 (CS/IT)', 'Tier 2 (Circuit)', 'Tier 3 (Core)'], size=n_samples, p=[0.55, 0.30, 0.15])

    # Latent Placement Index Calculation (Logistic Ground Truth with realistic boundary conditions):
    # Normalized features (0 to 1 scale)
    norm_cgpa = (cgpa - 5.0) / 5.0
    norm_coding = coding_score / 100.0
    norm_aptitude = aptitude_score / 100.0
    norm_comm = communication_score / 100.0
    norm_intern = internships_count / 4.0
    norm_proj = projects_count / 6.0
    norm_skills = core_skills_count / 18.0

    # Logit score formula
    logit = (
        -4.5  # Base intercept
        + 3.2 * norm_cgpa
        + 3.8 * norm_coding
        + 2.6 * norm_aptitude
        + 1.8 * norm_comm
        + 2.2 * norm_intern
        + 1.4 * norm_proj
        + 1.2 * norm_skills
        - 2.8 * (backlogs > 0)  # Heavy penalty for having active backlogs
        - 1.5 * np.maximum(0, backlogs - 1)  # Further penalty for multiple backlogs
        + 0.5 * (degree_tier == 'Tier 1 (CS/IT)')
        - 0.4 * (degree_tier == 'Tier 3 (Core)')
    )

    # Real-world elimination bottleneck: If coding score < 35 or aptitude < 35, placement rate drops drastically
    bottleneck = (coding_score < 35) | (aptitude_score < 35) | (cgpa < 6.0)
    logit = np.where(bottleneck, logit - 3.0, logit)

    # Add realistic market/recruiter noise
    noise = np.random.normal(0, 0.45, size=n_samples)
    placement_prob = 1.0 / (1.0 + np.exp(-(logit + noise)))
    placed = (placement_prob >= 0.50).astype(int)

    # Salary Tier (Package Band):
    # Tier 1 (> 9 LPA): Elite tech companies (Google, Microsoft, Amazon, Top Unicorns)
    # Tier 2 (4.5 - 9 LPA): Product & Mid-sized IT (Informatica, Capgemini, Cisco, Oracle)
    # Tier 3 (< 4.5 LPA): Service IT & Mass recruiters (TCS, Infosys, Wipro, Cognizant)
    salary_tier = []
    for p, c_score, c_cgpa, is_pl in zip(placement_prob, coding_score, cgpa, placed):
        if is_pl == 0:
            salary_tier.append('Not Placed')
        else:
            if c_score >= 80 and c_cgpa >= 8.0 and p >= 0.82:
                salary_tier.append('Tier 1 (> 9 LPA)')
            elif c_score >= 60 and p >= 0.65:
                salary_tier.append('Tier 2 (4.5 - 9 LPA)')
            else:
                salary_tier.append('Tier 3 (< 4.5 LPA)')

    df = pd.DataFrame({
        'cgpa': cgpa,
        'backlogs': backlogs,
        'internships_count': internships_count,
        'projects_count': projects_count,
        'coding_score': coding_score,
        'aptitude_score': aptitude_score,
        'communication_score': communication_score,
        'certifications_count': certifications_count,
        'core_skills_count': core_skills_count,
        'hackathons_count': hackathons_count,
        'degree_tier': degree_tier,
        'placement_probability_true': np.round(placement_prob, 4),
        'placed': placed,
        'salary_tier': salary_tier,
    })

    return df

if __name__ == '__main__':
    data_dir = os.path.join(os.path.dirname(__file__))
    os.makedirs(data_dir, exist_ok=True)
    out_csv = os.path.join(data_dir, 'placement_dataset.csv')

    df = generate_placement_dataset(n_samples=4500, random_seed=42)
    df.to_csv(out_csv, index=False)

    print(f"Generated placement dataset with {len(df)} records at: {out_csv}")
    print("\nDataset Summary Statistics:")
    print(df[['cgpa', 'backlogs', 'internships_count', 'projects_count', 'coding_score', 'aptitude_score', 'placed']].describe())
    print("\nPlacement Distribution:")
    print(df['placed'].value_counts(normalize=True).round(3))
    print("\nSalary Tier Distribution:")
    print(df['salary_tier'].value_counts(normalize=True).round(3))
