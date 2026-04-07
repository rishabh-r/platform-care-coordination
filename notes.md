# Project Memory — The Time Traveller (CareBridge)

## Project Overview
- **What**: A clinical chatbot (CareBridge) that retrieves patient data from FHIR R4 APIs using Azure OpenAI function calling
- **Stack**: React (Vite) frontend, Vercel Edge Functions (api/chat.js) proxy to Azure OpenAI, FHIR R4 backend
- **FHIR Base URL**: `https://fhirassist.rsystems.com:8081`
- **GitHub**: `https://github.com/rishabh-r/platform-care-coordination.git` (branch: main)
- **Originally**: Vanilla JavaScript (app.js), converted to React without changing UI/logic

---

## Architecture

### Frontend Files
- `src/main.jsx` — React entry point
- `src/App.jsx` — Top-level component (login/home routing)
- `src/components/LoginScreen.jsx` — Login UI
- `src/components/HomeScreen.jsx` — Home screen UI
- `src/components/ChatWidget.jsx` — Core chat logic (tool execution, message rendering)
- `src/utils.js` — Markdown, Chart.js, time formatting utilities
- `src/styles.css` — All styles (unchanged from original)
- `src/config/constants.js` — Centralized constants (FHIR_BASE, etc.)
- `src/config/knowledgeBases.js` — ICD-9 codes, LOINC codes, drug codes, CPT codes, observation ranges
- `src/config/systemPrompt.js` — Full system prompt with response patterns, care gaps, clinical summary logic
- `src/config/tools.js` — 14 OpenAI function-calling tool definitions + end_chat
- `src/services/auth.js` — Login/authentication
- `src/services/fhir.js` — FHIR API calls and `executeTool()` with all 14 tool cases
- `src/services/openai.js` — Azure OpenAI streaming API communication
- `api/chat.js` — Vercel Edge function proxy to Azure OpenAI

### Key Config Files
- `vite.config.js` — Vite config
- `vercel.json` — Vercel deployment config
- `package.json` — React dependencies

---

## All 14 FHIR APIs Integrated

| # | Tool Name | API Endpoint | Key Params |
|---|-----------|-------------|------------|
| 1 | search_fhir_patient | /baseR4/Patient | GIVEN, FAMILY, EMAIL, GENDER, BIRTHDATE, PATIENT_ID |
| 2 | search_patient_condition | /baseR4/Condition | PATIENT, CODE (ICD-9), page |
| 3 | search_patient_procedure | /baseR4/Procedure | PATIENT, CODE (CPT), page |
| 4 | search_patient_medications | /baseR4/MedicationRequest | PATIENT, DRUG_CODE, STATUS, page |
| 5 | search_patient_encounter | /baseR4/Encounter | PATIENT, STATUS, CLASS (IMP/AMB), DATE, DATE2, page |
| 6 | search_patient_observations | /baseR4/Observation/search | PATIENT, CODE (LOINC), CATEGORY, VALUE_QUANTITY, DATE, page |
| 7 | search_patient_service_request | /baseR4/ServiceRequest | PATIENT, _ID, page |
| 8 | search_patient_document_reference | /baseR4/DocumentReference | PATIENT, _ID, page |
| 9 | search_patient_diagnostic_report | /baseR4/DiagnosticReport | PATIENT, _ID, page |
| 10 | search_patient_episode_of_care | /baseR4/EpisodeOfCare | PATIENT, STATUS, TYPE, _ID, page |
| 11 | search_practitioner | /baseR4/Practitioner | NAME, SPECIALTY, _ID, page |
| 12 | search_patient_allergy | /baseR4/AllergyIntolerance | PATIENT, _ID, page |
| 13 | search_patient_appointment | /baseR4/Appointment | PATIENT, STATUS, _ID, page |
| 14 | search_patient_immunization | /baseR4/Immunization | PATIENT, _ID, page |

All APIs use `page=0` + `size=100` (fetch all results in one call — no multi-page pagination needed).

---

## Database Schema (DESIGN_DOCUMENT.pdf)

The backend database follows the schema defined in `DESIGN_DOCUMENT.pdf` (located at `D:\new api integration\DESIGN_DOCUMENT.pdf`).

### Key Schema Changes from v1 to v2
- **UUIDs** as primary keys (not numeric IDs)
- **Unified `encounter` table** — replaces old `Visit_Admission` + `Visit_Outpatient`
- **Audit columns** on every table: `version`, `created_at`, `updated_at`
- **Master table FK pattern** — conditions, observations, procedures reference master tables via FK IDs
- **New tables**: `organization`, `patient_identifier`, `medication_code_master`, `episode_of_care` (+ sub-tables)
- Patient IDs are UUIDs (system prompt and tools updated accordingly)

### Master Tables (already exist in database)
- **Condition_Master** — 14,567 rows, columns: `row_id`, `icd9_code`, `short_title`, `long_title`, `category`, `cat_code`
- **Measurement_Master** — 773 rows, columns: `row_id`, `itemid`, `label`, `fluid`, `category`, `loinc_code`
- **Procedure_Master** — 134 rows, columns: `row_id`, `category`, `sectionrange`, `sectionheader`, `subsectionrange`, `subsectionheader`, `codesuffix`, `mincodeinsubsection`, `maxcodeinsubsection`

### FK Chain for Observations (critical to understand)
```
observation.observation_code_id → Measurement_Master.row_id → Measurement_Master.loinc_code
```
Bot passes LOINC code → backend searches Measurement_Master for loinc_code → gets row_id → searches observation table by observation_code_id.

### Design Document Table Details (from PDF analysis)
Each table in the PDF follows this pattern: UUID primary key `id`, entity-specific columns, and audit columns (`version`, `created_at`, `updated_at`).

**Tables defined in DESIGN_DOCUMENT.pdf:**
| Table | Key Columns | Notes |
|-------|-------------|-------|
| organization | id, name, type_code, type_display, active, address_*, telecom_* | Healthcare organizations |
| practitioner | id, active, family, given, prefix, gender, birth_date, qualification_code, qualification_display, specialty_code, specialty_display, organization_id, telecom_* | Doctors + care coordinators |
| patient | id, active, gender, birth_date, deceased_flag, deceased_date, marital_status_code/display, language_code/display, primary_practitioner_id (FK→practitioner), managing_organization_id (FK→organization) | Core patient demographics |
| patient_identifier | id, patient_id (FK→patient), system, value, type_code | MRN, SSN, etc. |
| patient_name | id, patient_id (FK→patient), use_type, family, given_first, given_middle, prefix, suffix, period_start/end | Official/nickname |
| patient_address | id, patient_id (FK→patient), use_type, type, line1, line2, city, state, postal_code, country, period_start/end | Home/work address |
| patient_telecom | id, patient_id (FK→patient), system, value, use_type, rank | Phone/email/fax |
| encounter | id, status, encounter_class (IMP/AMB/EMER), type_code/display, patient_id (FK), practitioner_id (FK), period_start/end, admission_location, discharge_location, discharge_disposition_code, reason_code/display, diagnosis_text, insurance, clinical_notes | Unified inpatient+outpatient |
| condition | id, patient_id (FK), encounter_id (FK), recorder_id (FK→practitioner), condition_code_id (FK→Condition_Master), clinical_status, verification_status, severity_code/display, seq_num, onset_date, abatement_date, recorded_date | Diagnoses |
| observation | id, patient_id (FK), encounter_id (FK), performer_id (FK→practitioner), observation_code_id (FK→Measurement_Master), status, value_quantity, value_unit, value_string, interpretation_code, effective_date, issued | Labs/vitals |
| procedure | id, patient_id (FK), encounter_id (FK), performer_id (FK→practitioner), procedure_code_id (FK→Procedure_Master), cpt_code, status, description, performed_start/end, body_site_code/display, outcome_code | Surgeries/procedures |
| medication_code_master | id, code_system, code_value, code_display, generic_name, form_code, form_display, active | Drug catalog (new table) |
| medication_request | id, patient_id (FK), encounter_id (FK), requester_id (FK→practitioner), medication_code_id (FK→medication_code_master), status, intent, priority, dosage_text, dosage_route_code/display, dose_value/unit, frequency_text, reason_code/display, note, authored_on, valid_start/end | Prescriptions |
| appointment | id, patient_id (FK), practitioner_id (FK), status, type_code/display, reason_code/display, description, start_time, end_time, minutes_duration, location, clinical_notes | Scheduled visits |
| allergy_intolerance | id, patient_id (FK), recorder_id (FK→practitioner), clinical_status, verification_status, type, category, criticality, code_value, code_display, reaction_substance, reaction_manifestation, reaction_severity, onset_date, recorded_date, note | Allergies |
| diagnostic_report | id, patient_id (FK), encounter_id (FK), performer_id (FK→practitioner), status, category_code/display, code_value/display, effective_date, issued, conclusion | Lab/imaging reports |
| diagnostic_report_observation | id, diagnostic_report_id (FK→diagnostic_report), observation_id (FK→observation) | Links reports to observations |
| service_request | id, patient_id (FK), encounter_id (FK), requester_id (FK→practitioner), status, intent, priority, code_value/display, reason_code/display, note, authored_on | Referrals/orders |
| immunization | id, patient_id (FK), encounter_id (FK), performer_id (FK→practitioner), status, vaccine_code/display, occurrence_date, lot_number, site_code/display, dose_quantity/unit, note | Vaccinations |
| document_reference | id, patient_id (FK), encounter_id (FK), author_id (FK→practitioner), status, type_code/display, category_code/display, description, content_type, content_url, content_title, date_created | Clinical documents |
| episode_of_care | id, patient_id (FK), managing_organization_id (FK), care_manager_id (FK→practitioner), type_code/display, status, period_start/end | Care programs |
| episode_of_care_diagnosis | id, episode_of_care_id (FK), condition_id (FK→condition), role_code/display, rank | Linked diagnoses |
| episode_of_care_encounter | id, episode_of_care_id (FK), encounter_id (FK→encounter) | Linked encounters |
| episode_of_care_status_history | id, episode_of_care_id (FK), status, period_start/end | Status changes |

