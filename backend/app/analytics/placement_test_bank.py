"""
Campus Recruitment Comprehensive Assessment Question Bank.
Divided into two sequential sections reflecting Day-1 Tier-1 corporate placement tests:
- Section 1: Verbal Ability & Business English Grammar (TCS NQT, Infosys, Accenture, Cognizant, Wipro)
- Section 2: Quantitative Aptitude, Logical Reasoning & Data Interpretation Charts (Percentages, Ratios, Series, Data Tables)

Includes strict section-wise grading, company cutoffs, and session randomization.
"""

from typing import List, Dict, Any
import random
import copy

# =============================================================================
# SECTION 1: VERBAL ABILITY & CORPORATE GRAMMAR (COMPANY PYQs)
# =============================================================================
SECTION_1_QUESTIONS: List[Dict[str, Any]] = [
    {
        "id": "pyq_verb_01",
        "company": "TCS NQT 2024",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Subject-Verb Agreement",
        "question": "[TCS NQT PYQ] Choose the grammatically correct sentence for an institutional report:",
        "options": [
            "Neither the lead architect nor the software developers were aware of the schema deprecation.",
            "Neither the lead architect nor the software developers was aware of the schema deprecation.",
            "Neither the lead architect nor the software developers is aware of the schema deprecation.",
            "Neither the lead architect or the software developers were aware of the schema deprecation.",
        ],
        "correct_option_index": 0,
        "explanation": "When subjects are connected by 'neither... nor', the verb must agree in number with the closer subject ('developers' is plural -> 'were'). Also, 'neither' pairs strictly with 'nor', not 'or'.",
    },
    {
        "id": "pyq_verb_02",
        "company": "Infosys Springboard",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Subjunctive & Conditionals",
        "question": "[Infosys PYQ] Complete the conditional clause in accordance with corporate syntax:\n\"If the production database cluster ______ configured with automatic failover, the transaction outage would not have occurred.\"",
        "options": [
            "had been",
            "would have been",
            "was",
            "has been",
        ],
        "correct_option_index": 0,
        "explanation": "Third conditional structures follow: 'If + past perfect (had been), ... would have + past participle'.",
    },
    {
        "id": "pyq_verb_03",
        "company": "Accenture Assessment",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Prepositions & Collocations",
        "question": "[Accenture PYQ] Select the correct prepositions to fill the blanks:\n\"The compliance auditor insisted ______ adhering strictly ______ the ISO-27001 cybersecurity guidelines.\"",
        "options": [
            "on, to",
            "at, for",
            "in, with",
            "for, about",
        ],
        "correct_option_index": 0,
        "explanation": "The standard English verb collocation is 'insist ON doing something' and 'adhere TO a set of rules or standards'.",
    },
    {
        "id": "pyq_verb_04",
        "company": "Cognizant GenC Next",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Relative Pronouns",
        "question": "[Cognizant PYQ] Fill in the blank:\n\"The principal engineer, ______ pull request resolved the latency regression, was commended by the VP of Engineering.\"",
        "options": [
            "whose",
            "who's",
            "whom",
            "which",
        ],
        "correct_option_index": 0,
        "explanation": "'Whose' is the possessive relative pronoun indicating ownership of the pull request. 'Who's' is a contraction for 'who is'.",
    },
    {
        "id": "pyq_verb_05",
        "company": "Wipro Elite NLTH",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Tenses & Sequence of Time",
        "question": "[Wipro Elite PYQ] Identify the sentence with the correct sequence of tenses:",
        "options": [
            "By the time the code review was initiated, the development team had already resolved all lint warnings.",
            "By the time the code review was initiated, the development team has already resolved all lint warnings.",
            "By the time the code review is initiated, the development team had already resolved all lint warnings.",
            "By the time the code review was initiated, the development team already resolved all lint warnings.",
        ],
        "correct_option_index": 0,
        "explanation": "When describing two completed past actions, the earlier action takes the Past Perfect ('had already resolved') while the subsequent action takes Simple Past ('was initiated').",
    },
    {
        "id": "pyq_verb_06",
        "company": "Deloitte USI Placement",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Correlative Conjunctions",
        "question": "[Deloitte PYQ] Choose the correctly punctuated and formatted sentence:",
        "options": [
            "Not only did the candidate optimize the SQL query execution time, but she also reduced server memory utilization.",
            "Not only the candidate optimized the SQL query execution time, but she also reduced server memory utilization.",
            "Not only did the candidate optimize the SQL query execution time, but also she reduced server memory utilization.",
            "Not only did the candidate optimized the SQL query execution time, but she also reduced server memory utilization.",
        ],
        "correct_option_index": 0,
        "explanation": "When 'Not only' starts a clause, subject-auxiliary inversion is mandatory ('Not only did the candidate optimize...').",
    },
    {
        "id": "pyq_verb_07",
        "company": "TCS NQT 2024",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Idioms & Phrasal Verbs",
        "question": "[TCS NQT PYQ] What is the most appropriate phrasal verb to complete the sprint update:\n\"Due to unexpected third-party API deprecation, the scrum master decided to ______ the scheduled release until Friday.\"",
        "options": [
            "put off",
            "put out",
            "call up",
            "carry out",
        ],
        "correct_option_index": 0,
        "explanation": "'Put off' means to postpone or delay an event until a later date.",
    },
    {
        "id": "pyq_verb_08",
        "company": "Amazon Campus Drive",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Parallel Structure",
        "question": "[Amazon PYQ] Identify the sentence with proper parallel structure for a resume achievement:",
        "options": [
            "The candidate was responsible for designing microservices, benchmarking throughput, and documenting API schemas.",
            "The candidate was responsible for designing microservices, to benchmark throughput, and documenting API schemas.",
            "The candidate was responsible for designing microservices, benchmarking throughput, and to document API schemas.",
            "The candidate was responsible for designing microservices, benchmark throughput, and API schemas documentation.",
        ],
        "correct_option_index": 0,
        "explanation": "Parallelism requires consistent grammatical verb forms in a list (gerunds: designing, benchmarking, and documenting).",
    },
    {
        "id": "pyq_verb_09",
        "company": "Capgemini Excellence",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Dangling Modifiers",
        "question": "[Capgemini PYQ] Which of the following sentences does NOT contain a dangling modifier?",
        "options": [
            "While reviewing the deployment logs, the DevOps engineer discovered an uncaught null pointer exception.",
            "While reviewing the deployment logs, an uncaught null pointer exception was discovered.",
            "Having completed the sprint milestones, the celebratory team dinner was scheduled by management.",
            "Running out of disk space, the batch job had to be terminated by the server.",
        ],
        "correct_option_index": 0,
        "explanation": "In option A, the subject 'the DevOps engineer' directly follows the modifying phrase 'While reviewing the deployment logs', correctly identifying who performed the action.",
    },
    {
        "id": "pyq_verb_10",
        "company": "Infosys Springboard",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Sentence Correction",
        "question": "[Infosys PYQ] Choose the best replacement for the underlined segment:\n\"Each of the microservice endpoints _have their own_ separate caching layer.\"",
        "options": [
            "has its own",
            "have its own",
            "has their own",
            "are having their own",
        ],
        "correct_option_index": 0,
        "explanation": "'Each' is an indefinite pronoun that takes a singular verb ('has') and a singular possessive pronoun ('its').",
    },
    {
        "id": "pyq_verb_11",
        "company": "Accenture Assessment",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Direct & Indirect Speech",
        "question": "[Accenture PYQ] Change to indirect speech:\nThe tech lead said, 'The security patch will be deployed tomorrow.'",
        "options": [
            "The tech lead said that the security patch would be deployed the following day.",
            "The tech lead said that the security patch will be deployed the following day.",
            "The tech lead said that the security patch would be deployed tomorrow.",
            "The tech lead told that the security patch would be deployed yesterday.",
        ],
        "correct_option_index": 0,
        "explanation": "In indirect speech with past reporting verb: 'will' becomes 'would', and 'tomorrow' changes to 'the following day'.",
    },
    {
        "id": "pyq_verb_12",
        "company": "Cognizant GenC",
        "category": "Verbal Ability & Grammar",
        "subtopic": "Subject-Verb Inversion",
        "question": "[Cognizant PYQ] Fill in the blank:\n\"Rarely ______ such a catastrophic zero-day vulnerability in an enterprise operating system kernel.\"",
        "options": [
            "have security researchers encountered",
            "security researchers have encountered",
            "encountered security researchers",
            "has security researchers encountered",
        ],
        "correct_option_index": 0,
        "explanation": "When negative or limiting adverbs such as 'Rarely', 'Seldom', or 'Hardly' begin a sentence, inverted word order (auxiliary verb + subject + main verb) is mandatory.",
    },
]

