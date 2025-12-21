import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIExplanationRequest {
  findingType: string;
  severity: string;
  technicalDetails: any;
  context?: string;
}

export async function generatePlainEnglishExplanation(
  request: AIExplanationRequest
): Promise<string> {
  const prompt = `You are a security expert explaining a security finding to a non-technical business owner.

Finding Type: ${request.findingType}
Severity: ${request.severity}
Technical Details: ${JSON.stringify(request.technicalDetails, null, 2)}
${request.context ? `Context: ${request.context}` : ''}

Provide a clear, plain-English explanation (2-3 sentences) that:
1. Explains what the issue is in simple terms
2. Explains why it's a security risk
3. Suggests what should be done about it

Avoid technical jargon. Write as if explaining to a CEO or business owner.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a security expert who explains complex security issues in simple, business-friendly language.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  return response.choices[0].message.content || 'Unable to generate explanation.';
}

export async function generateRemediationSteps(
  findingType: string,
  technicalDetails: any
): Promise<string[]> {
  const prompt = `Generate step-by-step remediation instructions for this security finding:

Finding Type: ${findingType}
Technical Details: ${JSON.stringify(technicalDetails, null, 2)}

Provide 3-5 clear, actionable steps to fix this issue. Format as a numbered list.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a security expert providing remediation guidance.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 500,
  });

  const content = response.choices[0].message.content || '';
  // Parse numbered list into array
  return content
    .split('\n')
    .filter(line => /^\d+\./.test(line.trim()))
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
}

export async function analyzeLogAnomaly(
  logData: any[],
  baseline: any
): Promise<{
  anomalyType: string;
  severity: string;
  explanation: string;
  playbookSuggestions: string[];
}> {
  const prompt = `Analyze these log entries for security anomalies:

Recent Logs:
${JSON.stringify(logData.slice(-10), null, 2)}

Baseline Behavior:
${JSON.stringify(baseline, null, 2)}

Identify:
1. What type of anomaly this is
2. Severity (critical, high, medium, low)
3. Plain-English explanation
4. Suggested playbook actions (3-5 steps)`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a security analyst expert at detecting anomalies in logs.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  const content = response.choices[0].message.content || '';
  
  // Parse response (simplified - in production, use structured output)
  return {
    anomalyType: extractField(content, 'Anomaly Type') || 'Unknown',
    severity: extractField(content, 'Severity') || 'medium',
    explanation: extractField(content, 'Explanation') || content,
    playbookSuggestions: extractList(content, 'Playbook'),
  };
}

function extractField(text: string, field: string): string | null {
  const regex = new RegExp(`${field}:\\s*(.+?)(?:\\n|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function extractList(text: string, field: string): string[] {
  const regex = new RegExp(`${field}:\\s*([\\s\\S]+?)(?:\\n\\n|$)`, 'i');
  const match = text.match(regex);
  if (!match) return [];
  
  return match[1]
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^[-*]\s*/, '').trim());
}

