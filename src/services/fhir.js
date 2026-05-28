import { FHIR_BASE } from '../config/constants';

const DECRYPT_KEY_B64 = import.meta.env.VITE_DECRYPT_KEY || '';

function b64ToUint8(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

let _cryptoKey = null;
async function getCryptoKey() {
  if (_cryptoKey) return _cryptoKey;
  if (!DECRYPT_KEY_B64) return null;
  const raw = b64ToUint8(DECRYPT_KEY_B64);
  _cryptoKey = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']);
  return _cryptoKey;
}

export async function decryptPayload(payloadB64) {
  const key = await getCryptoKey();
  if (!key) throw new Error('No decryption key configured');
  const data = b64ToUint8(payloadB64);
  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

export async function maybeDecrypt(json) {
  if (json && json.encrypted === true && typeof json.payload === 'string') {
    return await decryptPayload(json.payload);
  }
  return json;
}

export function getAuthHeader() {
  const token = localStorage.getItem('cb_token');
  if (!token) {
    window.location.reload();
    throw new Error('No auth token');
  }
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function callFhirApi(url) {
  const res = await fetch(url, { headers: getAuthHeader() });
  if (res.status === 401) {
    localStorage.removeItem('cb_token');
    localStorage.removeItem('cb_user');
    window.location.reload();
    throw new Error('Unauthorized');
  }
  const json = await res.json();
  return maybeDecrypt(json);
}

export function buildUrl(path, params) {
  const url = new URL(`${FHIR_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.append(k, v);
    }
  });
  return url.toString();
}

export async function executeTool(name, args, onPatientFound) {
  try {
    switch (name) {
      case 'search_fhir_patient': {
        const params = {};
        if (args.FAMILY) params.family = args.FAMILY;
        if (args.GIVEN) params.given = args.GIVEN;
        if (args.EMAIL) params.email = args.EMAIL;
        if (args.GENDER) params.gender = args.GENDER;
        if (args.BIRTHDATE) params.birthdate = args.BIRTHDATE;
        if (args.PATIENT_ID) params._id = args.PATIENT_ID;
        params.page = 0;
        params.size = 100;
        const patientResult = await callFhirApi(buildUrl('/baseR4/Patient', params));
        try {
          const entries = patientResult?.entry || [];
          let picked = null;
          if (entries.length === 1) {
            picked = entries[0]?.resource;
          } else if (args.PATIENT_ID && entries.length > 0) {
            picked = entries.find(e => e.resource?.id === args.PATIENT_ID)?.resource;
          } else if (entries.length > 1 && (args.GIVEN || args.FAMILY)) {
            const gLower = (args.GIVEN || '').toLowerCase();
            const fLower = (args.FAMILY || '').toLowerCase();
            for (const e of entries) {
              const r = e.resource;
              const rGiven = (r?.name?.[0]?.given || []).join(' ').toLowerCase();
              const rFamily = (r?.name?.[0]?.family || '').toLowerCase();
              const givenMatch = !gLower || rGiven.includes(gLower);
              const familyMatch = !fLower || rFamily === fLower;
              if (givenMatch && familyMatch && fLower) { picked = r; break; }
            }
          }
          if (picked) {
            const id = picked.id || args.PATIENT_ID || '';
            const rGiven = picked.name?.[0]?.given?.join(' ') || args.GIVEN || '';
            const rFamily = picked.name?.[0]?.family || args.FAMILY || '';
            const fullName = [rGiven, rFamily].filter(Boolean).join(' ');
            if (fullName && onPatientFound) onPatientFound({ name: fullName, id });
          }
        } catch (e) {}
        return patientResult;
      }
      case 'search_patient_condition': {
        const params = {};
        if (args.PATIENT) params.patient = args.PATIENT;
        if (args.CODE) params.code = args.CODE;
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/Condition', params));
      }
      case 'search_patient_procedure': {
        const params = {};
        if (args.PATIENT) params.patient = args.PATIENT;
        if (args.CODE !== undefined && args.CODE !== null && args.CODE !== '') params.code = Number(args.CODE);
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/Procedure', params));
      }
      case 'search_patient_medications': {
        const params = {};
        if (args.PATIENT) params.patient = args.PATIENT;
        if (args.DRUG_CODE) params['formulary-drug-cd'] = args.DRUG_CODE;
        if (args.STATUS) params.status = args.STATUS;
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/MedicationRequest', params));
      }
      case 'search_patient_encounter': {
        const base = `${FHIR_BASE}/baseR4/Encounter`;
        const url = new URL(base);
        if (args.PATIENT) url.searchParams.append('patient', args.PATIENT);
        if (args.STATUS) url.searchParams.append('status', args.STATUS);
        if (args.CLASS) url.searchParams.append('class', args.CLASS);
        if (args.DATE) url.searchParams.append('date', args.DATE);
        if (args.DATE2) url.searchParams.append('date', args.DATE2);
        const page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        url.searchParams.append('page', page);
        url.searchParams.append('size', 100);
        return await callFhirApi(url.toString());
      }
      case 'search_patient_observations': {
        const params = {};
        if (args.PATIENT) params.patient = args.PATIENT;
        if (args.CODE) params.code = args.CODE;
        if (args.CATEGORY) params.category = args.CATEGORY;
        if (args.VALUE_QUANTITY) params['value-quantity'] = args.VALUE_QUANTITY;
        if (args.DATE) params.date = args.DATE;
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/Observation/search', params));
      }
      case 'search_patient_service_request': {
        const params = {};
        if (args.PATIENT) params.patient = args.PATIENT;
        if (args._ID) params._id = args._ID;
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/ServiceRequest', params));
      }
      case 'search_patient_document_reference': {
        const params = {};
        if (args.PATIENT) params.patient = args.PATIENT;
        if (args._ID) params._id = args._ID;
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/DocumentReference', params));
      }
      case 'search_patient_diagnostic_report': {
        const params = {};
        if (args.PATIENT) params.patient = args.PATIENT;
        if (args._ID) params._id = args._ID;
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/DiagnosticReport', params));
      }
      case 'search_patient_episode_of_care': {
        const params = {};
        if (args.PATIENT) params.patient = args.PATIENT;
        if (args.STATUS) params.status = args.STATUS;
        if (args.TYPE) params.type = args.TYPE;
        if (args._ID) params._id = args._ID;
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/EpisodeOfCare', params));
      }
      case 'search_practitioner': {
        const params = {};
        if (args.NAME) params.name = args.NAME;
        if (args.SPECIALTY) params.specialty = args.SPECIALTY;
        if (args._ID) params._id = args._ID;
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/Practitioner', params));
      }
      case 'search_patient_allergy': {
        const params = {};
        if (args.PATIENT) params.patient = args.PATIENT;
        if (args._ID) params._id = args._ID;
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/AllergyIntolerance', params));
      }
      case 'search_patient_appointment': {
        const params = {};
        if (args.PATIENT) params.patient = args.PATIENT;
        if (args.STATUS) params.status = args.STATUS;
        if (args._ID) params._id = args._ID;
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/Appointment', params));
      }
      case 'search_patient_immunization': {
        const params = {};
        if (args.PATIENT) params.patient = args.PATIENT;
        if (args._ID) params._id = args._ID;
        params.page = (args.page !== undefined && args.page !== null && args.page !== '') ? Number(args.page) : 0;
        params.size = 100;
        return await callFhirApi(buildUrl('/baseR4/Immunization', params));
      }
      case 'end_chat':
        return { status: 'conversation_ended' };
      default:
        return { error: `Unknown function: ${name}` };
    }
  } catch (err) {
    return { error: err.message };
  }
}
