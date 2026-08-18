import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini AI
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada.');
  }
  return new GoogleGenAI({ apiKey });
}

// Healthcheck API
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Report Generator Endpoint
app.post('/api/generate-report', async (req, res) => {
  try {
    const { records, promptType } = req.body;
    const ai = getAI();

    const systemPrompt = `Eres un Analista Técnico Profesional de Arbitraje Baloncesto / Deportes. 
Tu tarea es examinar los siguientes datos de "Solicitudes de Revisiones de Coaches y Árbitros (IRS)" y emitir un informe analítico estructurado en español con formato Markdown.

Análisis a incluir:
1. Resumen Ejecutivo de Tendencias de Decisión (Porcentaje global de Revocaciones vs Decisiones Mantenidas).
2. Rendimiento y Firmeza de Árbitros (Quiénes acuden más al IRS y su tasa de confirmación/revocación).
3. Efectividad de Desafíos de Coaches (Quiénes desafían mejor y en qué tipo de jugadas).
4. Faltas Técnicas (F.Técnicas sancionadas o asociadas a los desafíos).
5. Tipos de Jugadas más Conflictivas (Faltas personales, fueras de banda, 24s, etc.).
6. Recomendaciones Técnicas para el Comité de Árbitros o Entrenadores.

Usa un tono técnico, claro, neutral y fundamentado en los datos.`;

    const userMessage = `Aquí están los registros actuales de partidos y revisiones en formato JSON:
${JSON.stringify(records, null, 2)}

Genera un informe analítico detallado de este conjunto de partidos.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }, { text: userMessage }] }
      ]
    });

    res.json({ success: true, report: response.text });
  } catch (error: any) {
    console.error('Error generating AI report:', error);
    res.status(500).json({ success: false, error: error?.message || 'Error al generar el informe con Gemini' });
  }
});

// AI OCR / Sheet Extractor Endpoint
app.post('/api/parse-sheet-image', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Se requiere la imagen en base64' });
    }

    const ai = getAI();

    const prompt = `Analiza esta imagen de una planilla o hoja de cálculo de "SOLICITUDES DE REVISIONES DE COACHES Y ARBITROS".
Extrae los datos visibles en una lista de objetos JSON estructurada con la siguiente interfaz:
[
  {
    "gameNumber": "string (ej: JUEGO N° 01)",
    "date": "string (YYYY-MM-DD o vacia si no es visible)",
    "teams": "string (opcional)",
    "coachName": "string (Nombre del Entrenador)",
    "coachTeam": "string (Equipo si se conoce)",
    "challengedPlay": "string (Jugada que desafía)",
    "coachResult": "GANA | PIERDE | N/A",
    "technicalFouls": 0,
    "referees": "string (Nombres de árbitros involucrados)",
    "assistedIRS": true,
    "refereeDecision": "MANTIENE | REVOCA | N/A",
    "notes": "string (Detalles o notas adicionales)"
  }
]

Devuelve ÚNICAMENTE el código JSON limpio dentro de una etiqueta json (\`\`\`json ... \`\`\`), sin texto adicional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: mimeType || 'image/jpeg'
              }
            }
          ]
        }
      ]
    });

    const text = response.text || '';
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    const parsedRecords = JSON.parse(jsonStr);

    res.json({ success: true, records: parsedRecords });
  } catch (error: any) {
    console.error('Error parsing sheet image:', error);
    res.status(500).json({ success: false, error: error?.message || 'Error al procesar la imagen con IA' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