**Note:** EpisodeOfCare tables were NOT in the original PDF but confirmed by user via DBeaver screenshot to exist in the database. Schema was inferred from the database structure.

---

## Swagger / API Documentation
- **Swagger v3 docs endpoint**: `https://fhirassist.rsystems.com:8081/v3/api-docs`
- All APIs follow Spring Boot FHIR R4 pattern
- Pagination: Spring Boot `pageable` with `page` (0-indexed) and `size` params
- Auth: Bearer token in Authorization header
- Response format: FHIR R4 Bundle with `entry[].resource` pattern

---

## User's Data Creation Instructions (Story Rules)

These are the rules the user specified for creating patient test data. Follow these for ALL future patients:

1. **Time span**: 3 years of clinical history (e.g., March 2023 — March 2026)
2. **Encounters**: Mix of inpatient (IMP) and outpatient (AMB) — Patient 1 has 20, Patient 2 should have 25
3. **Genuine data**: All diagnoses, diagnosis codes, clinical notes must look realistic. Don't copy from master tables — think of genuine diagnoses yourself
4. **Clinical notes**: Keep very short
5. **Observations**: Pick 7 genuine lab types relevant to the patient's disease from Measurement_Master. Same observation can repeat across encounters but must have 7 unique types
6. **Conditions**: For each encounter, assign conditions with seq_num. seq_num=1 is primary, seq_num=2 is secondary. Keep seq_num=2 rare (most encounters just seq_num=1)
7. **Procedures**: Only for inpatient (hadm_id). Look up CPT codes from Procedure_Master. Max 2 procedures per encounter. Different times for chartdate
8. **Medications**: Max 2 medications per encounter. Think yourself what's best for the patient's condition. Keep is_active=1 for active
9. **Date formats**: Follow the format used in existing data
10. **Care gaps MUST be simulated**:
    - **Medication non-adherence**: Set status="stopped", add note with "Care gap", "self-discontinued", "stopped by patient", "did not inform care team"
    - **Missed follow-up appointments**: Set encounter status="cancelled", add clinical_notes with "No-show" details
11. **Story-based**: Each patient should have a coherent clinical story (disease progression, complications, treatments)
12. **All APIs must have data**: No API should be left without backing data — every API must return results for the patient
13. **UUIDs**: All primary keys are UUIDs
14. **FK references**: Use correct FK IDs from master tables (Condition_Master, Measurement_Master, Procedure_Master)
15. **Episodes of Care**: Include care coordinators (not doctors — nurses/case managers who manage care programs)
16. **Knowledge base**: After creating patient data, ensure all codes used (ICD, LOINC, CPT, drug codes) are present in knowledgeBases.js

### Patient Plans
- **Patient 1**: Male, Type 2 Diabetes with complications, 20 encounters — COMPLETED (James Robert Mitchell)
- **Patient 2**: Female, CHF (Congestive Heart Failure), 25 encounters — PENDING

---

## Excel File: chatbase_data.xlsx

### Current State: 27 sheets

**3 Master/Lookup Tables (kept for FK reference when creating future patients):**
1. Measurement_Master (773 rows)
2. Condition_Master (14,567 rows)
3. Procedure_Master (134 rows)

**24 New Schema Sheets (Patient 1 data):**
4. organization
5. practitioner (includes 4 care coordinators)
6. patient
7. patient_identifier
8. patient_name
9. patient_address
10. patient_telecom
11. encounter (20 entries — mix of IMP and AMB)
12. condition
13. observation (74 rows, 7 unique observation types)
14. procedure
15. medication_code_master (11 medications)
16. medication_request (12 entries)
17. appointment
18. allergy_intolerance
19. diagnostic_report
20. diagnostic_report_observation
21. service_request
22. immunization
23. document_reference
24. episode_of_care
25. episode_of_care_diagnosis
26. episode_of_care_encounter
27. episode_of_care_status_history

### Deleted Old Sheets (no longer needed)
Person, Person_name, Person_Address, Person_Language, Person_Telecom, Extensions, Person_Measurement, Person_condition, Visit_Admission, Visit_Outpatient, Person_Procedure, Prescription — these were old v1 schema patient-specific data for 100+ patients.

---

## Patient 1 — James Robert Mitchell

- **Patient UUID**: `a3f8b2c1-7d4e-4a91-b6e5-9c2d1f3e8a7b`
- **DOB**: 15-Jun-1978
- **Gender**: Male
- **Marital Status**: Married
- **Language**: English
- **Primary Disease**: Type 2 Diabetes Mellitus with complications
- **Primary Practitioner**: Dr. Chen (UUID: `b2c7d4e1-8f3a-4b5c-9d6e-1a2b3c4d5e6f`)
- **Managing Organization**: Endocrinology Associates (UUID: `f6a1b8c5-2d7e-8f9a-3b0c-5e6f7a8b9c0d`)
- **Time Span**: March 2023 — March 2026 (3 years)
- **Encounters**: 20 total (mix of inpatient IMP and outpatient AMB)

### Conditions (ICD-9 codes used)
- 25000 — DMII wo cmp (condition_code_id: 1591)
- 25002 — DMII wo cmp uncntrld (1593)
- 25012 — DMII ketoacd uncontrold (1597)
- 25062 — DMII neuro uncntrld (2265)
- 2510 — Hypoglycemic coma (2279)
- 2724 — Hyperlipidemia NEC/NOS (2747)
- 4019 — Hypertension NOS (4304)
- 6826 — Cellulitis of leg (7283)

### Observations (7 unique types, LOINC codes)
| observation_code_id | Label | LOINC | In Knowledge Base |
|---|---|---|---|
| 53 | Hemoglobin A1c | 4548-4 | ✓ |
| 113 | Creatinine | 2160-0 | ✓ |
| 132 | Glucose | 2345-7 | ✓ |
| 172 | Potassium | 2823-3 | ✓ |
| 200 | Triglycerides | 1644-4 | ✓ |
| 106 | Cholesterol LDL | 2090-9 | ✓ |
| 108 | Cholesterol Total | 2093-3 | ✓ |

### Procedures (CPT codes used)
99222, 82947, 96365, 80053, 96360, 11042, 99232, 99254 — all in knowledge base.

