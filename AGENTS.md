# Agentic Standard Operating Procedures (SOPs)

> [!IMPORTANT]
> **ALL AGENTS MUST FOLLOW THIS WORKFLOW.**
> Do not deviate unless the user explicitly commands "do it quickly" or "fast".

## The 7-Step Agentic Workflow

Every agent run must adhere to this strict process. Do not skip steps.

### 0. 🛑 Pre-Flight Safety Protocol (MANDATORY)
Before reading the prompt, you MUST verify:
1.  **Clock**: What is the current date & time?
2.  **Sandbox**: Are you in Staging vs Prod? (`CONVEX_DEPLOYMENT`) -> **"The Sandbox First" Rule**.
    - *Rule*: **NEVER** run `npx convex deploy` (or any deployment) without confirming the target.
3.  **Wallet**: If using APIs, are credits/keys valid? -> **"The Wallet Check" Rule**.
    - *Rule*: Verify account status/credits via `ENV_VARS.md` (if available) as the *first* debugging step.
4.  **Tools**: Is there a Skill/Tool for this? -> **"The Tool Shed" Rule**.
    - *Rule*: Check `.agent/skills/` before planning.
5.  **Accounts**: Are you logged into the correct CLI account? -> **"The Identitiy Check" Rule (CRITICAL)**.
    - *Rule*: Before ANY `vercel`, `convex`, or `gh` commands, verify you are logged into: **`workwithharshdesai@gmail.com`**.
    - *Action*: Run `vercel whoami`, `convex whoami`, and `gh auth status` to confirm identity.

### 1. Understand & Contextualize
- **Goal**: Achieve 100% understanding of the user's query and the system.
- **Action**: 
    1.  Analyze the request. Do not assume.
    2.  **Read `AI_CONTEXT.md`**: You MUST read this file to ground yourself in the company context (Palej Conductors), products, and rules.
    3.  **Read `PROJECT_URLS.md`**: If the task involves deployment or URLs.

### 2. Clarity & Confidence (The "10/10" Rule)
- **Goal**: Raise confidence score to 10 out of 10.
- **Action**: Ask deep, detailed questions if there is ANY ambiguity.
- **Constraint**: Do not proceed until you are 100% sure.

### 3. Confirmation
- **Goal**: Align with the user.
- **Action**: Explicitly state: *"Here is my understanding of your request: [A], [B], [C]."*
- **Constraint**: Wait for the user to confirm your understanding is perfect.

### 4. Research, Plan & Pre-Mortem
- **Goal**: Create a foolproof implementation strategy.
- **Rule**: **"The Read-Only Diagnosis"** - When debugging, create a reproduction script or audit report *before* attempting a fix.
- **Action**:
    1.  **Research**: 
        - Check `REPO_INDEX.md`, `LEARNINGS.md`, and **`LOGS.md`** (MANDATORY).
        - **Review Previous Chats**: Look for similar queries or past failures to learn and improve execution.
    2.  **Plan**: Draft a step-by-step implementation plan.
    3.  **Scratchpad**: Use `.scratchpad/` for thinking. Use `.txt` or `.md`.
    4.  **Pre-Mortem**: Ask: *"What could go wrong?"* *“Where are the gaps?”* Improve the plan BEFORE writing code.
    5.  **Visualize & Verify**:
        - **Mental Sandbox**: Visualize the user using your changes. Walk through the UI flow step-by-step. **Use `/v` for deep pre-visualization.**
        - **Deployment**: The plan MUST include steps to verify the deployment and ensure no regressions.

### 5. Execution
- **Goal**: Implement the plan.
- **Rule**: **"The Two-Strike Rule"** - If your fix fails **TWICE**, **STOP**. Re-read context or ask for help. Don't spiral.
- **Action**: Write code, run commands, create files.
- **Rule**: **Visualize & Verify**: Before and during execution, visualize the end-to-end pipeline. Ensure builds will pass. Explicitly verify that your changes do not break existing working functionality (Regression Check).

### 6. Refactor & Clean
- **Goal**: Ensure code quality and hygiene.
- **Action**:
    1.  **Refactor**: Clean up the code, remove dead code/imports, and optimize.
    2.  **Context**: Ensure comments and `AI_CONTEXT.md` (if applicable) are fresh.
    3.  **Cleanup**: Delete temporary files in `.scratchpad/` unless valuable.

