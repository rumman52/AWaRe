# AMR Steward Messaging Pack

## A) Problem + Solution (Hackathon Application, 150–200 words)
Antimicrobial resistance (AMR) is a major global health threat, and WHO highlights misuse and overuse of antimicrobials as key drivers. AMR Steward addresses this at the point of care with practical, guideline-based decision support and a built-in stewardship workflow. Our app turns WHO AWaRe guidance into action: for common infections (UTI, community-acquired pneumonia, and skin/soft-tissue infection), it provides 2–3 empiric options with dose, route, and duration based on the WHO AWaRe Antibiotic Book. Every antibiotic is labeled Access, Watch, or Reserve so teams can avoid unnecessary broad-spectrum use. If a Watch or Reserve option is selected without clear justification, the app warns the user and suggests Access alternatives when appropriate. It also operationalizes a core stewardship process from CDC guidance: a 48–72 hour review checkpoint with reminders and structured suggestions to de-escalate, stop, or switch once new information is available. At system level, the dashboard tracks Access vs Watch/Reserve use, progress toward the WHO ≥70% Access indicator, overdue reviews, and top Watch use to support safer care, lower resistance pressure, and better resource use.

## B) Exactly what we solve
- **Wrong antibiotic choice at start:** We provide infection-specific empiric options linked to AWaRe guidance, so clinicians begin from recommended choices.
- **Overuse of broad antibiotics:** We label every drug as Access/Watch/Reserve, flag unneeded Watch/Reserve use, and suggest Access alternatives when suitable.
- **Wrong duration, route, or dose:** We show structured dose/route/duration guidance to reduce avoidable variation.
- **Missed 48–72 hour review:** We generate “review due” reminders and an overdue queue so reassessment becomes routine.
- **Lack of tracking and accountability:** We provide a stewardship dashboard with Access %, Watch/Reserve use, overdue reviews, and top Watch antibiotics.
- **Inconsistent guideline adherence across teams:** We standardize decision support and rationale display so stewardship practice is more consistent shift-to-shift.

## C) How AI is used safely
AMR Steward uses AI for **decision support only**.
- **Human in the loop:** The clinician must confirm all recommendations and final treatment decisions.
- **Source-linked guidance:** Suggestions are tied to AWaRe-based rules and transparent rationale, not black-box outputs.
- **No autonomous prescribing:** The system does not prescribe, place orders, or replace clinical judgment.
- **Safety note:** This tool supports stewardship workflow and should be used with local policy, microbiology data, and clinician assessment.

## D) Metrics to measure impact
- Increase in **% Access antibiotic use** and progress toward the WHO ≥70% Access benchmark.
- Reduction in **Watch/Reserve starts without documented criteria**.
- Reduction in **inappropriate antibiotic-days** (choice, route, or duration not aligned with guidance).
- Improvement in **48–72 hour review completion rate** and reduction in review overdue cases.
- Increase in **de-escalation/stop/switch actions** after review when clinically appropriate.
- Reduced variation in prescribing patterns across departments/teams.
- Operational gains: less time spent on manual audit preparation and clearer stewardship reporting.

## E) 45–60 second demo day pitch script
"AMR is one of the world’s biggest health threats, and overuse of antibiotics is a key driver. AMR Steward helps hospitals turn stewardship guidance into everyday clinical practice. For common infections like UTI, pneumonia, and skin infections, we provide AWaRe-based empiric options with dose, route, and duration. We clearly label every antibiotic as Access, Watch, or Reserve, and if broad-spectrum choices are used without clear reason, we prompt safer Access alternatives when appropriate. We also add the stewardship step that often gets missed: a 48–72 hour review reminder with structured de-escalate, stop, or switch suggestions once new results come in. At leadership level, our dashboard tracks Access percentage, progress toward the WHO 70% Access goal, overdue reviews, and top Watch use. The AI is decision support only—clinicians stay in control. The result is safer care, less resistance pressure, and better use of hospital time and cost."

## Reference links
- WHO AMR Fact Sheet: https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance
- WHO AWaRe 70% Access indicator: https://www.who.int/data/gho/indicator-metadata-registry/imr-details/5767
- WHO AWaRe Antibiotic Book: https://www.who.int/publications/i/item/9789240062382
- CDC Core Elements (Hospital Stewardship): https://www.cdc.gov/antibiotic-use/hcp/core-elements/hospital.html
