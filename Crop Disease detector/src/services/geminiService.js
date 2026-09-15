import { SAMPLE_DISEASES } from '../data/mockDiseases';

const SETTINGS_KEY = 'agrivision_gemini_settings';

export const getStoredSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse Gemini settings', e);
  }
  return {
    apiKey: '',
    model: 'gemini-2.5-flash', // Default Gemini model
    customPrompt: ''
  };
};

export const saveStoredSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

/**
 * Analyzes crop leaf image using Gemini Vision API or smart mock fallback.
 */
export async function analyzeCropDisease({ base64Image, cropType = 'all', plantPart = 'leaf', sampleId = null }) {
  const settings = getStoredSettings();

  // If sample ID is provided, simulate high-accuracy lookup directly from empirical dataset
  if (sampleId) {
    const match = SAMPLE_DISEASES.find(d => d.id === sampleId);
    if (match) {
      await new Promise(r => setTimeout(r, 1800)); // realistic scanner delay
      return { ...match, source: 'sample_database' };
    }
  }

  // If Gemini API Key is present, call Google Gemini Vision REST API directly
  if (settings.apiKey && settings.apiKey.trim() !== '') {
    try {
      const result = await callGeminiVisionApi(base64Image, cropType, plantPart, settings);
      return { ...result, source: 'gemini_api' };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to intelligent Agronomist engine:', err);
      // Fallback gracefully on API error
    }
  }

  // Mock Agronomist Engine Fallback
  await new Promise(r => setTimeout(r, 2200)); // Simulate AI processing time

  // Match crop type or default to Late Blight / Healthy
  let match = SAMPLE_DISEASES.find(d => d.cropType === cropType);
  if (!match) {
    match = SAMPLE_DISEASES[0]; // Late Blight default
  }

  // Add slight random variance to confidence & severity for realistic UX
  const variation = (Math.random() * 4 - 2).toFixed(1);
  const confidence = Math.min(99.4, Math.max(85.0, (parseFloat(match.confidence) + parseFloat(variation)))).toFixed(1);

  return {
    ...match,
    confidence: parseFloat(confidence),
    source: 'agronomist_offline_engine'
  };
}

/**
 * Calls Gemini 2.5 Flash / 1.5 Flash Vision Endpoint with JSON Structured Prompt
 */
async function callGeminiVisionApi(base64Image, cropType, plantPart, settings) {
  const apiKey = settings.apiKey.trim();
  const model = settings.model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Clean base64 string
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  const promptText = `
You are an expert agricultural phytopathologist and crop disease scientist. 
Analyze the provided crop image (Context Crop: ${cropType}, Plant Part: ${plantPart}).

Return your analysis EXACTLY as valid JSON matching this schema (do not wrap in markdown quotes if possible, or return raw JSON object):
{
  "cropName": "Crop Name e.g. Tomato",
  "diseaseName": "Common Disease Name e.g. Late Blight",
  "scientificName": "Scientific Pathogen Name e.g. Phytophthora infestans",
  "severity": "Critical" | "Severe" | "Moderate" | "Low" | "Healthy",
  "severityPercent": 75,
  "confidence": 96.5,
  "affectedArea": "Estimated percentage e.g. ~40% of leaf tissue",
  "symptoms": ["Symptom 1", "Symptom 2", "Symptom 3"],
  "emergencyAction": ["Emergency step 1", "Emergency step 2"],
  "organicRemedies": [
    {
      "name": "Remedy Name",
      "formula": "Dosage formula e.g. 5ml neem oil + 1L water",
      "instructions": "How to spray",
      "frequency": "Spray frequency"
    }
  ],
  "chemicalRemedies": [
    {
      "name": "Fungicide Name",
      "activeIngredient": "Chemical compound",
      "dosagePerLiter": "Exact dosage e.g. 2.5g per 1L water",
      "applicationMethod": "Spray method",
      "safetyWaitDays": "Days before harvest"
    }
  ],
  "prevention": ["Prevention tip 1", "Prevention tip 2"],
  "recoverySchedule7Days": [
    {"day": 1, "task": "Day 1 Action Title", "detail": "Detailed instruction"},
    {"day": 2, "task": "Day 2 Action Title", "detail": "Detailed instruction"},
    {"day": 3, "task": "Day 3 Action Title", "detail": "Detailed instruction"},
    {"day": 4, "task": "Day 4 Action Title", "detail": "Detailed instruction"},
    {"day": 5, "task": "Day 5 Action Title", "detail": "Detailed instruction"},
    {"day": 6, "task": "Day 6 Action Title", "detail": "Detailed instruction"},
    {"day": 7, "task": "Day 7 Action Title", "detail": "Detailed instruction"}
  ],
  "audioSummaryText": "Short 2-sentence summary suitable for reading aloud to a farmer."
}
  `;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: cleanBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API HTTP Error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error('Empty response from Gemini API');
  }

  // Parse JSON response safely
  try {
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        id: 'gemini-scan-' + Date.now(),
        ...parsed
      };
    }
  } catch (e) {
    console.error('Failed to parse Gemini JSON output', e, textResponse);
  }

  throw new Error('Could not parse structured diagnosis JSON from Gemini');
}
