"""
Aptitude & Technical MCQ Question Bank.
Covers:
- Percentages & Profit/Loss/Discount
- Ratios & Proportions, Mixtures, Ages
- Logical Series & "Find Next Word / Letter"
- Data Interpretation / Markdown & ASCII Charts/Tables
- Core Computer Science Fundamentals

Supports dynamic category balancing and full session-based randomization so tests are never identical.
"""

from typing import List, Dict, Any
import random
import copy


APTITUDE_QUESTIONS: List[Dict[str, Any]] = [
    # =========================================================================
    # 1. PERCENTAGES & PROFIT / LOSS / DISCOUNT
    # =========================================================================
    {
        "id": "pct_01",
        "category": "Quantitative Aptitude",
        "subtopic": "Percentages & Profit",
        "question": "A cloud subscription plan is listed at 25% above cost price. If a promotional discount of 10% is offered to university students, what is the net profit percentage for the SaaS vendor?",
        "options": [
            "12.5%",
            "15.0%",
            "10.0%",
            "13.5%",
        ],
        "correct_option_index": 0,  # 12.5%
        "explanation": "Let Cost = 100. Marked Price = 125. Selling Price = 125 - (10% of 125) = 125 - 12.5 = 112.5. Net profit = 12.5%.",
    },
    {
        "id": "pct_02",
        "category": "Quantitative Aptitude",
        "subtopic": "Percentages & Profit",
        "question": "A software engineer receives an annual salary hike of 20% in Year 1, but due to market correction, the compensation is reduced by 10% in Year 2. What is the net percentage change in the engineer's salary compared to the starting salary?",
        "options": [
            "8% increase",
            "10% increase",
            "5% increase",
            "No change (0%)",
        ],
        "correct_option_index": 0,  # 8% increase
        "explanation": "Let initial salary = 100. After Year 1 (+20%) = 120. After Year 2 (-10% of 120 = 12) = 108. Net change = 108 - 100 = 8% increase.",
    },
    {
        "id": "pct_03",
        "category": "Quantitative Aptitude",
        "subtopic": "Percentages & Profit",
        "question": "In an engineering batch of 600 students, 70% are enrolled in Computer Science and 30% in Mechanical. If 60% of CS students and 40% of Mechanical students secure placements in the Day-1 drive, what is the overall placement percentage of the entire batch?",
        "options": [
            "54.0%",
            "50.0%",
            "56.0%",
            "58.5%",
        ],
        "correct_option_index": 0,  # 54%
        "explanation": "CS students = 70% of 600 = 420. Placed CS = 60% of 420 = 252. Mech students = 180. Placed Mech = 40% of 180 = 72. Total placed = 252 + 72 = 324. Percentage = (324 / 600) * 100 = 54.0%.",
    },
    {
        "id": "pct_04",
        "category": "Quantitative Aptitude",
        "subtopic": "Percentages & Profit",
        "question": "An e-commerce retailer offers two successive discounts of 20% and 15% on a developer workstation listed at ₹1,00,000. What is the single equivalent overall discount percentage?",
        "options": [
            "32.0%",
            "35.0%",
            "30.0%",
            "33.5%",
        ],
        "correct_option_index": 0,  # 32%
        "explanation": "Equivalent discount = x + y - (x * y / 100) = 20 + 15 - (20 * 15 / 100) = 35 - 3 = 32.0%.",
    },

    # =========================================================================
    # 2. RATIOS & PROPORTIONS, MIXTURES & AGES
    # =========================================================================
    {
        "id": "ratio_01",
        "category": "Quantitative Aptitude",
        "subtopic": "Ratios & Proportions",
        "question": "In a software development department, the ratio of backend developers to frontend developers is 5:3. If 6 new frontend developers join and 2 backend developers leave, the ratio becomes 1:1. How many total developers were in the department initially?",
        "options": [
            "32 developers",
            "28 developers",
            "36 developers",
            "24 developers",
        ],
        "correct_option_index": 0,  # 32
        "explanation": "Let backend = 5x, frontend = 3x. After changes: (5x - 2) / (3x + 6) = 1/1 => 5x - 2 = 3x + 6 => 2x = 8 => x = 4. Initial total = 5x + 3x = 8x = 8 * 4 = 32 developers.",
    },
    {
        "id": "ratio_02",
        "category": "Quantitative Aptitude",
        "subtopic": "Ratios & Proportions",
        "question": "Two cluster servers A and B process incoming HTTP requests in the ratio 7:4. If server A processes 350 requests per second, how many requests per second does server B process?",
        "options": [
            "200 req/s",
            "180 req/s",
            "220 req/s",
            "150 req/s",
        ],
        "correct_option_index": 0,  # 200 req/s
        "explanation": "7 parts = 350 req/s => 1 part = 50 req/s. Server B (4 parts) = 4 * 50 = 200 req/s.",
    },
    {
        "id": "ratio_03",
        "category": "Quantitative Aptitude",
        "subtopic": "Ratios & Proportions",
        "question": "In a 90-liter memory buffer allocation, the ratio of cached data to raw payload is 2:1. How many liters of raw payload must be added to make the ratio 1:2?",
        "options": [
            "90 liters",
            "60 liters",
            "75 liters",
            "45 liters",
        ],
        "correct_option_index": 0,  # 90 liters
        "explanation": "Cached data = (2/3) * 90 = 60 liters; raw payload = 30 liters. We want cached/raw = 1/2: 60 / (30 + x) = 1/2 => 30 + x = 120 => x = 90 liters.",
    },
    {
        "id": "ratio_04",
        "category": "Quantitative Aptitude",
        "subtopic": "Ratios & Proportions",
        "question": "The present ages of a senior tech lead and a junior developer are in the ratio 5:3. Four years ago, the ratio of their ages was 2:1. What is the present age of the senior tech lead?",
        "options": [
            "20 years",
            "25 years",
            "30 years",
            "35 years",
        ],
        "correct_option_index": 0,  # 20 years
        "explanation": "Let present ages be 5x and 3x. Four years ago: (5x - 4) / (3x - 4) = 2/1 => 5x - 4 = 6x - 8 => x = 4. Senior tech lead age = 5 * 4 = 20 years.",
    },
    {
        "id": "quant_01",
        "category": "Quantitative Aptitude",
        "subtopic": "Time & Work",
        "question": "A can finish a software module in 12 days, and B can finish the same module in 18 days. If they work together for 4 days, what fraction of the work is left unfinished?",
        "options": [
            "5/9",
            "4/9",
            "2/3",
            "1/3",
        ],
        "correct_option_index": 1,  # 4/9
        "explanation": "1 day's work of (A + B) = 1/12 + 1/18 = 5/36. In 4 days, work done = 4 * (5/36) = 20/36 = 5/9. Unfinished work = 1 - 5/9 = 4/9.",
    },
    {
        "id": "quant_02",
        "category": "Quantitative Aptitude",
        "subtopic": "Speed, Time & Distance",
        "question": "A network packet travels at 60 km/h upstream and returns along the same fiber path at 90 km/h downstream. What is the average transmission speed for the entire round trip?",
        "options": [
            "72 km/h",
            "75 km/h",
            "78 km/h",
            "70 km/h",
        ],
        "correct_option_index": 0,  # 72 km/h
        "explanation": "Average speed for equal distances = (2 * x * y) / (x + y) = (2 * 60 * 90) / (60 + 90) = 10800 / 150 = 72 km/h.",
    },

    # =========================================================================
    # 3. WORD SERIES & "FIND NEXT WORD / LETTER"
    # =========================================================================
    {
        "id": "series_word_01",
        "category": "Logical Reasoning",
        "subtopic": "Word Series & Sequences",
        "question": "Find the NEXT WORD in the given series based on initial vowel progression: APPLE, ELEPHANT, IGLOO, OCTOPUS, ?",
        "options": [
            "UMBRELLA",
            "TIGER",
            "EAGLE",
            "ORANGE",
        ],
        "correct_option_index": 0,  # UMBRELLA
        "explanation": "The series follows the chronological English vowels as starting letters: A (Apple), E (Elephant), I (Igloo), O (Octopus), and next must be U -> Umbrella.",
    },
    {
        "id": "series_word_02",
        "category": "Logical Reasoning",
        "subtopic": "Word Series & Sequences",
        "question": "Find the NEXT WORD in the sequence: C, CAT, CHAT, CRANE, ?",
        "options": [
            "CODING",
            "CLOUD",
            "CUP",
            "CARPET",
        ],
        "correct_option_index": 0,  # CODING (or 6 letters starting with C)
        "explanation": "The sequence follows words starting with 'C' with increasing letter count: C (1), CAT (3), CHAT (4), CRANE (5), next is a 6-letter word starting with C: CODING (6).",
    },
    {
        "id": "series_letter_01",
        "category": "Logical Reasoning",
        "subtopic": "Letter Series",
        "question": "Find the NEXT TERM in the alphanumeric series: AZ1, BY2, CX3, DW4, ?",
        "options": [
            "EV5",
            "FU6",
            "EW5",
            "EU5",
        ],
        "correct_option_index": 0,  # EV5
        "explanation": "1st letter moves forward (A, B, C, D -> E). 2nd letter moves backward from Z (Z, Y, X, W -> V). Number increases (1, 2, 3, 4 -> 5). Thus, EV5.",
    },
    {
        "id": "series_letter_02",
        "category": "Logical Reasoning",
        "subtopic": "Letter Series",
        "question": "Find the NEXT TERM in the sequence: B2D, D4F, F6H, H8J, ?",
        "options": [
            "J10L",
            "K10L",
            "J10M",
            "I10K",
        ],
        "correct_option_index": 0,  # J10L
        "explanation": "First letter: B(+2)=D(+2)=F(+2)=H(+2)=J. Number: 2(+2)=4(+2)=6(+2)=8(+2)=10. Last letter: D(+2)=F(+2)=H(+2)=J(+2)=L. Next is J10L.",
    },
    {
        "id": "logic_01",
        "category": "Logical Reasoning",
        "subtopic": "Number Series",
        "question": "Find the missing number in the sequence: 4, 18, 48, 100, 180, ?",
        "options": [
            "294",
            "284",
            "312",
            "276",
        ],
        "correct_option_index": 0,  # 294
        "explanation": "The pattern follows n^3 - n^2 starting from n=2: 2^3-2^2=4, 3^3-3^2=18, 4^3-4^2=48, 5^3-5^2=100, 6^3-6^2=180, 7^3-7^2 = 343 - 49 = 294.",
    },
    {
        "id": "series_num_02",
        "category": "Logical Reasoning",
        "subtopic": "Number Series",
        "question": "Find the next number in the series: 7, 14, 42, 168, 840, ?",
        "options": [
            "5040",
            "4200",
            "5880",
            "4800",
        ],
        "correct_option_index": 0,  # 5040
        "explanation": "Multipliers increase sequentially: 7 * 2 = 14; 14 * 3 = 42; 42 * 4 = 168; 168 * 5 = 840; 840 * 6 = 5040.",
    },

    # =========================================================================
    # 4. DATA INTERPRETATION / CHART & TABLE QUESTIONS
    # =========================================================================
    {
        "id": "di_chart_01",
        "category": "Data Interpretation",
        "subtopic": "Table Chart Analysis",
        "question": (
            "Consider the University Placement Data Table below:\n\n"
            "| Branch | Total Eligible | Placed Students | Average Package |\n"
            "| :--- | :--- | :--- | :--- |\n"
            "| CSE | 200 | 180 | 14.5 LPA |\n"
            "| IT | 150 | 120 | 12.0 LPA |\n"
            "| ECE | 160 | 96 | 8.5 LPA |\n"
            "| ME | 100 | 50 | 6.5 LPA |\n\n"
            "What is the ratio of placed students in CSE to placed students in ECE?"
        ),
        "options": [
            "15 : 8",
            "9 : 5",
            "12 : 7",
            "3 : 2",
        ],
        "correct_option_index": 0,  # 180 / 96 = 15 / 8
        "explanation": "Placed in CSE = 180, Placed in ECE = 96. Ratio = 180 : 96. Dividing both by 12 gives 15 : 8.",
    },
    {
        "id": "di_chart_02",
        "category": "Data Interpretation",
        "subtopic": "Table Chart Analysis",
        "question": (
            "Refer to the Placement Data Table:\n\n"
            "| Branch | Total Eligible | Placed Students | Average Package |\n"
            "| :--- | :--- | :--- | :--- |\n"
            "| CSE | 200 | 180 | 14.5 LPA |\n"
            "| IT | 150 | 120 | 12.0 LPA |\n"
            "| ECE | 160 | 96 | 8.5 LPA |\n"
            "| ME | 100 | 50 | 6.5 LPA |\n\n"
            "Which branch recorded the HIGHEST placement percentage, and what was that percentage?"
        ),
        "options": [
            "CSE (90%)",
            "IT (80%)",
            "ECE (60%)",
            "ME (50%)",
        ],
        "correct_option_index": 0,  # CSE = 180/200 = 90%
        "explanation": "CSE = (180/200)*100 = 90%; IT = (120/150)*100 = 80%; ECE = (96/160)*100 = 60%; ME = (50/100)*100 = 50%. Highest is CSE at 90%.",
    },
    {
        "id": "di_chart_03",
        "category": "Data Interpretation",
        "subtopic": "Bar Chart Spend Analysis",
        "question": (
            "A SaaS tech startup's quarterly AWS Cloud Compute Spend is shown below:\n\n"
            "Q1: [====] ₹40 Lakhs\n"
            "Q2: [======] ₹60 Lakhs\n"
            "Q3: [=========] ₹90 Lakhs\n"
            "Q4: [============] ₹120 Lakhs\n\n"
            "What was the percentage increase in cloud compute spend from Q1 to Q4?"
        ),
        "options": [
            "200%",
            "300%",
            "150%",
            "80%",
        ],
        "correct_option_index": 0,  # (120 - 40) / 40 * 100 = 200%
        "explanation": "Increase = 120 - 40 = 80 Lakhs. Percentage increase = (80 / 40) * 100 = 200%.",
    },

    # =========================================================================
    # 5. CORE COMPUTER SCIENCE & VERBAL APTITUDE
    # =========================================================================
    {
        "id": "cs_01",
        "category": "Core CS Fundamentals",
        "subtopic": "Data Structures & Algorithms",
        "question": "What is the worst-case time complexity of searching an element in an unbalanced Binary Search Tree (BST)?",
        "options": [
            "O(log N)",
            "O(1)",
            "O(N)",
            "O(N log N)",
        ],
        "correct_option_index": 2,  # O(N)
        "explanation": "In an unbalanced BST (skewed), the height can degrade to N, resulting in O(N) search complexity.",
    },
    {
        "id": "cs_02",
        "category": "Core CS Fundamentals",
        "subtopic": "Operating Systems",
        "question": "In operating systems, which condition is NOT one of Coffman's four mandatory conditions required for a system deadlock to occur?",
        "options": [
            "Preemption Allowed",
            "Mutual Exclusion",
            "Hold and Wait",
            "Circular Wait",
        ],
        "correct_option_index": 0,  # Preemption Allowed
        "explanation": "The 4 Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlock cannot persist.",
    },
    {
        "id": "cs_03",
        "category": "Core CS Fundamentals",
        "subtopic": "Database Management Systems",
        "question": "Which of the following ACID properties ensures that concurrent execution of transactions results in a system state that would be obtained if transactions were executed sequentially?",
        "options": [
            "Isolation",
            "Atomicity",
            "Consistency",
            "Durability",
        ],
        "correct_option_index": 0,  # Isolation
        "explanation": "Isolation guarantees that concurrent transactions do not interfere with each other and execute as if they are serial.",
    },
]


