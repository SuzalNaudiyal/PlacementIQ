"""
Aptitude & Technical MCQ Question Bank.
Covers Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Core CS Fundamentals.
"""

from typing import List, Dict, Any
import random


APTITUDE_QUESTIONS: List[Dict[str, Any]] = [
    # --- QUANTITATIVE APTITUDE ---
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
        "question": "A packet transmitted across a network travels at 60 km/h upstream and returns along the same fiber path at 90 km/h downstream. What is the average transmission speed for the entire round trip?",
        "options": [
            "72 km/h",
            "75 km/h",
            "78 km/h",
            "70 km/h",
        ],
        "correct_option_index": 0,  # 72 km/h
        "explanation": "Average speed for equal distances = (2 * x * y) / (x + y) = (2 * 60 * 90) / (60 + 90) = 10800 / 150 = 72 km/h.",
    },
    {
        "id": "quant_03",
        "category": "Quantitative Aptitude",
        "subtopic": "Probability",
        "question": "Two unbiased dice are rolled simultaneously during a random hashing experiment. What is the probability that the sum of the numbers is greater than 8?",
        "options": [
            "5/18",
            "7/36",
            "1/6",
            "11/36",
        ],
        "correct_option_index": 0,  # 10/36 = 5/18
        "explanation": "Sums > 8 are 9, 10, 11, 12. Pairs: (3,6),(4,5),(5,4),(6,3) [4]; (4,6),(5,5),(6,4) [3]; (5,6),(6,5) [2]; (6,6) [1]. Total favorable outcomes = 10. Probability = 10/36 = 5/18.",
    },
    {
        "id": "quant_04",
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

    # --- LOGICAL REASONING ---
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
        "explanation": "The pattern follows n^3 - n^2 (or n^2 * (n-1)) starting from n=2: 2^3 - 2^2 = 4, 3^3 - 3^2 = 18, 4^3 - 4^2 = 48, 5^3 - 5^2 = 100, 6^3 - 6^2 = 180, 7^3 - 7^2 = 343 - 49 = 294.",
    },
    {
        "id": "logic_02",
        "category": "Logical Reasoning",
        "subtopic": "Syllogisms",
        "question": "Statements: (1) All microservices are scalable. (2) Some scalable systems are fault-tolerant.\nConclusions: I. Some microservices are fault-tolerant. II. All fault-tolerant systems are microservices.",
        "options": [
            "Only conclusion I follows",
            "Only conclusion II follows",
            "Neither conclusion I nor II follows",
            "Both conclusions I and II follow",
        ],
        "correct_option_index": 2,  # Neither follows
        "explanation": "Since the middle term 'scalable' is not distributed in both premises, no definite relation can be inferred between microservices and fault-tolerant systems. Therefore, neither follows.",
    },
    {
        "id": "logic_03",
        "category": "Logical Reasoning",
        "subtopic": "Coding-Decoding",
        "question": "In a certain cybersecurity encoding scheme, 'ALGORITHM' is encoded as 'CLIQTCKPK'. How will 'DATABASE' be encoded under the same cipher rule?",
        "options": [
            "FCVCDCUH",
            "FCVCBCTF",
            "FBVCBCUG",
            "FCVCBCUG",
        ],
        "correct_option_index": 1,  # +2, -2, +2, -2 pattern
        "explanation": "Letters shift alternating (+2, -2, +2, -2...): D(+2)=F, A(-2)=Y or here: A+2=C, L-3... A->C (+2), L->I (-3), G->I (+2), O->Q (+2)... In alternating +2, -2, D(+2)->F, A(-2)->Y or D(+2)->F, A(+2)->C, T(+2)->V, A(+2)->C, B(+2)->D... Looking at pattern: D->F, A->C, T->V, A->C, B->D, A->C, S->U, E->G.",
    },

    # --- VERBAL ABILITY ---
    {
        "id": "verbal_01",
        "category": "Verbal Ability",
        "subtopic": "Sentence Correction",
        "question": "Identify the grammatically correct sentence for an institutional engineering report:",
        "options": [
            "Neither the senior architect nor the junior developers was aware of the database deadlock.",
            "Neither the senior architect nor the junior developers were aware of the database deadlock.",
            "Neither the senior architect or the junior developers were aware of the database deadlock.",
            "Neither the senior architect nor the junior developers are been aware of the database deadlock.",
        ],
        "correct_option_index": 1,
        "explanation": "In 'Neither... nor' constructions, the verb agrees with the subject closest to it. Here, 'the junior developers' is plural, so the plural verb 'were' is correct.",
    },
    {
        "id": "verbal_02",
        "category": "Verbal Ability",
        "subtopic": "Vocabulary & Context",
        "question": "Choose the word most nearly OPPOSITE in meaning to 'EPHEMERAL' as used in cloud computing infrastructure:",
        "options": [
            "Transient",
            "Permanent",
            "Stateless",
            "Decentralized",
        ],
        "correct_option_index": 1,  # Permanent
        "explanation": "'Ephemeral' means lasting for a very short time (transient/temporary). Its exact antonym is 'Permanent' or 'Persistent'.",
    },
    {
        "id": "verbal_03",
        "category": "Verbal Ability",
        "subtopic": "Error Spotting",
        "question": "Select the part with an error: 'The team of DevOps engineers (A) have deployed the Kubernetes cluster (B) despite of the network issues (C) encountered yesterday (D).'",
        "options": [
            "A",
            "B",
            "C",
            "D",
        ],
        "correct_option_index": 2,  # 'despite of' is wrong, should be 'despite' or 'in spite of'
        "explanation": "Part (C) is erroneous. 'Despite' is never followed by 'of'. It should either be 'despite the network issues' or 'in spite of the network issues'.",
    },

    # --- CORE COMPUTER SCIENCE ---
    {
        "id": "cs_01",
        "category": "Core CS Fundamentals",
        "subtopic": "Database Management Systems",
        "question": "Which of the following ACID properties ensures that concurrent execution of transactions results in a system state that would be obtained if transactions were executed sequentially?",
        "options": [
            "Atomicity",
            "Consistency",
            "Isolation",
            "Durability",
        ],
        "correct_option_index": 2,  # Isolation
        "explanation": "Isolation guarantees that concurrent transactions do not interfere with each other and execute as if they are serial.",
    },
    {
        "id": "cs_02",
        "category": "Core CS Fundamentals",
        "subtopic": "Operating Systems",
        "question": "In operating systems, which condition is NOT one of Coffman's four mandatory conditions required for a system deadlock to occur?",
        "options": [
            "Mutual Exclusion",
            "Hold and Wait",
            "Preemption Allowed",
            "Circular Wait",
        ],
        "correct_option_index": 2,  # Preemption Allowed (Deadlock requires NO preemption)
        "explanation": "The 4 Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlock cannot persist.",
    },
    {
        "id": "cs_03",
        "category": "Core CS Fundamentals",
        "subtopic": "Data Structures & Algorithms",
        "question": "What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST) with N nodes?",
        "options": [
            "O(log N)",
            "O(N log N)",
            "O(N)",
            "O(1)",
        ],
        "correct_option_index": 2,  # O(N)
        "explanation": "In an unbalanced BST (e.g. skewed into a linked list when elements are inserted in sorted order), the height of the tree becomes N, resulting in O(N) worst-case search complexity.",
    },
    {
        "id": "cs_04",
        "category": "Core CS Fundamentals",
        "subtopic": "Computer Networks",
        "question": "Which HTTP status code should a RESTful API server return when an authenticated client attempts to access a protected administrative resource without sufficient role privileges?",
        "options": [
            "401 Unauthorized",
            "403 Forbidden",
            "404 Not Found",
            "422 Unprocessable Entity",
        ],
        "correct_option_index": 1,  # 403 Forbidden
        "explanation": "401 indicates lack of valid authentication credentials, whereas 403 Forbidden indicates the server understands the client's identity but refuses authorization due to insufficient permissions.",
    },
]


