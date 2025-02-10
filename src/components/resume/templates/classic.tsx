import { ResumeData } from "@/lib/templates/latex/types";
import { cn } from "@/lib/utils";

interface ClassicResumeProps {
  data: ResumeData;
  className?: string;
}

export function ClassicResume({ data, className }: ClassicResumeProps) {
  return (
    <div className={cn(
      "w-full max-w-[210mm] mx-auto bg-white text-black font-serif",
      "p-8 shadow-lg print:shadow-none",
      className
    )}>
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">{data.personalInfo.name}</h1>
        <div className="text-sm space-y-1">
          <p>{data.personalInfo.email} • {data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
          <p>
            <a href={`https://linkedin.com/in/${data.personalInfo.linkedin}`} className="hover:underline">LinkedIn</a>
            {" • "}
            <a href={`https://github.com/${data.personalInfo.github}`} className="hover:underline">GitHub</a>
            {data.personalInfo.website && (
              <>
                {" • "}
                <a href={data.personalInfo.website} className="hover:underline">Portfolio</a>
              </>
            )}
          </p>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-6">
        <h2 className="text-xl font-bold uppercase border-b border-black pb-1 mb-3">Summary</h2>
        <p className="text-sm leading-relaxed">{data.summary}</p>
      </section>

      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-xl font-bold uppercase border-b border-black pb-1 mb-3">Experience</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-base font-bold">{exp.company}</h3>
              <span className="text-sm italic">{exp.startDate} - {exp.endDate}</span>
            </div>
            <div className="flex justify-between items-baseline mb-2">
              <p className="text-sm font-semibold">{exp.position}</p>
              <p className="text-sm italic">{exp.location}</p>
            </div>
            <ul className="list-disc ml-4 text-sm space-y-1">
              {exp.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-xl font-bold uppercase border-b border-black pb-1 mb-3">Education</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-base font-bold">{edu.school}</h3>
              <span className="text-sm italic">{edu.startDate} - {edu.endDate}</span>
            </div>
            <div className="flex justify-between items-baseline mb-2">
              <p className="text-sm font-semibold">{edu.degree}</p>
              <p className="text-sm italic">{edu.location}</p>
            </div>
            {edu.description && (
              <ul className="list-disc ml-4 text-sm space-y-1">
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
        <h2 className="text-xl font-bold uppercase border-b border-black pb-1 mb-3">Projects</h2>
        {data.projects.map((project, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-base font-bold">{project.name}</h3>
              <span className="text-sm italic">{project.date}</span>
            </div>
            <p className="text-sm font-semibold mb-2">{project.technologies}</p>
            <ul className="list-disc ml-4 text-sm space-y-1">
              {project.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h2 className="text-xl font-bold uppercase border-b border-black pb-1 mb-3">Skills</h2>
        <div className="space-y-2 text-sm">
          <p><span className="font-bold">Technical:</span> {data.skills.technical.join(", ")}</p>
          <p><span className="font-bold">Soft Skills:</span> {data.skills.soft.join(", ")}</p>
          <p><span className="font-bold">Languages:</span> {data.skills.languages.join(", ")}</p>
        </div>
      </section>

      {/* Certifications */}
      <section className="mb-6">
        <h2 className="text-xl font-bold uppercase border-b border-black pb-1 mb-3">Certifications</h2>
        {data.certifications.map((cert, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-baseline">
              <h3 className="text-base font-bold">{cert.name}</h3>
              <span className="text-sm italic">{cert.date}</span>
            </div>
            <p className="text-sm font-semibold">{cert.issuer}</p>
            {cert.description && <p className="text-sm mt-1">{cert.description}</p>}
          </div>
        ))}
      </section>

      {/* Achievements */}
      <section className="mb-6">
        <h2 className="text-xl font-bold uppercase border-b border-black pb-1 mb-3">Achievements</h2>
        {data.achievements.map((achievement, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-baseline">
              <h3 className="text-base font-bold">{achievement.title}</h3>
              <span className="text-sm italic">{achievement.date}</span>
            </div>
            <p className="text-sm">{achievement.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
} 