// Client-side API interfaces and functions
export interface GeminiResponse {
  content: string;
  error?: string;
}

export interface ATSAnalysisResponse {
  ats_analysis: {
    total_score: number;
    section_scores: {
      format: number;
      content: number;
      language: number;
      competencies: number;
      keywords: number;
    };
    detailed_breakdown: {
      format_analysis: {
        length_depth_score: number;
        bullet_usage_score: number;
        bullet_length_score: number;
        page_density_score: number;
        formatting_score: number;
      };
      content_analysis: {
        impact_score: number;
        achievements_score: number;
        relevance_score: number;
        technical_depth_score: number;
      };
      language_analysis: {
        verb_strength: number;
        tense_consistency: number;
        clarity: number;
        spelling_grammar: number;
        professional_tone: number;
      };
      competencies_analysis: {
        leadership_initiative: number;
        problem_solving: number;
        collaboration: number;
        results_orientation: number;
      };
    };
    keyword_match_rate: string;
    missing_keywords: string[];
  };
  improvement_suggestions: {
    high_priority: string[];
    content: string[];
    language: string[];
    format: string[];
    keywords: string[];
  };
  improvement_details: {
    bullet_points: Array<{
      original: string;
      improved: string;
      reason: string;
    }>;
    achievements: Array<{
      section: string;
      current: string;
      suggested: string;
      impact: string;
    }>;
    skills: Array<{
      skill_area: string;
      current: string;
      improved: string;
      explanation: string;
    }>;
  };
}

export const generateResumeContent = async (
  section: string,
  context: Record<string, any>
): Promise<GeminiResponse> => {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, context })
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    return { content: data.content };
  } catch (error) {
    console.error('Error generating resume content:', error);
    return {
      content: '',
      error: 'Failed to generate content. Please try again.'
    };
  }
};

export const analyzeResume = async (resumeData: string): Promise<ATSAnalysisResponse> => {
  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze resume');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume');
  }
};

const getPromptForSection = (section: string, context: Record<string, any>): string => {
  const prompts: Record<string, string> = {
    name: `Generate a professional full name that would be suitable for a ${context.jobTitle} position.`,
    
    jobTitle: `Based on the skills "${context.skills}" and ${context.experience} years of experience, 
    suggest a professional job title that best represents this profile.`,
    
    skills: `Based on the job title "${context.jobTitle}" and experience level of ${context.experience} years, 
    suggest 5-7 relevant technical and soft skills that should be included in the resume. Format them as a comma-separated list.`,
    
    summary: `Create a compelling professional summary for a ${context.jobTitle} with ${context.experience} years of experience. 
    Focus on their expertise in ${context.skills.join(', ')}.`,
    
    experience: `Create a detailed bullet point description for a ${context.jobTitle} role at ${context.company}, 
    focusing on achievements and impact. Include metrics where possible.`,
    
    education: `Create a professional description for education at ${context.school} studying ${context.degree} 
    in ${context.fieldOfStudy}.`,
    
    projects: `Create a compelling description for a project titled "${context.title}" 
    that uses technologies: ${context.technologies.join(', ')}.`,
    
    certifications: `Create a professional description highlighting the value and relevance of ${context.name} 
    certification from ${context.issuingOrg}.`,
    
    achievements: `Create an impactful description for a professional achievement titled "${context.title}" 
    that demonstrates leadership and impact.`,
    
    references: `Create a professional reference description for ${context.name} who is a ${context.position} 
    at ${context.company}.`
  };

  return prompts[section] || 'Please provide content for this section.';
};

export const generateBulletPoints = async (
  text: string,
  context: Record<string, any>
): Promise<GeminiResponse> => {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: 'bullet_points',
        context: { ...context, text }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate bullet points');
    }

    const data = await response.json();
    return { content: data.content };
  } catch (error) {
    console.error('Error generating bullet points:', error);
    return {
      content: '',
      error: 'Failed to generate bullet points. Please try again.'
    };
  }
}; 