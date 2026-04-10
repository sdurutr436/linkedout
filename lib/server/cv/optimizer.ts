import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface OptimizeParams {
  cvContent: string;
  titulaciones: string;
  experiencia: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
}

export async function optimizeCV(params: OptimizeParams): Promise<string> {
  const { cvContent, titulaciones, experiencia, jobTitle, company, jobDescription } = params;

  const systemPrompt = `Eres un experto en recursos humanos y redacción de CVs profesionales en español.
Tu tarea es crear un CV optimizado en formato Markdown para una oferta de trabajo específica.
El CV debe estar totalmente adaptado a la oferta, resaltando las habilidades y experiencias más relevantes.
Usa un tono profesional, conciso y directo. Evita relleno genérico.
El resultado debe ser SOLO el contenido Markdown del CV, sin texto adicional ni explicaciones.`;

  const userPrompt = `## Información del candidato

### CV actual:
${cvContent || "(No proporcionado)"}

### Titulaciones:
${titulaciones || "(No proporcionadas)"}

### Experiencia laboral:
${experiencia || "(No proporcionada)"}

---

## Oferta de trabajo

**Puesto:** ${jobTitle}
**Empresa:** ${company}
**Descripción:**
${jobDescription}

---

Genera un CV optimizado en Markdown para esta oferta. El CV debe:
1. Comenzar con el nombre y datos de contacto (puedes usar placeholders como [Tu Nombre], [email], [teléfono], [LinkedIn])
2. Incluir un resumen ejecutivo de 2-3 líneas adaptado específicamente a esta oferta
3. Ordenar la experiencia por relevancia para la oferta
4. Destacar las habilidades técnicas más relevantes para el puesto
5. Incluir titulaciones
6. Ser conciso (máximo 2 páginas equivalentes)
7. Usar formato Markdown limpio con secciones bien definidas`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Respuesta inesperada de Claude");

  return content.text;
}
