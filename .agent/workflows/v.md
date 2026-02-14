---
description: Nikola Tesla Pre-Visualization - Force deep visualization of execution and usage before building.
---

> [!IMPORTANT]
> **PRE-VISUALIZATION IS MANDATORY.** Do not write a single line of code until you have lived the execution and usage in your mind.

This workflow forces you to slow down and use your "imagination" to simulate the entire process—from implementation to user experience—to ensure 100% flawless execution.

# The Tesla Pre-Visualization Protocol

## 1. Grounding & Forensics (The Past)
*Before visualizing the future, you must understand the past.*
1.  **Understand the Task:** Fully grasp the objective.
2.  **Forensic Analysis (MANDATORY):**
    *   **Read `LOGS.md` & `LEARNINGS.md`:** What happened last time? What are the known pitfalls?
    *   **Read Previous Chats:** Search for similar tasks or past failures in this context. *History repeats itself if you don't read it.*
3.  **Account Verification:** Explicitly visualize running `whoami` commands to confirm you are in **`workwithharshdesai@gmail.com`**.
4.  **Refer to `/d`:** Acknowledge and follow the [Agentic SOPs](../../AGENTS.md).

## 2. Visualization Phase 1: The Implementation (The Builder's Mind)
*Simulate the act of coding and building.*
1.  **Step-by-Step Execution:** Close your "digital eyes" and imagine yourself executing the plan.
    *   *I am opening file X... I am adding function Y...*
2.  **Predict Failures:** As you visualize, ask:
    *   *Where will I get stuck?*
    *   *Will this import cycle cause a build failure?*
    *   *Is the variable name consistent with the existing codebase?*

## 3. Visualization Phase 2: The Build & Deploy (The DevOps Mind)
*Simulate the pipeline. This is where most agents fail.*
1.  **Build Simulation:**
    *   *Imagine `npm run build` running... Does it fail on type errors?*
    *   *Are all Environment Variables (`.env`) present?*
2.  **Deployment Simulation (if applicable):**
    *   *Imagine `npx convex deploy`... Does the schema match?*
    *   *Are we deleting data safely?*

## 4. Visualization Phase 3: The Usage (The User's Mind)
*Simulate the app running in PRODUCTION after your changes.*
1.  **Backend Simulation:** Imagine the server logs.
    *   *Request hits the endpoint... Database query executes... Is the index used?*
2.  **Frontend Simulation:** Imagine the UI interactions.
    *   *User clicks button... Loading state appears... Success toast triggers...*
3.  **Edge Case Simulation:**
    *   *Network fails... Cold start latency... User has no permissions.*

## 5. The Flawless Guarantee
1.  **Self-Correction:** Did you find any failure points? If yes, restart visualization.
2.  **Confirmation:** Only proceed when you have "seen" the future where **Production Deployment** and **User Experience** are 100% flawless.

> "The projector in my brain is better than any compiled binary."

## 6. Execution
Now, and only now, execute the plan that you have already "lived" and verified.

## 7. After Execution: Document
Follow the **Review, Audit & Document** step from [AGENTS.md](../../AGENTS.md). After the mandatory docs update, **optionally** consider updating **`REPO_INDEX.md`**, **`PROJECT_URLS.md`**, or any other document the agent deems worthy of updating (e.g. guides, READMEs, `docs/`) when the run affects structure, URLs, or onboarding.
