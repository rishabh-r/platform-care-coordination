export const CONDITION_CODES = `
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

export const DRUG_CODES = `
DRUG CODES (pass as DRUG_CODE param to search_patient_medications):
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

export const PROCEDURE_CODES = `
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

export const OBSERVATION_RANGES = `
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

export const LOINC_CODES = `
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