### Medications (medication_code_master IDs)
1=Metformin 500mg, 2=Metformin 1000mg, 3=Aspirin 81mg, 4=Lisinopril 10mg, 5=Insulin Regular, 6=NS 0.9%, 7=Insulin Glargine, 8=Atorvastatin 20mg, 9=Dextrose 50%, 10=Cephalexin 500mg, 11=Gabapentin 300mg

### Care Gaps Simulated
- **Medication non-adherence**: Aspirin self-discontinued (status=stopped, note contains "Care gap — patient self-discontinued")
- **Missed appointments**: Encounters with status=cancelled and clinical_notes containing "No-show"

### Episodes of Care (4 programs)
- Diabetes Disease Management (active)
- Diabetic Neuropathy Pain Management (active)
- Hypertension Monitoring (active)
- Diabetic Foot Care (finished)

### Care Coordinators (added to practitioner sheet)
- Rebecca Torres, RN — Diabetes Care Coordinator
- Maria Santos, RN — Neuropathy Care Coordinator
- David Park, RN — Hypertension Care Coordinator
- Jennifer Walsh, RN — Wound Care Coordinator

---

## Patient 2 — Sarah Elizabeth Cooper

- **Patient UUID**: `a3e838d7-a0dc-41af-859b-113c9dc93ea9`
- **DOB**: 20-Feb-1955
- **Gender**: Female
- **Marital Status**: Married
- **Language**: English
- **Primary Disease**: Congestive Heart Failure (CHF) with AFib, HTN, CKD
- **Primary Practitioner**: Dr. Anita Patel (UUID in practitioner sheet, Cardiology)
- **Managing Organization**: Raleigh Heart & Vascular Center (UUID in organization sheet)
- **Time Span**: March 2023 — March 2026 (3 years)
- **Encounters**: 25 total (6 IMP + 17 AMB + 2 cancelled no-shows)
- **Excel background**: All Patient 2 rows have **yellow background** (`#FFFF99`)

### Clinical Story
- Mar 2023: Initial CHF diagnosis (LVEF 38%), started Furosemide + Lisinopril
- Jun 2023: First acute decompensation (IMP), IV diuretics, 3-day admission
- Sep 2023: AFib detected, started Warfarin, discontinued Aspirin
- Oct 2023: AFib with RVR (HR 142), cardioversion (IMP)
- Feb 2024: Missed appointment (CARE GAP — no-show)
- May 2024: CHF exacerbation — patient self-discontinued Furosemide (CARE GAP — medication non-adherence)
- Jun 2024: Post-discharge, restarted Furosemide, added Spironolactone + KCl
- Aug 2024: CKD Stage 3 diagnosed (cardiorenal syndrome), Creatinine 1.5
- Oct 2024: Fluid overload with pleural effusions (IMP), Digoxin added
- Dec 2024: Missed appointment (CARE GAP — no-show)
- Feb 2025: Severe CHF exacerbation, ICU admission (LVEF 25%), IV Milrinone
- Mar 2025: Switched Lisinopril → Entresto (Sacubitril-Valsartan)
- Jul 2025: Elective cardiac catheterization — moderate non-obstructive CAD, no intervention
- Oct 2025: Clinically improved, NYHA Class II, cardiac rehab completing
- Mar 2026: Latest visit — stable, LVEF 38%, NT-proBNP 380 (near normal)

### Conditions (ICD-10 codes, condition_code_id from Condition_Master)
- 4473 — CHF NOS (I50814)
- 4477 — Chr systolic hrt failure (I5022)
- 4481 — Chr diastolic hrt fail (I5032)
- 4476 — Acute systolic hrt failure (I5021)
- 4478 — Ac on chr syst hrt fail (I5023)
- 4462 — Atrial fibrillation (I4891)
- 14618 — Paroxysmal AFib (I48.0)
- 4304 — Hypertension NOS (I10)
- 14590 — CKD stage 3 (N18.3)
- 14617 — T2DM without complications (E11.9)
- 5273 — Acute lung edema (J810)
- 12123 — Edema (R600)
- 5149 — Pleural effusion (J90)
- 2745 — Mixed hyperlipidemia (E782)

### Observations (9 unique types including vitals)
| observation_code_id | Label | LOINC | Unit | In Knowledge Base |
|---|---|---|---|---|
| 1 | Heart Rate | 8867-4 | /min | ✓ |
| 2 | Systolic Blood Pressure | 8480-6 | mmHg | ✓ |
| 3 | Diastolic Blood Pressure | 8462-4 | mmHg | ✓ |
| 4 | Body Temperature | 8310-5 | degC | ✓ |
| 10 | Glucose | 2345-7 | mg/dL | ✓ |
| 11 | Creatinine | 2160-0 | mg/dL | ✓ |
| 17 | NT-proBNP | 33762-6 | pg/mL | ✓ |
| 24 | Potassium | 2823-3 | mEq/L | ✓ |
| 25 | Sodium | 2951-2 | mEq/L | ✓ |

Total: 147 observations across 23 non-cancelled encounters.

### Procedures (CPT codes)
93000, 93010, 93303, 93306, 99222, 99223, 99254, 99291 — all in knowledge base.
12 procedures across 6 inpatient encounters (max 2 per encounter).

### Medications (medication_code_master IDs)
New: 249=Furosemide 40mg, 250=Metoprolol Succinate ER 25mg, 251=Digoxin 0.125mg, 252=Spironolactone 25mg
Existing reused: 3=Aspirin 81mg, 4=Lisinopril 10mg, 24=Sacubitril-Valsartan 97-103mg, 26=Warfarin 5mg, 155=KCl 20mEq

### Care Gaps Simulated
- **Medication non-adherence**: Furosemide self-discontinued (status=stopped, note contains "Care gap — patient self-discontinued furosemide due to frequent urination")
- **Missed appointments**: Encounter 9 (Feb 2024) and Encounter 16 (Dec 2024) both status=cancelled with "No-show" clinical notes

### Episodes of Care (4 programs)
- CHF Disease Management Program (active) — Care Coordinator: Lisa Martinez, RN
- Atrial Fibrillation Monitoring Program (active) — Care Coordinator: Angela Johnson, RN
- Chronic Kidney Disease Monitoring (active) — Care Coordinator: Patricia Williams, RN
- Cardiac Rehabilitation Program (finished) — Care Coordinator: Karen Anderson, RN

### Other Data
- **Allergies**: 3 (Iodine contrast dye, Shellfish, NSAID intolerance)
- **Diagnostic Reports**: 5 (Echo, CMP, ECG, Cardiac Cath, NT-proBNP Trend)
- **Service Requests**: 5 (Echo, Pulmonology consult, Nephrology consult, Cardiac cath, Cardiac rehab)
- **Immunizations**: 6 (Influenza x3, Pneumococcal PCV20, COVID-19 booster, Td)
- **Document References**: 6 (5 discharge summaries + 1 cardiac cath procedure note)

### Testing Prompts for Patient 2
1. "Search for patient Sarah Cooper"
2. "What are the active conditions for this patient?"
3. "Show me all inpatient admissions for this patient"
4. "What is the latest NT-proBNP for this patient?"
5. "Show recent observations for this patient"
6. "List all medications for this patient"
7. "Perform a care gap analysis for this patient"
8. "Show appointments for this patient"
9. "Does this patient have any allergies?"
10. "What vaccines has this patient received?"
11. "Show episodes of care for this patient"
12. "Who are the care coordinators for this patient?"
13. "Show diagnostic reports for this patient"
14. "Find Dr. Patel"
15. "Give me a full clinical summary of this patient"
16. "Show me the NT-proBNP trend as a chart"
17. "Show blood pressure trends for this patient"
18. "Show heart rate trends for this patient"

---

