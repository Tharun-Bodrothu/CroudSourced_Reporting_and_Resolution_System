const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.analyzeIssue = async (description) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "Return ONLY valid JSON."
      },
      {
        role: "user",
        content: `
Return JSON in this format:

{
  "title": "",
  "issueCategory": "",
  "issueType": "",
  "department": "",
  "severity": "low | medium | high",
  "priorityScore": 1-10,
  "aiSummary": ""
}

Rules:
- priorityScore must be an integer between 1 and 10
- aiSummary must be 1–2 professional sentences summarizing the issue

Complaint:
${description}
        `
      }
    ],
    temperature: 0.3,
  });

  const text = response.choices[0].message.content;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI did not return valid JSON");
  }

  return JSON.parse(jsonMatch[0]);
};

