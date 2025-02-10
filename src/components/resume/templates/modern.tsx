import { ResumeData } from "@/lib/templates/latex/types";
import { cn } from "@/lib/utils";

interface ModernResumeProps {
  data: ResumeData;
  className?: string;
}

export function ModernResume({ data, className }: ModernResumeProps) {
  return (
    <div className={cn(
      "w-full max-w-[210mm] mx-auto bg-white text-[#2B3C4E] font-[system-ui]",
      "p-8 shadow-lg print:shadow-none",
      className
    )}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#466995] mb-2">{data.personalInfo.name}</h1>
        <p className="text-lg text-[#466995]/80 mb-4">{data.personalInfo.title}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href={`mailto:${data.personalInfo.email}`} className="text-[#466995] hover:underline">
            {data.personalInfo.email}
          </a>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
          <a href={`https://linkedin.com/in/${data.personalInfo.linkedin}`} className="text-[#466995] hover:underline">
            LinkedIn
          </a>
          <a href={`https://github.com/${data.personalInfo.github}`} className="text-[#466995] hover:underline">
            GitHub
          </a>
          {data.personalInfo.website && (
            <a href={data.personalInfo.website} className="text-[#466995] hover:underline">
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-[#466995] border-b-2 border-[#466995] mb-3">Summary</h2>
        <p className="text-sm leading-relaxed">{data.summary}</p>
      </section>

      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-[#466995] border-b-2 border-[#466995] mb-3">Experience</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="text-base font-semibold">{exp.company}</h3>
              <span className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</span>
            </div>
            <div className="flex justify-between items-baseline mb-2">
              <p className="text-sm italic">{exp.position}</p>
              <p className="text-sm text-gray-600">{exp.location}</p>
            </div>
            <ul className="list-disc list-inside text-sm space-y-1">
              {exp.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-[#466995] border-b-2 border-[#466995] mb-3">Education</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="text-base font-semibold">{edu.school}</h3>
              <span className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</span>
            </div>
            <div className="flex justify-between items-baseline mb-2">
              <p className="text-sm italic">{edu.degree}</p>
              <p className="text-sm text-gray-600">{edu.location}</p>
            </div>
            {edu.description && (
              <ul className="list-disc list-inside text-sm space-y-1">
                {edu.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-[#466995] border-b-2 border-[#466995] mb-3">Projects</h2>
        {data.projects.map((project, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="text-base font-semibold">{project.name}</h3>
              <span className="text-sm text-gray-600">{project.date}</span>
            </div>
            <p className="text-sm italic mb-2">{project.technologies}</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {project.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-[#466995] border-b-2 border-[#466995] mb-3">Skills</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Technical:</strong> {data.skills.technical.join(", ")}</p>
          <p><strong>Soft Skills:</strong> {data.skills.soft.join(", ")}</p>
          <p><strong>Languages:</strong> {data.skills.languages.join(", ")}</p>
        </div>
      </section>

      {/* Certifications */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-[#466995] border-b-2 border-[#466995] mb-3">Certifications</h2>
        {data.certifications.map((cert, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="text-base font-semibold">{cert.name}</h3>
              <span className="text-sm text-gray-600">{cert.date}</span>
            </div>
            <p className="text-sm italic">{cert.issuer}</p>
            {cert.description && <p className="text-sm mt-1">{cert.description}</p>}
          </div>
        ))}
      </section>

      {/* Achievements */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-[#466995] border-b-2 border-[#466995] mb-3">Achievements</h2>
        {data.achievements.map((achievement, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="text-base font-semibold">{achievement.title}</h3>
              <span className="text-sm text-gray-600">{achievement.date}</span>
            </div>
            <p className="text-sm">{achievement.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
} 