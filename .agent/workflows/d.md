---
description: Enforce agentic SOPs - Follow the 7-step workflow for every task.
---

> [!IMPORTANT]
> **DO NOT SKIP STEPS** unless user explicitly says "do it quickly" or "fast".

---

## 🎯 The 7-Step Workflow

### 0. 🛑 Pre-Flight Safety Protocol (MANDATORY)
Before reading the prompt, you MUST verify:
1.  **Clock**: What is the current date & time?
2.  **Sandbox**: Are you in Staging vs Prod? -> **"The Sandbox First" Rule**.
    - *Rule*: **NEVER** deploy without confirming the target.
3.  **Wallet**: If using APIs, are credits/keys valid? -> **"The Wallet Check" Rule**.
    - *Rule*: Verify account status/credits via `ENV_VARS.md` (if available) as the *first* debugging step.
4.  **Tools**: Is there a Skill/Tool for this? -> **"The Tool Shed" Rule**.
    - *Rule*: Check `.agent/skills/` before planning.
5.  **Accounts**: Are you logged into **`workwithharshdesai@gmail.com`**? -> **"The Identity Check" Rule (CRITICAL)**.
    - *Rule*: Verify identity for `vercel`, `convex`, and `gh` before execution.

### 1. Understand & Contextualize
- Analyze request. Do not assume.
- **Read `AI_CONTEXT.md`** to ground yourself.

### 2. Clarity & Confidence (10/10 Rule)
- Ask detailed questions if ANY ambiguity exists.
- **Do not proceed until 10/10 confidence.**

### 3. Confirmation
- State: *"My understanding: [A], [B], [C]."*
- Wait for user to confirm.

### 4. Research, Plan & Pre-Mortem
- **Rule**: **"The Read-Only Diagnosis"** - Create a reproduction script or audit report *before* attempting a fix.
- **Actions**:
    1. **Research**: 
       - Check `REPO_INDEX.md`, `LEARNINGS.md`.
       - **Review Previous Chats**: Look for similar queries or past failures.
    2. **Plan**: Create step-by-step implementation plan.
    3. **Scratchpad**: Use `.scratchpad/` for drafts/thinking.
    4. **Pre-Mortem**: Ask "What could go wrong?" Fix gaps BEFORE coding.
    5. **Visualize & Verify**:
       - **Mental Sandbox**: Visualize the user using your changes. Walk through the UI flow step-by-step.
       - **Deployment**: The plan MUST include steps to verify the deployment.

### 5. Execution
- **Rule**: **"The Two-Strike Rule"** - If your fix fails **TWICE**, **STOP**. Re-read context.
- Implement the plan. Write code, run commands.
- **Rule**: **Visualize & Verify**: Before and during execution, visualize the end-to-end deployment pipeline (Vercel/Convex/GitHub). Ensure builds will pass. Explicitly verify that your changes do not break existing working functionality (Regression Check).

### 6. Refactor & Clean
1. Refactor: Remove dead code/imports, optimize.
2. Context: Update comments and `AI_CONTEXT.md` if applicable.
3. Cleanup: Delete `.scratchpad/` files unless valuable.

### 7. Review, Audit & Document
1. **Verify**: Test your work using `VERIFICATION.md` (if exists) or other verification methods. (See 🛡️ Verification First below).
2. Audit: Did execution match plan?
3. **📝 MANDATORY DOCS UPDATE**:
    - **`LOGS.md`**: Append summary. **REQUIRED.**
    - **`REPO_INDEX.md`**: Update if map changed.
    - **`AI_CONTEXT.md`**: Update context. **REQUIRED.**
    - **`LEARNINGS.md`**: Log new insights. **REQUIRED.**
4. **Summary & Verification**:
    - Inform user of completion.
    - **OUTPUT THIS CHECKLIST (Mandatory)**:
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

## 🔒 Critical Rules

### 🎯 Surgical Precision & Preservation
- **Rule**: NEVER accidentally remove, edit, or refactor code that is not explicitly required for your current task.
- **Action**: Respect the existing codebase. Preserve all existing logic, comments, and imports unless they are strictly blocking your task.

### 🛡️ Verification First
> **"Unless you test yourself, do not say it is done."**
- Never declare complete without empirical proof.
- Use CLI (build/test), browser tool (UI), or API verification.

### 📝 Temporary Scratchpad
- Use `.scratchpad/` for temporary files.
- Delete or move to `docs/` before finishing.

### 🗺️ Maintain the Map
- Update `REPO_INDEX.md` when adding/deleting/renaming files.

### 🛡️ Governance Protection
- **Protected Files**: `AGENTS.md`, `AI_CONTEXT.md`, `REPO_INDEX.md`, `LOGS.md`, `LEARNINGS.md`.
- **Constraint**: **NEVER DELETE**. **NEVER MERGE**. Only **UPDATE/APPEND**.

### 🧠 Compound Knowledge
- Log tricky bugs or architectural decisions in `LEARNINGS.md`.

---

## 🚀 Execute User Request

**The user's actual task/question is in their message alongside `/d`.**
- Execute that task NOW while strictly following the workflow above.
- `/d` enforces the rules; the user's message is the work to be done.
- Do not stop after reading this; fulfill the user's specific request in this turn.

**Full reference**: [AGENTS.md](file:///C:/Users/Harsh/.gemini/antigravity/playground/Palej/AGENTS.md)