## Data Generation Scripts (in project root, not committed to git)
- `generate_patient1.py` — First version (superseded)
- `generate_patient1_v2.py` — Patient 1 data per DESIGN_DOCUMENT.pdf schema
- `generate_episode_of_care.py` — Added EpisodeOfCare sheets + care coordinators
- `cleanup_sheets.py` — Deleted old patient-specific sheets
- `check_codes.py` — Verified FK code mappings
- `check_old_sheets.py` — Analyzed old sheets before deletion
- `fix_units.py` — Added missing expected_unit values to Measurement_Master (335 units filled)
- `generate_patient2.py` — Patient 2 (Sarah Cooper) CHF data, all 24 sheets with yellow background

---

## Knowledge Bases (src/config/knowledgeBases.js)
- **CONDITION_CODES** — ICD-9 + ICD-10 codes (all Patient 1 and Patient 2 codes included)
- **LOINC_CODES** — 68 LOINC codes with units (all Patient 1 and Patient 2 observations included)
- **DRUG_CODES** — Drug formulary codes including INSR, ENTR49/97, SACV49/97 (all Patient 1 and Patient 2 drugs covered)
- **PROCEDURE_CODES** — CPT code ranges + specific codes including 93000, 93010, 93303 (all Patient 1 and Patient 2 procedures included)
- **OBSERVATION_RANGES** — Normal ranges with Low/Normal/High classifications (includes BP, HR, temp, glucose, NTproBNP, sodium, potassium, creatinine)

---

## System Prompt Key Features (src/config/systemPrompt.js)
- Response patterns for all 14 APIs — NO API pagination (all results returned in single call with size=100)
- **Display chunking (conditions only)**: Conditions API shows 15 at a time from the same API response (no new API call). User says "more" → next batch from same data. Other APIs show all results at once
- Explicit instruction to display every entry individually even if ICD/LOINC codes repeat (each is tied to different encounter/date)
- Care gap analysis (missed follow-ups, clinical deterioration, medication non-adherence)
- Clinical summary (fetches all APIs simultaneously)
- Discharge summary
- Chart support ([CHART:{...}] format)
- EpisodeOfCare care coordinator pattern (answers "who is taking care of this patient?")
- Cross-patient search by code (conditions, medications, procedures, observations)

---

## Testing Prompts for Patient 1
1. "Search for patient James Mitchell"
2. "What are the active conditions for this patient?"
3. "Show me all inpatient admissions for this patient"
4. "What is the latest HbA1c for this patient?"
5. "Show recent observations for this patient"
6. "List all medications for this patient"
7. "Perform a care gap analysis for this patient"
8. "Show appointments for this patient"
9. "Does this patient have any allergies?"
10. "What vaccines has this patient received?"
11. "Show episodes of care for this patient"
12. "Who are the care coordinators for this patient?"
13. "Show service requests for this patient"
14. "Show diagnostic reports for this patient"
15. "Show clinical documents for this patient"
16. "Find Dr. Chen"
17. "Give me a full clinical summary of this patient"
18. "Show me the HbA1c trend as a chart"

---

## Debugging Approach
When testing, if issues arise:
1. Hit the API in Postman and copy the curl + response
2. Copy the chatbot's response
3. Share both — this allows comparison of raw API data vs bot interpretation

---

## Git Commands (PowerShell)

**Note: This is a PowerShell environment — `&&` does NOT work. Run commands one by one.**

```powershell
# Check status
git status

# Stage specific files (exclude Excel, Python scripts)
git add src/config/systemPrompt.js src/config/tools.js src/config/knowledgeBases.js

# Stage all code changes (be selective, don't include .xlsx or .py data scripts)
git add src/

# Commit
git commit -m "Your commit message here"

# Push to GitHub
git push origin main

# Check recent commits
git log --oneline -5

# Check what changed
git diff --stat

# Check remote
git remote -v
```

**Files to NEVER commit**: `chatbase_data.xlsx`, `generate_*.py`, `check_*.py`, `cleanup_sheets.py`, `~$chatbase_data.xlsx`, `.env`

---

## Care Gap Dashboard (CareCord AI)

### Overview
After a care gap analysis, the chatbot shows a "Launch CareCord AI" button that opens a dynamic dashboard page at `/dashboard?patient={patientId}`. The dashboard displays AI-structured care gap insights, patient data, and an action approval workflow.

### Old Implementation Reference
The full working implementation exists at `D:\Fresh FHIR\the-time-traveller-main` with these key files:
- `src/components/DashboardPage.jsx` (966 lines) — Full dashboard component
- `src/dashboard.css` (23,628 bytes) — Full dashboard styling
- `src/App.jsx` — React Router setup with `/` and `/dashboard` routes
- `src/components/ChatWidget.jsx` — CareCordButton component + sessionStorage caching

### Flow
1. **ChatWidget.jsx** — When user asks a care gap question:
   - Detects "care gap" in user message
   - Stores bot's care gap response in `sessionStorage` key: `dashboard_caregap_{patientId}`
   - Shows "Launch CareCord AI" button with dynamic URL: `/dashboard?patient={patientId}`

2. **App.jsx** — Uses `react-router-dom` with `BrowserRouter`:
   - `/` → MainApp (login + home + chat)
   - `/dashboard` → DashboardPage

3. **DashboardPage.jsx** — Reads `patient` from URL query params, then:
   - Fetches patient details from FHIR: `/baseR4/Patient/{patientId}`
   - Fetches medications + encounters from FHIR directly
   - Reads cached care gap text from `sessionStorage`
   - Sends care gap text to a **second AI call** (`callAIForAnalysis`) via `/api/chat` endpoint
   - AI extracts structured JSON with: `alerts`, `trends`, `aiActions`, `missedAppointments`
   - If no cached text, falls back to fetching FHIR data directly and summarizing
   - Falls back to `MOCK_DATA` for sections without live data (vitals, care team, clinical notes, risk insights)

### AI Analysis Prompt (callAIForAnalysis)
The dashboard sends the care gap text to AI with a system prompt that extracts:
```json
{
  "alerts": [{ "title": "...", "detail": "...", "severity": "CRITICAL|HIGH|MEDIUM" }],
  "trends": [{ "label": "SHORT_LABEL", "value": "value with units", "status": "critical|high|medium" }],
  "aiActions": [{ "title": "...", "priority": "High|Medium|Low Priority", "timeframe": "Within 24 hours|48 hours|1 week", "description": "...", "rationale": "..." }],
  "missedAppointments": [{ "title": "...", "date": "...", "location": "...", "reason": "..." }]
}
```
- Always returns exactly 3 alerts: Clinical Deterioration, Medication Non-Adherence, Missed Follow-Up
- Trends: all abnormal/deteriorating observations with values and status
- AI Actions: 4-6 recommended actions with priority, timeframe, description, rationale
- Missed Appointments: all no-shows/cancellations extracted from care gap text

### Dashboard UI Sections
1. **Navbar** — Logo, "Patient 360 Portal" title, nav links (Care Manager/Provider/Patients), notifications bell, user info
2. **Sub-header** — Back button, breadcrumb, quick-scroll pills (Vitals/Medications/Appointments)
3. **Patient Banner** — Avatar with initials, name, High Priority pill, Care Gap pill, age/gender/MRN/programs, DOB/phone/email, "Mark as Reviewed" button
4. **Alert Triggers & Risk Drivers** — 3 alert cards (Clinical Deterioration ⚠, Medication Non-Adherence 💊, Missed Appointments 📅) with severity pills + Deteriorating Clinical Trends chips
5. **Risk Insights** — AI-powered risk percentages (static/mock)
6. **Tabs** — AI Actions (active), Clinical Trends, Task Queue, Patient Outreach (disabled)
7. **AI-Recommended Actions** — Checkbox-selectable action cards with priority pills, timeframe, description, AI rationale. "Approve Selected" button opens modal
8. **Approval Modal** — Lists selected actions, coordinator notes textarea, "Confirm & Create Tasks" button
9. **Vitals** — Grid cards with icons, values, normal ranges, status bars (mock data)
10. **Medications** — List from FHIR with name, dose, frequency, status pills (Active/Discontinued/On-hold), show more/less
11. **Appointments & Encounters** — From FHIR + AI-extracted missed appointments, with status pills (Upcoming/Completed/Missed), show more/less
12. **Right Sidebar — Care Team** — Team members with avatars, roles, departments, call/email buttons (mock data)
13. **Right Sidebar — Clinical Notes** — Filterable notes (All/Clinical/Coordination) with author, role, text, date (mock data)

