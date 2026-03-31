/* =====================================================
   CareBridge – Clinical AI Chatbot
   OpenAI GPT-5 + FHIR R4 API Integration
===================================================== */

// ── Config ──────────────────────────────────────────
// OpenAI API key is stored in localStorage (entered by user on first run)
// Never hardcode API keys in source code
const OPENAI_MODEL   = "gpt-5.4-nano-2026-03-17";
const FHIR_BASE      = "https://fhirassist.rsystems.com:8081";
const LOGIN_URL      = `${FHIR_BASE}/auth/login`;

// ── State ────────────────────────────────────────────
let conversationHistory = [];
let currentPatient = null; // tracks last searched patient { name, id }
let pendingChipAction = null; // tracks which chip was clicked: "conditions"|"lab"|"medications"|"encounters"
let userName = "";
let userInitial = "U";
let isBotResponding = false;

// ── Knowledge Bases (embedded) ───────────────────────
const CONDITION_CODES = `
CONDITION ICD-9 CODES:
0064=Amebic lung abscess, 00845=Int inf clstrdium dfcile, 01736=TB of eye-oth test, 01744=TB of ear-cult dx,
01786=TB esophagus-oth test, 0380=Streptococcal septicemia, 03819=Staphylcocc septicem NEC, 0383=Anaerobic septicemia,
03849=Gram-neg septicemia NEC, 0389=Septicemia NOS, 04102=Streptococcus group b, 07030=Hpt B acte wo cm wo dlta,
07054=Chrnc hpt C wo hpat coma, 1628=Mal neo bronch/lung NEC, 1970=Secondary malig neo lung, 1976=Sec mal neo peritoneum,
1977=Second malig neo liver, 1980=Second malig neo kidney, 1987=Second malig neo adrenal, 20020=Brkt tmr unsp xtrndl org,
20280=Oth lymp unsp xtrndl org, 2273=Benign neo pituitary, 2380=Unc behav neo bone, 2449=Hypothyroidism NOS,
25000=DMII wo cmp nt st uncntr, 25062=DMII neuro uncntrld, 2530=Acromegaly and gigantism, 2720=Pure hypercholesterolem,
2724=Hyperlipidemia NEC/NOS, 2749=Gout NOS, 2760=Hyperosmolality, 2761=Hyposmolality, 2851=Ac posthemorrhag anemia,
28522=Anemia in neoplastic dis, 28529=Anemia-other chronic dis, 2859=Anemia NOS, 2875=Thrombocytopenia NOS,
28959=Spleen disease NEC, 2948=Mental disor NEC oth dis, 30390=Alcoh dep NEC/NOS-unspec, 30401=Opioid dependence-contin,
3051=Tobacco use disorder, 311=Depressive disorder NEC, 3361=Vascular myelopathies, 34401=Quadrplg c1-c4 complete,
3569=Idio periph neurpthy NOS, 3970=Tricuspid valve disease, 4010=Malignant hypertension, 4019=Hypertension NOS,
40390=Hy kid NOS w cr kid I-IV, 40391=Hyp kid NOS w cr kid V, 41071=Subendo infarct initial, 412=Old myocardial infarct,
41400=Cor ath unsp vsl ntv/gft, 41401=Crnry athrscl natve vssl, 41511=Iatrogen pulm emb/infarc, 4168=Chr pulmon heart dis NEC,
4240=Mitral valve disorder, 4241=Aortic valve disorder, 4266=Other heart block, 4271=Parox ventric tachycard,
42731=Atrial fibrillation, 42781=Sinoatrial node dysfunct, 4280=CHF NOS, 42822=Chr systolic hrt failure,
42830=Diastolc hrt failure NOS, 431=Intracerebral hemorrhage, 43310=Ocl crtd art wo infrct, 43889=Late effect CV dis NEC,
4439=Periph vascular dis NOS, 44422=Lower extremity embolism, 486=Pneumonia organism NOS, 4928=Emphysema NEC,
49390=Asthma NOS, 5070=Food/vomit pneumonitis, 5119=Pleural effusion NOS, 5121=Iatrogenic pneumothorax,
51881=Acute respiratry failure, 51882=Other pulmonary insuff, 53551=Gstr/ddnts NOS w hmrhg, 56211=Dvrtcli colon w/o hmrhg,
56409=Constipation NEC, 56881=Hemoperitoneum, 5691=Rectal prolapse, 570=Acute necrosis of liver, 5711=Ac alcoholic hepatitis,
5722=Hepatic encephalopathy, 57451=Choledochlith NOS w obst, 5750=Acute cholecystitis, 5761=Cholangitis,
5762=Obstruction of bile duct, 5781=Blood in stool, 5845=Ac kidny fail tubr necr, 5849=Acute kidney failure NOS,
5854=Chr kidney dis stage IV, 5856=End stage renal disease, 5859=Chronic kidney dis NOS, 5939=Renal & ureteral dis NOS,
5990=Urin tract infection NOS, 6826=Cellulitis of leg, 70703=Pressure ulcer low back, 70714=Ulcer of heel & midfoot,
7211=Cerv spondyl w myelopath, 7850=Tachycardia NOS, 78551=Cardiogenic shock, 78552=Septic shock, 78559=Shock w/o trauma NEC,
79092=Abnrml coagultion prfile, 80102=Cl skul base fx-brf coma, 8024=Fx malar/maxillary-close, 80375=Opn skl fx NEC-deep coma,
80601=C1-c4 fx-cl/com cord les, 82101=Fx femur shaft-closed, 87349=Open wound of face NEC, 99591=Sepsis, 99592=Severe sepsis,
99659=Malfunc oth device/graft, 99662=React-oth vasc dev/graft, 99673=Comp-ren dialys dev/grft, 99812=Hematoma complic proc,
99813=Seroma complicting proc, E8120=Mv collision NOS-driver, E8231=Oth coll stndng obj-psgr, E8495=Accid on street/highway,
E8788=Abn react-surg proc NEC, E8791=Abn react-renal dialysis, E8859=Fall from slipping NEC, E8889=Fall NOS,
E9342=Adv eff anticoagulants, V090=Inf mcrg rstn pncllins, V103=Hx of breast malignancy, V1251=Hx-ven thrombosis/embols,
V1259=Hx-circulatory dis NEC, V1582=History of tobacco use, V1588=Personal history of fall, V440=Tracheostomy status,
V5861=Long-term use anticoagul, V5867=Long-term use of insulin, V8741=Hx antineoplastic chemo,
5852=Chr kidney dis stage II, 5853=Chr kidney dis stage III, 5855=Chron kidney dis stage V,
28521=Anemia in chr kidney dis, 58881=Sec hyperparathyrd-renal, 7910=Proteinuria,
V4511=Renal dialysis status, V560=Renal dialysis encounter,
25002=DMII wo cmp uncntrld, 25010=DMII keto nt st uncntrld, 25012=DMII ketoacd uncontrold,
25022=DMII hprosmlr uncontrold, 25032=DMII oth coma uncontrold, 25040=DMII renl nt st uncntrld,
25042=DMII renal uncntrld, 25052=DMII ophth uncntrld, 25060=DMII neuro nt st uncntrl,
25072=DMII circ uncntrld, 2510=Hypoglycemic coma, 2511=Oth spcf hypoglycemia,
4254=Prim cardiomyopathy NEC, 42823=Ac on chr syst hrt fail, 5184=Acute lung edema NOS,
20071=Large cell lymphoma head, 20073=Large cell lymph abdom, 20078=Large cell lymph multip,
2853=Anemia d/t antineo chemo, 28749=Sec thrombocytopenia NEC, 28800=Neutropenia NOS,
52801=Mucositis d/t antineo rx,
1123=Cutaneous candidiasis, 1170=Rhinosporidiosis, 1190=Pulmonary TB NOS-unspec,
1200=Schistosoma haematobium, 1800=Malig neo endocervix, 5733=Hepatitis NOS, 78630=Hemoptysis NOS
`;

