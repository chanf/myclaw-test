import { Request, Response } from 'express';
import { AIRequest, AIResponse } from '../types';

export const assist = async (req: Request, res: Response) => {
  try {
    const { action, content, language, tone }: AIRequest = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const response = await callAzureOpenAI(action, content, language, tone);
    res.json(response);
  } catch (error: any) {
    console.error('AI Assist Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const callAzureOpenAI = async (action: string, content: string, language?: string, tone?: string): Promise<AIResponse> => {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiVersion = process.env.AZURE_API_VERSION;
  const deploymentName = process.env.AZURE_DEPLOYMENT_NAME || 'Gpt-4o';

  if (!apiKey || !endpoint) {
    throw new Error('Azure OpenAI configuration is missing');
  }

  const prompts = {
    continue: `Continue writing the following content in a natural and coherent way:\n\n${content}\n\nContinue from here:`,
    improve: `Improve the following content to make it more clear, engaging, and well-structured:\n\n${content}\n\nImproved version:`,
    summarize: `Provide a concise summary of the following content:\n\n${content}\n\nSummary:`,
    translate: `Translate the following content to ${language || 'English'}:\n\n${content}\n\nTranslation:`,
    rewrite: `Rewrite the following content in a ${tone || 'professional'} tone:\n\n${content}\n\nRewritten version:`
  };

  const systemPrompt = `You are a helpful writing assistant. Provide clear, well-formatted responses. Use markdown for formatting when appropriate.`;
  const userPrompt = prompts[action as keyof typeof prompts] || prompts.continue;

  const response = await fetch(`${endpoint}openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const aiContent = data.choices[0]?.message?.content || 'No response from AI';

  return {
    success: true,
    content: aiContent
  };
};