### Adaptation Needed for Current Codebase
- Add `react-router-dom` dependency
- Change API params from `subject` to `patient` (v2 API)
- Copy `DashboardPage.jsx` and adapt for v2 APIs
- Copy `dashboard.css`
- Update `App.jsx` with Router + `/dashboard` route
- Update `ChatWidget.jsx` with `CareCordButton` component + sessionStorage caching (replace static Figma URL)
- Update `vercel.json` for SPA routing (rewrites for `/dashboard`)

### Current State — IMPLEMENTED
- **Old codebase reference**: `D:\Fresh FHIR\the-time-traveller-main`
- **Current codebase**: Dynamic dashboard fully ported and adapted for v2 APIs
- **Status**: COMPLETED — all changes done, build passes clean

### Files Added/Changed for Dashboard
- `package.json` — Added `react-router-dom`
- `src/App.jsx` — Added `BrowserRouter` with `/` and `/dashboard` routes, imports `formatDisplayName` from utils
- `src/utils.js` — Added `formatDisplayName` (shared between App and Dashboard)
- `src/components/ChatWidget.jsx` — Care gap response cached in `sessionStorage` (`dashboard_caregap_{patientId}`), static Figma URL replaced with dynamic `/dashboard?patient={patientId}`
- `src/components/DashboardPage.jsx` — Ported from old codebase, adapted: `subject` → `patient`, `/Observations` → `/Observation/search`, import `FHIR_BASE` from `../config/constants`
- `src/dashboard.css` — Copied from old codebase (full dashboard styling)
- `public/images/LogoRsi.png` — Dashboard logo (copied from old codebase)
- `vercel.json` — Added SPA rewrite: `{ "source": "/((?!api/).*)", "destination": "/index.html" }`

---

## Known Issues / Bugs Found During Testing

### 1. Pagination Overlap — Size 20 → 100 Fix (FIXED)
- **Problem**: Backend pagination is non-standard. The `page` param always steps by a fixed offset of 10, regardless of `size`. So `page=0&size=20` returns results 1–20, but `page=1&size=20` returns results 11–30 (overlapping with results 11–20 from page 0). This caused the LLM to receive duplicate entries and display fewer unique conditions (17 shown out of 21 total).
- **Root cause**: Backend uses `offset = page × 10` (fixed step of 10), not standard `offset = page × size`.
- **How pagination actually works**:
  - page=0, size=10 → results 1–10
  - page=0, size=20 → results 1–20
  - page=0, size=30 → results 1–30
  - page=1, size=10 → results 11–20
  - page=1, size=20 → results 11–30 (overlap!)
- **Fix applied**: Changed `size=20` to `size=100` across all 14 APIs in `src/services/fhir.js`. Since no patient will have >100 results for any single resource type, this fetches everything in one call — no pagination needed, no overlap.
- **Commit**: `c8c9e0f` — "Update API page size from 20 to 100 to fetch all results in single call"
- **Status**: FIXED and pushed to GitHub
- **System prompt update**: Removed ALL multi-page pagination instructions (page=1, page=2 etc.) from all API response patterns. All APIs now say "Display ALL results" from the single call. Conditions API only has display-side chunking (15 at a time from same data, no new API call)
- **Display pagination rule was tried globally for all APIs (15 at a time) but reverted** — only kept for conditions API since it can have many entries. Other APIs show all results at once

### 2. Observation API — Missing `code` field (BACKEND FIX NEEDED)
- **Problem**: The FHIR Observation API response is missing the `code` element entirely. Each observation has `valueQuantity`, `interpretation`, `effectiveDateTime` but NO `code` field (no LOINC code, no display name).
- **Impact**: The chatbot searches observations by LOINC code (e.g., `CODE=4548-4` for HbA1c). Since the backend has no LOINC mapping in the response, these searches return 0 results → "No data available."
- **Postman works without code param**: Searching with just `patient` + `date` returns 23 results (all observations), but they're unidentifiable without the `code` field.
- **Root cause**: Backend isn't joining `observation.observation_code_id` → `Measurement_Master.row_id` → `Measurement_Master.loinc_code` to populate the FHIR `resource.code` field.
- **Fix needed from backend team**:
  1. Join observation table with Measurement_Master to get `loinc_code` and `label`
  2. Populate `resource.code.coding[0]` with `{ system: "http://loinc.org", code: "<loinc_code>", display: "<label>" }`
  3. Support filtering by the `code` query parameter using the LOINC code
- **Status**: FIXED by backend team — `code` field now populated in API response

---

## Important Notes
- All APIs use Bearer token authentication (stored in localStorage as cb_token)
- Patient IDs are now UUIDs (not numeric)
- Backend transforms DB rows → FHIR R4 JSON responses
- The bot never queries master tables directly — it uses knowledge base codes, passes to API, backend does FK joins
- Excel file is for the backend team to insert data into the actual database
- Old master tables (Condition_Master, Measurement_Master, Procedure_Master) are kept in Excel for FK reference when creating future patient data
- **Always push code changes to GitHub** — Vercel is connected to the GitHub repo and auto-deploys on push
- Backend pagination is non-standard (page step = 10 fixed, not page × size) — we use `size=100` to avoid overlap issues
- **Shell is PowerShell** — heredoc (`<<EOF`) does NOT work; use simple `-m "message"` for git commits

---

## Dashboard Dynamic Sections (April 2, 2026)

### Changes Made to DashboardPage.jsx

#### 1. Mark as Reviewed Alert — TRIED & REVERTED
- Added a green toast "Marked for Review" for 1 second on click → user didn't like it → reverted back to simple toggle

#### 2. Care Team — Made Dynamic (DONE)
- **Before**: Static `MOCK_DATA.careTeam` with 3 hardcoded members (Dr. Michael Chen, Emily Davis, Jane Smith)
- **After**: Fetches active EpisodeOfCare records from `/baseR4/EpisodeOfCare?patient={id}&status=active`, extracts `careManager` from each episode
- **Parser**: `parseCareTeamFromEoC(bundle)` — extracts care manager name, initials, role ("Care Coordinator"), program name. Deduplicates by name
- **Fallback**: Falls back to `MOCK_DATA.careTeam` if API returns nothing
- **Shows**: Only care coordinators/managers from EpisodeOfCare, NOT practitioners/doctors
- **For Patient 1**: Rebecca Torres, Maria Santos, David Park, Jennifer Walsh — each with their care program name

#### 3. Vitals — Made Dynamic (DONE)
- **Before**: Static `MOCK_DATA.vitals` with 3 hardcoded entries (Blood Pressure, Heart Rate, Blood Glucose)
- **After**: Fetches all observations from `/baseR4/Observation/search?patient={id}&page=0&size=100`, groups by LOINC code, picks latest reading per type
- **Parser**: `parseVitalsFromFhir(bundle)` — groups observations by code, picks latest by date, maps normal ranges, classifies as normal/elevated/low, calculates status bar percentage
- **Normal ranges map**: `OBSERVATION_NORMAL_RANGES` constant with ranges for HbA1c (4.0-5.6%), Creatinine (0.6-1.3), Glucose (70-99), Potassium (3.5-5.0), Triglycerides (<150), LDL (<130), Total Cholesterol (125-200), Hemoglobin (13.0-17.5), WBC (4.5-11.0), Platelets (150-400)
- **Fallback**: Falls back to `MOCK_DATA.vitals` if API returns nothing
- **Section title**: "Vitals" (not "Latest Observations" — user preference)
- **Shows**: Each observation card with value, unit, normal range, color-coded status bar, and date of latest reading
- **For Patient 1**: 7 observation types — HbA1c 9.2%, Creatinine 1.4, Glucose 165, Potassium 4.5, Triglycerides, LDL 158, Cholesterol Total 235

#### 4. FHIR Fetches in loadDashboard — Updated
The `fhirDirectPromise` now fetches 4 resources in parallel:
1. MedicationRequest (was already there)
2. Encounter (was already there)
3. EpisodeOfCare — NEW (for Care Team)
4. Observation — NEW (for Vitals)