const DRUG_CODES = `
DRUG CODES (pass as CODE param to search_patient_medications):
ACET20/4I, ACET325, ADAL60, ALBU25, ALTE1I, AMBI5, AMID200, APAP500, ARTI3.5O, ASA325, ASA81EC,
ATOR10, ATOR20, BISA10R, CALC500, CALG1I, CEFA10I, CEFX1F, CEPH500, CIPR250, CIPR500, CISA10I,
CLOP75, D5W100, D5W250, D5W50, DEXA4I, DIAZ5, DOBPREM, DOCU100, DOCU100L, DOLA12.5I, DONE5,
DOPA400PM, DRON25, ENAL25I, FURO20, FURO40I, GENT120PM, GENT80PM, GENTBASE1, GENTBASE2, GLAR100I,
GLIP10, GLYCO4I, HEPA100SYR, HEPA5I, HEPAPREMIX, HEPBASE, HEPPREMIX, HYD12.5PCA, HYDR2I, HYDRO4I,
INSULIN, IPRA2H, IPRAPF, KAYE15L, KCL20P, KCL40I, LACT30L, LEV250, LEVO175, LEVO250PM, LEVO4I,
LEVO500PM, LEVOBASE, LISI10, LISI20, LISI5, MAGN400, MAGS1I, MERO500I, METH5, METO25, METO50,
METO5I, METR500, METR500PM, MICROK10, MIDA2I, MOM30L, MORP2I, MORP50PCA, MORPIM, NABC50S,
NACLFLUSH, NAPR250, NEOSI, NEPH1, NESI1.5I, NS100, NS1000, NS250, NTG3SL, OXYC5, PANT40, PANT40I,
PEPC20, PERC, PHEN10I, PHYT10I, PIOG15, PNEU25I, PRAV20, PROC10, PROP100IG, QUET25, RANI150,
SENN187, SEVE800, TIZA4, TRAM50, VANC1F, VENL75XR, VIAL, WARF0, WARF1, WARF2, ZITHR250, ZOSY2.25I,
ALLO100, AMLO5, AMLO10, ATOR40, ATOR80, BUME1I, BUMET_IV, CALC025, CALC05, CAGLU1I, CINA30, COLC06,
DARB40, DARB60, EPO10K, FERCM500, FESO325, FURO40PO, FURO80I, FURO160I, HEPA5KSC, HEPA1KI,
INDO25, INSREG10I, LABE200I, METZ25, NEPHVIT, SEVE1600, NAHCO3, NAHCO3I, NS1000I, KAYEX15, SPIR25, WARF5,
AMIO_IV, AMIO200, AMIO_MAINT, AMOX_CL, ASPI75, DAPA10, D10W, D50W, EMPA10, EMPA25,
FURO40, FURO80, FURO_IV, GABA300, GABA600, GLUC1MG, ASPART4, GLAR10, INS_REG, LABE_IV,
METF500, METF1000, METO_IV, NOREPI, OMEP20, PIP_TAZO, KCL_IV, KCL_IV40, SEMA05,
NAHCO500, NAHCO_IV, NS_045, NS_09, VANC_IV, B12_1MG,
BISO125, BISO5, CEFAZ_IV, DIGO125, DOBU_IV, DOBU_LD, DOBU_HI, DOBU_WN,
FURO80PO, FURO40IV, FURO80IV, GTN_IV, HEPAR_IV, IVAB5, MGSO4_IV, MORPH_IV,
NORA_IV, KCL_PO, PROP_IV, RAMI25, RAMI5, RAMI10, HYPTON_SAL, SPIRO25, SPIRO125, WARF3,
ACIC400, ACIC800I, AMIK500I, BEND90I, CARM100I, COTRMX, CYCLO500I, DEFIB_IV, DOXO50I,
FILG300, FLUCON150, GRAN1I, IFOS_IV, MELPH_IV, ONDAN4I, ONDAN8, PLERIX, POLAT140I,
PRED5, PRED25, RASBU_IV, RITUX500I, TPN_IV,
ACETY_IV, ETHAMB400, GLYCO_INH, ISONH300, MOXIFL400, PYRAZIN500, PYRIDOX50, RIFAMP450, STREPT_IM, TRANEX_IV
`;

const PROCEDURE_CODES = `
PROCEDURE CPT CODE RANGES:
- Evaluation and Management / Consultations: 99241–99255
- Surgery / Musculoskeletal System: 20000–29999
- Surgery / Respiratory System: 30000–32999
- Surgery / Cardiovascular System: 33010–37799
- Radiology / Diagnostic Ultrasound: 76506–76999
- Medicine / Dialysis: 90935–90999
- Medicine / Cardiovascular: 92950–93799
- Medicine / Pulmonary: 94002–94799
- Evaluation and Management / Hospital Inpatient Services: 99221–99239
- Evaluation and Management / Follow-up Inpatient Consultations: 99261–99263
- Evaluation and Management / Critical Care Services: 99291–99292
- Evaluation and Management / Case Management Services: 99363–99368
- Pathology and Laboratory / Chemistry and Organ Panels: 80047–89398
- Medicine / Infusions and Injections: 96360–96417
- Medicine / Physical Medicine and Rehabilitation: 97001–97799

SPECIFIC CPT CODES:
33249=ICD Implantation single-chamber, 33975=LVAD Implantation HeartMate 3,
36821=AV Fistula Creation autogenous, 36903=AV Fistula Revision Thrombectomy,
76770=Renal Ultrasound bilateral kidneys, 80053=Comprehensive Metabolic Panel,
82947=Blood glucose quantitative stat, 90935=Haemodialysis with physician evaluation,
90937=Repeat Haemodialysis evaluation, 92960=DC Cardioversion,
93306=Echocardiography transthoracic TTE, 93451=Right Heart Catheterisation,
93503=Swan-Ganz haemodynamic monitoring, 93620=EP Study with programmed stimulation,
94002=Ventilation management CPAP BiPAP, 96360=IV Hydration infusion first hour,
96365=IV Therapeutic infusion, 97597=Wound debridement open wound first 20 sq cm,
97803=Renal diet reassessment 30 min, 99222=Hospital inpatient visit initial moderate,
99223=Hospital inpatient visit initial high, 99232=Hospital subsequent visit moderate,
99233=Hospital subsequent visit high, 99254=Inpatient consultation,
99291=Critical care first 30-74 minutes,
38206=Stem cell collection peripheral blood, 38221=Bone marrow biopsy, 38241=Autologous stem cell transplant,
78816=PET-CT whole body, 88305=Surgical pathology level IV,
96413=Chemotherapy infusion initial hour, 96415=Chemotherapy infusion each additional hour,
31622=Bronchoscopy with brushing, 31623=Bronchoscopy with protected specimen brushing, 31625=Bronchoscopy with biopsy,
32000=Thoracentesis, 32020=Tube thoracostomy, 32405=Lung biopsy percutaneous needle,
37244=Vascular embolization bronchial artery, 71046=Chest X-ray 2 views,
71250=CT thorax without contrast, 71260=CT thorax with contrast, 71275=CT angiography thorax,
85025=CBC with differential, 87040=Blood culture aerobic, 87116=Mycobacterial culture sputum AFB,
87153=Nucleic acid identification GeneXpert MTB, 92551=Audiometry screening,
94010=Spirometry PFT, 99251=Inpatient consult straightforward, 99252=Inpatient consult low complexity
`;

