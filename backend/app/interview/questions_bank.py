"""
Comprehensive Question Bank for AI Mock Interview Simulator.
Covers Technical, System Design, Behavioral/HR, and Core CS domains with multi-tier difficulty ratings.
"""

from typing import List, Dict, Any

INTERVIEW_QUESTIONS: List[Dict[str, Any]] = [
    # --- Full Stack Developer ---
    {
        "id": "fs-01",
        "role_id": "full-stack-developer",
        "round_type": "technical",
        "difficulty": "intermediate",
        "concept": "Event Loop & Asynchronous JavaScript",
        "question": "Can you explain how the JavaScript Event Loop works, specifically the difference between the Call Stack, Microtask Queue (Promises), and Macrotask Queue (setTimeout)?",
        "expected_keywords": ["call stack", "event loop", "microtask", "macrotask", "promises", "settimeout", "single-threaded", "non-blocking", "callback queue"],
        "ideal_answer": "JavaScript is single-threaded and executes synchronous code on the Call Stack. When asynchronous operations initiate, web APIs handle them in the background. Completed callbacks enter either the Microtask Queue (Promises, queueMicrotask) or the Macrotask Queue (setTimeout, setInterval, I/O). The Event Loop constantly monitors the Call Stack: once the stack is empty, it exhausts ALL microtasks before picking the next macrotask. This is why Promise.then executes before a setTimeout(fn, 0) callback.",
        "hint": "Think about execution order when both Promise.resolve().then() and setTimeout(..., 0) are in the code.",
        "time_limit_seconds": 120,
    },
    {
        "id": "fs-02",
        "role_id": "full-stack-developer",
        "round_type": "technical",
        "difficulty": "advanced",
        "concept": "Database Indexing & Query Optimization",
        "question": "How do B-Tree indexes improve database query performance in PostgreSQL or MongoDB, and in what scenarios might adding an index degrade system throughput?",
        "expected_keywords": ["b-tree", "lookup", "logarithmic", "o(log n)", "write overhead", "insert", "update", "memory", "cardinality", "table scan"],
        "ideal_answer": "B-Tree indexes organize sorted pointer structures that reduce search time from O(N) full table scans to O(log N) balanced tree traversals. However, every write operation (INSERT, UPDATE, DELETE) requires the database engine to maintain and rebalance index trees, incurring disk I/O and locking overhead. Additionally, indexes consume RAM and buffer pool cache; indexing low-cardinality columns (e.g., boolean flags) provides negligible selectivity while degrading write throughput.",
        "hint": "Discuss both the read lookup time complexity and the write penalty on inserts and updates.",
        "time_limit_seconds": 150,
    },
    {
        "id": "fs-03",
        "role_id": "full-stack-developer",
        "round_type": "technical",
        "difficulty": "beginner",
        "concept": "RESTful API Design & HTTP Status Codes",
        "question": "What are the core architectural constraints of REST, and what is the semantic difference between PUT and PATCH HTTP methods?",
        "expected_keywords": ["stateless", "client-server", "cacheable", "idempotent", "put", "patch", "full replacement", "partial update"],
        "ideal_answer": "REST is a stateless, client-server architecture with uniform resource interfaces. In RESTful semantics, PUT is idempotent and represents a full replacement of the target resource with the request payload. PATCH is designed for partial updates, modifying only the fields specified in the request body without replacing unaffected properties.",
        "hint": "Focus on idempotency and partial vs complete resource modification.",
        "time_limit_seconds": 90,
    },
    {
        "id": "fs-04",
        "role_id": "full-stack-developer",
        "round_type": "system_design",
        "difficulty": "advanced",
        "concept": "Scalable URL Shortener Architecture",
        "question": "How would you design a scalable URL Shortener service like Bitly handling 100 million links per day? Discuss short key generation, caching, and database schema.",
        "expected_keywords": ["base62", "hashing", "md5", "counter", "redis", "caching", "nosql", "mongodb", "distributed id", "snowflake", "read heavy"],
        "ideal_answer": "A URL shortener is a read-heavy system (e.g., 100:1 read-to-write ratio). For key generation, we use Base62 encoding (a-z, A-Z, 0-9) on a distributed 64-bit integer counter or MD5 hash with collision handling. A 7-character Base62 string yields 62^7 (~3.5 trillion) unique URLs. Data is persisted in a distributed key-value or document store (MongoDB/Cassandra) with (short_key -> original_url, user_id, created_at). We place a Redis cache cluster in front of the DB with LRU eviction to serve top 20% hot links with sub-5ms latency.",
        "hint": "Address Base62 encoding, caching layer (Redis), and distributed unique ID generation.",
        "time_limit_seconds": 180,
    },
    {
        "id": "fs-05",
        "role_id": "full-stack-developer",
        "round_type": "behavioral",
        "difficulty": "intermediate",
        "concept": "Conflict Resolution & Technical Debt",
        "question": "Describe a situation where you and a team member disagreed on a technical choice or architectural decision. How did you resolve it?",
        "expected_keywords": ["situation", "task", "action", "result", "trade-offs", "objective criteria", "benchmark", "collaboration", "consensus"],
        "ideal_answer": "In our college capstone project, my teammate favored Redux for state management while I advocated for React Context and TanStack Query. I set up a quick 1-hour spike comparing bundle size, boilerplate code, and caching overhead. We evaluated both against our specific project scope and saw that TanStack Query solved 90% of our server caching with 60% less code. We agreed on the data-backed choice, completed the feature 3 days ahead of schedule, and maintained strong mutual respect.",
        "hint": "Use the STAR format: Situation, Task, Action, Result. Emphasize data-driven decision making.",
        "time_limit_seconds": 150,
    },

    # --- Frontend Engineer ---
    {
        "id": "fe-01",
        "role_id": "frontend-engineer",
        "round_type": "technical",
        "difficulty": "intermediate",
        "concept": "React Fiber & Reconciliation Engine",
        "question": "How does React's Virtual DOM reconciliation and Fiber architecture optimize UI updates, and why are keys mandatory when rendering lists?",
        "expected_keywords": ["virtual dom", "reconciliation", "fiber", "diffing algorithm", "keys", "render phase", "commit phase", "heuristics", "tree traversal"],
        "ideal_answer": "React Fiber is a complete rewrite of React's reconciliation engine that splits rendering into interruptible units of work. Instead of synchronous stack recursion, Fiber can pause, abort, or prioritize updates (e.g., user inputs over animations). React uses an O(N) heuristic diffing algorithm comparing element types and props. Keys give list items a persistent identity across renders, allowing React to match existing elements and minimize unnecessary DOM node re-creations or mutations.",
        "hint": "Mention the distinction between the interruptible render phase and the synchronous commit phase.",
        "time_limit_seconds": 120,
    },
    {
        "id": "fe-02",
        "role_id": "frontend-engineer",
        "round_type": "technical",
        "difficulty": "intermediate",
        "concept": "Core Web Vitals & Web Performance",
        "question": "What are Core Web Vitals (LCP, INP, CLS), and how would you optimize an application that suffers from poor Largest Contentful Paint?",
        "expected_keywords": ["lcp", "inp", "cls", "largest contentful paint", "cumulative layout shift", "interaction to next paint", "cdn", "lazy loading", "code splitting", "compression", "critical css"],
        "ideal_answer": "Core Web Vitals measure user experience: LCP measures perceived loading speed (target < 2.5s), INP measures responsiveness to user actions (target < 200ms), and CLS measures visual layout stability (target < 0.1). To optimize high LCP, I would: 1) Compress and serve next-gen image formats (AVIF/WebP) via a CDN; 2) Preload the hero image resource via <link rel='preload'>; 3) Eliminate render-blocking stylesheets with critical inline CSS; 4) Implement route-based code splitting using React.lazy and dynamic imports.",
        "hint": "List each metric's meaning and specific strategies like image preloading, CDNs, and critical CSS.",
        "time_limit_seconds": 150,
    },

    # --- Backend Engineer ---
    {
        "id": "be-01",
        "role_id": "backend-engineer",
        "round_type": "technical",
        "difficulty": "intermediate",
        "concept": "Database Concurrency & ACID Properties",
        "question": "Explain ACID properties in database transactions and how Isolation Levels (Read Committed vs Repeatable Read vs Serializable) prevent race conditions like Dirty Reads and Phantom Reads.",
        "expected_keywords": ["atomicity", "consistency", "isolation", "durability", "acid", "dirty read", "non-repeatable read", "phantom read", "serializable", "locks", "mvcc"],
        "ideal_answer": "ACID guarantees transactional reliability: Atomicity (all-or-nothing), Consistency (schema constraints preserved), Isolation (concurrent execution correctness), and Durability (committed writes persist on disk). Isolation levels trade performance for consistency: Read Committed prevents dirty reads (uncommitted changes); Repeatable Read ensures rows read once return identical values within the transaction; Serializable enforces strict order, eliminating phantom rows using predicate locking or serializable snapshot isolation (SSI).",
        "hint": "Define each letter of ACID and contrast Read Committed with Serializable.",
        "time_limit_seconds": 150,
    },
    {
        "id": "be-02",
        "role_id": "backend-engineer",
        "round_type": "system_design",
        "difficulty": "advanced",
        "concept": "API Rate Limiting & Token Bucket Algorithm",
        "question": "How would you design an API rate limiter to protect public endpoints from brute-force DDoS attacks? Compare Token Bucket with Leaky Bucket.",
        "expected_keywords": ["token bucket", "leaky bucket", "redis", "sliding window", "rate limiting", "429 too many requests", "concurrency", "distributed"],
        "ideal_answer": "A rate limiter restricts request velocity per IP or user token. The Token Bucket algorithm adds tokens at a fixed rate up to capacity; each request consumes a token, allowing short bursts while capping average throughput. Leaky Bucket processes requests at a constant FIFO rate, smoothing bursts into a uniform stream. For a distributed system, we implement Token Bucket or Sliding Window Counter in Redis using Lua scripts for atomic increments and expiry, returning HTTP 429 Too Many Requests with a Retry-After header when exceeded.",
        "hint": "Explain how Redis atomic operations prevent race conditions across multiple server instances.",
        "time_limit_seconds": 150,
    },

    # --- Data Scientist / ML Engineer ---
    {
        "id": "ds-01",
        "role_id": "data-scientist",
        "round_type": "technical",
        "difficulty": "intermediate",
        "concept": "Bias-Variance Tradeoff & Regularization",
        "question": "What is the Bias-Variance tradeoff in supervised machine learning, and how do L1 (Lasso) and L2 (Ridge) regularization mitigate overfitting?",
        "expected_keywords": ["bias", "variance", "tradeoff", "overfitting", "underfitting", "regularization", "l1", "l2", "lasso", "ridge", "sparsity", "penalty"],
        "ideal_answer": "High bias leads to underfitting due to overly simplistic models missing key relationships. High variance leads to overfitting because the model memorizes training noise and fails to generalize to test data. Regularization adds a penalty term to the loss function: L1 (Lasso) adds the absolute sum of weights (alpha * sum|w|), driving irrelevant feature weights to exactly zero for automated feature selection and sparsity; L2 (Ridge) adds the squared sum of weights (alpha * sum(w^2)), shrinking weights smoothly toward zero without eliminating them.",
        "hint": "Contrast how L1 produces sparse weights (feature selection) while L2 shrinks coefficients proportionally.",
        "time_limit_seconds": 120,
    },
    {
        "id": "ds-02",
        "role_id": "data-scientist",
        "round_type": "technical",
        "difficulty": "advanced",
        "concept": "Explainable AI & SHAP Values",
        "question": "Why are SHAP (SHapley Additive exPlanations) values preferred over traditional Gini feature importances when interpreting tree-based models like XGBoost or LightGBM?",
        "expected_keywords": ["shap", "shapley values", "game theory", "gini importance", "consistency", "local accuracy", "missingness", "directionality", "positive", "negative"],
        "ideal_answer": "Gini importance only measures the total reduction in impurity across splits, which is biased toward high-cardinality continuous features and fails to provide directionality (does a feature increase or decrease placement chance?). SHAP values originate from cooperative game theory and uniquely satisfy three mathematical axioms: Local Accuracy, Missingness, and Consistency. Furthermore, SHAP provides both local explanations for individual candidate instances and global explanations with positive and negative attribution polarities.",
        "hint": "Mention game theory, directionality (positive vs negative impact), and individual local explanations.",
        "time_limit_seconds": 150,
    },

    # --- DevOps / Cloud Engineer ---
    {
        "id": "do-01",
        "role_id": "devops-engineer",
        "round_type": "technical",
        "difficulty": "intermediate",
        "concept": "Containerization & Docker Layer Caching",
        "question": "How does Docker layer caching work, and what best practices would you follow to minimize container image sizes and optimize build times?",
        "expected_keywords": ["dockerfile", "layers", "caching", "multi-stage builds", "alpine", "slim", ".dockerignore", "cache invalidation", "order"],
        "ideal_answer": "Docker builds images as stacked read-only layers corresponding to Dockerfile instructions. If a layer and its dependencies haven't changed, Docker reuses the cached layer. To optimize build times and image sizes: 1) Order instructions from least to most frequently modified (e.g., COPY package.json and npm install before COPY .); 2) Utilize multi-stage builds to compile assets in a builder stage and copy only binaries to a minimal runtime base (alpine or distroless); 3) Leverage .dockerignore to exclude node_modules, git histories, and test artifacts.",
        "hint": "Discuss multi-stage builds and ordering commands to maximize layer cache hits.",
        "time_limit_seconds": 120,
    },

    # --- Core CS & Campus Behavioral / HR ---
    {
        "id": "cs-01",
        "role_id": "core-cs",
        "round_type": "technical",
        "difficulty": "beginner",
        "concept": "Process vs Thread & Memory Layout",
        "question": "What is the difference between a Process and a Thread in operating systems, and how do they communicate with each other?",
        "expected_keywords": ["process", "thread", "address space", "memory", "stack", "heap", "ipc", "shared memory", "context switch", "overhead"],
        "ideal_answer": "A process is an executing program instance with its own independent virtual address space, memory allocation (heap, stack, code, data), and OS descriptors. A thread is a lightweight execution unit within a process; multiple threads of the same process share the heap, global variables, and open file descriptors, while maintaining private registers and stacks. Threads communicate cheaply via shared memory with synchronization (mutexes), whereas processes require Inter-Process Communication (IPC) mechanisms like sockets, pipes, or shared memory segments.",
        "hint": "Contrast memory isolation (private address space vs shared heap) and IPC overhead.",
        "time_limit_seconds": 120,
    },
    {
        "id": "hr-01",
        "role_id": "hr-behavioral",
        "round_type": "behavioral",
        "difficulty": "beginner",
        "concept": "Failure & Overcoming Obstacles (STAR)",
        "question": "Tell me about a time you missed a project deadline or made a critical mistake in your code. How did you handle the fallout and what did you learn?",
        "expected_keywords": ["situation", "task", "action", "result", "ownership", "root cause", "post-mortem", "communication", "testing", "prevention"],
        "ideal_answer": "In my third-year database project, I pushed an unindexed migration that slowed our test server down 2 hours before submission. Instead of deflecting, I immediately took ownership, notified my team lead, and rolled back the change. I then ran an EXPLAIN ANALYZE, added the composite B-Tree index, and verified latency dropped from 4 seconds to 12ms before redeploying. I learned never to push schema migrations without staging load tests, and established a pre-commit checklist for our subsequent projects.",
        "hint": "Use the STAR method: Situation, Task, Action, Result. Emphasize accountability, fast recovery, and systemic prevention.",
        "time_limit_seconds": 150,
    },
    {
        "id": "hr-02",
        "role_id": "hr-behavioral",
        "round_type": "hr",
        "difficulty": "beginner",
        "concept": "Career Alignment & 5-Year Vision",
        "question": "Where do you see yourself in 3 to 5 years, and how does this engineering role align with your long-term technical aspirations?",
        "expected_keywords": ["growth", "technical leadership", "architecture", "mentorship", "impact", "continuous learning", "domain expertise"],
        "ideal_answer": "Over the next 2 years, my priority is mastering your engineering stack, delivering high-reliability production features, and absorbing best practices in distributed systems. Within 3 to 5 years, I aim to evolve into a Senior Engineer and Technical Lead, designing scalable service architectures and mentoring junior campus hires. This role directly aligns with my goal because your team tackles high-concurrency systems where I can build deep expertise and create measurable business impact.",
        "hint": "Balance short-term craftsmanship and fast learning with long-term leadership and architectural impact.",
        "time_limit_seconds": 120,
    },
]


