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

export const ATS_ANALYSIS_PROMPT = `Analyze this resume with balanced but strict scoring criteria. Provide constructive feedback while acknowledging strengths.
A well-crafted resume should be able to achieve a score between 70-85%, with exceptional resumes potentially scoring higher.

Scoring Criteria (Balanced but Strict):

1. Format & Structure (20 points):
   - Length & depth (0-4): Standard 1-2 pages acceptable, -1 for excess
   - Use of bullets (0-4): Clear bullet points with action verbs
   - Bullet lengths (0-4): 1-2 lines optimal, clear and concise
   - Page density (0-4): Balanced white space and content
   - Overall formatting (0-4): Consistent fonts and spacing

2. Content Quality (20 points):
   - Quantified impact (0-5): Numbers and metrics where applicable
   - Specific achievements (0-5): Clear accomplishments over duties
   - Relevance to field (0-5): Industry-aligned experience
   - Technical depth (0-5): Appropriate technical detail

3. Language & Communication (20 points):
   - Verb strength (0-4): Strong action verbs
   - Verb tense consistency (0-4): Proper past/present usage
   - Clarity (0-4): Clear, professional language
   - Spelling & grammar (0-4): Minimal errors acceptable
   - Professional tone (0-4): Appropriate business language

4. Core Competencies (20 points):
   - Leadership/Initiative (0-5): Shows proactive approach
   - Problem-solving (0-5): Demonstrates analytical thinking
   - Collaboration (0-5): Shows team and communication skills
   - Results-orientation (0-5): Focus on outcomes

5. Keywords & Industry Alignment (20 points):
   - Industry-specific terms (0-7): Relevant current technologies
   - Role-specific keywords (0-7): Matching job requirements
   - Soft skills alignment (0-6): Balanced technical and soft skills`;

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

    const result = await response.json();
    return result;
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