# =============================================================================
# SECTION 2: QUANTITATIVE APTITUDE, LOGIC & DATA CHARTS (COMPANY PYQs)
# =============================================================================
SECTION_2_QUESTIONS: List[Dict[str, Any]] = [
    {
        "id": "pyq_quant_01",
        "company": "TCS NQT 2024",
        "category": "Quantitative Aptitude",
        "subtopic": "Percentages & Profit",
        "question": "[TCS NQT PYQ] A cloud infrastructure provider marks up compute instances by 25% above wholesale server costs. During an annual recruitment hackathon, an academic discount of 10% is offered to colleges. What is the net percentage profit earned by the provider on these instances?",
        "options": [
            "12.5%",
            "15.0%",
            "10.0%",
            "13.5%",
        ],
        "correct_option_index": 0,
        "explanation": "Let wholesale cost = 100. Marked Price = 125. Selling Price with 10% discount = 125 - (10% of 125) = 125 - 12.5 = 112.5. Net profit = 112.5 - 100 = 12.5%.",
    },
    {
        "id": "pyq_quant_02",
        "company": "Infosys Springboard",
        "category": "Quantitative Aptitude",
        "subtopic": "Ratios & Mixtures",
        "question": "[Infosys PYQ] In a machine learning cluster of 80 worker nodes, the initial ratio of GPU-accelerated nodes to CPU-only nodes is 5 : 3. How many additional GPU nodes must be provisioned to make the ratio 3 : 1?",
        "options": [
            "40 nodes",
            "30 nodes",
            "20 nodes",
            "50 nodes",
        ],
        "correct_option_index": 0,
        "explanation": "Initial GPU nodes = (5/8) * 80 = 50. CPU nodes = 30. Let x GPU nodes be added: (50 + x) / 30 = 3 / 1 => 50 + x = 90 => x = 40 nodes.",
    },
    {
        "id": "pyq_quant_03",
        "company": "Accenture Assessment",
        "category": "Logical Reasoning",
        "subtopic": "Word Series & Sequences",
        "question": "[Accenture PYQ] Find the NEXT WORD in the given verbal reasoning series based on initial vowel progression:\nAPPLE, ELEPHANT, IGLOO, OCTOPUS, ______?",
        "options": [
            "UMBRELLA",
            "TIGER",
            "EAGLE",
            "ORANGE",
        ],
        "correct_option_index": 0,
        "explanation": "The progression follows alphabetical initial vowels: A (Apple), E (Elephant), I (Igloo), O (Octopus), and the next term must begin with U -> UMBRELLA.",
    },
    {
        "id": "pyq_quant_04",
        "company": "Cognizant GenC Next",
        "category": "Logical Reasoning",
        "subtopic": "Find Next Word / Length Series",
        "question": "[Cognizant PYQ] Identify the NEXT WORD in the sequence based on word length progression starting with 'C':\nC (1 letter), CAT (3 letters), CHAT (4 letters), CRANE (5 letters), ______?",
        "options": [
            "CODING",
            "CLOUD",
            "CUP",
            "CARPETS",
        ],
        "correct_option_index": 0,
        "explanation": "The series follows consecutive word lengths starting with 'C': 1, 3, 4, 5. The next word must have exactly 6 letters and start with C: C-O-D-I-N-G (6 letters).",
    },
    {
        "id": "pyq_quant_05",
        "company": "Wipro Elite NLTH",
        "category": "Quantitative Aptitude",
        "subtopic": "Mixtures & Replacement",
        "question": "[Wipro Elite PYQ] A 60-liter tank contains an ethanol-water cooling solution in the ratio 2 : 1. If 15 liters of the solution is drained out and replaced with pure water, what is the new ratio of ethanol to water?",
        "options": [
            "1 : 1",
            "5 : 4",
            "4 : 3",
            "3 : 2",
        ],
        "correct_option_index": 0,
        "explanation": "Initial Ethanol = (2/3)*60 = 40L, Water = 20L. 15L drawn contains (2/3)*15 = 10L Ethanol and 5L Water. Remaining Ethanol = 40 - 10 = 30L. Remaining Water = 20 - 5 = 15L. After adding 15L pure water, Water = 15 + 15 = 30L. New ratio = 30 : 30 = 1 : 1.",
    },
    {
        "id": "pyq_quant_06",
        "company": "Deloitte USI Placement",
        "category": "Logical Reasoning",
        "subtopic": "Alphanumeric Series",
        "question": "[Deloitte PYQ] Find the NEXT TERM in the alphanumeric sequence:\nAZ1, BY2, CX3, DW4, ______?",
        "options": [
            "EV5",
            "FU6",
            "EW5",
            "EU5",
        ],
        "correct_option_index": 0,
        "explanation": "1st letter moves forward (A->B->C->D->E). 2nd letter moves backward from Z (Z->Y->X->W->V). Number increments by 1 (1->2->3->4->5). Result: EV5.",
    },
    {
        "id": "pyq_quant_07",
        "company": "TCS NQT 2024",
        "category": "Data Interpretation",
        "subtopic": "Table Chart Interpretation",
        "question": "[TCS NQT PYQ] The following table presents the campus placement statistics of Apex Institute of Technology across 4 branches:\n\n+------------+--------------------+------------------+\n| Branch     | Registered Batch   | Placed Students  |\n+------------+--------------------+------------------+\n| CSE        | 250                | 200              |\n| ECE        | 160                | 120              |\n| MECH       | 100                | 50               |\n| CIVIL      | 80                 | 32               |\n+------------+--------------------+------------------+\n\nWhich branch recorded the HIGHEST placement conversion rate?",
        "options": [
            "CSE (80.0%)",
            "ECE (75.0%)",
            "MECH (50.0%)",
            "CIVIL (40.0%)",
        ],
        "correct_option_index": 0,
        "explanation": "Placement rates: CSE = 200/250 = 80.0%; ECE = 120/160 = 75.0%; MECH = 50/100 = 50.0%; CIVIL = 32/80 = 40.0%. Highest is CSE at 80.0%.",
    },
    {
        "id": "pyq_quant_08",
        "company": "Amazon Campus Drive",
        "category": "Data Interpretation",
        "subtopic": "Bar Chart Sprint Metrics",
        "question": "[Amazon PYQ] The ASCII bar chart illustrates the completed story points across 4 engineering sprints:\n\nSprint 1 [40 pts] : ████████████████████\nSprint 2 [60 pts] : ██████████████████████████████\nSprint 3 [75 pts] : █████████████████████████████████████\nSprint 4 [90 pts] : █████████████████████████████████████████████\n\nWhat is the percentage growth in delivered velocity from Sprint 1 to Sprint 4?",
        "options": [
            "125.0%",
            "150.0%",
            "100.0%",
            "225.0%",
        ],
        "correct_option_index": 0,
        "explanation": "Growth = ((Sprint 4 - Sprint 1) / Sprint 1) * 100 = ((90 - 40) / 40) * 100 = (50 / 40) * 100 = 125.0%.",
    },
    {
        "id": "pyq_quant_09",
        "company": "Infosys Springboard",
        "category": "Quantitative Aptitude",
        "subtopic": "Ages & Proportions",
        "question": "[Infosys PYQ] Four years ago, the ratio of the age of a Senior Architect to a Junior Engineer was 2 : 1. At present, the ratio of their ages is 5 : 3. What is the current age of the Senior Architect?",
        "options": [
            "20 years",
            "24 years",
            "30 years",
            "18 years",
        ],
        "correct_option_index": 0,
        "explanation": "Let present ages be 5x and 3x. Four years ago: (5x - 4) / (3x - 4) = 2 / 1 => 5x - 4 = 6x - 8 => x = 4. Present age of Senior Architect = 5 * 4 = 20 years.",
    },
    {
        "id": "pyq_quant_10",
        "company": "Capgemini Excellence",
        "category": "Data Interpretation",
        "subtopic": "Data Chart Budget Allocation",
        "question": "[Capgemini PYQ] An IT company distributes its ₹200 Crore annual R&D capital expenditure as follows:\n- Generative AI & LLMs : 40%\n- Cloud & DevOps       : 25%\n- Cybersecurity        : 20%\n- Legacy Maintenance   : 15%\n\nHow much MORE capital is invested in Generative AI than in Cybersecurity?",
        "options": [
            "₹40 Crores",
            "₹30 Crores",
            "₹50 Crores",
            "₹25 Crores",
        ],
        "correct_option_index": 0,
        "explanation": "Difference = 40% - 20% = 20% of ₹200 Crores = 0.20 * 200 = ₹40 Crores.",
    },
    {
        "id": "pyq_quant_11",
        "company": "Accenture Assessment",
        "category": "Quantitative Aptitude",
        "subtopic": "Successive Discounts",
        "question": "[Accenture PYQ] An enterprise software retailer offers two successive discounts of 20% and 15% on a developer workstation listed at ₹1,00,000. What is the single equivalent overall discount percentage?",
        "options": [
            "32.0%",
            "35.0%",
            "30.0%",
            "28.5%",
        ],
        "correct_option_index": 0,
        "explanation": "Equivalent discount = x + y - (x * y) / 100 = 20 + 15 - (20 * 15) / 100 = 35 - 3 = 32.0%.",
    },
    {
        "id": "pyq_quant_12",
        "company": "TCS NQT 2024",
        "category": "Logical Reasoning",
        "subtopic": "Number Sequence Patterns",
        "question": "[TCS NQT PYQ] Find the missing number in the computational sequence: 4, 18, 48, 100, 180, ______?",
        "options": [
            "294",
            "284",
            "312",
            "276",
        ],
        "correct_option_index": 0,
        "explanation": "The formula follows n^3 - n^2 starting with n=2: 2^3-2^2=4; 3^3-3^2=18; 4^3-4^2=48; 5^3-5^2=100; 6^3-6^2=180; 7^3-7^2 = 343 - 49 = 294.",
    },
]


