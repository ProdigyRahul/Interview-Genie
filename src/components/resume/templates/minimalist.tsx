import { ResumeData } from "@/lib/templates/latex/types";
import { cn } from "@/lib/utils";

interface MinimalistResumeProps {
  data: ResumeData;
  className?: string;
}

export function MinimalistResume({ data, className }: MinimalistResumeProps) {
  return (
    <div className={cn(
      "w-full max-w-[210mm] mx-auto bg-white text-zinc-900 font-sans",
      "p-8 shadow-lg print:shadow-none",
      className
    )}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-light mb-2">{data.personalInfo.name}</h1>
        <div className="text-sm text-zinc-600 space-x-4">
          <a href={`mailto:${data.personalInfo.email}`} className="hover:text-black">{data.personalInfo.email}</a>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
        </div>
        <div className="text-sm text-zinc-600 space-x-4 mt-1">
          <a href={`https://linkedin.com/in/${data.personalInfo.linkedin}`} className="hover:text-black">LinkedIn</a>
          <a href={`https://github.com/${data.personalInfo.github}`} className="hover:text-black">GitHub</a>
          {data.personalInfo.website && (
            <a href={data.personalInfo.website} className="hover:text-black">Portfolio</a>
          )}
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-wider text-zinc-900 mb-3">About</h2>
        <p className="text-sm leading-relaxed text-zinc-600">{data.summary}</p>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-wider text-zinc-900 mb-4">Experience</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-6">
            <div className="grid grid-cols-[1fr_auto] gap-4 mb-1">
              <h3 className="font-medium">{exp.company}</h3>
              <span className="text-sm text-zinc-500">{exp.startDate} - {exp.endDate}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-4 mb-2">
              <p className="text-sm text-zinc-600">{exp.position}</p>
              <p className="text-sm text-zinc-500">{exp.location}</p>
            </div>
            <ul className="text-sm text-zinc-600 space-y-1 list-inside list-disc">
              {exp.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-wider text-zinc-900 mb-4">Education</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-6">
            <div className="grid grid-cols-[1fr_auto] gap-4 mb-1">
              <h3 className="font-medium">{edu.school}</h3>
              <span className="text-sm text-zinc-500">{edu.startDate} - {edu.endDate}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-4 mb-2">
              <p className="text-sm text-zinc-600">{edu.degree}</p>
              <p className="text-sm text-zinc-500">{edu.location}</p>
            </div>
            {edu.description && (
              <ul className="text-sm text-zinc-600 space-y-1 list-inside list-disc">
                {edu.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-wider text-zinc-900 mb-4">Projects</h2>
        {data.projects.map((project, index) => (
          <div key={index} className="mb-6">
            <div className="grid grid-cols-[1fr_auto] gap-4 mb-1">
              <h3 className="font-medium">{project.name}</h3>
              <span className="text-sm text-zinc-500">{project.date}</span>
            </div>
            <p className="text-sm text-zinc-600 mb-2">{project.technologies}</p>
            <ul className="text-sm text-zinc-600 space-y-1 list-inside list-disc">
              {project.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-wider text-zinc-900 mb-4">Skills</h2>
        <div className="space-y-2 text-sm text-zinc-600">
          <p>
            <span className="text-zinc-900">Technical:</span> {data.skills.technical.join(" • ")}
          </p>
          <p>
            <span className="text-zinc-900">Soft Skills:</span> {data.skills.soft.join(" • ")}
          </p>
          <p>
            <span className="text-zinc-900">Languages:</span> {data.skills.languages.join(" • ")}
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-wider text-zinc-900 mb-4">Certifications</h2>
        {data.certifications.map((cert, index) => (
          <div key={index} className="mb-4">
            <div className="grid grid-cols-[1fr_auto] gap-4 mb-1">
              <h3 className="font-medium">{cert.name}</h3>
              <span className="text-sm text-zinc-500">{cert.date}</span>
            </div>
            <p className="text-sm text-zinc-600">{cert.issuer}</p>
            {cert.description && <p className="text-sm text-zinc-600 mt-1">{cert.description}</p>}
          </div>
        ))}
      </section>

      {/* Achievements */}
      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-wider text-zinc-900 mb-4">Achievements</h2>
        {data.achievements.map((achievement, index) => (
          <div key={index} className="mb-4">
            <div className="grid grid-cols-[1fr_auto] gap-4 mb-1">
              <h3 className="font-medium">{achievement.title}</h3>
              <span className="text-sm text-zinc-500">{achievement.date}</span>
            </div>
            <p className="text-sm text-zinc-600">{achievement.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
} 