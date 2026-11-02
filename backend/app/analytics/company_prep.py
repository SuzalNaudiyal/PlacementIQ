from typing import Dict, Any, List, Optional


COMPANY_CHEAT_SHEETS: List[Dict[str, Any]] = [
    {
        "id": "google",
        "company_name": "Google",
        "category": "Product Tier 1",
        "target_role": "Software Development Engineer - I (L3)",
        "ctc_range": "28 - 36 LPA",
        "logo_color": "#4285F4",
        "eligibility": {
            "min_cgpa": 8.0,
            "max_backlogs": 0,
            "allowed_branches": ["Computer Science", "Information Technology", "Electronics"],
            "min_coding_score": 85.0,
            "min_leetcode_mediums": 40,
        },
        "selection_process": [
            {
                "round_num": 1,
                "name": "Online Assessment (OA)",
                "duration": "90 mins",
                "focus": "2 Algorithmic coding problems on Google Online Challenge platform (DP, Segment Trees, Graphs).",
                "format": "Automated test suite (strict O(N log N) time & memory limits).",
            },
            {
                "round_num": 2,
                "name": "Technical Interview 1",
                "duration": "45 mins",
                "focus": "Data Structures, Recursion, Trees, Graphs, or Advanced Array manipulation on Google Docs.",
                "format": "Live coding without auto-complete; communication of complexity is heavily weighed.",
            },
            {
                "round_num": 3,
                "name": "Technical Interview 2",
                "duration": "45 mins",
                "focus": "Dynamic Programming, Topological Sort, or Trie-based lookup optimization.",
                "format": "Problem escalation: Starts medium, evolves into hard with follow-up constraints.",
            },
            {
                "round_num": 4,
                "name": "Googleyness & Behavioral",
                "duration": "45 mins",
                "focus": "Intellectual humility, navigating ambiguity, ethical tech choices, and bias for action.",
                "format": "STAR method scenario-based questions.",
            },
        ],
        "top_dsa_patterns": [
            {"pattern": "Graphs (BFS/DFS, Dijkstra, Topological Sort)", "frequency_pct": 89},
            {"pattern": "Dynamic Programming (2D/3D Grid & State Compression)", "frequency_pct": 84},
            {"pattern": "Binary Trees & Lowest Common Ancestor (LCA)", "frequency_pct": 78},
            {"pattern": "Monotonic Stack & Two Pointers", "frequency_pct": 71},
        ],
        "frequent_leetcode_questions": [
            {"title": "Course Schedule II", "difficulty": "Medium", "topic": "Topological Sort", "leetcode_url": "https://leetcode.com/problems/course-schedule-ii/"},
            {"title": "Word Ladder", "difficulty": "Hard", "topic": "BFS / Shortest Path", "leetcode_url": "https://leetcode.com/problems/word-ladder/"},
            {"title": "Decode String", "difficulty": "Medium", "topic": "Stack / Recursion", "leetcode_url": "https://leetcode.com/problems/decode-string/"},
            {"title": "Longest Increasing Path in a Matrix", "difficulty": "Hard", "topic": "DFS + Memoization", "leetcode_url": "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/"},
            {"title": "Trapping Rain Water", "difficulty": "Hard", "topic": "Two Pointers / Stack", "leetcode_url": "https://leetcode.com/problems/trapping-rain-water/"},
        ],
        "core_cs_questions": [
            "How does Virtual Memory translation work with Page Tables and TLB?",
            "Explain TCP 3-way handshake and why SYN flood attacks happen.",
            "Compare B-Trees vs LSM-Trees in storage engines.",
            "What is ACID and how does Multi-Version Concurrency Control (MVCC) operate in modern RDBMS?",
        ],
        "star_behavioral_questions": [
            "Tell me about a time you worked on a technically ambiguous project without clear requirements.",
            "Describe a situation where you had a strong technical disagreement with a team member.",
        ],
        "insider_tips": [
            "Google interviewers do NOT care if you finish fast; they care deeply about edge cases (null inputs, integer overflows, memory leaks).",
            "Always state brute-force first with Big-O, then iteratively optimize before writing a single line of code.",
            "Write modular helper functions rather than giant monolith methods.",
        ],
    },
    {
        "id": "microsoft",
        "company_name": "Microsoft",
        "category": "Product Tier 1",
        "target_role": "Software Engineer (Cloud & Systems)",
        "ctc_range": "22 - 28 LPA",
        "logo_color": "#00A4EF",
        "eligibility": {
            "min_cgpa": 7.5,
            "max_backlogs": 0,
            "allowed_branches": ["Computer Science", "Information Technology", "Electronics", "Electrical"],
            "min_coding_score": 75.0,
            "min_leetcode_mediums": 30,
        },
        "selection_process": [
            {
                "round_num": 1,
                "name": "Codility Online Assessment",
                "duration": "75 mins",
                "focus": "2-3 coding problems testing Arrays, String manipulation, and Hashing.",
                "format": "Codility platform (performance on hidden corner test suites is critical).",
            },
            {
                "round_num": 2,
                "name": "DSA & Low-Level Design Round 1",
                "duration": "45 mins",
                "focus": "Binary Trees, Linked Lists, Stack/Queue and Object-Oriented Design.",
                "format": "Interactive pair coding with Microsoft Teams + online collaborative editor.",
            },
            {
                "round_num": 3,
                "name": "DSA & Systems Round 2",
                "duration": "45 mins",
                "focus": "Graph algorithms or Trie + Deep discussion of college projects & Cloud/OS concepts.",
                "format": "Live coding + technical deep dive into candidate resume.",
            },
            {
                "round_num": 4,
                "name": "Director / AA (As Appropriate) Round",
                "duration": "45 mins",
                "focus": "High-level design, culture fit, Growth Mindset, and career vision.",
                "format": "Bar raiser style architectural & behavioral interview.",
            },
        ],
        "top_dsa_patterns": [
            {"pattern": "Binary Trees & BST (Inorder, LCA, Path Sum)", "frequency_pct": 91},
            {"pattern": "Linked Lists (Cycle Detection, Merge K Lists)", "frequency_pct": 82},
            {"pattern": "String Matching & Sliding Window", "frequency_pct": 76},
            {"pattern": "Breadth-First Search (Shortest Path)", "frequency_pct": 70},
        ],
        "frequent_leetcode_questions": [
            {"title": "Serialize and Deserialize Binary Tree", "difficulty": "Hard", "topic": "Tree / BFS", "leetcode_url": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/"},
            {"title": "Lowest Common Ancestor of a Binary Tree", "difficulty": "Medium", "topic": "Binary Tree", "leetcode_url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/"},
            {"title": "Merge k Sorted Lists", "difficulty": "Hard", "topic": "Priority Queue / MinHeap", "leetcode_url": "https://leetcode.com/problems/merge-k-sorted-lists/"},
            {"title": "Spiral Matrix", "difficulty": "Medium", "topic": "Matrix Traversal", "leetcode_url": "https://leetcode.com/problems/spiral-matrix/"},
            {"title": "LRU Cache", "difficulty": "Medium", "topic": "Doubly Linked List + HashMap", "leetcode_url": "https://leetcode.com/problems/lru-cache/"},
        ],
        "core_cs_questions": [
            "Difference between Process and Thread, and how Context Switching affects CPU cache.",
            "Explain Deadlock: Coffman conditions and how to prevent it in multi-threaded programs.",
            "What are Clustered vs Non-Clustered indexes in SQL?",
            "Explain Garbage Collection mechanisms in Java or C# runtime.",
        ],
        "star_behavioral_questions": [
            "How do you embody a Growth Mindset when faced with constructive feedback?",
            "Tell me about a technical project where you had to pivot direction midway.",
        ],
        "insider_tips": [
            "Microsoft heavily favors clean Object-Oriented code (proper naming, interface segregation).",
            "Be prepared to dry-run your code with custom test cases before telling the interviewer you are done.",
            "Review your listed resume projects thoroughly; interviewers frequently ask you to whiteboard your schema.",
        ],
    },
    {
        "id": "amazon",
        "company_name": "Amazon",
        "category": "Product Tier 1",
        "target_role": "Software Development Engineer - I",
        "ctc_range": "24 - 32 LPA",
        "logo_color": "#FF9900",
        "eligibility": {
            "min_cgpa": 7.0,
            "max_backlogs": 0,
            "allowed_branches": ["Computer Science", "Information Technology", "Electronics", "All Engineering"],
            "min_coding_score": 75.0,
            "min_leetcode_mediums": 35,
        },
        "selection_process": [
            {
                "round_num": 1,
                "name": "Amazon OA (OA1 + OA2)",
                "duration": "105 mins",
                "focus": "2 DSA problems on HackerRank + Amazon Work Style Assessment (behavioral survey).",
                "format": "Automated online assessment with rigorous behavioral alignment scoring.",
            },
            {
                "round_num": 2,
                "name": "Technical Loop 1",
                "duration": "60 mins",
                "focus": "20 mins Leadership Principles (Customer Obsession, Ownership) + 40 mins DSA.",
                "format": "Amazon Chime + LiveCode platform.",
            },
            {
                "round_num": 3,
                "name": "Technical Loop 2",
                "duration": "60 mins",
                "focus": "20 mins Leadership Principles (Bias for Action, Deliver Results) + 40 mins Hard DSA.",
                "format": "Emphasis on optimal time complexity and clean execution.",
            },
            {
                "round_num": 4,
                "name": "Bar Raiser Round",
                "duration": "60 mins",
                "focus": "Deep probe on Leadership Principles (Earn Trust, Have Backbone) + Logical Architecture.",
                "format": "Conducted by an independent evaluator outside the hiring team.",
            },
        ],
        "top_dsa_patterns": [
            {"pattern": "PriorityQueue / Heaps (Top K Elements)", "frequency_pct": 92},
            {"pattern": "Two Pointers & Sliding Window", "frequency_pct": 86},
            {"pattern": "Breadth-First Search & Dijkstra", "frequency_pct": 80},
            {"pattern": "Dynamic Programming (Subsequences)", "frequency_pct": 74},
        ],
        "frequent_leetcode_questions": [
            {"title": "Reorganize String", "difficulty": "Medium", "topic": "Max Heap / Greedy", "leetcode_url": "https://leetcode.com/problems/reorganize-string/"},
            {"title": "Top K Frequent Words", "difficulty": "Medium", "topic": "Heap / Trie", "leetcode_url": "https://leetcode.com/problems/top-k-frequent-words/"},
            {"title": "Rotting Oranges", "difficulty": "Medium", "topic": "Multi-Source BFS", "leetcode_url": "https://leetcode.com/problems/rotting-oranges/"},
            {"title": "Word Break", "difficulty": "Medium", "topic": "Dynamic Programming", "leetcode_url": "https://leetcode.com/problems/word-break/"},
            {"title": "Find Median from Data Stream", "difficulty": "Hard", "topic": "Two Heaps Pattern", "leetcode_url": "https://leetcode.com/problems/find-median-from-data-stream/"},
        ],
        "core_cs_questions": [
            "Explain Sharding vs Replication in distributed databases.",
            "How does a Content Delivery Network (CDN) cache static assets globally?",
            "What is the difference between Synchronous and Asynchronous execution models?",
            "How do you design a thread-safe Singleton in Java or C++?",
        ],
        "star_behavioral_questions": [
            "Give me an example of when you showed Customer Obsession over an easier engineering shortcut.",
            "Tell me about a time you failed to meet a deadline. What did you learn and how did you communicate it?",
        ],
        "insider_tips": [
            "You CANNOT pass Amazon without preparing 16 Leadership Principles; 50% of your interview score is LP adherence.",
            "Structure every behavioral answer strictly using STAR: Situation, Task, Action, Result (with quantified metrics).",
            "Be prepared for Top K and Heap questions — Amazon loves PriorityQueue questions for inventory/order simulation.",
        ],
    },
    {
        "id": "goldman_sachs",
        "company_name": "Goldman Sachs",
        "category": "FinTech / High-Frequency",
        "target_role": "Engineering Analyst",
        "ctc_range": "24 - 30 LPA",
        "logo_color": "#1E3A8A",
        "eligibility": {
            "min_cgpa": 7.5,
            "max_backlogs": 0,
            "allowed_branches": ["Computer Science", "Information Technology", "Maths & Computing", "Electronics"],
            "min_coding_score": 80.0,
            "min_leetcode_mediums": 35,
        },
        "selection_process": [
            {
                "round_num": 1,
                "name": "HackerRank Aptitude + Advanced Coding",
                "duration": "120 mins",
                "focus": "Math & Quantitative Reasoning, CS MCQs (OS/DBMS), and 2 Hard/Medium coding questions.",
                "format": "High cutoff threshold across both aptitude and technical sections.",
            },
            {
                "round_num": 2,
                "name": "Technical Round 1 (Math & DSA)",
                "duration": "60 mins",
                "focus": "Probability, Number Theory, Arrays, Tree Traversals, and DP.",
                "format": "Heavy mathematical rigor alongside code implementation.",
            },
            {
                "round_num": 3,
                "name": "Technical Round 2 (Core CS & Low-Level)",
                "duration": "60 mins",
                "focus": "Concurrency, Memory Models, Race Conditions, Indexing, and C++ / Java internals.",
                "format": "Focus on high-throughput, low-latency financial systems.",
            },
            {
                "round_num": 4,
                "name": "Senior Leader / HR Round",
                "duration": "45 mins",
                "focus": "Why Financial Services, ethical compliance, pressure handling, and leadership.",
                "format": "Executive interview with Managing Director / Partner.",
            },
        ],
        "top_dsa_patterns": [
            {"pattern": "Dynamic Programming & Matrix Memoization", "frequency_pct": 94},
            {"pattern": "Mathematics & Probability Puzzles", "frequency_pct": 88},
            {"pattern": "HashMap & Frequency Tracking", "frequency_pct": 82},
            {"pattern": "Binary Search on Answer Space", "frequency_pct": 78},
        ],
        "frequent_leetcode_questions": [
            {"title": "Trapping Rain Water", "difficulty": "Hard", "topic": "Two Pointers", "leetcode_url": "https://leetcode.com/problems/trapping-rain-water/"},
            {"title": "High Five", "difficulty": "Easy", "topic": "Heap / Hash Table", "leetcode_url": "https://leetcode.com/problems/high-five/"},
            {"title": "Coin Change", "difficulty": "Medium", "topic": "Dynamic Programming", "leetcode_url": "https://leetcode.com/problems/coin-change/"},
            {"title": "Robot Bounded In Circle", "difficulty": "Medium", "topic": "Math / Simulation", "leetcode_url": "https://leetcode.com/problems/robot-bounded-in-circle/"},
            {"title": "Fraction to Recurring Decimal", "difficulty": "Medium", "topic": "Math / Hash Table", "leetcode_url": "https://leetcode.com/problems/fraction-to-recurring-decimal/"},
        ],
        "core_cs_questions": [
            "What is the difference between Optimistic vs Pessimistic locking in distributed transactions?",
            "Explain memory cache coherence protocols (MESI protocol).",
            "How does Java JVM Garbage Collection work (G1 vs ZGC)?",
            "What happens under the hood during a TCP Zero Window notification?",
        ],
        "star_behavioral_questions": [
            "Why Goldman Sachs over pure technology product companies like Google or Amazon?",
            "How do you maintain zero-defect precision under high-pressure delivery timelines?",
        ],
        "insider_tips": [
            "Practice 50 popular math & probability puzzles (e.g. 25 horses problem, 3 light bulbs, coin tosses).",
            "Goldman places immense weight on Core CS subjects (OS memory layout, thread synchronization, database isolation levels).",
            "Ensure you can calculate Big-O time and auxiliary space complexity instantly.",
        ],
    },
    {
        "id": "tcs_digital",
        "company_name": "TCS Digital / Prime",
        "category": "High-Volume / Mass Recruiter",
        "target_role": "Systems Engineer (Digital & Prime Cadres)",
        "ctc_range": "7.5 - 11.5 LPA",
        "logo_color": "#10B981",
        "eligibility": {
            "min_cgpa": 6.5,
            "max_backlogs": 0,
            "allowed_branches": ["All Engineering Disciplines"],
            "min_coding_score": 60.0,
            "min_leetcode_mediums": 15,
        },
        "selection_process": [
            {
                "round_num": 1,
                "name": "TCS National Qualifier Test (NQT)",
                "duration": "110 mins",
                "focus": "Numerical Ability, Verbal Ability, Reasoning Ability + 2 Advanced Coding questions.",
                "format": "TCS iON online assessment center (Strict negative marking on aptitude).",
            },
            {
                "round_num": 2,
                "name": "Technical Interview (TR)",
                "duration": "30 mins",
                "focus": "Academic projects, Object-Oriented Programming (Java/Python), SQL queries, and basic DSA.",
                "format": "In-person or MS Teams video panel.",
            },
            {
                "round_num": 3,
                "name": "Managerial & HR Round (MR + HR)",
                "duration": "20 mins",
                "focus": "Willingness to relocate, shifts, project ownership, and interpersonal skills.",
                "format": "Standard HR verification.",
            },
        ],
        "top_dsa_patterns": [
            {"pattern": "Arrays & String Manipulation", "frequency_pct": 95},
            {"pattern": "Hashing & Frequency Maps", "frequency_pct": 85},
            {"pattern": "Recursion & Backtracking Basics", "frequency_pct": 72},
            {"pattern": "SQL Joins & Group By Queries", "frequency_pct": 88},
        ],
        "frequent_leetcode_questions": [
            {"title": "Two Sum", "difficulty": "Easy", "topic": "HashMap", "leetcode_url": "https://leetcode.com/problems/two-sum/"},
            {"title": "Valid Anagram", "difficulty": "Easy", "topic": "Strings", "leetcode_url": "https://leetcode.com/problems/valid-anagram/"},
            {"title": "Subarray Sum Equals K", "difficulty": "Medium", "topic": "Prefix Sum", "leetcode_url": "https://leetcode.com/problems/subarray-sum-equals-k/"},
            {"title": "Longest Substring Without Repeating Characters", "difficulty": "Medium", "topic": "Sliding Window", "leetcode_url": "https://leetcode.com/problems/longest-substring-without-repeating-characters/"},
            {"title": "Climbing Stairs", "difficulty": "Easy", "topic": "Dynamic Programming", "leetcode_url": "https://leetcode.com/problems/climbing-stairs/"},
        ],
        "core_cs_questions": [
            "Explain 4 pillars of OOP with real-world examples.",
            "Write a SQL query to find the 2nd highest salary in an Employee table without using LIMIT.",
            "Difference between Primary Key, Unique Key, and Foreign Key.",
            "Difference between Method Overloading and Method Overriding.",
        ],
        "star_behavioral_questions": [
            "Are you comfortable with cross-domain technology re-skilling (e.g. mainframe to cloud)?",
            "Tell me about a time you handled a difficult deadline during your final semester.",
        ],
        "insider_tips": [
            "To qualify for the higher 'Prime' (9-11 LPA) or 'Digital' (7-8 LPA) package, you MUST solve BOTH coding questions in the NQT completely.",
            "Be crystal clear on standard SQL queries (Joins, Subqueries, HAVING vs WHERE clauses).",
            "Show enthusiasm for learning enterprise tech stacks like Java Spring Boot, Cloud, and AI.",
        ],
    },
]


def evaluate_company_readiness(student_data: Dict[str, Any], company_id: str) -> Dict[str, Any]:
    """
    Evaluates a candidate's live academic standing, verified coding footprint,
    and LeetCode metrics against a specific company's hiring thresholds.
    """
    sheet = next((c for c in COMPANY_CHEAT_SHEETS if c["id"] == company_id), None)
    if not sheet:
        return {"error": f"Company '{company_id}' not found."}

    elig = sheet["eligibility"]
    cgpa = float(student_data.get("cgpa", 7.0))
    backlogs = int(student_data.get("backlogs", 0))
    branch = student_data.get("education", {}).get("branch", "Computer Science")

    assessments = student_data.get("assessments", {})
    coding_score = float(assessments.get("coding_score", 70.0))

    coding_profiles = student_data.get("coding_profiles") or {}
    lc_stats = coding_profiles.get("leetcode_stats") or {}
    med_solved = lc_stats.get("medium_solved", 0)

    # 1. Eligibility Check
    is_cgpa_ok = cgpa >= elig["min_cgpa"]
    is_backlogs_ok = backlogs <= elig["max_backlogs"]

    # 2. Preparation Readiness Percentage Calculation (0 - 100)
    cgpa_ratio = min(1.0, cgpa / elig["min_cgpa"]) if elig["min_cgpa"] > 0 else 1.0
    coding_ratio = min(1.0, coding_score / elig["min_coding_score"])
    dsa_ratio = min(1.0, med_solved / max(1, elig["min_leetcode_mediums"]))

    readiness_pct = round((cgpa_ratio * 30) + (coding_ratio * 40) + (dsa_ratio * 30), 1)

    # 3. Status Badging
    recommendations: List[str] = []
    if not is_cgpa_ok:
        status_label = "Below Academic Cutoff"
        badge_variant = "rose"
        recommendations.append(f"Company enforces a strict minimum CGPA of {elig['min_cgpa']} (Current: {cgpa:.2f}).")
    elif not is_backlogs_ok:
        status_label = "Blocked by Backlogs"
        badge_variant = "rose"
        recommendations.append(f"Company requires 0 active backlogs (Current: {backlogs}). Clear backlogs before drive.")
    elif readiness_pct >= 85:
        status_label = "Eligible & Highly Prepared"
        badge_variant = "emerald"
        recommendations.append("Your academic credentials and coding benchmark place you in the top 10% candidate pool.")
    elif readiness_pct >= 70:
        status_label = "Eligible - Needs DSA Polish"
        badge_variant = "amber"
        recommendations.append(f"Solve {max(0, elig['min_leetcode_mediums'] - med_solved)} more LeetCode Mediums on {sheet['top_dsa_patterns'][0]['pattern']}.")
    else:
        status_label = "Eligible - High Preparation Gap"
        badge_variant = "indigo"
        recommendations.append(f"Boost assessment coding score from {coding_score:.1f} to {elig['min_coding_score']}+.")

    return {
        "company_id": sheet["id"],
        "company_name": sheet["company_name"],
        "readiness_percentage": readiness_pct,
        "status_label": status_label,
        "badge_variant": badge_variant,
        "is_eligible": is_cgpa_ok and is_backlogs_ok,
        "recommendations": recommendations,
        "metrics_comparison": {
            "candidate_cgpa": cgpa,
            "required_cgpa": elig["min_cgpa"],
            "candidate_coding_score": coding_score,
            "required_coding_score": elig["min_coding_score"],
            "candidate_mediums_solved": med_solved,
            "recommended_mediums": elig["min_leetcode_mediums"],
        },
    }

