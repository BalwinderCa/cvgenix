"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Globe, 
  Calendar,
  Award,
  GraduationCap,
  Briefcase,
  FileText,
  Languages,
  User
} from 'lucide-react';

interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    linkedin: string;
    website: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    category?: string;
  }>;
  languages: Array<{
    id: string;
    language: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native' | 'Fluent';
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  socialLinks: Array<{
    id: string;
    platform: string;
    url: string;
  }>;
  customSections: Array<{
    id: string;
    title: string;
    content: string;
    type: 'text' | 'list' | 'mixed';
    items?: string[];
  }>;
}

interface ResumePreviewProps {
  data: ResumeData;
  template?: 'modern' | 'classic' | 'minimal';
  className?: string;
}

export function ResumePreview({ data, template = 'modern', className = '' }: ResumePreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  // Check if resume is empty
  const isResumeEmpty = () => {
    return (
      !data.personalInfo.firstName &&
      !data.personalInfo.lastName &&
      !data.personalInfo.email &&
      data.experience.length === 0 &&
      data.education.length === 0 &&
      data.skills.length === 0 &&
      data.languages.length === 0 &&
      data.certifications.length === 0 &&
      data.socialLinks.length === 0 &&
      data.customSections.length === 0
    );
  };

  const formatDateRange = (startDate: string, endDate: string, current: boolean) => {
    const start = formatDate(startDate);
    const end = current ? 'Present' : formatDate(endDate);
    return `${start} - ${end}`;
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">Your Resume Preview</h3>
      <p className="text-gray-600 mb-2 max-w-xs text-sm">
        Start filling out the sections on the left to see your resume come to life here.
      </p>
      <div className="text-xs text-gray-500">
        <p>Begin with your personal information, then add your experience and skills.</p>
      </div>
    </div>
  );

  if (template === 'classic') {
    return (
      <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
        <CardContent className="p-8">
          {isResumeEmpty() ? (
            <EmptyState />
          ) : (
            <>
          {/* Header */}
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.personalInfo.firstName} {data.personalInfo.lastName}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              {data.personalInfo.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {data.personalInfo.email}
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {data.personalInfo.phone}
                </div>
              )}
              {data.personalInfo.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {data.personalInfo.address}
                </div>
              )}
              {data.personalInfo.linkedin && (
                <div className="flex items-center gap-1">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </div>
              )}
              {data.personalInfo.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Website
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {data.personalInfo.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                Professional Experience
              </h2>
              <div className="space-y-6">
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                        <p className="text-gray-700 font-medium">{exp.company}</p>
                      </div>
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">{exp.description}</p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="text-gray-700 text-sm space-y-1">
                        {exp.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                Education
              </h2>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                        <p className="text-gray-700">{edu.institution}</p>
                        {edu.field && <p className="text-gray-600 text-sm">{edu.field}</p>}
                        {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
                      </div>
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {formatDateRange(edu.startDate, edu.endDate, false)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                Skills
              </h2>
              <div className="space-y-3">
                {data.skills.map((skill) => (
                  <div key={skill.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900">{skill.name}</span>
                      {skill.category && (
                        <span className="text-sm text-gray-600 ml-2">({skill.category})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            skill.level === 'Beginner' ? 'w-1/4 bg-red-400' :
                            skill.level === 'Intermediate' ? 'w-1/2 bg-yellow-400' :
                            skill.level === 'Advanced' ? 'w-3/4 bg-blue-400' :
                            'w-full bg-green-400'
                          }`}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-20">{skill.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                Languages
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{lang.language}</span>
                    <span className="text-sm text-gray-600">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                Certifications
              </h2>
              <div className="space-y-3">
                {data.certifications.map((cert) => (
                  <div key={cert.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                        <p className="text-gray-700">{cert.issuer}</p>
                      </div>
                      <span className="text-sm text-gray-600">{cert.date}</span>
                    </div>
                    {cert.url && (
                      <a 
                        href={cert.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {data.socialLinks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                Social Links
              </h2>
              <div className="space-y-2">
                {data.socialLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{link.platform}:</span>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {link.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sections */}
          {data.customSections.map((section) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.content && (
                  <p className="text-gray-700 text-sm leading-relaxed">{section.content}</p>
                )}
                {section.items && section.items.length > 0 && (
                  <ul className="text-gray-700 text-sm space-y-1">
                    {section.items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (template === 'minimal') {
    return (
      <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
        <CardContent className="p-6">
          {isResumeEmpty() ? (
            <EmptyState />
          ) : (
            <>
          {/* Header */}
          <div className="text-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {data.personalInfo.firstName} {data.personalInfo.lastName}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
              {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
              {data.personalInfo.address && <div>{data.personalInfo.address}</div>}
            </div>
          </div>

          {/* Summary */}
          {data.personalInfo.summary && (
            <div className="mb-6">
              <p className="text-gray-700 text-sm leading-relaxed">{data.personalInfo.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Experience</h2>
              <div className="space-y-4">
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{exp.position}</h3>
                        <p className="text-gray-700 text-sm">{exp.company}</p>
                      </div>
                      <span className="text-xs text-gray-600">
                        {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 text-xs leading-relaxed mb-1">{exp.description}</p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="text-gray-700 text-xs space-y-0.5">
                        {exp.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-1.5 flex-shrink-0" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Education</h2>
              <div className="space-y-3">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{edu.degree}</h3>
                        <p className="text-gray-700 text-sm">{edu.institution}</p>
                        {edu.field && <p className="text-gray-600 text-xs">{edu.field}</p>}
                      </div>
                      <span className="text-xs text-gray-600">
                        {formatDateRange(edu.startDate, edu.endDate, false)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
              <div className="space-y-2">
                {data.skills.map((skill) => (
                  <div key={skill.id} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-900">{skill.name}</span>
                      {skill.category && (
                        <span className="text-gray-600 ml-1">({skill.category})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            skill.level === 'Beginner' ? 'w-1/4 bg-red-400' :
                            skill.level === 'Intermediate' ? 'w-1/2 bg-yellow-400' :
                            skill.level === 'Advanced' ? 'w-3/4 bg-blue-400' :
                            'w-full bg-green-400'
                          }`}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-16">{skill.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Languages</h2>
              <div className="space-y-1">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-900">{lang.language}</span>
                    <span className="text-gray-600">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h2>
              <div className="space-y-2">
                {data.certifications.map((cert) => (
                  <div key={cert.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{cert.name}</h3>
                        <p className="text-gray-700 text-sm">{cert.issuer}</p>
                      </div>
                      <span className="text-xs text-gray-600">{cert.date}</span>
                    </div>
                    {cert.url && (
                      <a 
                        href={cert.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {data.socialLinks.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Social Links</h2>
              <div className="space-y-1">
                {data.socialLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-900">{link.platform}:</span>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      {link.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sections */}
          {data.customSections.map((section) => (
            <div key={section.id} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h2>
              <div className="space-y-2">
                {section.content && (
                  <p className="text-gray-700 text-xs leading-relaxed">{section.content}</p>
                )}
                {section.items && section.items.length > 0 && (
                  <ul className="text-gray-700 text-xs space-y-0.5">
                    {section.items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Modern template (default)
  return (
    <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
      <CardContent className="p-8">
        {isResumeEmpty() ? (
          <EmptyState />
        ) : (
          <>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {data.personalInfo.firstName} {data.personalInfo.lastName}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            {data.personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                {data.personalInfo.email}
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                {data.personalInfo.phone}
              </div>
            )}
            {data.personalInfo.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                {data.personalInfo.address}
              </div>
            )}
            {data.personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-600" />
                LinkedIn Profile
              </div>
            )}
            {data.personalInfo.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Personal Website
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.personalInfo.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed pl-7">{data.personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Professional Experience
            </h2>
            <div className="space-y-6 pl-7">
              {data.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-blue-100 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-blue-600 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap bg-gray-100 px-2 py-1 rounded">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-2">{exp.description}</p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="text-gray-700 text-sm space-y-1">
                      {exp.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Education
            </h2>
            <div className="space-y-4 pl-7">
              {data.education.map((edu) => (
                <div key={edu.id} className="border-l-2 border-blue-100 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-blue-600">{edu.institution}</p>
                      {edu.field && <p className="text-gray-600 text-sm">{edu.field}</p>}
                      {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap bg-gray-100 px-2 py-1 rounded">
                      {formatDateRange(edu.startDate, edu.endDate, false)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Skills
            </h2>
            <div className="space-y-3 pl-7">
              {data.skills.map((skill) => (
                <div key={skill.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    {skill.category && (
                      <span className="text-sm text-blue-600 ml-2">({skill.category})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          skill.level === 'Beginner' ? 'w-1/4 bg-red-400' :
                          skill.level === 'Intermediate' ? 'w-1/2 bg-yellow-400' :
                          skill.level === 'Advanced' ? 'w-3/4 bg-blue-400' :
                          'w-full bg-green-400'
                        }`}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-20">{skill.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Languages className="w-5 h-5 text-blue-600" />
              Languages
            </h2>
            <div className="space-y-2 pl-7">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{lang.language}</span>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Certifications
            </h2>
            <div className="space-y-4 pl-7">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="border-l-2 border-blue-100 pl-4">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                      <p className="text-blue-600">{cert.issuer}</p>
                    </div>
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{cert.date}</span>
                  </div>
                  {cert.url && (
                    <a 
                      href={cert.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Credential
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {data.socialLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Social Links
            </h2>
            <div className="space-y-2 pl-7">
              {data.socialLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{link.platform}:</span>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {link.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Sections */}
        {data.customSections.map((section) => (
          <div key={section.id} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {section.title}
            </h2>
            <div className="space-y-3 pl-7">
              {section.content && (
                <p className="text-gray-700 text-sm leading-relaxed">{section.content}</p>
              )}
              {section.items && section.items.length > 0 && (
                <ul className="text-gray-700 text-sm space-y-1">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}

          </>
        )}
      </CardContent>
    </Card>
  );
}