def get_curated_aptitude_test(num_questions: int = 10) -> List[Dict[str, Any]]:
    """
    Returns a completely randomized, category-balanced set of questions.
    Ensures 'har baar same na ho' (every attempt is dynamically shuffled and unique).
    Sanitizes questions by stripping correct_option_index and explanation before sending to candidate.
    """
    # 1. Group questions by subcategory / category
    cat_map: Dict[str, List[Dict[str, Any]]] = {}
    for q in APTITUDE_QUESTIONS:
        cat = q["category"]
        cat_map.setdefault(cat, []).append(q)

    chosen: List[Dict[str, Any]] = []

    # 2. Pick balanced samples randomly from each category
    # Ensure Percentages/Ratios, Word Series, Data Charts, and CS are guaranteed
    for cat, q_list in cat_map.items():
        sample_size = min(len(q_list), max(1, num_questions // len(cat_map)))
        chosen.extend(random.sample(q_list, sample_size))

    # 3. Fill up to num_questions if needed from remaining questions
    chosen_ids = {q["id"] for q in chosen}
    remaining = [q for q in APTITUDE_QUESTIONS if q["id"] not in chosen_ids]
    if len(chosen) < num_questions and remaining:
        extra_needed = min(len(remaining), num_questions - len(chosen))
        chosen.extend(random.sample(remaining, extra_needed))

    # 4. If more than num_questions, trim randomly
    if len(chosen) > num_questions:
        chosen = random.sample(chosen, num_questions)

    # 5. Full random shuffle of question sequence
    random.shuffle(chosen)

    # 6. Sanitize without leaking answers
    sanitized: List[Dict[str, Any]] = []
    for q in chosen:
        sanitized.append({
            "id": q["id"],
            "category": q["category"],
            "subtopic": q.get("subtopic", "General"),
            "question": q["question"],
            "options": q["options"],
        })

    return sanitized


def evaluate_aptitude_test(answers: Dict[str, int]) -> Dict[str, Any]:
    """
    Grade candidate answers against source questions.
    Evaluates only the questions in the candidate's test session.
    Computes total score, percentage, category-wise breakdown, and detailed review.
    """
    qmap = {q["id"]: q for q in APTITUDE_QUESTIONS}
    legacy_aliases = {
        "quant_01": "quant_work_01",
        "quant_02": "quant_speed_01",
        "logic_01": "series_num_01",
    }
    for alias, target in legacy_aliases.items():
        if target in qmap and alias not in qmap:
            qmap[alias] = qmap[target]

    # Evaluate based on the questions that were part of this test
    test_q_ids = list(answers.keys()) if answers else [q["id"] for q in APTITUDE_QUESTIONS[:10]]
    total = len(test_q_ids) if test_q_ids else 10

    attempted = 0
    correct = 0
    cat_stats: Dict[str, Dict[str, int]] = {}
    review_items = []

    for qid in test_q_ids:
        q = qmap.get(qid)
        if not q:
            continue

        cat = q["category"]
        if cat not in cat_stats:
            cat_stats[cat] = {"total": 0, "correct": 0}
        cat_stats[cat]["total"] += 1

        selected_opt = answers.get(qid)
        is_attempted = selected_opt is not None
        is_correct = False

        if is_attempted:
            attempted += 1
            if int(selected_opt) == q["correct_option_index"]:
                correct += 1
                is_correct = True
                cat_stats[cat]["correct"] += 1

        review_items.append({
            "question_id": qid,
            "category": cat,
            "subtopic": q.get("subtopic", "General"),
            "question": q["question"],
            "options": q["options"],
            "selected_option_index": selected_opt,
            "correct_option_index": q["correct_option_index"],
            "is_correct": is_correct,
            "explanation": q["explanation"],
        })

    score_pct = round((correct / max(attempted, 1)) * 100, 1) if attempted > 0 else 0.0
    overall_pct = round((correct / max(total, 1)) * 100, 1)

    # Category analysis
    cat_breakdown = {}
    for cat, stat in cat_stats.items():
        tot = stat["total"]
        cor = stat["correct"]
        cat_breakdown[cat] = {
            "total": tot,
            "correct": cor,
            "accuracy_pct": round((cor / max(tot, 1)) * 100, 1),
        }

    # Grade determination
    if overall_pct >= 85:
        readiness = "Tier-1 Product Ready (High Competency)"
        badge = "Gold Aptitude Master"
    elif overall_pct >= 70:
        readiness = "Placement Cleared (Good Analytical Foundation)"
        badge = "Silver Quantitative Scholar"
    elif overall_pct >= 50:
        readiness = "Moderate Readiness (Focus on Weak Subtopics)"
        badge = "Bronze Solver"
    else:
        readiness = "Needs Immediate Improvement (Practice Required)"
        badge = "Foundation Stage"

    return {
        "total_questions": total,
        "attempted_questions": attempted,
        "correct_answers": correct,
        "overall_percentage": overall_pct,
        "attempted_accuracy_percentage": score_pct,
        "readiness_status": readiness,
        "badge_awarded": badge,
        "category_breakdown": cat_breakdown,
        "detailed_review": review_items,
    }