### 7. Review, Audit & Document
- **Goal**: Verify quality and compound knowledge.
- **Action**:
    1.  **Verify**: Test your work using `VERIFICATION.md` (if available). (See "Verification First" below).
    2.  **Audit**: Check if execution matched the plan.
    3.  **📝 MANDATORY DOCS UPDATE**:
        - **`LOGS.md`**: Append a summary of this run. **REQUIRED.**
        - **`REPO_INDEX.md`**: Update if ANY file was created/moved/deleted.
        - **`AI_CONTEXT.md`**: Review and update current state/context. **REQUIRED.**
        - **`LEARNINGS.md`**: Document meaningful insights. **REQUIRED.**
        - **Optional**: Consider updating `PROJECT_URLS.md` or other docs if relevant.
    4.  **Summary & Compliance Checklist**: 
        - Inform the user of completion.
        - **OUTPUT THIS CHECKLIST**: You must perform these checks and output the following block at the end of your response:
          ```markdown
          ## Workflow Compliance Verification
          - [ ] 0. **Pre-Flight**: Checked Clock, Sandbox, Wallet, Tools, **Accounts** (`workwithharshdesai@gmail.com`).
          - [ ] 1. **Context**: Read `AI_CONTEXT.md` & `AGENTS.md`.
          - [ ] 2. **Clarity**: Achieved 10/10 confidence.
          - [ ] 3. **Confirm**: User confirmed plan (or no ambiguity).
          - [ ] 4. **Plan**: Created plan & pre-mortem.
          - [ ] 4a. **Research**: Reviewed `LEARNINGS.md` & previous chats.
          - [ ] 4b. **Visualization**: Mental Sandbox run performed.
          - [ ] 5. **Exec**: Code implemented & verified.
          - [ ] 6. **Clean**: Refactored & cleaned `.scratchpad`.
          - [ ] 7. **Docs**: Updated `LOGS.md`, `AI_CONTEXT.md`, `REPO_INDEX.md`, `LEARNINGS.md`.
          ```

---

## 🧠 Core Beliefs & Principles
1. **Everything can be figured out**: With persistence, a "CAN DO" attitude, and belief in yourself, any problem is solvable.
2. **You are super smart & creative**: You have the intelligence and persistence to achieve the objective. Do not stop until it is complete.
3. **Skills can be acquired**: Self-belief and motivation are essential. Any missing skill can be learned to tackle a problem.
4. **Strategic Pause**: When stuck, pause and audit the whole situation/codebase. Think strategically and tactically to uncover blind spots. Figuring out solutions requires catches your blind spots.

---

## Critical Rules

### 🎯 Surgical Precision & Preservation
- **Rule**: NEVER accidentally remove, edit, or refactor code that is not explicitly required for your current task.
- **Action**: Respect the existing codebase. Preserve all existing logic, comments, and imports unless they are strictly blocking your task.
- **Constraint**: If refactoring is needed for clarity, it MUST be a separate, documented step in your plan. Do not "stealth refactor" while fixing a bug.

### 🛡️ Verification First
> **"Unless you test yourself, do not say it is done."**

- **Rule**: Never declare a task complete without empirical proof.
- **Method**: Use the most effective method available:
    - **CLI**: Run build scripts, test commands, or curl requests.
    - **Browser**: Use the browser tool to verify UI changes visually.
    - **Responsiveness**: **MANDATORY**: Verify UI changes on Mobile (375px) and Tablet (768px) viewports.
    - **API**: Check endpoints.
- **Constraint**: If you cannot verify it automatically, you must have a very strong reason why.

### 📝 Temporary Scratchpad
- **Rule**: Use a `.scratchpad/` directory for any temporary files, logs, or planning documents.
- **Cleanup**: You must delete or move these files (to `docs/`) before finishing the task, unless they are useful artifacts.

### 🗺️ Maintain the Map
- **Rule**: If you add, delete, or rename files, you **MUST** update `REPO_INDEX.md`.
- **Reason**: Future agents rely on this index to navigate quickly.

### 🛡️ Governance Protection
- **Protected Files**: `AGENTS.md`, `AI_CONTEXT.md`, `REPO_INDEX.md`, `LOGS.md`, `LEARNINGS.md`.
- **Rule**: These are system files. **NEVER DELETE** them. **NEVER MERGE** them.
- **Action**: Only **UPDATE** or **APPEND** to these files.

### 🧠 Compound Knowledge
- **Rule**: If you solve a tricky bug or make a significant architectural decision, log it in `LEARNINGS.md`.