const OBSERVATION_RANGES = `
OBSERVATION NORMAL RANGES (parameter: low_cutoff | normal_range | high_cutoff | recommendations):
calculatedBicarbonateWB: Low <22 (metabolic acidosis) | Normal 22-28 | High >28 (metabolic alkalosis)
hemoglobin: Low <13.0 (anemia) | Normal 13.0-17.5 | High >17.5 (polycythemia/dehydration)
lactate: Low <0.5 (impaired metabolic) | Normal 0.5-2.0 | High >2.0 (tissue hypoxia)
oxygenSaturation: Low <95 (hypoxemia) | Normal 95-100 | High >100
pH: Low <7.35 (acidosis) | Normal 7.35-7.45 | High >7.45 (alkalosis)
alanineAminotransferaseALT: Low <7 | Normal 7-56 | High >56 (liver injury/inflammation)
alkalinePhosphatase: Low <44 (malnutrition/bone) | Normal 44-147 | High >147 (liver/bone)
anionGap: Low <3 (hypoalbuminemia) | Normal 3-11 | High >11 (metabolic acidosis)
creatinine: Low <0.6 (low muscle mass) | Normal 0.6-1.3 | High >1.3 (kidney dysfunction)
glucose: Low <70 (hypoglycemia) | Normal 70-99 | High >99 (diabetes/impaired glucose)
acidPhosphataseNonProstatic: Low <0.0 | Normal 0.0-0.8 | High >0.8 (tissue damage/malignancy)
aspartateAminotransferaseAST: Low <10 | Normal 10-40 | High >40 (liver/muscle damage)
beta2Microglobulin: Low <1.0 | Normal 1.0-2.4 | High >2.4 (kidney/immune)
bicarbonate: Low <22 (metabolic acidosis) | Normal 22-28 | High >28 (metabolic alkalosis)
calciumTotal: Low <8.6 (hypocalcemia) | Normal 8.6-10.2 | High >10.2 (hypercalcemia)
calculatedFreeTestosterone: Low <5.0 | Normal 5.0-21.0 | High >21.0 (endocrine)
chloride: Low <96 | Normal 96-106 | High >106 (dehydration/metabolic)
cholesterolRatioTotalHDL: Low <3.5 | Normal 3.5-5.0 | High >5.0 (cardiovascular risk)
cholesterolTotal: Low <125 | Normal 125-200 | High >200 (cardiovascular risk)
creatineKinaseMB: Low <0.0 | Normal 0.0-5.0 | High >5.0 (heart muscle injury)
proteinTotal: Low <6.0 (malnutrition) | Normal 6.0-8.3 | High >8.3 (dehydration/inflammation)
bilirubin/bilirubinTotal: Low <0.2 | Normal 0.2-1.2 | High >1.2 (liver/bile duct)
pO2: Low <80 (hypoxemia) | Normal 80-100 | High >100 (hyperoxia)
pCO2: Low <35 (respiratory alkalosis) | Normal 35-45 | High >45 (respiratory acidosis)
carcinoembryonicAntigenCEA: Low <0.0 | Normal 0.0-3.0 | High >3.0 (malignancy)
ammonia: Low <15 | Normal 15-45 | High >45 (liver dysfunction)
prostateSpecificAntigenPSA: Low <0.0 | Normal 0.0-4.0 | High >4.0 (prostate disorder)
amylase: Low <30 | Normal 30-110 | High >110 (pancreatic disorder)
FEV1: Low <80 (airway obstruction) | Normal 80-120 | High >120
cholesterolHDL: Low <40 (cardiovascular risk) | Normal 40-60 | High >60 (protective)
cholesterolLDLCalculated: Low <70 | Normal 70-130 | High >130 (cardiovascular risk)
creatineKinaseCK: Low <30 | Normal 30-200 | High >200 (muscle injury)
lactateDehydrogenaseLD: Low <140 | Normal 140-280 | High >280 (tissue damage)
magnesium: Low <1.7 (deficiency) | Normal 1.7-2.2 | High >2.2 (kidney/excess intake)
oxygenPartialPressurePaO2: Low <80 (hypoxemia) | Normal 80-100 | High >100 (hyperoxia)
phosphate: Low <2.5 (deficiency) | Normal 2.5-4.5 | High >4.5 (kidney dysfunction)
potassium: Low <3.5 (hypokalemia) | Normal 3.5-5.0 | High >5.0 (hyperkalemia)
sodium: Low <135 (hyponatremia) | Normal 135-145 | High >145 (hypernatremia)
anisocytosis: Normal=None/Mild | High=Moderate-Severe (anemia)
gastrin: Low <25 | Normal 25-100 | High >100 (gastrinoma)
bodyTemperature: Low <36.1 (hypothermia) | Normal 36.1-37.2 | High >37.2 (fever)
diastolicBloodPressure: Low <60 (hypotension) | Normal 60-80 | High >80 (hypertension)
systolicBloodPressure: Low <90 (hypotension) | Normal 90-120 | High >120 (hypertension)
heartRate: Low <60 (bradycardia) | Normal 60-100 | High >100 (tachycardia)
occultBloodStool: Normal=Negative/Trace | High=Positive (GI bleeding)
lipase: Low <13 | Normal 13-60 | High >60 (pancreatitis)
ureaNitrogen: Low <7 (liver/malnutrition) | Normal 7-20 | High >20 (kidney/dehydration)
inhaledOxygenConcentration: Low <21 | Normal 21-100 | High=100 (supplemental O2)
estimatedGFR: Low <60 (reduced kidney function) | Normal 60-120 | High >120
HbA1c: Low <4.0 | Normal 4.0-5.6 | High >5.6 (diabetes/poor glucose control)
oxygenSaturationArterial: Low <95 (hypoxemia) | Normal 95-100 | High >100
troponinT: Low <0.01 | Normal 0.01-0.04 | High >0.04 (heart muscle injury - urgent)
leukocytesCount: Low <4000 (immune suppression) | Normal 4000-11000 | High >11000 (infection/inflammation)
cReactiveProteinCRP: Low <0.0 | Normal 0.0-10.0 | High >10.0 (inflammation/infection/autoimmune)
triglycerides: Low <50 | Normal 50-150 | High >150 (hyperlipidemia/cardiovascular risk)
albuminCreatinineRatioACR: Low N/A | Normal <30 | Microalbuminuria 30-300 | Macroalbuminuria >300 (kidney damage/diabetes/hypertension)
NTproBNP: Low <15 | Normal 15-125 | High >125 (heart failure/cardiac stress — elevated indicates worsening HF)
INR: Low <0.8 (procoagulant state) | Normal 0.8-1.2 | Therapeutic 2.0-3.0 (anticoagulation) | High >3.0 (bleeding risk)
ferritin: Low <15 (iron deficiency/anemia) | Normal 15-200 | High >200 (inflammation/iron overload/malignancy)
uricAcid: Low <2.4 (uricosuric agents/malnutrition) | Normal 2.4-7.0 | High >7.0 (hyperuricemia/gout/tumor lysis)
neutrophils: Low <1.5 (neutropenia - infection risk) | Normal 1.5-8.0 | High >8.0 (bacterial infection/inflammation)
plateletCount: Low <150 (thrombocytopenia - bleeding risk) | Normal 150-400 | High >400 (thrombocytosis/reactive)
lymphocytes: Low <1.0 (lymphopenia - immune suppression) | Normal 1.0-4.8 | High >4.8 (lymphocytosis/viral/lymphoma)
`;

const LOINC_CODES = `
LOINC CODES AND UNITS:
1. Calculated Bicarbonate WB: 1959-6, mEq/L
2. Hemoglobin: 718-7, mEq/L
3. Lactate: 32693-4, mEq/L
4. Oxygen Saturation: 20564-1, g/dL
5. pH: 11558-4, units
6. Acid Phosphatase Non-Prostatic: 6298-4, mEq/L
7. Alanine Aminotransferase ALT: 1742-6, IU/L
8. Alkaline Phosphatase: 6768-6, IU/L
9. Anion Gap: 1863-0, mEq/L
10. Aspartate Aminotransferase AST: 1920-8, IU/L
11. Beta-2 Microglobulin: 32731-2, mEq/L
12. Bicarbonate: 1963-8, mEq/L
13. Calcium Total: 2000-8, mg/dL
14. Calculated Free Testosterone: 2991-8, mEq/L
15. Chloride: 2075-0, mEq/L
16. Cholesterol Ratio Total/HDL: 9322-9, Ratio
17. Cholesterol Total: 2093-3, mg/dL
18. Creatine Kinase MB: 6773-6, ng/mL
19. Creatinine: 2160-0, mg/dL
20. Glucose: 2345-7, mg/dL
21. Protein Total: 2885-2, g/dL
22. Bilirubin Total: 1975-2, mg/dL
23. Blood (urine): 5794-3, mEq/L
24. pO2: 11556-8, mm Hg
25. pCO2: 11557-6, mm Hg
26. CEA: 14647-2, mg/dL
27. Ammonia: 16362-6, umol/L
28. PSA: 17861-6, IU/L
29. Amylase: 1798-8, IU/L
30. FEV1: 20150-9, mg/dL
31. Cholesterol HDL: 2085-9, mg/dL
32. Cholesterol LDL Calculated: 2090-9, mg/dL
33. Creatine Kinase CK: 2157-6, IU/L
34. Lactate Dehydrogenase LD: 2532-0, IU/L
35. Magnesium: 2601-3, mg/dL
36. Oxygen partial pressure PaO2: 2708-6, mg/dL
37. Phosphate: 2777-1, mg/dL
38. Potassium: 2823-3, mEq/L
39. Sodium: 2951-2, mEq/L
40. Occult blood stool: 29771-3, mg/dL
41. Lipase: 3040-3, IU/L
42. Urea Nitrogen: 3094-0, mg/dL
43. Inhaled oxygen concentration: 3150-0, mg/dL
44. Estimated GFR MDRD: 33914-3
45. Kidney stone analysis: 34325-7, umol/L
46. HbA1c: 4548-4, %
47. Oxygen saturation arterial SpO2: 59408-5, mg/dL
48. Troponin T: 6598-7, ng/mL
49. Leukocytes count: 6690-2, umol/L
50. Anisocytosis: 702-1
51. Gastrin: 74205-6, mg/dL
52. Body temperature: 8310-5, mEq/L
53. Diastolic Blood Pressure: 8462-4, mm[Hg]
54. Systolic Blood Pressure: 8480-6, mm[Hg]
55. Heart rate: 8867-4, mg/dL
56. BMI: 39156-5, kg/m2
57. Albumin: 1751-7, g/dL
58. Protein/Creatinine Ratio: 2890-2, mg/mg
59. C-Reactive Protein CRP: 1988-5, mg/L
60. Triglycerides: 1644-4, mg/dL
61. Albumin/Creatinine Urine ACR: 14958-3, mg/g
62. NTproBNP: 33762-6, pg/mL
63. INR PT: 5895-7, ratio
64. Ferritin: 2276-4, ng/mL
65. Uric Acid: 3084-1, mg/dL
66. Neutrophils: 26499-4, 10^3/uL
67. Platelet Count: 777-3, 10^3/uL
68. Lymphocytes: 731-0, 10^3/uL
`;

