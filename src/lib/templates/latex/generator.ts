import fs from 'fs';
import path from 'path';
import { ResumeData, TemplateType } from './types';

export function generateLaTeX(data: ResumeData, template: TemplateType): string {
  // Read the template file
  const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', 'latex', `${template}.tex`);
  let content = fs.readFileSync(templatePath, 'utf-8');

  // Replace personal information
  const { personalInfo } = data;
  content = content.replace(/\$name\$/g, personalInfo.name);
  content = content.replace(/\$email\$/g, personalInfo.email);
  content = content.replace(/\$phone\$/g, personalInfo.phone);
  content = content.replace(/\$linkedin\$/g, personalInfo.linkedin);
  content = content.replace(/\$github\$/g, personalInfo.github);
  content = content.replace(/\$location\$/g, personalInfo.location);
  content = content.replace(/\$website\$/g, personalInfo.website);
  content = content.replace(/\$title\$/g, personalInfo.title || '');

  // Replace summary
  content = content.replace(/\$summary\$/g, data.summary);

  // Generate experience section
  const experienceContent = data.experience.map(exp => `
    \\resumeSubHeading
      {${exp.company}}{${exp.startDate} - ${exp.endDate}}
      {${exp.position}}{${exp.location}}
      \\resumeItemListStart
        ${exp.description.map(desc => `\\resumeItem{${escapeLatex(desc)}}`).join('\n')}
      \\resumeItemListEnd
  `).join('\n');
  content = content.replace(/\$experience\$/g, experienceContent);

  // Generate education section
  const educationContent = data.education.map(edu => `
    \\resumeSubHeading
      {${edu.school}}{${edu.startDate} - ${edu.endDate}}
      {${edu.degree}}{${edu.location}}
      ${edu.description ? `
      \\resumeItemListStart
        ${edu.description.map(desc => `\\resumeItem{${escapeLatex(desc)}}`).join('\n')}
      \\resumeItemListEnd
      ` : ''}
  `).join('\n');
  content = content.replace(/\$education\$/g, educationContent);

  // Generate projects section
  const projectsContent = data.projects.map(proj => `
    \\resumeProject
      {${proj.name}}{${proj.technologies}}{${proj.date}}
      \\resumeItemListStart
        ${proj.description.map(desc => `\\resumeItem{${escapeLatex(desc)}}`).join('\n')}
      \\resumeItemListEnd
  `).join('\n');
  content = content.replace(/\$projects\$/g, projectsContent);

  // Generate skills section
  const skillsContent = `
    \\resumeItem{Technical Skills: ${data.skills.technical.join(', ')}}
    \\resumeItem{Soft Skills: ${data.skills.soft.join(', ')}}
    \\resumeItem{Languages: ${data.skills.languages.join(', ')}}
  `;
  content = content.replace(/\$skills\$/g, skillsContent);

  // Generate certifications section
  const certificationsContent = data.certifications.map(cert => `
    \\resumeSubHeading
      {${cert.name}}{${cert.date}}
      {${cert.issuer}}{}
      ${cert.description ? `\\resumeItem{${escapeLatex(cert.description)}}` : ''}
  `).join('\n');
  content = content.replace(/\$certifications\$/g, certificationsContent);

  // Generate achievements section
  const achievementsContent = data.achievements.map(ach => `
    \\resumeSubHeading
      {${ach.title}}{${ach.date}}
      {}{}
      \\resumeItem{${escapeLatex(ach.description)}}
  `).join('\n');
  content = content.replace(/\$achievements\$/g, achievementsContent);

  return content;
}

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}');
} 