def get_curated_aptitude_test(num_questions: int = 10) -> List[Dict[str, Any]]:
    """
    Returns balanced set of questions across all categories without leaking correct answers.
    """
    # Group by category
    cats = {}
    for q in APTITUDE_QUESTIONS:
        c = q["category"]
        cats.setdefault(c, []).append(q)

    selected = []
    # Take at least 2 from each category
    for c, qlist in cats.items():
        shuffled = list(qlist)
        random.shuffle(shuffled)
        selected.extend(shuffled[:2])

    # If more needed, fill from remaining
    remaining = [q for q in APTITUDE_QUESTIONS if q not in selected]
    random.shuffle(remaining)
    needed = max(0, num_questions - len(selected))
    selected.extend(remaining[:needed])

    # Sanitize: Remove correct_option_index and explanation before sending to candidate!
    sanitized = []
    for q in selected[:num_questions]:
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
    Computes total score, percentage, category-wise breakdown, and detailed explanations.
    """
    total = len(APTITUDE_QUESTIONS)
    # Map questions by ID
    qmap = {q["id"]: q for q in APTITUDE_QUESTIONS}

    attempted = 0
    correct = 0
    cat_stats: Dict[str, Dict[str, int]] = {}
    review_items = []

    for qid, q in qmap.items():
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
    overall_pct = round((correct / total) * 100, 1)

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

