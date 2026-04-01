export const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_fhir_patient",
      description: "Search for patients in the FHIR system by name, email, gender, birthdate, or patient ID.",
      parameters: {
        type: "object",
        properties: {
          GIVEN:      { type: "string", description: "Patient first/given name" },
          FAMILY:     { type: "string", description: "Patient last/family name" },
          EMAIL:      { type: "string", description: "Patient email address" },
          GENDER:     { type: "string", description: "Patient gender (male, female, other, unknown)" },
          BIRTHDATE:  { type: "string", description: "Patient date of birth (YYYY-MM-DD)" },
          PATIENT_ID: { type: "string", description: "Patient ID (UUID or numeric)" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_condition",
      description: "Search patient conditions/diagnoses from FHIR. Can search by patient ID and/or ICD-9 code.",
      parameters: {
        type: "object",
        properties: {
          PATIENT:   { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          CODE:      { type: "string", description: "ICD-9 diagnosis code" },
          page:      { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_procedure",
      description: "Search patient procedures/surgeries from FHIR. Can search by patient ID and/or CPT code.",
      parameters: {
        type: "object",
        properties: {
          PATIENT:   { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          CODE:      { type: "number", description: "CPT procedure code (integer)" },
          page:      { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_medications",
      description: "Search patient medication requests/prescriptions from FHIR.",
      parameters: {
        type: "object",
        properties: {
          PATIENT:        { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          DRUG_CODE:      { type: "string", description: "Formulary drug code (e.g. INSULIN, ACET325)" },
          STATUS:         { type: "string", description: "Medication status filter (e.g. active, stopped, on-hold, cancelled)" },
          page:           { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_encounter",
      description: "Search patient encounters (admissions, discharges, insurance info) from FHIR.",
      parameters: {
        type: "object",
        properties: {
          PATIENT: { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          STATUS:  { type: "string", description: "Encounter status filter (e.g. planned, arrived, in-progress, finished, cancelled)" },
          CLASS:   { type: "string", description: "Encounter class filter (IMP=inpatient, AMB=outpatient/ambulatory)" },
          DATE:    { type: "string", description: "Start date filter e.g. 'gt2000-01-13' (gt=after, lt=before)" },
          DATE2:   { type: "string", description: "End date filter e.g. 'lt2024-09-13'" },
          page:    { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_observations",
      description: "Search patient lab results, vitals, and clinical observations from FHIR.",
      parameters: {
        type: "object",
        properties: {
          PATIENT:        { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          CODE:           { type: "string", description: "LOINC observation code" },
          CATEGORY:       { type: "string", description: "Observation category filter (e.g. vital-signs, laboratory)" },
          VALUE_QUANTITY: { type: "string", description: "Filter by value e.g. 'gt10|mEq/L' or 'lt5|mg/dL'" },
          DATE:           { type: "string", description: "Date filter e.g. 'gt2025-01-01' to return results after a date" },
          page:           { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_service_request",
      description: "Search patient service requests (referrals, orders, consult requests) from FHIR.",
      parameters: {
        type: "object",
        properties: {
          PATIENT: { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          _ID:     { type: "string", description: "ServiceRequest resource ID" },
          page:    { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_document_reference",
      description: "Search patient document references (clinical documents, reports, notes) from FHIR.",
      parameters: {
        type: "object",
        properties: {
          PATIENT: { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          _ID:     { type: "string", description: "DocumentReference resource ID" },
          page:    { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_diagnostic_report",
      description: "Search patient diagnostic reports (lab reports, imaging reports, pathology) from FHIR.",
      parameters: {
        type: "object",
        properties: {
          PATIENT: { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          _ID:     { type: "string", description: "DiagnosticReport resource ID" },
          page:    { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_episode_of_care",
      description: "Search patient episodes of care from FHIR. Can filter by status and type.",
      parameters: {
        type: "object",
        properties: {
          PATIENT: { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          STATUS:  { type: "string", description: "Episode status (planned, waitlist, active, onhold, finished, cancelled)" },
          TYPE:    { type: "string", description: "Episode type filter" },
          _ID:     { type: "string", description: "EpisodeOfCare resource ID" },
          page:    { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_practitioner",
      description: "Search for practitioners/doctors/providers in the FHIR system by name or specialty.",
      parameters: {
        type: "object",
        properties: {
          NAME:      { type: "string", description: "Practitioner name to search" },
          SPECIALTY: { type: "string", description: "Practitioner specialty to search" },
          _ID:       { type: "string", description: "Practitioner resource ID" },
          page:      { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_allergy",
      description: "Search patient allergy and intolerance records from FHIR.",
      parameters: {
        type: "object",
        properties: {
          PATIENT: { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          _ID:     { type: "string", description: "AllergyIntolerance resource ID" },
          page:    { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_appointment",
      description: "Search patient appointment records from FHIR. Can filter by status.",
      parameters: {
        type: "object",
        properties: {
          PATIENT: { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          STATUS:  { type: "string", description: "Appointment status (proposed, pending, booked, arrived, fulfilled, cancelled, noshow)" },
          _ID:     { type: "string", description: "Appointment resource ID" },
          page:    { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_patient_immunization",
      description: "Search patient immunization/vaccination records from FHIR.",
      parameters: {
        type: "object",
        properties: {
          PATIENT: { type: "string", description: "Patient ID (do NOT include 'Patient/' prefix)" },
          _ID:     { type: "string", description: "Immunization resource ID" },
          page:    { type: "number", description: "Page number for pagination, starting at 0" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "end_chat",
      description: "End the conversation when the user explicitly indicates they are done (says 'no', 'nothing else', 'that's all', 'goodbye', 'bye', 'thank you' in a closing context).",
      parameters: {
        type: "object",
        properties: {
          farewell_message: { type: "string", description: "A short professional closing message to the user." }
        },
        required: ["farewell_message"]
      }
    }
  }
];
