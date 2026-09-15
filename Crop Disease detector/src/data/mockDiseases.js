// High quality crop disease sample data for fallback simulation & sample picker

export const SAMPLE_DISEASES = [
  {
    id: 'rice-brown-spot',
    cropName: 'Rice',
    cropType: 'rice',
    diseaseName: 'Brown Spot',
    scientificName: 'Cochliobolus miyabeanus',
    severity: 'Moderate',
    severityPercent: 52,
    confidence: 94.1,
    affectedArea: '~28% of tiller leaf area',
    symptoms: [
      'Oval or circular reddish-brown spots with yellow halo surrounding the center',
      'Lesions coalescence causing leaf tips to dry and turn straw-colored',
      'Dark brown spots on paddy grains causing seed discoloration and poor yield'
    ],
    emergencyAction: [
      'Apply balanced potassium fertilizer (MOP) immediately to boost crop immunity.',
      'Drain excess standing water for 24 hours to aerate root zone if soil is waterlogged.'
    ],
    organicRemedies: [
      {
        name: 'Trichoderma harzianum Bio-Control',
        formula: '10g bio-powder per 1L water',
        instructions: 'Spray leaf canopy and apply soil drench near plant base.',
        frequency: 'Apply once every 10 days.'
      },
      {
        name: 'Garlic & Chili Fermented Leaf Extract',
        formula: '20ml extract diluted in 1L water',
        instructions: 'Strain thoroughly through cloth and spray as natural antifungal.',
        frequency: 'Every 7 days.'
      }
    ],
    chemicalRemedies: [
      {
        name: 'Tebuconazole 50% + Trifloxystrobin 25% WG',
        activeIngredient: 'Triazole + Strobilurin',
        dosagePerLiter: '0.4 grams per Liter of water',
        applicationMethod: 'Foliar spray at tillering and boot leaf stage.',
        safetyWaitDays: '21 days before harvest'
      },
      {
        name: 'Carbendazim 50% WP',
        activeIngredient: 'Benzimidazole',
        dosagePerLiter: '1.0 gram per Liter of water',
        applicationMethod: 'Targeted spray on infected patches in paddy field.',
        safetyWaitDays: '14 days'
      }
    ],
    prevention: [
      'Treat paddy seeds with Carbendazim (2g/kg seed) before sowing.',
      'Ensure balanced Soil N-P-K nutrient management (avoid excess Nitrogen).',
      'Keep field borders free of wild grassy weeds.'
    ],
    recoverySchedule7Days: [
      { day: 1, task: 'Nutrient Deficiency Check', detail: 'Test field soil pH and apply MOP (Potash) fertilizer boost.' },
      { day: 2, task: 'Targeted Fungicide Foliar Spray', detail: 'Spray Tebuconazole formula during quiet wind early morning.' },
      { day: 3, task: 'Water Aeration Cycle', detail: 'Drain standing water to allow soil surface to crack slightly.' },
      { day: 4, task: 'Field Spot Inspection', detail: 'Map affected paddy patches to check if lesion spreading has halted.' },
      { day: 5, task: 'Bio-Organic Canopy Spray', detail: 'Apply Trichoderma bio-agent to strengthen new tiller leaves.' },
      { day: 6, task: 'Grain Head Inspection', detail: 'Check panicle emergence for discoloration symptoms.' },
      { day: 7, task: 'Yield Safeguard Review', detail: 'Confirm leaf greenness index on secondary tillers.' }
    ],
    sampleImageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
    audioSummaryText: 'Rice Brown Spot identified at moderate level. Apply Potassium fertilizer and spray 0.4g Tebuconazole per liter. Avoid excessive nitrogen.'
  },
  {
    id: 'wheat-leaf-rust',
    cropName: 'Wheat',
    cropType: 'wheat',
    diseaseName: 'Leaf Rust (Brown Rust)',
    scientificName: 'Puccinia triticina',
    severity: 'Severe',
    severityPercent: 76,
    confidence: 96.2,
    affectedArea: '~40% of flag leaf area',
    symptoms: [
      'Small, round orange-brown pustules scattered randomly on upper leaf surfaces',
      'Powdery rust spores rubbing off on fingers when touched',
      'Rapid leaf desiccation and yellowing causing grain shriveling'
    ],
    emergencyAction: [
      'Apply systemic triazole fungicide immediately to protect flag leaves.',
      'Avoid high nitrogen top-dressing during rust outbreaks.'
    ],
    organicRemedies: [
      {
        name: 'Wettable Sulfur Bio-Fungicide',
        formula: '3g sulfur powder per 1L water',
        instructions: 'Coat foliage thoroughly early morning.',
        frequency: 'Every 7 days.'
      }
    ],
    chemicalRemedies: [
      {
        name: 'Propiconazole 25% EC',
        activeIngredient: 'Propiconazole (Triazole)',
        dosagePerLiter: '1.0 ml per Liter of water',
        applicationMethod: 'Foliar spray at flag leaf emergence stage.',
        safetyWaitDays: '30 days before harvest'
      }
    ],
    prevention: [
      'Sow rust-resistant wheat cultivars.',
      'Eradicate wild barberry hosts near field borders.'
    ],
    recoverySchedule7Days: [
      { day: 1, task: 'Flag Leaf Assessment', detail: 'Inspect top flag leaves for rust pustules.' },
      { day: 2, task: 'Propiconazole Foliar Application', detail: 'Spray systemic fungicide early morning.' },
      { day: 3, task: 'Field Humidity Control', detail: 'Adjust irrigation frequency.' },
      { day: 4, task: 'Pustule Drying Inspection', detail: 'Verify pustules turn dark black (spore death).' },
      { day: 5, task: 'Organic Protective Spray', detail: 'Dust wettable sulfur on adjacent healthy rows.' },
      { day: 6, task: 'Nutrient Balance Audit', detail: 'Apply potassium sulfate soil boost.' },
      { day: 7, task: 'Grain Spike Inspection', detail: 'Confirm wheat head filling is unaffected.' }
    ],
    sampleImageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    audioSummaryText: 'Wheat Leaf Rust detected at 76% severity. Spray 1.0 ml Propiconazole per liter of water immediately to protect flag leaves.'
  },
  {
    id: 'maize-common-rust',
    cropName: 'Maize',
    cropType: 'maize',
    diseaseName: 'Common Rust',
    scientificName: 'Puccinia sorghi',
    severity: 'Severe',
    severityPercent: 71,
    confidence: 95.8,
    affectedArea: '~38% of mature leaf surface',
    symptoms: [
      'Golden-brown to cinnamon-red powdery pustules (pustulae) on upper and lower leaf surfaces',
      'Pustules rupture early releasing powdery rust-colored fungal spores',
      'Premature leaf yellowing and necrosis leading to reduced ear grain fill'
    ],
    emergencyAction: [
      'Spray fungicide immediately if crop is before flowering (tasseling) stage.',
      'Avoid high density crowding; prune non-essential basal leaves if feasible.'
    ],
    organicRemedies: [
      {
        name: 'Sulfur Dusting / Wettable Sulfur',
        formula: '3g wettable sulfur per 1L water',
        instructions: 'Apply thoroughly to coat powdery pustules. Do not apply in temperatures above 32°C.',
        frequency: 'Every 7 to 10 days.'
      }
    ],
    chemicalRemedies: [
      {
        name: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
        activeIngredient: 'Strobilurin + Triazole compound',
        dosagePerLiter: '1.0 ml per Liter of water',
        applicationMethod: 'High-pressure mist spray covering middle canopy leaves.',
        safetyWaitDays: '14 days'
      }
    ],
    prevention: [
      'Plant rust-resistant hybrid maize varieties.',
      'Rotate maize crops with leguminous nitrogen fixers like beans or groundnuts.'
    ],
    recoverySchedule7Days: [
      { day: 1, task: 'Pustule Density Audit', detail: 'Assess if rust spores are expanding toward top cob leaves.' },
      { day: 2, task: 'Systemic Fungicide Spray', detail: 'Spray Azoxystrobin mixture before midday sun heat.' },
      { day: 3, task: 'Crop Weed Clear', detail: 'Remove Oxalis weed species nearby which serve as alternate rust hosts.' },
      { day: 4, task: 'Foliar Health Check', detail: 'Inspect if rust pustules are turning dark black (spore desiccation).' },
      { day: 5, task: 'Potash Soil Drench', detail: 'Apply potassium sulfate to improve leaf tissue stiffness.' },
      { day: 6, task: 'Organic Protective Coat', detail: 'Dust wettable sulfur on surrounding healthy maize stalks.' },
      { day: 7, task: 'Cob Filling Status', detail: 'Verify maize ear development is progressing normally.' }
    ],
    sampleImageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
    audioSummaryText: 'Maize Common Rust detected. Spray 1 ml Azoxystrobin per liter of water. Remove surrounding weed hosts.'
  },
  {
    id: 'onion-purple-blotch',
    cropName: 'Onion',
    cropType: 'onion',
    diseaseName: 'Purple Blotch',
    scientificName: 'Alternaria porri',
    severity: 'Critical',
    severityPercent: 82,
    confidence: 96.7,
    affectedArea: '~42% tubular leaf area',
    symptoms: [
      'Small water-soaked lesions on tubular leaves turning purplish-brown with yellow margins',
      'Concentric dark rings forming on purple lesions',
      'Leaves girdled and falling over prematurely, reducing onion bulb development'
    ],
    emergencyAction: [
      'Cut off severely blighted tubular leaf tips showing purple lesions.',
      'Stop sprinkler watering; shift to drip lines to reduce leaf surface wetness.'
    ],
    organicRemedies: [
      {
        name: 'Neem Oil + Bio-Soap Emulsion',
        formula: '5ml neem oil + 2ml liquid soap per 1L water',
        instructions: 'Spray thoroughly on onion tubular foliage early morning.',
        frequency: 'Every 5 days.'
      }
    ],
    chemicalRemedies: [
      {
        name: 'Mancozeb 75% WP + Copper Oxychloride 50% WP',
        activeIngredient: 'Mancozeb + Copper Oxychloride',
        dosagePerLiter: '2.5 grams per Liter of water',
        applicationMethod: 'Uniform foliar spray covering tubular leaves.',
        safetyWaitDays: '7 days before harvest'
      }
    ],
    prevention: [
      'Ensure 15cm plant spacing for maximum sunlight and air drying.',
      'Follow 2-year crop rotation with non-allium crops.'
    ],
    recoverySchedule7Days: [
      { day: 1, task: 'Infected Foliage Pruning', detail: 'Remove dry purple-blotched leaf tips.' },
      { day: 2, task: 'Fungicide Spraying', detail: 'Apply Mancozeb + Copper mixture to foliage.' },
      { day: 3, task: 'Irrigation Shift', detail: 'Ensure zero overhead water splashing.' },
      { day: 4, task: 'Lesion Expansion Check', detail: 'Verify purple rings are drying up.' },
      { day: 5, task: 'Neem Bio-Protectant', detail: 'Spray neem oil barrier spray.' },
      { day: 6, task: 'Soil Drainage Audit', detail: 'Ensure ridge beds are free of standing water.' },
      { day: 7, task: 'Bulb Sizing Inspection', detail: 'Check onion bulb neck stiffness.' }
    ],
    sampleImageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
    audioSummaryText: 'Onion Purple Blotch identified. Prune blighted tips and apply 2.5g Mancozeb plus Copper Oxychloride per liter of water.'
  },
  {
    id: 'healthy-crop',
    cropName: 'Healthy Crop Foliage',
    cropType: 'general',
    diseaseName: 'No Disease Detected (Healthy Leaf)',
    scientificName: 'Planctae Sanus',
    severity: 'Healthy',
    severityPercent: 0,
    confidence: 99.2,
    affectedArea: '0% (Foliage in prime vigor)',
    symptoms: [
      'Vibrant deep green leaf coloration without brown spots or yellowing halos',
      'Firm leaf cuticle texture and healthy vein structure',
      'No fungal spores, powdery residues, or pest feeding damage visible'
    ],
    emergencyAction: [
      'No remedial action required! Your crop tissue is healthy and thriving.'
    ],
    organicRemedies: [
      {
        name: 'Proactive Seaweed Kelp Extract (Growth Tonic)',
        formula: '2ml seaweed extract per 1L water',
        instructions: 'Foliar spray monthly to boost micronutrient absorption and heat resistance.',
        frequency: 'Every 20 to 30 days.'
      }
    ],
    chemicalRemedies: [],
    prevention: [
      'Continue current balanced irrigation and soil composting practices.',
      'Inspect crop underside leaves weekly for early insect vectors (aphids/thrips).'
    ],
    recoverySchedule7Days: [
      { day: 1, task: 'Routine Health Log', detail: 'Log current healthy status and take photo reference.' },
      { day: 4, task: 'Soil Moisture Check', detail: 'Inspect root zone soil moisture depth.' },
      { day: 7, task: 'Weekly Farm Walk', detail: 'Inspect field perimeters for wild weed growth.' }
    ],
    sampleImageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
    audioSummaryText: 'Good news! Your crop leaf appears completely healthy with 99 percent confidence. Keep up your current irrigation and care routine.'
  }
];

export const CROP_OPTIONS = [
  { id: 'all', name: 'Auto-detect / All Crops' },
  { id: 'rice', name: 'Rice' },
  { id: 'wheat', name: 'Wheat' },
  { id: 'maize', name: 'Maize' },
  { id: 'onion', name: 'Onion' }
];

export const PLANT_PARTS = [
  { id: 'leaf', name: 'Leaf / Foliage' },
  { id: 'stem', name: 'Stem / Stalk' },
  { id: 'fruit', name: 'Fruit / Pod / Bulb' },
  { id: 'root', name: 'Root / Crown' }
];
