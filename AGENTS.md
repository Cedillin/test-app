# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this repo is

A **take-home challenge spec**, not an implemented app. `README.md` is the full
assignment brief and the source of truth for all requirements. As of now there
is **no application code** — only the brief and tooling dirs (`.codegraph/`,
`.cursor/`, `.remember/`).

Task: build a **Gym Kiosk** mobile app where members check in for today's
classes. Stack is the implementer's choice (see below) and has **not been
chosen yet**.

## Hard constraints (from the brief)

- **Time-box: max 2 days.** Scope aggressively; a few polished features beat many half-done ones.
- **Mobile only**: Flutter, React Native, Kotlin Multiplatform, SwiftUI, or Jetpack Compose.
- **Design-driven**: match the [Figma concept](https://www.figma.com/design/yZiTpnsOb9E8v0lUHRHNB9/MAAT-Kiosk-Concept?node-id=0-1&m=dev) (one screen given — extend its language coherently). Uses [Geist font](https://github.com/vercel/geist-font/). Coherence required, pixel-perfection not.
- **Evaluation is weighted 25% each**: Design / Code quality / UX / Ownership & trade-offs. The submission README (architecture, decisions, trade-offs, "what I'd improve") is graded — keep it updated as decisions are made.

## Required user flow (5 screens)

1. **Home** — welcome state + today's classes + nav to a class.
2. **Class** — class info (name, time, instructor) + attendee list (name, photo, status, optional reg time) + "add check-in".
3. **Member Search** — client-side name filter, scrollable list, explicit "no results" state.
4. **Check-In** — selected member's name + today's date + "Check In" CTA.
5. **Success** — confirmation, then **auto-reset to Home after 2–3s** (kiosk returns to ready).

Kiosk-first UX: large tap targets, minimal text input, clear hierarchy. Handle loading / empty / error / success states throughout.

## Data layer

Pick one (both are acceptable):
- **Local JSON (recommended)**: `members.json` (`id`, `firstName`, `lastName`, `profilePicture`) + a classes/sessions JSON; load at startup, hold check-ins in memory or local storage.
- **Minimal API**: `GET /members`, `GET /classes`, `POST /checkins` (any backend).

## Build / run / test

Not established yet — no stack chosen. **Once a stack is picked, replace this
section** with the real install / run / single-test commands for that stack.


<claude-mem-context>
# Memory Context

# [maat-test] recent context, 2026-06-28 8:24pm GMT+2

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 1 obs (645t read) | 50,165t work | 99% savings

### Jun 28, 2026
**753** 8:20p ⚖️ **Gym Kiosk Design Spec Created with Anti-Slop Framework**
A comprehensive design specification was created for a gym kiosk tablet application as part of a take-home challenge with a 2-day time-box. The spec locks technical decisions (Expo + TypeScript, portrait orientation, AsyncStorage for persistence) and extracts design tokens from a provided Figma reference (Aranha gym style).

The review process loaded multiple design quality frameworks: the Hallmark skill (an anti-AI-slop design system with 22 named themes, 21 macrostructures, and 69-gate slop test) and the anti-slop skill (detecting generic AI patterns in text, code, and visual design). These frameworks emphasize avoiding common AI-generated design tells like purple gradients, Inter-everywhere typography, 3-column feature grids, and generic "Get Started" CTAs.

The spec defines a complete flow (home → class → search → check-in → success → auto-reset) with integration test coverage for critical paths. Trade-offs are explicitly documented: Context over Zustand for state (smaller dependency surface), mock QR payload (no real companion app), coherent visual fidelity vs pixel-perfection (per brief requirements).

The design review workflow demonstrates applying rigorous anti-templating standards to a real-world mobile app specification, ensuring decisions are intentional rather than AI-default.
~645t ⚖️ 50,165


Access 50k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>