---

## System Prompt Changes (April 2, 2026)

### Conditions Display — 15 at a time — TRIED & REMOVED
- Tried showing conditions 15 at a time from single API call — bot was inconsistent (showed 10, then 2, then 9 instead of 15+6)
- **Removed** — conditions now show all results at once like every other API

### Clinical Deterioration Gaps — Step-by-step Instruction — TRIED & REVERTED
- **Problem**: Bot was skipping the observation API call during care gap analysis, giving vague summary instead of actual values
- Tried replacing "Refer to Section 4" with explicit step-by-step instructions (determine observations → call API → check ranges → show abnormal)
- **Reverted by user request** — user wants to handle this themselves
- **Current state**: Back to original "Refer to Section 4" instruction, but with user's simplification: removed "based on their active conditions" phrase to avoid the bot being too narrow in which observations it fetches

### User's Manual Prompt Edits (pushed to GitHub)
- Simplified Step 1 in "Recent/Latest Observations": removed "clinically relevant to the patient based on their active conditions" → just "automatically determine the key observations"
- Simplified Step 1 in "Deterioration Patterns": removed "(same approach as Section 3 above)" cross-reference
- Simplified Clinical Deterioration Gaps: removed "for this patient based on their active conditions" → just "fetch all clinically relevant observations"
- **Rationale**: The "based on active conditions" phrasing was causing the bot to be too restrictive or skip observation fetching entirely
- **Result**: Clinical deterioration gaps now working correctly after user's simplifications

---

## Additional Dashboard Fixes (April 2, 2026 — Late Session)

### Vitals Date Removed
- Removed the date display (e.g., "Oct 15, 2025") from each vitals/observation card — user didn't want it shown

### Completed Pill Color Fix
- `.pill-completed` in `dashboard.css` was red (`#FEE2E2` / `#DC2626`) — changed to green (`#DCFCE7` / `#16A34A`) to match the "Active" pill style in medications

### Current Dashboard Dynamic Sections Status
| Section | Status | Data Source |
|---------|--------|------------|
| Patient Banner | Dynamic | `/baseR4/Patient/{id}` |
| Alerts & Trends | Dynamic | AI analysis of care gap text |
| AI Actions | Dynamic | AI analysis of care gap text |
| Vitals | **Dynamic** | `/baseR4/Observation/search` — latest reading per LOINC code |
| Medications | Dynamic | `/baseR4/MedicationRequest` |
| Appointments & Encounters | Dynamic | `/baseR4/Encounter` + AI-extracted missed appointments |
| Care Team | **Dynamic** | `/baseR4/EpisodeOfCare` — care managers only |
| Risk Insights | Static | `MOCK_DATA.riskInsights` |
| Clinical Notes | Static | `MOCK_DATA.clinicalNotes` |

### Git Commits (this session, chronological)
1. `c8c9e0f` — Update API page size from 20 to 100
2. `b8beaf9` — Add notes.md with full project memory
3. `6b58bc5` — Remove all pagination from system prompt
4. `5bbd9b5` — Add 15-at-a-time display chunking (all APIs)
5. `33d237b` — Revert structured condition format
6. `da21da9` — Revert display pagination rule (all APIs)
7. `8f423be` — Add 15-at-a-time for conditions only
8. `16fff74` — Add review alert toast
9. `c0705cb` — Revert review alert, make Care Team dynamic
10. `bad8b43` — Make Vitals dynamic from Observation API
11. `d7ebaad` — Rename Latest Observations to Vitals
12. `5617d07` — Clarify clinical deterioration gaps (step-by-step)
13. `5b3708b` — Update notes.md
14. `d989b24` — Remove 15-at-a-time for conditions
15. `e6cb9e3` — User's manual prompt simplifications
16. `4561a17` — Revert clinical deterioration to original instruction
17. `18f8f3d` — User's final prompt simplification
18. `696c542` — Update notes.md
19. `86eb38b` — Remove date from vitals cards
20. `0061faf` — Fix completed pill color to green
21. `2b4b7e9` — Update notes.md
22. `26ef543` — Make Risk Insights dynamic from predict API

---

## Risk Prediction API (April 2, 2026)

### API Details
- **Endpoint**: `POST https://fhirassist.rsystems.com:5050/api/predict`
- **Body**: `{"patient_id": "<uuid>"}`
- **Header**: `Content-Type: application/json`
- **Response**: HTML page with risk data embedded as `var D={...}` in a `<script>` tag
- **No JSON endpoint available** — must parse from HTML
- **No auth required** (no Bearer token)

### Response Data Structure
The `var D` object contains risk categories as keys (e.g., `cvd`, `diabetes`, `cancer`), each with:
- `risk_level`: "High" / "Moderate" / "Low"
- `risk_percentage`: number (e.g., 82.5)
- `risk_drivers`: array of strings explaining why risk is elevated
- `protective_factors`: array of strings for positive factors

### Implementation in DashboardPage.jsx
- **Function**: `fetchRiskPrediction(patientId)` — POSTs to predict API, parses `var D={...}` from HTML via regex, maps to `{ name, value, level }` format
- **Label mapping**: `RISK_LABEL_MAP` — `cvd` → "HYPERTENSION", `diabetes` → "DIABETES", `cancer` → "CANCER"
- **Level mapping**: API returns "High"/"Moderate"/"Low" → mapped to CSS classes `high`/`mod`/`low`
- **State**: `riskData` — falls back to `MOCK_DATA.riskInsights` if API fails
- **Called in**: `loadDashboard()` alongside other FHIR fetches (runs in parallel)
- **For Patient 1**: Hypertension 63.4% (HIGH), Diabetes 82.5% (HIGH), Cancer 12.7% (LOW)

### Updated Dashboard Dynamic Sections Status
| Section | Status | Data Source |
|---------|--------|------------|
| Patient Banner | Dynamic | `/baseR4/Patient/{id}` |
| Alerts & Trends | Dynamic | AI analysis of care gap text |
| AI Actions | Dynamic | AI analysis of care gap text |
| Vitals | Dynamic | `/baseR4/Observation/search` |
| Medications | Dynamic | `/baseR4/MedicationRequest` |
| Appointments & Encounters | Dynamic | `/baseR4/Encounter` + AI missed appointments |
| Care Team | Dynamic | `/baseR4/EpisodeOfCare` — care managers |
| Risk Insights | **Dynamic** | `POST /api/predict` — risk prediction API |
| Clinical Notes | Static | `MOCK_DATA.clinicalNotes` |

### Pending Work
- **Patient 2**: COMPLETED (see Patient 2 section above)
- **Clinical Notes**: COMPLETED (see Clinical Notes section below)

---

## Session: April 3, 2026

