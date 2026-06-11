import React from 'react';

interface SectionWrapperProps {
  id: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ 
  id, 
  title, 
  subtitle, 
  children, 
  className = '' 
}) => {
  return (
    <section id={id} className={`py-20 sm:py-24 ${className}`}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {(title || subtitle) && (
          <div className="mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-slate-600 max-w-2xl">
                {subtitle}
              </p>
            )}
            <div className="h-1 w-20 bg-brand-500 rounded mt-6"></div>
          </div>
        )}
        {children}
      </div>
    </section>
  );
};