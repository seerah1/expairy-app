---
id: 001
title: Create Expiry Tracker Constitution
stage: constitution
date: 2026-01-23
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: DELL LATITUDE
command: /sp.constitution
labels: ["constitution", "security", "mobile", "offline-first", "notifications", "data-integrity"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - None (constitution document)
---

## Prompt

Build a secure Food & Document Expiry Tracker mobile application that helps users track expiry dates of food items and important documents and sends timely reminder notifications to reduce waste and avoid penalties.

## Response snapshot

Created comprehensive project constitution (v1.0.0) for Food & Document Expiry Tracker mobile application with seven core principles:

1. **Security & Privacy First (NON-NEGOTIABLE)**: AES-256 encryption at rest, TLS 1.3 in transit, biometric authentication, no sensitive data logging, security audits before releases.

2. **Offline-First Architecture (NON-NEGOTIABLE)**: All core features work without internet, local database as source of truth, optional cloud sync, graceful network handling.

3. **Notification Reliability (NON-NEGOTIABLE)**: Platform-native notification APIs, survives app termination/restarts, configurable timing, multiple schedules per item, delivery verification.

4. **Data Integrity & Accuracy (NON-NEGOTIABLE)**: ISO 8601 date format, timezone handling, atomic transactions, backup/restore, confirmation for critical operations.

5. **Test-First Development (NON-NEGOTIABLE)**: Red-Green-Refactor cycle, 80% code coverage target, unit/integration/UI/security tests, CI/CD pipeline integration.

6. **User Experience & Accessibility**: Platform design guidelines, 3-tap maximum for critical actions, VoiceOver/TalkBack support, dark mode, minimum touch targets.

7. **Performance Standards**: <2s cold start, 60fps scrolling, indexed database queries, <2% battery drain/hour, <100MB RAM usage.

Additional sections include Security Requirements (data classification, controls, compliance), Performance Standards (mobile benchmarks, resource constraints), Development Workflow (branching, code review, quality gates), and Governance (amendment process, versioning, compliance verification).

## Outcome

- ✅ Impact: Established foundational governance document defining non-negotiable principles for secure, reliable mobile expiry tracking application
- 🧪 Tests: No tests (documentation artifact)
- 📁 Files: Created .specify/memory/constitution.md (v1.0.0)
- 🔁 Next prompts: /sp.specify to create feature specification, /sp.plan for implementation planning
- 🧠 Reflection: Constitution emphasizes mobile-specific concerns (offline-first, notifications, performance) and security given sensitive document handling. Seven principles balance technical requirements with user experience and accessibility needs.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual review - PASS (all placeholders filled, principles testable and declarative, mobile-specific benchmarks included)
- Prompt variant (if applicable): N/A (initial constitution)
- Next experiment (smallest change to try): Monitor whether notification reliability and offline-first principles require refinement during implementation planning phase