### Patient Outreach Tab — IMPLEMENTED (Static)
- **Tab switching**: Added `activeTab` state (`'actions'` | `'outreach'`). AI Actions and Patient Outreach tabs are now clickable; Clinical Trends and Task Queue remain disabled.
- **UI matches Figma** design exactly:
  - **3 communication cards** in a row: Phone Call, SMS Message, Email Portal — each with icon, description, and green action button
  - **Outreach Communication Template** section: customizable textarea pre-filled with patient-personalized message (uses patient's first name dynamically via `pt.name`)
  - **"Send to Patient"** (red) and **"Save as Template"** (outline) buttons
- **JSX structure**: AI Actions + Approve Modal wrapped in `<>...</>` Fragment, conditionally rendered with `{activeTab === 'actions' && <>...</>}`. Patient Outreach rendered with `{activeTab === 'outreach' && (...)}`
- **Status**: Static (no API calls), functional tab switching
- **Commit**: `a2dd340` — "Add static Patient Outreach tab with phone, SMS, email cards and outreach template"

### .gitignore Updated
- Added `*.xlsx` and `*.py` to `.gitignore` to prevent Excel data files and Python scripts from being accidentally committed
- Previously committed Excel/Python files were removed from tracking with `git rm --cached`

### R Systems Logo Fix — Multiple Iterations

**Problem**: The original CSS `filter: brightness(0) invert(1)` on the logo made "SYSTEMS" text invisible. The filter turns ALL pixels white — the R icon showed as a white silhouette (visible on dark bg), but the "SYSTEMS" text (originally white on grey box) also became white (invisible against the now-white grey box).

**Iteration 1 — White background badge (REJECTED by user)**:
- Added `background: white; padding: 3px 6px; border-radius: 6px` to the logo
- Result: Full R SYSTEMS logo visible but looked odd — white box on dark background
- User feedback: "looks odd, should merge with background"

**Iteration 2 — No filter, colored logo on dark bg (APPROVED)**:
- Removed ALL filters and white background
- Logo displays as original colored image (blue R + grey SYSTEMS box with white text) directly on dark navy background
- Works because the PNG has transparency — no white rectangle behind it
- Applied to both navbar and loading screen

**Iteration 3 — Size & positioning tweaks (FINAL)**:
- **Loading screen logo**: height 44px, `margin-right: 12px` (shifts logo left of spinner), `margin-bottom: 32px`
- **Navbar logo**: height 32px, `margin-left: -8px` (shifts slightly left)
- Loading screen kept inline layout (logo beside spinner — user preferred this over stacked)

**Final CSS**:
```css
.dash-nav-logo { height: 32px; object-fit: contain; margin-left: -8px; }
.dash-loading-logo { height: 44px; margin-bottom: 32px; margin-right: 12px; object-fit: contain; }
```

### Risk Insights Spacing Fix
- Widened the alerts row grid column from `200px` to `260px` for risk card: `grid-template-columns: 1fr 260px`
- Changed risk row layout from `justify-content: space-between` to `gap: 10px` with `flex: 1` on `.dash-risk-name`
- Added `white-space: nowrap` on `.dash-risk-val` to prevent value wrapping

### Git Commits (this session, chronological)
1. `a2dd340` — Add static Patient Outreach tab with phone, SMS, email cards and outreach template
2. `beceef9` — Fix R Systems logo visibility and Risk Insights spacing
3. `9817119` — Fix logo - remove white background, show colored logo directly on dark bg
4. `452e645` — Reduce logo size and add spacing between logo and spinner
5. `e64e606` — Revert loading logo to inline layout, shift navbar logo left
6. `7a8c64d` — Shift loading screen logo left with margin-right spacing

### Current Dashboard Tab State
| Tab | Status | Content |
|-----|--------|---------|
| AI Actions | Active/Clickable | Dynamic — AI-structured actions with approve workflow |
| Clinical Trends | Disabled | Not implemented |
| Task Queue | Disabled | Not implemented |
| Patient Outreach | Active/Clickable | Static — Phone/SMS/Email cards + message template |

### Patient Banner Spacing Fix
- **Meta row** (age · Male · MRN · Programs): Changed from plain `<p>` with `·` text separators to `<div>` with individual `<span>` items and styled `dash-meta-sep` dot separators
- **Separator dots**: `font-size: 18px`, `font-weight: 700`, color `#94A3B8`, `margin: 0 8px`
- **Contact row** (DOB, phone, email): Removed dot separators, items spread with `gap: 32px`
- **Row vertical spacing**: Meta row `margin-top: 8px`, contact row `margin-top: 12px`
- **User feedback**: "OK better but needs more UI tweaks" — will revisit later
- **Commits**: `6e8d4d5`, `d699964`, `de68f1d`

### Task Queue Tab — IMPLEMENTED (Dynamic)
- **Commit**: `ce6f7bc` — "Implement Task Queue tab with status cards, task flow, and Figma-matching UI"
- **Tab enabled**: Task Queue tab is now clickable (`activeTab === 'queue'`), joins AI Actions and Patient Outreach as active tabs. Clinical Trends remains disabled.

**State Management:**
- `taskQueue` — array of task objects `{ id, title, priority, priorityClass, status, dueDate, description, notes }`
- `taskFilter` — `'pending'` | `'inprocess'` | `'completed'` (default: `'pending'`)
- `taskCounts` — computed counts for each status
- `filteredTasks` — tasks filtered by current `taskFilter`

**Flow:**
1. User selects actions in AI Actions tab → clicks "Approve Selected" → modal opens
2. User adds optional coordinator notes → clicks "Confirm & Create Tasks"
3. `handleApprove()` creates task objects from approved actions:
   - Due date calculated from timeframe: "Within 24 hours" → +1 day, "Within 48 hours" → +2, "Within 1 week" → +7, default → +3
   - Notes = coordinator notes (if entered) or AI rationale
   - Deduplicates by title (won't create duplicate tasks)
   - All new tasks start with `status: 'pending'`
4. Tasks appear in Task Queue tab

**Status Transitions:**
- `updateTaskStatus(taskId, newStatus)` — updates a task's status
- Pending → "Start Task" button → In Process
- Pending → "Mark Complete" button → Completed
- In Process → "Mark Complete" button → Completed
- Completed → shows "✓ Completed" label (no further actions)

**UI (matches Figma):**
- **Summary cards**: 3 clickable cards (Pending/In Process/Completed) with status icons, labels, and colored count badges. Active card has purple border + light purple background
- **Task cards**: Light blue background (`#F0F9FF`), blue border, containing:
  - Title (bold)
  - Priority pill + Status pill + Due date
  - Description text
  - NOTES section (white box with label + italic text)
  - Action buttons (Start Task = green solid, Mark Complete = green outline)
- **Empty state**: Dashed border box with helpful message when no tasks in selected filter

**CSS classes added** (in `dashboard.css`):
- `.tq-summary`, `.tq-summary-card`, `.tq-active`, `.tq-summary-icon`, `.tq-summary-label`, `.tq-badge`
- `.tq-section-header`, `.tq-empty`
- `.tq-task-card`, `.tq-task-header`, `.tq-task-meta`, `.tq-due`, `.tq-status-pill`
- `.tq-task-desc`, `.tq-notes`, `.tq-notes-label`
- `.tq-btn-start`, `.tq-btn-complete`, `.tq-completed-label`

### Updated Dashboard Tab State
| Tab | Status | Content |
|-----|--------|---------|
| AI Actions | Active/Clickable | Dynamic — AI-structured actions with approve workflow |
| Clinical Trends | Disabled | Not implemented |
| Task Queue | **Active/Clickable** | Dynamic — approved tasks with Pending/In Process/Completed flow |
| Patient Outreach | Active/Clickable | Static — Phone/SMS/Email cards + message template |

### All Git Commits (April 3 session, chronological)
1. `a2dd340` — Add static Patient Outreach tab
2. `beceef9` — Fix R Systems logo visibility and Risk Insights spacing
3. `9817119` — Fix logo - remove white background, show colored logo directly on dark bg
4. `452e645` — Reduce logo size and add spacing between logo and spinner
5. `e64e606` — Revert loading logo to inline layout, shift navbar logo left
6. `7a8c64d` — Shift loading screen logo left with margin-right spacing
7. `7f7ceed` — Update notes.md with April 3 session
8. `6e8d4d5` — Add proper spacing between patient banner meta items
9. `d699964` — Increase separator dot size and spacing in patient banner
10. `de68f1d` — Increase row spacing, spread contact items wider
11. `57f2c2a` — Update notes.md with patient banner spacing changes
12. `ce6f7bc` — Implement Task Queue tab
13. `34c8648` — Update notes.md with Task Queue details
14. `03b102b` — Make Clinical Notes dynamic from Encounter API
15. `d76b48b` — Add Admin note type

---

## Clinical Notes — IMPLEMENTED (Dynamic) — April 6, 2026

### Overview
The Clinical Notes section in the right sidebar is now fully dynamic. It extracts clinical notes from the Encounter API, resolves practitioner names, and supports adding new notes via a form.

### Data Flow
1. Encounters already fetched in `loadDashboard()` via `/baseR4/Encounter?patient={id}`
2. `parseClinicalNotesFromEncounters(encBundle, careManagerIds)` function:
   - Iterates all encounter entries, extracts `extension` where `url === "clinicalNotes"`
   - Groups by practitioner ID → picks the **latest** note per practitioner (one note per practitioner)
   - Fetches each unique practitioner from `/baseR4/Practitioner?_id={id}&page=0&size=1` to get name, prefix, specialty
   - Classifies note type: if practitioner ID is in `careManagerIds` (from EpisodeOfCare) or specialty matches /coordinator|care manager|nurse/ → **"Coordination"**, else → **"Clinical"**
   - Generates initials from practitioner name
   - Formats date as "Mon DD, YYYY · HH:MM AM/PM"
   - Sorts by date descending (latest first)
3. `careManagerIds` extracted from EpisodeOfCare bundle: `eocBundle.entry[].resource.careManager.reference` → stripped to UUID

### State Variables
- `clinicalNotesData` — parsed notes from encounters (array of note objects)
- `addedNotes` — notes added locally via "Add Note" form
- `showAddNoteModal` — boolean toggle for add note modal
- `newNote` — `{ author, role, type, text }` form state
- `viewingNote` — note object being viewed in View modal (null when closed)

### Computed Values
- `allNotes` — `[...clinicalNotesData, ...addedNotes]` (dynamic + locally added)
- `adminNotes` — `addedNotes.filter(n => n.type === 'Admin')` (only Admin-typed added notes)
- `filteredNotes` — filtered by `noteFilter`:
  - `'all'` → all notes
  - `'clinical'` → notes with type "Clinical"
  - `'coordination'` → notes with type "Coordination"
  - `'admin'` → only admin-typed added notes

### Filter Tabs
| Tab | Shows | Count Source |
|-----|-------|-------------|
| All | All notes (dynamic + added) | `allNotes.length` |
| Clinic | Notes with type "Clinical" | `allNotes.filter(type=Clinical)` |
| Care | Notes with type "Coordination" | `allNotes.filter(type=Coordination)` |
| Admin | Only admin-typed added notes | `adminNotes.length` |

### "Add Note" Modal
- Opens via "+ Add Note" button
- Form fields: Author Name, Role, Note Type (Clinical / Coordination / Admin), Note text
- Note Type selector: 3 toggle buttons, "Admin" type notes only appear under Admin tab
- On submit: creates note with current timestamp, adds to `addedNotes` state
- CSS class: `.cn-modal` (max-width 520px)

### "View" Modal
- Opens when "View" link is clicked on any note
- Shows: author avatar + name + role, type pill, full note text, timestamp
- Close button in footer

### Note Type Pills (CSS)
- `.pill-note-clinical` — blue (`#DBEAFE` / `#2563EB`)
- `.pill-note-coordination` — amber (`#FEF3C7` / `#D97706`)
- `.pill-note-admin` — purple (`#F3E8FF` / `#7C3AED`)

### CSS Classes Added
- `.cn-modal`, `.cn-input`, `.cn-type-select`, `.cn-type-btn`, `.cn-view-meta`, `.cn-view-text`, `.cn-view-date`, `.pill-note-admin`

### Updated Dashboard Dynamic Sections Status
| Section | Status | Data Source |
|---------|--------|------------|
| Patient Banner | Dynamic | `/baseR4/Patient/{id}` |
| Alerts & Trends | Dynamic | AI analysis of care gap text |
| AI Actions | Dynamic | AI analysis of care gap text |
| Vitals | Dynamic | `/baseR4/Observation/search` |
| Medications | Dynamic | `/baseR4/MedicationRequest` |
| Appointments & Encounters | Dynamic | `/baseR4/Encounter` + AI missed appointments |
| Care Team | Dynamic | `/baseR4/EpisodeOfCare` — care managers |
| Risk Insights | Dynamic | `POST /api/predict` — risk prediction API |
| Clinical Notes | **Dynamic** | `/baseR4/Encounter` (clinicalNotes extension) + `/baseR4/Practitioner` (name resolution) + local "Add Note" |

**All dashboard sections are now dynamic — no more static mock-only sections.**

---

## Session: April 6, 2026 — Patient 2 Data Generation

### Measurement Master — Unit Fix
- Found 574 out of 742 rows in `Measurement_Master` were missing `expected_unit` values
- Created `fix_units.py` script with a dictionary mapping ~67 LOINC codes to their standard units and reference ranges
- After running: 335 additional units were populated; remaining rows are less common LOINC codes
- Also verified that vital signs (Heart Rate, BP systolic/diastolic, Body Temp, Glucose) are present in `Measurement_Master` with correct LOINC codes

### Condition Master — ICD-9 → ICD-10 Migration
- Master table was migrated from ICD-9 to ICD-10 codes since last session
- All Patient 2 conditions use ICD-10 codes from the updated `Condition_Master`
- Patient 1 conditions still reference ICD-9 codes in the data (no change)

### Knowledge Base Updates
- **CONDITION_CODES**: ICD-10 codes for Patient 2 merged INTO the existing `CONDITION_CODES` section (not separate). Both ICD-9 (Patient 1) and ICD-10 (Patient 2) codes coexist in format `CODE=Description`
- **DRUG_CODES**: Added ENTR49, ENTR97, SACV49, SACV97 (Sacubitril-Valsartan formulations)
- **PROCEDURE_CODES**: Added 93000 (ECG), 93010 (ECG interp), 93303 (Echo TTE), 93306 (Echo Doppler TTE)

### chatbase_data.xlsx — Patient 2 Sheets
All 24 sheets were appended with Patient 2 data (yellow background `#FFFF99`):
- patient, encounter, condition, observation, procedure, medicationRequest, appointment
- allergy, diagnosticReport, serviceRequest, immunization, documentReference, episodeOfCare
- organization, practitioner
- Master tables updated: medication_code_master (4 new entries), Condition_Master (verified), Measurement_Master (units fixed), Procedure_Master (verified)

### Files to NEVER commit (updated)
`chatbase_data.xlsx`, `generate_*.py`, `check_*.py`, `cleanup_sheets.py`, `fix_units.py`, `~$chatbase_data.xlsx`, `.env`

---

## Session: April 7, 2026

### Clinical Notes — "Unknown" Practitioner Issue (DATA FIX)
- One of the 3 clinical notes showed "Unknown / Physician" instead of a practitioner name
- Root cause: The practitioner ID `d4e9f6a3-0b5c-6d7e-1f8a-3c4d5e6f7a8b` (Lisa Wong, Wound Care) referenced in the encounter didn't match the actual practitioner ID in the database
- Fix: Backend data fix — user confirmed it's now working after correcting the ID

### Vitals — Show 4 with "Show All" Toggle
- Previously all vitals were shown at once (could be 7+ for Patient 1)
- Added `showAllVitals` state, shows only **4 vitals by default**
- "▼ Show All (X more)" button appears when >4 vitals, same pattern as Current Medications and Appointments
- "▲ Show Less" collapses back to 4
- **Commit**: `41872c8` — "Show 4 vitals by default with Show All toggle for remaining"

### Practitioner Data Reference (from Excel)
**Patient 1 practitioners (non-yellow rows):**
| ID (prefix) | Family | Given | Specialty |
|---|---|---|---|
| b2c7d4e1 | Chen | Sarah | Endocrinology |
| c3d8c5f2 | Brooks | Michael | Internal Medicine |
| d4e9f6a3 | Wong | Lisa | Wound Care |
| e5f0a7b4 | Patel | David | Nephrology |
| 596f43c8 | Torres | Rebecca | Diabetes Care Coordinator |
| fc41e2aa | Rivera | Angela | Chronic Care Coordinator |
| 8a120908 | Marshall | Kevin | Cardiovascular |
| 779f3a81 | Hoffman | Patricia | Wound Care Coordinator |

Only 3 practitioners appear in encounters: Chen (most), Brooks (3), Wong (2).

**Patient 2 practitioners (yellow rows):**
| ID (prefix) | Family | Given | Specialty |
|---|---|---|---|
| 4a6e566f | Patel | Anita | Cardiology |
| b0044caa | Nguyen | David | Pulmonology |
| 729629b8 | Martinez | Lisa | Care Coordinator |
| 8c58388e | Johnson | Angela | Care Coordinator |
| 44e239b0 | Williams | Patricia | Care Coordinator |
| 9ea70bec | Anderson | Karen | Care Coordinator |

### Git Commits (April 7 session)
1. `41872c8` — Show 4 vitals by default with Show All toggle
