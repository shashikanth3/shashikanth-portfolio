import React from 'react';
import type { Project } from '../../data/projects';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ExternalLink } from 'lucide-react';
import { FiGithub } from 'react-icons/fi';

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Card className="mb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900">{project.title}</h3>
          <p className="text-brand-600 font-semibold mt-1">
            {project.role} • <span className="text-slate-500 font-medium">{project.domain}</span>
          </p>
        </div>
        <div className="flex gap-3">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
              <FiGithub size={20} />
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
              <ExternalLink size={20} />
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-100 pb-6">
        {project.techStack.map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] gap-2 md:gap-4">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Problem</span>
          <p className="text-slate-700 leading-relaxed">{project.pacsi.problem}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] gap-2 md:gap-4">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Architecture</span>
          <p className="text-slate-700 leading-relaxed">{project.pacsi.architecture}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] gap-2 md:gap-4">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Challenges</span>
          <p className="text-slate-700 leading-relaxed">{project.pacsi.challenges}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] gap-2 md:gap-4">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Implementation</span>
          <p className="text-slate-700 leading-relaxed">{project.pacsi.solution}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] gap-2 md:gap-4 pt-4 mt-2 border-t border-slate-100">
          <span className="text-sm font-bold text-brand-600 uppercase tracking-wider">Impact</span>
          <p className="text-slate-900 font-semibold leading-relaxed">{project.pacsi.impact}</p>
        </div>
      </div>
    </Card>
  );
};