def get_questions_for_interview(
    role_id: str,
    round_type: str = "technical",
    difficulty: str = "intermediate",
    count: int = 5,
) -> List[Dict[str, Any]]:
    """
    Selects balanced questions based on role, round type, and difficulty.
    Falls back gracefully to general core CS or behavioral questions if specific role questions are exhausted.
    """
    matched: List[Dict[str, Any]] = []

    # 1. Exact match (role, round, difficulty)
    for q in INTERVIEW_QUESTIONS:
        if q["role_id"] == role_id and q["round_type"] == round_type and q["difficulty"] == difficulty:
            matched.append(q)

    # 2. Match role and round (any difficulty)
    if len(matched) < count:
        for q in INTERVIEW_QUESTIONS:
            if q["role_id"] == role_id and q["round_type"] == round_type and q not in matched:
                matched.append(q)

    # 3. Match round type across all roles
    if len(matched) < count:
        for q in INTERVIEW_QUESTIONS:
            if q["round_type"] == round_type and q not in matched:
                matched.append(q)

    # 4. Fallback to any questions to guarantee requested count
    if len(matched) < count:
        for q in INTERVIEW_QUESTIONS:
            if q not in matched:
                matched.append(q)

    return matched[:count]


def get_question_by_id(question_id: str) -> Dict[str, Any]:
    """Retrieve question definition by ID."""
    for q in INTERVIEW_QUESTIONS:
        if q["id"] == question_id:
            return q
    # Fallback default question
    return INTERVIEW_QUESTIONS[0]