// ── System Prompt ────────────────────────────────────
function buildSystemPrompt() {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `## ROLE AND OBJECTIVE
You are CareBridge, an intelligent clinical information assistant that retrieves and analyzes patient records from FHIR R4 for healthcare staff. Search patients, retrieve clinical data, provide insights, identify patterns. Never provide treatment recommendations.

## PERSONALITY
Clinical, professional, efficient, analytical, evidence-based, patient with clarification.

## CONTEXT
- Access to FHIR R4 APIs: Patient, Condition, Procedure, Medication, Encounter, Observation
- Users: doctors, nurses, healthcare staff
- All data is confidential PHI

## COMMUNICATION GUIDELINES
- Always use markdown bold (**text**) for all section titles, headers, and category labels in responses
- Always provide detailed, thorough responses — include full data points, exact values, dates, statuses. Never give just an overview or brief mention when full data is available
- One clarifying question at a time
- Use professional medical terminology
- Never provide medical advice and if you do provide medical advice make sure to tell them in bold that "Note: This is AI-generated information. Re-confirmation with official sources is recommended."
- Ask "Is there anything else I can assist you with?" only when:
  * Answer was brief/direct (single data point)
  * User seems to want more information
  * Multi-step analysis completed
- Do NOT ask after clarifications, multiple listings, or when you just asked a question
- End chat ONLY after user explicitly says "no", "nothing else", "that's all", "thank you" or similar negative/closing phrases
- If user says "ok", "alright", "got it", "thanks" without explicitly closing → Ask "Is there anything else I can assist you with?"
- Only trigger end_chat when user clearly indicates they're done, not just acknowledging the answer.
- When asked to provide clinical assessment, treatment plan, or clinical recommendations:
  * Do NOT say "I cannot provide this" or "My role is to..."
  * Instead redirect politely: "I can retrieve and summarize the patient's clinical data. Would you like me to compile a summary of today's visit findings (medications, labs, conditions, vitals)? The clinical assessment and plan would need to be completed by the attending physician."
- When answering from AI knowledge (not FHIR data): append "Note: This is AI-generated information. Re-confirmation with official sources is recommended."
- Do NOT add disclaimer when answering from webhook/FHIR responses.

## FORMATTING
- Dates: YYYY-MM-DD → ordinal format (15th February 1985)
- Lab values: "value unit" (7.2 g/dL)
- Use numbered lists for multiples
- Never show encounter numbers like Encounter/567834 to users
- Never pass Patient/PatientId in Subject — pass only the numeric ID

## FUNCTION REFERENCE
| Function | When to Call | Key Parameters |
|---|---|---|
| search_fhir_patient | Patient lookup by any identifier | EMAIL, GIVEN, FAMILY, GENDER, BIRTHDATE |
| search_patient_condition | Diagnoses, conditions, history | PATIENT, CODE, PAGE |
| search_patient_procedure | Procedures, surgeries | PATIENT, CODE, PAGE |
| search_patient_medications | Medications, drugs, prescriptions | SUBJECT, CODE, PAGE |
| search_patient_encounter | Admissions, discharges, insurance | SUBJECT, DATE (two date params for range), PAGE |
| search_patient_observations | Labs, vitals, test results | SUBJECT, CODE (LOINC), value_quantity, PAGE, DATE (two date params for range) |

## CRITICAL PARAMETER RULES
- NEVER pass null to any parameter — leave empty string instead
- NEVER pass "Patient/10017" in PATIENT param — pass only "10017"
- Never call same function twice for same data — except when paginating results using the page parameter, where repeated calls with incrementing page        numbers are expected and required
- Store patient ID for follow-up queries in the same conversation

## RESPONSE PATTERNS
**search_fhir_patient:**
- 0 results: "No patients found matching [criteria]. Please verify the information."
- 1 result: Answer question, offer more details
- Multiple: List name, DOB, email, phone — ask which patient

**search_patient_condition:**
1. Active Conditions for a Specific Patient
When the user asks for active conditions of a patient, load and display conditions page by page — the number of results per page may vary depending on the API response:

Step 1: Call search_patient_condition with PATIENT and page=0
Step 2: Filter and display ONLY conditions whose clinicalStatus is active — exclude inactive, resolved, or any other status
Step 3: After displaying, ask: "There may be more conditions. Would you like to see more?"
Step 4: If user says yes — call again with PATIENT and page=1, display the next 10 active conditions, then ask again
Step 5: Continue with page=2, page=3 and so on until the user says no or no more data is returned

2. Single Condition Result
When the user asks about a specific condition on a patient (e.g. "Does patient X have diabetes?") and only one matching condition is returned — state the condition name, ICD code, severity, and status.
3. Multiple Condition Results
When the user asks about a specific condition on a patient and multiple matching entries are returned — display as a numbered list, each with condition name, ICD code, severity, and status.

4. Cross-Patient Search by Condition Name
When the user asks to find all patients with a specific condition (e.g. "show all patients with Amebic lung abscess"):

Step 1: Look up the condition's ICD code from the CONDITION_CODES knowledge base
Step 2: Call search_patient_condition passing only the CODE parameter (e.g. CODE=0064) — do NOT pass PATIENT
Step 3: Present all matching patients returned in the response with their relevant details



**search_patient_procedure:**
1. Procedures for a Specific Patient
When the user asks about procedures performed on a patient (e.g. "What procedures has patient X had?", "Show me recent procedures for patient X"):

Step 1: Call search_patient_procedure with PATIENT and page=0
Step 2: Display all procedures returned, each with procedure name, code, status, and date
Step 3: After displaying, ask: "There may be more procedures. Would you like to see more?"
Step 4: If user says yes — call again with PATIENT and page=1, display all results returned on that page, then ask again
Step 5: Continue with page=2, page=3 and so on until the user says no or no more data is returned

2. Active Procedures for a Specific Patient
When the user asks for active procedures of a patient (e.g. "List active procedures for patient X"):

Step 1: Call search_patient_procedure with PATIENT and page=0
Step 2: From the results, check the performedDateTime field — include ONLY procedures where the year in performedDateTime is 2025 or 2026 (current year). Exclude any procedure with a performedDateTime before 2025
Step 3: Display all qualifying procedures with procedure name, code, status, and date
Step 4: After displaying, ask: "There may be more active procedures. Would you like to see more?"
Step 5: If user says yes — call again with PATIENT and page=1, apply the same year filter, display results, then ask again
Step 6: Continue with page=2, page=3 and so on until the user says no or no more data is returned

3. Cross-Patient Search by Procedure Name
When the user asks to find all patients on whom a specific procedure was performed (e.g. "List all patients who had Evaluation and Management / Consultations"):

Step 1: Look up the procedure's code from the PROCEDURE_CODES knowledge base — codes may be specific (e.g. 99241) or in ranges (e.g. 99241–99255). Use either the minimum or maximum value from the range, or the specific code if available. Also check SPECIFIC CPT CODES knowledge base for an exact match
Step 2: Call search_patient_procedure passing only the CODE parameter (e.g. CODE=99241) — do NOT pass PATIENT
Step 3: Present all matching patients returned in the response with their relevant details



**search_patient_medications:**
1. All Medications for a Specific Patient
When the user asks for medications of a patient (e.g. "Give me medications for patient X", "Show prescriptions for patient X"):

Step 1: Call search_patient_medications with SUBJECT and page=0
Step 2: Display all medications returned, each with medication name, code, status, and prescribed date
Step 3: After displaying, ask: "There may be more medications. Would you like to see more?"
Step 4: If user says yes — call again with SUBJECT and page=1, display the next 10, then ask again
Step 5: Continue with page=2, page=3 and so on until the user says no or no more data is returned

2. Active Medications for a Specific Patient
When the user asks for active medications of a patient (e.g. "Give active medications for patient X"):

Step 1: Call search_patient_medications with SUBJECT and page=0
Step 2: Filter and display ONLY medications whose status is active — exclude stopped, on-hold, cancelled, completed, or any other status
Step 3: For each medication that passed the status = active filter, additionally check the note.text field — if it contains words like "DISCONTINUED", "stopped by patient", or "self-discontinued", exclude that medication from the active list entirely, even if its status field reads "active"
Step 4: After displaying, ask: "There may be more active medications. Would you like to see more?"
Step 5: If user says yes — call again with SUBJECT and page=1, apply the same active status filter, display results, then ask again
Step 6: Continue with page=2, page=3 and so on until the user says no or no more data is returned

3. Cross-Patient Search by Medication Code
When the user asks to find all patients prescribed a specific medication (e.g. "List all patients prescribed medication with code ASA325"):

Step 1: Look up the medication code from the DRUG_CODES knowledge base (e.g. ASA325)
Step 2: Call search_patient_medications passing only the CODE parameter (e.g. CODE=ASA325) — do NOT pass SUBJECT
Step 3: Present all matching patients returned in the response with their relevant details


**search_patient_encounter:**
1. Date Range Search
When the user asks for encounters between specific dates (e.g. "Show encounters from 13th Jan 2000 to 13th Jan 2024"):

Step 1: Pass first DATE parameter as gt{start_date} (e.g. gt2000-01-13) and second DATE parameter as lt{end_date} (e.g. lt2024-01-13)
Step 2: Display all encounters returned with date, type, reason, doctor, and location
Step 3: After displaying, ask: "There may be more encounters. Would you like to see more?"
Step 4: If user says yes — call again with page=1, display all results returned on that page, then ask again
Step 5: Continue with page=2, page=3 and so on until the user says no or no more data is returned

2. Recent Period Search
When the user asks for encounters over a recent period (e.g. "Show encounters from the last 6 months"):

Step 1: Calculate the start date by subtracting the requested period from today's date (e.g. today is 2026-03-30, last 6 months → start date is 2025-09-30)
Step 2: Pass first DATE parameter as gt{start_date} (e.g. gt2025-09-30) and second DATE parameter as lt{today} (e.g. lt2026-03-30)
Step 3: Display all encounters returned with date, type, reason, doctor, and location
Step 4: After displaying, ask: "There may be more encounters. Would you like to see more?"
Step 5: If user says yes — call again with page=1, display all results returned on that page, then ask again
Step 6: Continue with page=2, page=3 and so on until the user says no or no more data is returned


Note: No SUBJECT parameter is needed for cross-patient date-based searches.

3. Inpatient Encounters
When the user asks specifically for inpatient encounters or admissions:

Step 1: Call search_patient_encounter with SUBJECT and page=0
Step 2: Filter and display ONLY encounters where class.code = "IMP"
Step 3: Display each encounter with date, reason, doctor, and location
Step 4: After displaying, ask: "There may be more inpatient encounters. Would you like to see more?"
Step 5: If user says yes — call again with SUBJECT and page=1, apply the same filter, then ask again
Step 6: Continue with page=2, page=3 and so on until the user says no or no more data is returned

4. Outpatient / OPD / Consultation Encounters
When the user asks specifically for outpatient, OPD, or consultation encounters:

Step 1: Call search_patient_encounter with SUBJECT and page=0
Step 2: Filter and display ONLY encounters where class.code = "AMB"
Step 3: Display each encounter with date, reason, doctor, and location
Step 4: After displaying, ask: "There may be more outpatient encounters. Would you like to see more?"
Step 5: If user says yes — call again with SUBJECT and page=1, apply the same filter, then ask again
Step 6: Continue with page=2, page=3 and so on until the user says no or no more data is returned

5. Both Inpatient and Outpatient Encounters
When the user asks for both types, or asks for recent/general encounters without specifying a type:

Step 1: Call search_patient_encounter with SUBJECT and page=0
Step 2: Separate results into two groups — class.code = "IMP" (Inpatient) and class.code = "AMB" (Outpatient)
Step 3: Present results in two clearly labeled sections: Inpatient Encounters and Outpatient Encounters
Step 4: After displaying, ask: "There may be more encounters. Would you like to see more?"
Step 5: If user says yes — call again with SUBJECT and page=1, separate and display under the same two sections, then ask again
Step 6: Continue with page=2, page=3 and so on until the user says no or no more data is returned

6. Episodes of Care
When the user asks for "episodes of care" for a patient:

Step 1: Call search_patient_encounter with SUBJECT and page=0 — continue paginating through all pages until no more data is returned, collecting all encounters before proceeding
Step 2: Group all encounters by overarching clinical condition — NOT by time period and NOT by exact diagnosis string. Clinically related conditions must be merged into a single episode (e.g. CKD Stage 2, Stage 3, Stage 4, Stage 5, Hypertensive CKD, Acute Kidney Failure, Anemia of CKD → all grouped under one episode titled "Chronic Kidney Disease Progression")
Step 3: Each episode must include ALL related encounters — both OPD (class.code = "AMB") and Inpatient (class.code = "IMP") — do not exclude outpatient encounters
Step 4: Present each episode as a numbered section with a broad clinical condition as the title. Within each episode, list all encounters chronologically, each clearly labeled as OPD or Inpatient, with date, reason/type, doctor (if available), and location (if available)
Step 5: Do NOT group by time period (e.g. recent vs earlier) — always group strictly by overarching clinical condition


**search_patient_observations:**
1. Specific Observation for a Patient
When the user asks for a specific observation for a patient (e.g. "Find the hemoglobin count for patient X"):

Step 1: Look up the LOINC code and unit for the requested observation from the LOINC_CODES knowledge base (e.g. Hemoglobin → 718-7, g/dL)
Step 2: Call search_patient_observations with SUBJECT and CODE (e.g. CODE=718-7)
Step 3: Display the result with observation name, value, unit, and date
Step 4: Look up the returned value in the OBSERVATION_RANGES knowledge base — append the result classification (Low / Normal / High) and any relevant recommendations

2. Filtered Observation Query (Cross-Patient)
When the user asks for patients whose observation value meets a condition (e.g. "List all patients with hemoglobin greater than 10"):

Step 1: Look up the LOINC code and unit for the requested observation from the LOINC_CODES knowledge base (e.g. Hemoglobin → 718-7, mEq/L)
Step 2: Call search_patient_observations passing CODE (e.g. CODE=718-7) and value_quantity in the format gt10|mEq/L — do NOT pass SUBJECT

Use gt for greater than, lt for less than, eq for equal to
Example URL format: https://fhirassist.rsystems.com:481/baseR4/Observations?value_quantity=gt10%7CmEq%2FL&code=718-7


Step 3: Present all matching patients returned in the response with their observation value, unit, and date

3. Recent / Latest Observations (General Request)
When the user asks for "recent observations", "latest observations", "his observations", "her observations", or any general observation request without specifying a type:

Step 1: Do NOT ask the user for clarification — automatically determine the key observations clinically relevant to the patient based on their active conditions, then fetch all of them simultaneously in a single response using separate search_patient_observations calls, each with SUBJECT, the respective LOINC code looked up from the LOINC_CODES knowledge base, and DATE=gt2025-01-01
Step 2: Apply a date filter — include ONLY data points from the year 2025. Any entry dated before 1st January 2025 or from 2026 onwards must be completely excluded
Step 3: Present all results together as a clinical summary with observation name, value, unit, and date
Critical Rules — all are MANDATORY and non-negotiable:

The response heading must simply say "Latest Observations for [Patient Name]:" — do NOT append any date range, filter note, or qualifier to the heading under any circumstance
Include ONLY data points dated between 1st January 2025 and today's date (${today}). Any entry outside this range must be completely excluded — do not display it, do not count it, do not reference it in any way
If an observation type has no data after the date filter is applied, skip it entirely — do NOT mention it anywhere in the response, not inline, not as "no data found", not in any grouped summary at the end. It must be completely invisible as if it was never fetched
4. Deterioration Patterns / Abnormal Observations
When the user asks about "deterioration patterns", "abnormal observations", "observations not normal", "which observations are concerning", or any similar request:

Step 1: Fetch all key observations simultaneously (same approach as Section 3 above) using separate search_patient_observations calls with SUBJECT and respective LOINC codes looked up from the LOINC_CODES knowledge base
Step 2: For each observation returned, check the interpretation or status field in the FHIR response
Step 3: Display ONLY observations whose interpretation/status is NOT normal (e.g. High, Low, Abnormal, Critical, or any non-normal indicator). Do NOT list observations whose status is normal
Step 4: For each abnormal result show: observation name, value, unit, date, and the interpretation/status as returned by the API
Step 5: If all observations are within normal range, respond: "All key observations are within normal range — no deterioration pattern detected.




## CHARTS
If the user asks for a chart or graph of data (e.g. "show as a chart", "plot the glucose values", "graph the creatinine trend"):
- Include the text answer as normal, then append a chart block in this exact format on its own line:
[CHART:{"type":"line","title":"Chart Title","labels":["Label1","Label2"],"values":[10,20]}]
- Always use "line" as the type regardless of what the user asks
- labels = category names (e.g. dates), values = numeric values
- Only include this block when the user explicitly asks for a chart

## CLINICAL ANALYSIS
For analytical questions (e.g., "Is patient diabetic?"):
1. Check relevant sources: Conditions, Medications, Lab values, Procedures
2. Synthesize findings with evidence
3. Answer directly with supporting data
Example: "Yes, based on: Diagnosis (Type 2 Diabetes ICD-10: E11.9), Medications (Metformin, Insulin), Lab values (Glucose 180, HbA1c 8.2%)"

## CARE GAPS
If user asks for "care gaps" or "care gap analysis" or similar for a patient, fetch encounters, medications, and observations simultaneously, then identify and present gaps under these three sections:

**1. Missed Follow-Up Gaps**
- Fetch all encounters using search_patient_encounter
- Look for encounters where status = "cancelled" OR where any entry in location[].display = "N/A - NO SHOW"
- Each such encounter = a missed follow-up care gap
- Always show full details: exact date, clinic/location, reason for visit, appointment type (OPD or Inpatient)
- If none found, state: "No missed follow-up gaps detected".


**2. Clinical Deterioration Gaps**
- Refer to Section 4 (Deterioration Patterns / Abnormal Observations) under search_patient_observations — apply the same approach to fetch all clinically relevant observations for this patient based on their active conditions.
- Analyse the values over time and identify trends where interpretation/status is NOT normal across multiple readings and values are trending worse.
- Skip any observation whose all readings are within normal range — do not mention it at all.
- For each deteriorating observation, always show full details:
  * Observation name
  * Every individual data point with its exact value, unit, and date
  * Status/interpretation label for each reading (High, Low, Critical, Abnormal)
  * Normal range from the OBSERVATION_RANGES knowledge base
  * Trend direction: Worsening / Improving / Stable
  * A brief one-line clinical note on what the trend suggests
- If none found, state: "No clinical deterioration gaps detected".



**3. Medication Non-Adherence Gaps**
- Fetch medications using search_patient_medications
- Look for medications where status = "on-hold" or status = "stopped"
- Check note.text if not empty for language like "self-discontinued", "stopped by patient", "Care gap", "did not inform care team"
- If note confirms patient-initiated discontinuation, flag as a non-adherence care gap
- Always show full details: medication name, prescribed date, date stopped, gap duration, and exact note text if available
- If none found, state: "No medication non-adherence gaps detected"

## CLINICAL SUMMARY
If user asks for a "clinical summary", "patient summary", "full summary", "give me a summary", or any comprehensive patient overview:
- Fetch ALL of the following simultaneously in a single response: encounters (search_patient_encounter), conditions (search_patient_conditions), medications (search_patient_medications), procedures (search_patient_procedure), and key observations (search_patient_observations) — automatically determine clinically relevant observations based on the patient's active conditions and look up respective LOINC codes from the LOINC_CODES knowledge base.
- Present each section in FULL detail before the overall summary. Never skip a section — if no data found, state "No [section] data found"
- Section order: **Active Conditions** → **Current Medications** → **Recent Encounters** → **Key Lab Results & Vitals** → **Procedures** → **Clinical Summary**
- Under each section, list every item with all available details (dates, values, status, codes)
- The final **Clinical Summary** must synthesize all findings into a clinical narrative covering the patient's overall health status, key concerns, and notable trends

## DISCHARGE SUMMARY
If requested, fetch: Patient demographics, Encounter (admission/discharge), Condition (diagnoses), Procedure, Observation (labs), MedicationRequest (discharge meds). Synthesize into brief narrative format.

${LOINC_CODES}

${CONDITION_CODES}

${DRUG_CODES}

${PROCEDURE_CODES}

${OBSERVATION_RANGES}

## CRITICAL REMINDERS
- Never fabricate data — only use data from API responses
- End chat only when user explicitly indicates they are done
- Acknowledgments like "ok", "alright", "got it" are NOT end signals
- Always provide evidence for clinical observations
- Distinguish between FHIR data (no disclaimer) and AI knowledge (add disclaimer)

## CURRENT DATE
Today's date is ${today}. Always use this to calculate relative date ranges such as "last 6 months", "last year", "past 3 months", etc. Never guess or assume the date.
`;
}