def get_curated_placement_test(num_per_section: int = 10) -> Dict[str, Any]:
    """
    Generates a 2-section Campus Placement Comprehensive Test.
    Section 1: 10 Verbal & Corporate Grammar questions (Company PYQs)
    Section 2: 10 Quantitative, Logic, Series & Data Chart questions (Company PYQs)
    Both sections are randomized per candidate session.
    """
    sec1_pool = list(SECTION_1_QUESTIONS)
    sec2_pool = list(SECTION_2_QUESTIONS)

    random.shuffle(sec1_pool)
    random.shuffle(sec2_pool)

    sec1_selected = sec1_pool[:num_per_section]
    sec2_selected = sec2_pool[:num_per_section]

    def sanitize(q_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [
            {
                "id": q["id"],
                "company": q.get("company", "Campus Placement PYQ"),
                "category": q["category"],
                "subtopic": q.get("subtopic", "General"),
                "question": q["question"],
                "options": q["options"],
            }
            for q in q_list
        ]

    return {
        "title": "Campus Placement Comprehensive Test (Company PYQs)",
        "subtitle": "Two-Section Timed Assessment simulated for Tier-1 drives (TCS, Infosys, Accenture, Cognizant, Wipro, Amazon)",
        "total_sections": 2,
        "total_questions": len(sec1_selected) + len(sec2_selected),
        "total_duration_minutes": 20,
        "sections": [
            {
                "section_id": "sec_verbal_grammar",
                "section_number": 1,
                "title": "Section 1: Verbal Ability & Business English Grammar",
                "badge": "Mandatory First Round",
                "company_tags": ["TCS NQT", "Infosys", "Accenture", "Cognizant", "Wipro"],
                "instructions": "10 questions on corporate grammar, error spotting, conditionals, and syntax. You must finish and lock this section before Section 2 unlocks.",
                "duration_seconds": 600,
                "questions": sanitize(sec1_selected),
            },
            {
                "section_id": "sec_quant_di",
                "section_number": 2,
                "title": "Section 2: Quantitative Aptitude, Logic & Data Charts",
                "badge": "Unlocks After Section 1",
                "company_tags": ["TCS NQT", "Infosys", "Deloitte", "Amazon", "Capgemini"],
                "instructions": "10 questions on percentages, ratios, mixtures, next word sequences, and data interpretation charts. Unlocked upon Section 1 completion.",
                "duration_seconds": 600,
                "questions": sanitize(sec2_selected),
            },
        ],
    }


def evaluate_placement_test(
    section1_answers: Dict[str, int],
    section2_answers: Dict[str, int],
    total_time_taken_seconds: int = 0,
) -> Dict[str, Any]:
    """
    Evaluates both sections of the Campus Placement Comprehensive Test.
    Provides section-wise scores, CEFR rating, company cutoffs cleared, and detailed solution reviews.
    """
    all_q_map = {q["id"]: q for q in SECTION_1_QUESTIONS + SECTION_2_QUESTIONS}

    # Evaluate Section 1
    sec1_attempted = 0
    sec1_correct = 0
    sec1_review = []
    for qid, sel in section1_answers.items():
        q = all_q_map.get(qid)
        if not q:
            continue
        sec1_attempted += 1
        is_correct = int(sel) == q["correct_option_index"]
        if is_correct:
            sec1_correct += 1
        sec1_review.append({
            "question_id": qid,
            "company": q.get("company", "Company PYQ"),
            "category": q["category"],
            "subtopic": q["subtopic"],
            "question": q["question"],
            "options": q["options"],
            "selected_option_index": int(sel),
            "correct_option_index": q["correct_option_index"],
            "is_correct": is_correct,
            "explanation": q["explanation"],
        })

    # Evaluate Section 2
    sec2_attempted = 0
    sec2_correct = 0
    sec2_review = []
    for qid, sel in section2_answers.items():
        q = all_q_map.get(qid)
        if not q:
            continue
        sec2_attempted += 1
        is_correct = int(sel) == q["correct_option_index"]
        if is_correct:
            sec2_correct += 1
        sec2_review.append({
            "question_id": qid,
            "company": q.get("company", "Company PYQ"),
            "category": q["category"],
            "subtopic": q["subtopic"],
            "question": q["question"],
            "options": q["options"],
            "selected_option_index": int(sel),
            "correct_option_index": q["correct_option_index"],
            "is_correct": is_correct,
            "explanation": q["explanation"],
        })

    sec1_total = len(section1_answers) if section1_answers else 10
    sec2_total = len(section2_answers) if section2_answers else 10
    total_questions = sec1_total + sec2_total
    total_correct = sec1_correct + sec2_correct

    sec1_pct = round((sec1_correct / max(1, sec1_total)) * 100, 1)
    sec2_pct = round((sec2_correct / max(1, sec2_total)) * 100, 1)
    overall_pct = round((total_correct / max(1, total_questions)) * 100, 1)

    # CEFR rating for Section 1
    if sec1_pct >= 85:
        cefr = "C1 / Advanced Professional"
    elif sec1_pct >= 70:
        cefr = "B2 / Vantage Working Proficiency"
    elif sec1_pct >= 50:
        cefr = "B1 / Threshold Intermediate"
    else:
        cefr = "A2 / Waystage Basic"

    # Company Eligibility Assessment
    eligible_companies = []
    if overall_pct >= 80:
        eligible_companies.extend(["TCS Digital (7.5 LPA)", "Infosys Specialist Programmer (9.5 LPA)", "Amazon SDE-1 (24.0 LPA)", "Accenture Advanced ASE (6.5 LPA)"])
    elif overall_pct >= 65:
        eligible_companies.extend(["TCS Ninja (3.6 LPA)", "Infosys Systems Engineer (4.5 LPA)", "Cognizant GenC Next (6.0 LPA)", "Wipro Elite (4.0 LPA)", "Accenture ASE (4.5 LPA)"])
    elif overall_pct >= 50:
        eligible_companies.extend(["Mass IT Recruiter Baseline (3.2 - 3.8 LPA)", "Capgemini Analyst Drive"])
    else:
        eligible_companies.append("Foundation Stage (Remediation Needed Before Drives)")

    if overall_pct >= 85:
        badge = "Gold Tier-1 Product Cleared"
        readiness = "High Placement Competency (Tier-1 Standard)"
    elif overall_pct >= 70:
        badge = "Silver Campus Placement Scholar"
        readiness = "Placement Cleared (Good Technical & Verbal Base)"
    elif overall_pct >= 50:
        badge = "Bronze Placement Aspirant"
        readiness = "Moderate Readiness (Practice Speed & Accuracy)"
    else:
        badge = "Academic Foundation"
        readiness = "Needs Immediate Improvement"

    return {
        "total_questions": total_questions,
        "total_attempted": sec1_attempted + sec2_attempted,
        "total_correct": total_correct,
        "overall_percentage": overall_pct,
        "readiness_status": readiness,
        "badge_awarded": badge,
        "section_1_summary": {
            "title": "Verbal Ability & Corporate Grammar",
            "total": sec1_total,
            "correct": sec1_correct,
            "percentage": sec1_pct,
            "cefr_band": cefr,
        },
        "section_2_summary": {
            "title": "Quantitative Aptitude, Logic & Data Charts",
            "total": sec2_total,
            "correct": sec2_correct,
            "percentage": sec2_pct,
        },
        "eligible_companies": eligible_companies,
        "detailed_review": sec1_review + sec2_review,
        "total_time_taken_seconds": total_time_taken_seconds,
    }
