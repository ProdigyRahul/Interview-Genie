import { ResumeData } from "@/lib/types/resume";
import { cn } from "@/lib/utils";

interface ModernResumeProps {
  data: ResumeData;
  className?: string;
}

export function ModernResume({ data, className }: ModernResumeProps) {
  return (
    <div className={cn(
      "w-full max-w-[210mm] mx-auto bg-white text-black",
      "p-8 shadow-lg print:shadow-none dark:ring-1 dark:ring-white/10",
      className
    )}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#2563eb] mb-2">{data.personalInfo.name}</h1>
        <p className="text-lg text-[#2563eb]/80 mb-4">{data.personalInfo.title}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href={`mailto:${data.personalInfo.email}`} className="text-[#2563eb] hover:underline">
            {data.personalInfo.email}
          </a>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && (
            <a href={`https://linkedin.com/in/${data.personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
              LinkedIn
            </a>
          )}
          {data.personalInfo.github && (
            <a href={`https://github.com/${data.personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
              GitHub
            </a>
          )}
          {data.personalInfo.website && (
            <a href={data.personalInfo.website} target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#2563eb] border-b-2 border-[#2563eb] mb-3">Summary</h2>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#2563eb] border-b-2 border-[#2563eb] mb-3">Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-medium">{exp.company}</h3>
                    <p className="text-gray-700">{exp.position}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exp.startDate} - {exp.endDate}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{exp.location}</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {exp.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#2563eb] border-b-2 border-[#2563eb] mb-3">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-medium">{edu.school}</h3>
                    <p className="text-gray-700">{edu.degree}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {edu.startDate} - {edu.endDate}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{edu.location}</p>
                {edu.description && (
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {edu.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#2563eb] border-b-2 border-[#2563eb] mb-3">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.skills.technical && data.skills.technical.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Technical</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-[#2563eb] text-sm rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft && data.skills.soft.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.soft.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-[#2563eb] text-sm rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.languages && data.skills.languages.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.languages.map((lang, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-[#2563eb] text-sm rounded">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#2563eb] border-b-2 border-[#2563eb] mb-3">Projects</h2>
          <div className="space-y-4">
            {data.projects.map((project, index) => (
              <div key={index}>
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{project.technologies}</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {project.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#2563eb] border-b-2 border-[#2563eb] mb-3">Certifications</h2>
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                </div>
                <div className="text-sm text-gray-600">{cert.date}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#2563eb] border-b-2 border-[#2563eb] mb-3">Achievements</h2>
          <div className="space-y-2">
            {data.achievements.map((achievement, index) => (
              <div key={index}>
                <h3 className="font-medium">{achievement.title}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 