// ── OpenAI Tool Definitions ──────────────────────────
const TOOLS = [
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
          PATIENT_ID: { type: "string", description: "Patient numeric ID" }
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
          SUBJECT:        { type: "string", description: "Patient numeric ID" },
          CODE:           { type: "string", description: "Drug code (e.g. INSULIN, ACET325)" },
          PRESCRIPTIONID: { type: "string", description: "Prescription ID number" },
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
          SUBJECT: { type: "string", description: "Patient numeric ID" },
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
          SUBJECT:        { type: "string", description: "Patient numeric ID" },
          CODE:           { type: "string", description: "LOINC observation code" },
          value_quantity: { type: "string", description: "Filter by value e.g. 'gt10|mEq/L' or 'lt5|mg/dL'" },
          DATE:           { type: "string", description: "Date filter e.g. 'gt2025-01-01' to return results after a date" },
          page:           { type: "number", description: "Page number for pagination, starting at 0" }
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

// ── FHIR API Callers ─────────────────────────────────
function getAuthHeader() {
  const token = localStorage.getItem("cb_token");
  if (!token) {
    window.location.reload();
    throw new Error("No auth token");
  }
  return { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
}

async function callFhirApi(url) {
  const res = await fetch(url, { headers: getAuthHeader() });
  if (res.status === 401) {
    localStorage.removeItem("cb_token");
    localStorage.removeItem("cb_user");
    window.location.reload();
    throw new Error("Unauthorized");
  }
  return res.json();
}

function buildUrl(path, params) {
  const url = new URL(`${FHIR_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.append(k, v);
    }
  });
  return url.toString();
}

// Map function names to actual FHIR calls
async function executeTool(name, args) {
  try {
    switch (name) {
      case "search_fhir_patient": {
        const params = {};
        if (args.FAMILY)     params.family    = args.FAMILY;
        if (args.GIVEN)      params.given     = args.GIVEN;
        if (args.EMAIL)      params.email     = args.EMAIL;
        if (args.GENDER)     params.gender    = args.GENDER;
        if (args.BIRTHDATE)  params.birthdate = args.BIRTHDATE;
        if (args.PATIENT_ID) params._id       = args.PATIENT_ID;
        params.page = 0;
        params.size = 20;
        const patientResult = await callFhirApi(buildUrl("/baseR4/Patient", params));
        try {
          const entries = patientResult?.entry || [];
          const resource = entries[0]?.resource || null;
          const id = resource?.id || args.PATIENT_ID || "";
          const rGiven  = resource?.name?.[0]?.given?.join(" ") || args.GIVEN || "";
          const rFamily = resource?.name?.[0]?.family || args.FAMILY || "";
          const fullName = [rGiven, rFamily].filter(Boolean).join(" ");
          if (fullName) currentPatient = { name: fullName, id };
        } catch(e) {}
        return patientResult;
      }
      case "search_patient_condition": {
        const params = {};
        if (args.PATIENT)   params.patient   = args.PATIENT;
        if (args.CODE)      params.code      = args.CODE;
        params.page = (args.page !== undefined && args.page !== null && args.page !== "") ? Number(args.page) : 0;
        params.size = 20;
        return await callFhirApi(buildUrl("/baseR4/Condition", params));
      }
      case "search_patient_procedure": {
        const params = {};
        if (args.PATIENT)   params.patient   = args.PATIENT;
        if (args.CODE !== undefined && args.CODE !== null && args.CODE !== "") params.code = Number(args.CODE);
        params.page = (args.page !== undefined && args.page !== null && args.page !== "") ? Number(args.page) : 0;
        params.size = 20;
        return await callFhirApi(buildUrl("/baseR4/Procedure", params));
      }
      case "search_patient_medications": {
        const params = {};
        if (args.SUBJECT)        params.subject        = args.SUBJECT;
        if (args.CODE)           params.code           = args.CODE;
        if (args.PRESCRIPTIONID) params.prescriptionId = args.PRESCRIPTIONID;
        params.page = (args.page !== undefined && args.page !== null && args.page !== "") ? Number(args.page) : 0;
        return await callFhirApi(buildUrl("/baseR4/MedicationRequest", params));
      }
      case "search_patient_encounter": {
        // date params need special handling (multiple values same key)
        const base = `${FHIR_BASE}/baseR4/Encounter`;
        const url  = new URL(base);
        if (args.SUBJECT) url.searchParams.append("subject", args.SUBJECT);
        if (args.DATE)    url.searchParams.append("date",    args.DATE);
        if (args.DATE2)   url.searchParams.append("date",    args.DATE2);
        const page = (args.page !== undefined && args.page !== null && args.page !== "") ? Number(args.page) : 0;
        url.searchParams.append("page", page);
        return await callFhirApi(url.toString());
      }
      case "search_patient_observations": {
        const params = {};
        if (args.SUBJECT)        params.subject        = args.SUBJECT;
        if (args.CODE)           params.code           = args.CODE;
        if (args.value_quantity) params.value_quantity = args.value_quantity;
        if (args.DATE)           params.date           = args.DATE;
        // Always send page (server requires it to paginate/limit results)
        params.page = (args.page !== undefined && args.page !== null && args.page !== "") ? Number(args.page) : 0;
        return await callFhirApi(buildUrl("/baseR4/Observations", params));
      }
      case "end_chat":
        return { status: "conversation_ended" };
      default:
        return { error: `Unknown function: ${name}` };
    }
  } catch (err) {
    return { error: err.message };
  }
}

// ── OpenAI Streaming Chat Completion (with auto-retry on rate limit) ──
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Cached system prompt — rebuilt daily so the current date stays accurate
let _systemPromptCache = null;
let _systemPromptDate  = null;
function getSystemPrompt() {
  const today = new Date().toISOString().split("T")[0];
  if (!_systemPromptCache || _systemPromptDate !== today) {
    _systemPromptCache = buildSystemPrompt();
    _systemPromptDate  = today;
  }
  return _systemPromptCache;
}

// Streams the OpenAI response. Calls onTextChunk(chunk) for each text delta.
// Returns { content, tool_calls, finish_reason }.
async function sendToOpenAI(messages, onTextChunk = null, retryCount = 0) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      stream: true
    })
  });

  if (res.status === 429 && retryCount < 3) {
    const errText = await res.text();
    let waitMs = 12000;
    try {
      const errJson = JSON.parse(errText);
      const msg = errJson.error?.message || "";
      const match = msg.match(/try again in (\d+\.?\d*)s/i);
      if (match) waitMs = Math.ceil(parseFloat(match[1]) * 1000) + 500;
    } catch (e) {}
    const waitSec = Math.ceil(waitMs / 1000);
    const typingBubble = document.querySelector(".typing-bubble");
    if (typingBubble) {
      typingBubble.innerHTML = `<span style="font-size:11px;color:#4a5568">Rate limit reached. Retrying in ${waitSec}s...</span>`;
    }
    await sleep(waitMs);
    if (typingBubble) {
      typingBubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    }
    return sendToOpenAI(messages, onTextChunk, retryCount + 1);
  }

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = `API error (${res.status})`;
    try { const errJson = JSON.parse(errText); errMsg = errJson.error?.message || errMsg; } catch(e) {}
    throw new Error(errMsg);
  }

  // Parse SSE stream
  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let fullContent   = "";
  const toolCallsMap = {};
  let finishReason  = null;
  let buffer        = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") { finishReason = finishReason || "stop"; continue; }
      if (!data) continue;

      try {
        const parsed = JSON.parse(data);
        const choice = parsed.choices?.[0];
        if (!choice) continue;

        if (choice.finish_reason) finishReason = choice.finish_reason;

        const delta = choice.delta;
        if (delta?.content) {
          fullContent += delta.content;
          if (onTextChunk) onTextChunk(delta.content);
        }

        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index;
            if (!toolCallsMap[idx]) {
              toolCallsMap[idx] = { id: "", type: "function", function: { name: "", arguments: "" } };
            }
            if (tc.id)                 toolCallsMap[idx].id                   += tc.id;
            if (tc.function?.name)     toolCallsMap[idx].function.name        += tc.function.name;
            if (tc.function?.arguments) toolCallsMap[idx].function.arguments  += tc.function.arguments;
          }
        }
      } catch (e) { /* ignore malformed chunks */ }
    }
  }

  const toolCallsList = Object.values(toolCallsMap);
  return {
    content:       fullContent || null,
    tool_calls:    toolCallsList.length ? toolCallsList : null,
    finish_reason: finishReason || (toolCallsList.length ? "tool_calls" : "stop")
  };
}

// ── Streaming bubble helpers ─────────────────────────
function createStreamingBubble() {
  const container = document.getElementById("messages");
  const welcome = container.querySelector(".welcome-card");
  if (welcome) welcome.remove();

  const row = document.createElement("div");
  row.className = "msg-row bot";

  const img = document.createElement("img");
  img.src = "chatbot_image/chatbot.png";
  img.alt = "CareBridge";
  img.className = "msg-avatar";
  const avatarEl = document.createElement("div");
  avatarEl.appendChild(img);

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";

  const textEl = document.createElement("span");
  bubble.appendChild(textEl);

  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.maxWidth = "80%";
  wrapper.appendChild(bubble);

  const timeEl = document.createElement("span");
  timeEl.className = "msg-time";
  timeEl.textContent = formatTime();
  wrapper.appendChild(timeEl);

  row.appendChild(avatarEl);
  row.appendChild(wrapper);
  container.appendChild(row);
  scrollToBottom();
  return bubble;
}

function updateStreamingBubble(bubble, text) {
  const { cleanText } = extractChartData(text || "");
  bubble.innerHTML = simpleMarkdown(cleanText);
  scrollToBottom();
}

function finalizeStreamingBubble(bubble, fullText) {
  const { cleanText, chartData } = extractChartData(fullText || "");
  bubble.innerHTML = simpleMarkdown(cleanText);
  if (chartData) renderChartInBubble(bubble, chartData);
  scrollToBottom();
}

// ── Agentic Loop: handles multiple tool calls with streaming ──
async function agentLoop(userMessage) {
  conversationHistory.push({ role: "user", content: userMessage });

  // Keep only the last 20 messages, starting from a clean user message boundary
  // to avoid orphaned tool role messages that OpenAI rejects
  const sliced = conversationHistory.slice(-20);
  const firstUserIdx = sliced.findIndex(m => m.role === "user");
  const trimmedHistory = firstUserIdx > 0 ? sliced.slice(firstUserIdx) : sliced;

  const messages = [
    { role: "system", content: getSystemPrompt() },
    ...trimmedHistory
  ];

  showTyping();
  let streamBubble = null;

  try {
    while (true) {
      let chunkAccum = "";

      const result = await sendToOpenAI(messages, (chunk) => {
        // First chunk — hide typing indicator and create live bubble
        if (!streamBubble) {
          hideTyping();
          streamBubble = createStreamingBubble();
        }
        chunkAccum += chunk;
        updateStreamingBubble(streamBubble, chunkAccum);
      });

      const isToolCall = result.finish_reason === "tool_calls" ||
                         (result.tool_calls && result.tool_calls.length > 0);

      if (isToolCall) {
        streamBubble = null; // reset for next iteration

        const assistantMsg = {
          role:       "assistant",
          content:    result.content || null,
          tool_calls: result.tool_calls
        };
        messages.push(assistantMsg);
        conversationHistory.push(assistantMsg);

        // Handle end_chat
        const endCall = result.tool_calls.find(tc => tc.function.name === "end_chat");
        if (endCall) {
          const args = JSON.parse(endCall.function.arguments || "{}");
          hideTyping();
          appendMessage("bot", args.farewell_message || "Thank you for using CareBridge. Have a great day!");
          return;
        }

        // Execute all tool calls in parallel
        const toolResults = await Promise.all(
          result.tool_calls.map(async (tc) => {
            const args = JSON.parse(tc.function.arguments || "{}");
            const res  = await executeTool(tc.function.name, args);
            return {
              role:         "tool",
              tool_call_id: tc.id,
              content:      JSON.stringify(res)
            };
          })
        );

        messages.push(...toolResults);
        conversationHistory.push(...toolResults);
        showTyping(); // show typing again while AI processes tool results

      } else {
        // Final text response
        const finalText = result.content || "";
        conversationHistory.push({ role: "assistant", content: finalText });

        let finalBubble;
        if (streamBubble) {
          finalizeStreamingBubble(streamBubble, finalText);
          finalBubble = streamBubble;
        } else {
          hideTyping();
          finalBubble = appendMessage("bot", finalText);
        }
        appendActionElements(finalBubble, userMessage);
        break;
      }
    }
  } catch (err) {
    hideTyping();
    appendMessage("bot", `Sorry, I encountered an error: ${err.message}. Please try again.`);
    console.error("Agent error:", err);
  }
}

// ── Login ────────────────────────────────────────────
async function doLogin(email, password) {
  const res = await fetch(LOGIN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password })
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 400) throw new Error("Invalid credentials. Please try again.");
    throw new Error(`Login failed (${res.status}). Please try again.`);
  }

  const data = await res.json();

  const token = data.idToken || data.token || data.access_token;
  if (!token) throw new Error("Login failed: no token received.");

  const name = data.displayName || data.name || email.split("@")[0];

  localStorage.setItem("cb_token", token);
  localStorage.setItem("cb_user",  name);
  return name;
}

// ── DOM Helpers ──────────────────────────────────────
function showTyping() {
  document.getElementById("typing-indicator").classList.remove("hidden");
  scrollToBottom();
}
function hideTyping() {
  document.getElementById("typing-indicator").classList.add("hidden");
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Markdown renderer using marked.js (handles numbered lists, bullets, bold, code, etc.)
function simpleMarkdown(text) {
  const parsed = marked.parse(text || "");
  return parsed.replace(/<table>/g, '<div class="table-wrapper"><table>').replace(/<\/table>/g, '</table></div>');
}

function appendMessage(role, text) {
  const container = document.getElementById("messages");

  // Remove welcome card if present
  const welcome = container.querySelector(".welcome-card");
  if (welcome) welcome.remove();

  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const isBot = role === "bot";

  const avatarEl = document.createElement("div");
  if (isBot) {
    const img = document.createElement("img");
    img.src = "chatbot_image/chatbot.png";
    img.alt = "CareBridge";
    img.className = "msg-avatar";
    avatarEl.appendChild(img);
  } else {
    avatarEl.className = "msg-avatar user-av";
    avatarEl.textContent = userInitial;
  }

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  let _chartData = null;
  if (isBot) {
    const { cleanText, chartData } = extractChartData(text);
    bubble.innerHTML = simpleMarkdown(cleanText);
    _chartData = chartData;
  } else {
    bubble.textContent = text;
  }

  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.maxWidth = "80%";

  wrapper.appendChild(bubble);

  const timeEl = document.createElement("span");
  timeEl.className = "msg-time";
  timeEl.textContent = formatTime();
  wrapper.appendChild(timeEl);

  if (isBot) {
    row.appendChild(avatarEl);
    row.appendChild(wrapper);
  } else {
    row.appendChild(wrapper);
    row.appendChild(avatarEl);
  }

  container.appendChild(row);
  scrollToBottom();
  if (_chartData) renderChartInBubble(bubble, _chartData);
  return bubble;
}

function scrollToBottom() {
  const el = document.getElementById("messages");
  el.scrollTop = el.scrollHeight;
}

function showWelcomeCard(name) {
  const container = document.getElementById("messages");
  container.innerHTML = `
    <div class="welcome-card">
      <img src="chatbot_image/chatbot.png" alt="CareBridge" />
      <h3>Hey ${name}, how can I assist you today?</h3>
      <p>Search patient records, retrieve lab results, conditions, medications, encounters, and procedures.</p>
      
    </div>
  `;
  // Chip click handlers
  container.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const q = chip.getAttribute("data-q");
      document.getElementById("user-input").value = q;
      handleSend();
    });
  });
}

// ── Display Name Formatter ───────────────────────────
function formatDisplayName(raw) {
  // Strip email domain if full email (e.g. abc.pqr@gmail.com → abc.pqr)
  let name = raw.includes("@") ? raw.split("@")[0] : raw;
  // Take only the first part before a dot (e.g. rishabh.raj → rishabh)
  name = name.split(".")[0];
  // Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// ── Screen Transitions ───────────────────────────────
function showChatScreen(name) {
  const displayName = formatDisplayName(name);
  userName    = displayName;
  userInitial = displayName.charAt(0).toUpperCase();

  // Hide login, show home page and chat widget
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("home-screen").classList.remove("hidden");
  document.getElementById("chat-widget").classList.remove("hidden");

  showWelcomeCard(displayName);
}

function handleLogout() {
  localStorage.removeItem("cb_token");
  localStorage.removeItem("cb_user");
  // Note: we intentionally keep cb_oai_key so user doesn't have to re-enter it
  conversationHistory = [];

  // Close chat panel if open
  document.getElementById("chat-panel").classList.add("hidden");
  document.getElementById("chat-toggle-btn").querySelector(".toggle-icon-open").classList.remove("hidden");
  document.getElementById("chat-toggle-btn").querySelector(".toggle-icon-close").classList.add("hidden");

  // Hide home + widget, show login
  document.getElementById("home-screen").classList.add("hidden");
  document.getElementById("chat-widget").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("login-form").reset();
  document.getElementById("login-error").classList.add("hidden");
}

// ── Send Message ─────────────────────────────────────
async function handleSend() {
  const input   = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const text    = input.value.trim();
  if (!text) return;

  input.value = "";
  input.style.height = "auto";
  isBotResponding = true;
  sendBtn.disabled = true;
  input.placeholder = "CareBridge is responding...";

  appendMessage("user", text);

  // Build internal query if a chip action is pending
  let internalQuery = text;
  if (pendingChipAction) {
    const action = pendingChipAction;
    pendingChipAction = null;

    // Determine patient reference: use ID if known, else use typed name
    let patientRef = text;
    if (currentPatient) {
      const typedLower = text.toLowerCase();
      const nameLower  = currentPatient.name.toLowerCase();
      const firstName  = nameLower.split(" ")[0];
      // If user confirmed same patient (typed their name or short confirm)
      if (typedLower.includes(firstName) || typedLower === "yes" || typedLower === "yeah" || typedLower === "same") {
        patientRef = currentPatient.id || currentPatient.name;
      }
    }

    const queries = {
      "conditions":  `Show active conditions for patient ${patientRef}`,
      "lab":         `Latest observations for the patient ${patientRef}`,
      "medications": `List medications for patient ${patientRef}`,
      "encounters":  `Show encounters for patient ${patientRef}`,
      "caregaps":    `Show care gaps for patient ${patientRef}`
    };
    internalQuery = queries[action] || text;
  }

  await agentLoop(internalQuery);

  isBotResponding = false;
  sendBtn.disabled = false;
  input.placeholder = "Ask about patient records, labs...";
  input.focus();
}

// ── API Key Modal ─────────────────────────────────────
// ── Event Listeners ──────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  // Auto-login check
  const savedToken = localStorage.getItem("cb_token");
  const savedUser  = localStorage.getItem("cb_user");
  if (savedToken && savedUser) {
    showChatScreen(savedUser);
  }

  // Login form
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const btn      = document.getElementById("login-btn");
    const btnText  = document.getElementById("btn-text");
    const spinner  = document.getElementById("btn-spinner");
    const errBanner= document.getElementById("login-error");
    const errText  = document.getElementById("login-error-text");
    const overlay  = document.getElementById("signin-overlay");

    errBanner.classList.add("hidden");
    btn.disabled = true;
    btnText.textContent = "Signing in...";
    spinner.classList.remove("hidden");
    overlay.classList.remove("hidden");

    try {
      const name = await doLogin(email, password);
      overlay.classList.add("hidden");
      showChatScreen(name);
    } catch (err) {
      overlay.classList.add("hidden");
      errText.textContent = err.message;
      errBanner.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btnText.textContent = "Launch Provider Assistant";
      spinner.classList.add("hidden");
    }
  });

  // Toggle password visibility
  document.getElementById("toggle-password").addEventListener("click", () => {
    const pwInput = document.getElementById("password");
    pwInput.type  = pwInput.type === "password" ? "text" : "password";
  });

  // Logout button (navbar)
  document.getElementById("logout-btn").addEventListener("click", handleLogout);

  // Chat widget toggle
  document.getElementById("chat-toggle-btn").addEventListener("click", () => {
    const panel     = document.getElementById("chat-panel");
    const iconOpen  = document.querySelector(".toggle-icon-open");
    const iconClose = document.querySelector(".toggle-icon-close");
    const isOpen    = !panel.classList.contains("hidden");

    if (isOpen) {
      panel.classList.add("hidden");
      iconOpen.classList.remove("hidden");
      iconClose.classList.add("hidden");
    } else {
      panel.classList.remove("hidden");
      iconOpen.classList.add("hidden");
      iconClose.classList.remove("hidden");
      scrollToBottom();
    }
  });

  // Close chat panel button
  document.getElementById("close-chat-btn").addEventListener("click", () => {
    document.getElementById("chat-panel").classList.add("hidden");
    document.querySelector(".toggle-icon-open").classList.remove("hidden");
    document.querySelector(".toggle-icon-close").classList.add("hidden");
  });

  // Send button
  document.getElementById("send-btn").addEventListener("click", handleSend);

  // Enter key to send (Shift+Enter = newline)
  const userInput = document.getElementById("user-input");
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const sendBtn = document.getElementById("send-btn");
      if (!sendBtn.disabled) handleSend();
    }
  });

  // Auto-resize textarea
  userInput.addEventListener("input", () => {
    const sendBtn = document.getElementById("send-btn");
    sendBtn.disabled = isBotResponding || userInput.value.trim() === "";
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 100) + "px";
  });

  // Clear chat
  document.getElementById("clear-chat-btn").addEventListener("click", () => {
    conversationHistory = [];
    showWelcomeCard(userName);
  });

});

// ── Action Elements: append link/button after bot response ──
function appendActionElements(bubble, userMessage) {
  const msg = userMessage.toLowerCase();

  if (msg.includes("care gap")) {
    const btn = document.createElement("button");
    btn.textContent = "Launch CareCord AI";
    btn.style.cssText = "display:inline-block;margin-top:10px;padding:6px 14px;background:transparent;color:#0d9488;border:1px solid #0d9488;border-radius:4px;font-size:0.85rem;cursor:pointer;";
    btn.onmouseenter = () => { btn.style.background = "#0d9488"; btn.style.color = "#fff"; };
    btn.onmouseleave = () => { btn.style.background = "transparent"; btn.style.color = "#0d9488"; };
    btn.onclick = () => window.open("https://hull-act-74080093.figma.site/care-manager/P-001", "_blank");
    bubble.appendChild(document.createElement("br"));
    bubble.appendChild(btn);
  }
}

// ── Chart utilities ──────────────────────────────────────────
function extractChartData(text) {
  const match = text.match(/\[CHART:(\{[\s\S]*?\})\]/);
  if (!match) return { cleanText: text, chartData: null };
  try {
    return { cleanText: text.replace(match[0], "").trim(), chartData: JSON.parse(match[1]) };
  } catch(e) {
    return { cleanText: text.replace(match[0], "").trim(), chartData: null };
  }
}

function renderChartInBubble(bubble, chartData) {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "margin-top:14px;max-width:440px;background:#f8fafc;border-radius:10px;padding:12px;";
  const canvas = document.createElement("canvas");
  wrapper.appendChild(canvas);
  bubble.appendChild(wrapper);
  new Chart(canvas, {
    type: "line",
    data: {
      labels: chartData.labels,
      datasets: [{
        label: chartData.title || "Data",
        data: chartData.values,
        backgroundColor: "rgba(13,148,136,0.1)",
        borderColor: "#0d9488",
        borderWidth: 2,
        pointBackgroundColor: "#0f766e",
        pointRadius: 4,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: !!chartData.title, text: chartData.title || "", font: { size: 13 } }
      },
      scales: {
        y: { beginAtZero: false, grid: { color: "#f0f0f0" } },
        x: { grid: { display: false } }
      }
    }
  });
}


// ── Predefined Questions Bulb ────────────────────────────
(function() {
  const bulbBtn  = document.getElementById("bulb-btn");
  const dropdown = document.getElementById("predefined-dropdown");
  const input    = document.getElementById("user-input");
  const sendBtn  = document.getElementById("send-btn");

  if (!bulbBtn || !dropdown) return;

  bulbBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = dropdown.classList.contains("hidden");
    dropdown.classList.toggle("hidden", !isHidden);
    bulbBtn.classList.toggle("active", isHidden);
  });

  dropdown.addEventListener("click", async (e) => {
    const item = e.target.closest(".predefined-dropdown-item");
    if (!item) return;
    if (isBotResponding) return; // ignore clicks while bot is responding
    const label = item.dataset.label;
    dropdown.classList.add("hidden");
    bulbBtn.classList.remove("active");
    appendMessage("user", label);
    const welcomeCard = document.querySelector(".welcome-card");
    if (welcomeCard) welcomeCard.remove();
    // Store pending action so the next user reply gets the internal query
    const actionMap = {
      "View Active Conditions":          "conditions",
      "View Latest Observations":        "lab",
      "View Active Medications":         "medications",
      "View Last 12 months encounters":  "encounters",
      "View Care Gaps":                  "caregaps"
    };
    if (actionMap[label]) pendingChipAction = actionMap[label];
    // Send the chip label directly to the agent — no hardcoded reply
    const input   = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    isBotResponding = true;
    sendBtn.disabled = true;
    input.placeholder = "CareBridge is responding...";
    await agentLoop(label);
    isBotResponding = false;
    sendBtn.disabled = false;
    input.placeholder = "Ask about patient records, labs...";
    input.focus();
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== bulbBtn) {
      dropdown.classList.add("hidden");
      bulbBtn.classList.remove("active");
    }
  });
})();
