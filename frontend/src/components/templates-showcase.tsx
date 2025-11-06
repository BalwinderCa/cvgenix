"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LayoutTemplate, ChevronLeft, ChevronRight, Filter, X, Star, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TemplateItem = {
  id: string;
  name: string;
  industry: string;
  style: string;
  experience: string;
  atsScore?: number;
  isPremium?: boolean;
  popularity?: number;
  rating?: number;
  usageCount?: number;
  features?: string[];
  bestFor?: string[];
  profileData: {
    name: string;
    title: string;
    skills: string[];
    sections: string[];
  };
  // Real template data from API
  _id?: string;
  thumbnail?: string;
  category?: string;
};

export type TemplatesShowcaseProps = {
  className?: string;
  title?: string;
  description?: string;
  templates?: TemplateItem[];
  onUseTemplate?: (template: TemplateItem) => void;
};

const DEFAULT_TEMPLATES: TemplateItem[] = [
  { 
    id: "t1", 
    name: "Modern Professional", 
    industry: "Technology", 
    style: "Modern", 
    experience: "Mid",
    atsScore: 95,
    isPremium: false,
    popularity: 4.8,
    rating: 4.9,
    usageCount: 1250,
    features: ["ATS Optimized", "Modern Design", "Tech Focused"],
    bestFor: ["Software Engineers", "Developers", "Tech Professionals"],
    profileData: {
      name: "Alex Chen",
      title: "Senior Software Engineer",
      skills: ["React", "Node.js", "Python", "AWS", "Docker", "GraphQL"],
      sections: ["Experience", "Skills", "Projects", "Education"]
    }
  },
  { 
    id: "t2", 
    name: "Classic Corporate", 
    industry: "Finance", 
    style: "Classic", 
    experience: "Senior",
    atsScore: 98,
    isPremium: true,
    popularity: 4.6,
    rating: 4.8,
    usageCount: 890,
    features: ["ATS Optimized", "Executive Ready", "Finance Focused"],
    bestFor: ["Finance Professionals", "Banking", "Corporate Executives"],
    profileData: {
      name: "Sarah Mitchell",
      title: "Investment Banking Director",
      skills: ["Financial Modeling", "M&A", "Risk Analysis", "Bloomberg", "Excel", "Valuation"],
      sections: ["Experience", "Education", "Certifications", "Skills"]
    }
  },
  { 
    id: "t3", 
    name: "Minimalist Focus", 
    industry: "Design", 
    style: "Minimal", 
    experience: "Entry",
    atsScore: 92,
    isPremium: false,
    popularity: 4.7,
    rating: 4.6,
    usageCount: 2100,
    features: ["Clean Design", "Portfolio Ready", "Creative Focused"],
    bestFor: ["Designers", "Creative Professionals", "Entry Level"],
    profileData: {
      name: "Jordan Park",
      title: "UX Designer",
      skills: ["Figma", "Sketch", "Prototyping", "User Research", "Wireframing", "Design Systems"],
      sections: ["Portfolio", "Experience", "Skills", "Education"]
    }
  },
  { 
    id: "t4", 
    name: "Clean ATS", 
    industry: "General", 
    style: "Modern", 
    experience: "Entry",
    profileData: {
      name: "Taylor Johnson",
      title: "Business Analyst",
      skills: ["SQL", "Excel", "PowerBI", "Process Improvement", "Data Analysis", "Agile"],
      sections: ["Summary", "Experience", "Skills", "Education"]
    }
  },
  { 
    id: "t5", 
    name: "Executive Edge", 
    industry: "Management", 
    style: "Classic", 
    experience: "Senior",
    profileData: {
      name: "Michael Rodriguez",
      title: "VP of Operations",
      skills: ["Strategic Planning", "Team Leadership", "P&L Management", "Process Optimization", "Six Sigma", "Change Management"],
      sections: ["Leadership", "Experience", "Achievements", "Education"]
    }
  },
  { 
    id: "t6", 
    name: "Product Lead", 
    industry: "Technology", 
    style: "Modern", 
    experience: "Senior",
    profileData: {
      name: "Emma Thompson",
      title: "Senior Product Manager",
      skills: ["Product Strategy", "Roadmap Planning", "User Analytics", "A/B Testing", "Scrum", "Stakeholder Management"],
      sections: ["Products", "Experience", "Metrics", "Skills"]
    }
  },
  { 
    id: "t7", 
    name: "Creative Grid", 
    industry: "Design", 
    style: "Minimal", 
    experience: "Mid",
    profileData: {
      name: "David Kim",
      title: "Creative Director",
      skills: ["Brand Strategy", "Adobe Creative Suite", "Art Direction", "Campaign Development", "Typography", "Photography"],
      sections: ["Portfolio", "Creative Work", "Experience", "Awards"]
    }
  },
  { 
    id: "t8", 
    name: "Consultant Pro", 
    industry: "Consulting", 
    style: "Classic", 
    experience: "Mid",
    profileData: {
      name: "Lisa Anderson",
      title: "Management Consultant",
      skills: ["Strategy Development", "Client Relations", "Market Research", "Business Analysis", "Presentation", "Problem Solving"],
      sections: ["Consulting", "Experience", "Projects", "Education"]
    }
  },
  { 
    id: "t9", 
    name: "Analyst Standard", 
    industry: "Finance", 
    style: "Minimal", 
    experience: "Entry",
    profileData: {
      name: "Ryan Lee",
      title: "Financial Analyst",
      skills: ["Financial Modeling", "Excel", "SQL", "Tableau", "Forecasting", "Variance Analysis"],
      sections: ["Experience", "Skills", "Projects", "Education"]
    }
  },
  { 
    id: "t10", 
    name: "Marketing Bold", 
    industry: "Marketing", 
    style: "Modern", 
    experience: "Mid",
    profileData: {
      name: "Jessica Martinez",
      title: "Digital Marketing Manager",
      skills: ["Google Ads", "Social Media", "SEO/SEM", "Analytics", "Content Strategy", "Email Marketing"],
      sections: ["Campaigns", "Experience", "Metrics", "Skills"]
    }
  },
  { 
    id: "t11", 
    name: "Operations Clarity", 
    industry: "Operations", 
    style: "Minimal", 
    experience: "Senior",
    profileData: {
      name: "Robert Wilson",
      title: "Operations Director",
      skills: ["Supply Chain", "Logistics", "Quality Control", "Lean Manufacturing", "Team Management", "Cost Reduction"],
      sections: ["Operations", "Experience", "Improvements", "Education"]
    }
  },
  { 
    id: "t12", 
    name: "Generalist Neat", 
    industry: "General", 
    style: "Classic", 
    experience: "Mid",
    profileData: {
      name: "Amanda Davis",
      title: "Project Manager",
      skills: ["Project Planning", "Resource Management", "Risk Assessment", "Budget Control", "Communication", "Stakeholder Relations"],
      sections: ["Projects", "Experience", "Certifications", "Skills"]
    }
  },
  { 
    id: "t13", 
    name: "Healthcare Clear", 
    industry: "Healthcare", 
    style: "Modern", 
    experience: "Mid",
    profileData: {
      name: "Nina Patel",
      title: "Registered Nurse",
      skills: ["Patient Care", "EMR/EHR", "IV Therapy", "Medication Admin", "Triage", "BLS/ACLS"],
      sections: ["Clinical Experience", "Certifications", "Skills", "Education"]
    }
  },
  { 
    id: "t14", 
    name: "Data Insight", 
    industry: "Technology", 
    style: "Minimal", 
    experience: "Mid",
    profileData: {
      name: "Priya Desai",
      title: "Data Scientist",
      skills: ["Python", "TensorFlow", "SQL", "Pandas", "Visualization", "A/B Testing"],
      sections: ["Projects", "Experience", "Skills", "Education"]
    }
  },
  { 
    id: "t15", 
    name: "Sales Accelerator", 
    industry: "Sales", 
    style: "Classic", 
    experience: "Senior",
    profileData: {
      name: "Anthony Brown",
      title: "Sales Manager",
      skills: ["Pipeline Management", "Negotiation", "CRM (Salesforce)", "Forecasting", "Team Leadership", "Account Growth"],
      sections: ["Achievements", "Experience", "Skills", "Education"]
    }
  },
  { 
    id: "t16", 
    name: "People First", 
    industry: "HR", 
    style: "Minimal", 
    experience: "Mid",
    profileData: {
      name: "Elena Garcia",
      title: "HR Specialist",
      skills: ["Talent Acquisition", "Onboarding", "Employee Relations", "Compliance", "Benefits", "HRIS"],
      sections: ["Experience", "Programs", "Skills", "Education"]
    }
  },
  { 
    id: "t17", 
    name: "Cyber Defense", 
    industry: "Security", 
    style: "Modern", 
    experience: "Senior",
    profileData: {
      name: "Omar Hassan",
      title: "Cybersecurity Analyst",
      skills: ["SIEM", "Incident Response", "Threat Hunting", "Network Security", "Linux", "CISSP"],
      sections: ["Incidents", "Experience", "Certifications", "Skills"]
    }
  },
  { 
    id: "t18", 
    name: "Educator Bright", 
    industry: "Education", 
    style: "Classic", 
    experience: "Entry",
    profileData: {
      name: "Sophie Nguyen",
      title: "Elementary Teacher",
      skills: ["Curriculum Design", "Classroom Management", "Assessment", "Parent Communication", "EdTech", "SEL"],
      sections: ["Teaching Experience", "Certifications", "Skills", "Education"]
    }
  },
  { 
    id: "t19", 
    name: "QA Precision", 
    industry: "Technology", 
    style: "Modern", 
    experience: "Mid",
    profileData: {
      name: "Hannah Cooper",
      title: "QA Engineer",
      skills: ["Cypress", "Playwright", "Jest", "Postman", "CI/CD", "Bug Tracking"],
      sections: ["Experience", "Projects", "Skills", "Education"]
    }
  },
  { 
    id: "t20", 
    name: "Legal Brief", 
    industry: "Legal", 
    style: "Classic", 
    experience: "Senior",
    profileData: {
      name: "Daniela Rossi",
      title: "Corporate Counsel",
      skills: ["Contract Law", "Compliance", "Negotiation", "M&A", "Risk", "Policy"],
      sections: ["Matters", "Experience", "Bar & Certifications", "Education"]
    }
  },
  { 
    id: "t21", 
    name: "Architect Blueprint", 
    industry: "Architecture", 
    style: "Minimal", 
    experience: "Mid",
    profileData: {
      name: "Marco Alvarez",
      title: "Architect",
      skills: ["AutoCAD", "Revit", "3D Modeling", "Site Planning", "LEED", "Construction Docs"],
      sections: ["Projects", "Experience", "Skills", "Education"]
    }
  },
  { 
    id: "t22", 
    name: "Hospitality Prime", 
    industry: "Hospitality", 
    style: "Modern", 
    experience: "Senior",
    profileData: {
      name: "Amelia Stone",
      title: "Hotel General Manager",
      skills: ["Operations", "Guest Experience", "Revenue Mgmt", "Staff Training", "Scheduling", "Budgeting"],
      sections: ["Operations", "Experience", "Awards", "Education"]
    }
  }
];

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

function ResumeMiniPreview({
  styleVariant,
  profileData
}: {
  styleVariant: "Modern" | "Classic" | "Minimal" | string;
  profileData: TemplateItem['profileData'];
}) {
  // Visual tweaks per style
  const accent = {
    Modern: "bg-chart-3",
    Classic: "bg-chart-4",
    Minimal: "bg-chart-2"
  }[styleVariant as "Modern" | "Classic" | "Minimal"] || "bg-primary";

  const headerHeight = styleVariant === "Classic" ? "h-6" : "h-8";
  const blockRadius = styleVariant === "Minimal" ? "rounded" : "rounded-md";

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-card border border-border shadow-sm">
      <div className="aspect-[3/4]">
        <div className="absolute inset-0 p-3 sm:p-4 flex flex-col gap-2 text-[6px] sm:text-[7px]">
          {/* Header similar to hero section */}
          <div className={cn("w-full", headerHeight, "flex items-center gap-2")}>
            <div className={cn("h-full w-10", blockRadius, accent)} />
            <div className="flex-1">
              <div className={cn("h-2.5 w-full rounded flex items-center px-1", styleVariant === "Classic" ? "bg-foreground/5" : "bg-foreground/5")}>
                <span className="font-bold text-foreground truncate">{profileData.name}</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded bg-muted-foreground/5 flex items-center px-1">
                <span className="text-muted-foreground truncate">{profileData.title}</span>
              </div>
              <div className="mt-0.5 h-1 w-full rounded bg-muted-foreground/5 flex items-center px-1">
                <span className="text-muted-foreground/60 truncate text-[5px] sm:text-[6px]">email@example.com • +1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Summary section like hero */}
          <div className="rounded bg-foreground/5 p-1.5 mt-1">
            <div className="h-1.5 w-12 rounded bg-muted-foreground/20 flex items-center px-0.5 mb-1">
              <span className="font-semibold text-foreground/70 truncate text-[5px] sm:text-[6px]">SUMMARY</span>
            </div>
            <div className="space-y-0.5">
              <div className="h-1 w-full rounded bg-foreground/10" />
              <div className="h-1 w-4/5 rounded bg-foreground/10" />
              <div className="h-1 w-3/4 rounded bg-foreground/10" />
              <div className="h-1 w-2/3 rounded bg-foreground/10" />
            </div>
          </div>

          {/* Two-column body similar to hero section */}
          <div className="grid grid-cols-3 gap-2 mt-1 flex-1">
            {/* Left column - Experience */}
            <div className="col-span-2 space-y-2">
              <div className="h-2 w-full rounded bg-muted-foreground/20 flex items-center px-1">
                <span className="font-semibold text-foreground/70 truncate">EXPERIENCE</span>
              </div>
              {[...Array(2)].map((_, i) =>
                <div key={i} className="space-y-1 rounded bg-white/80 p-1">
                  <div className="flex items-center gap-1">
                    <div className={cn("h-1.5 w-3 rounded", accent)} />
                    <div className="h-1.5 flex-1 rounded bg-foreground/5 flex items-center px-0.5">
                      <span className="text-foreground/60 truncate text-[5px] sm:text-[6px] font-medium">
                        {i === 0 ? "Senior Position" : "Previous Role"}
                      </span>
                    </div>
                  </div>
                  <div className="h-1 w-full rounded bg-muted-foreground/5 flex items-center px-0.5">
                    <span className="text-muted-foreground/60 truncate text-[5px] sm:text-[6px]">Company • 2020-2024</span>
                  </div>
                  <div className="space-y-0.5 ml-1">
                    <div className="h-0.5 w-4/5 rounded bg-foreground/10" />
                    <div className="h-0.5 w-3/4 rounded bg-foreground/10" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column - Skills & Education */}
            <div className="col-span-1 space-y-2">
              <div className="space-y-1">
                <div className="h-2 w-full rounded bg-muted-foreground/20 flex items-center px-1">
                  <span className="font-semibold text-foreground/70 truncate text-[5px] sm:text-[6px]">SKILLS</span>
                </div>
                <div className="space-y-1">
                  {profileData.skills.slice(0, 6).map((skill, i) =>
                    <div key={i} className={cn("h-1.5 rounded flex items-center justify-center px-0.5", accent)}>
                      <span className="text-white/90 truncate text-[4px] sm:text-[5px] font-medium">{skill}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="h-2 w-full rounded bg-muted-foreground/20 flex items-center px-1">
                  <span className="font-semibold text-foreground/70 truncate text-[5px] sm:text-[6px]">EDUCATION</span>
                </div>
                <div className="rounded bg-white/80 p-1 space-y-0.5">
                  <div className="h-1 w-full rounded bg-foreground/10" />
                  <div className="h-0.5 w-3/4 rounded bg-muted-foreground/20" />
                  <div className="h-1 w-4/5 rounded bg-foreground/10" />
                  <div className="h-0.5 w-2/3 rounded bg-muted-foreground/20" />
                </div>
              </div>

              {/* Certifications mini-block to increase content density */}
              <div className="space-y-1">
                <div className="h-2 w-full rounded bg-muted-foreground/20 flex items-center px-1">
                  <span className="font-semibold text-foreground/70 truncate text-[5px] sm:text-[6px]">CERTIFICATIONS</span>
                </div>
                <div className="rounded bg-white/80 p-1 space-y-0.5">
                  <div className="h-1 w-5/6 rounded bg-foreground/10" />
                  <div className="h-1 w-2/3 rounded bg-foreground/10" />
                </div>
              </div>

              {/* Languages mini-block */}
              <div className="space-y-1">
                <div className="h-2 w-full rounded bg-muted-foreground/20 flex items-center px-1">
                  <span className="font-semibold text-foreground/70 truncate text-[5px] sm:text-[6px]">LANGUAGES</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <div className={cn("px-1 py-0.5 rounded border border-border text-[4px] sm:text-[5px]", "bg-card")}>English</div>
                  <div className={cn("px-1 py-0.5 rounded border border-border text-[4px] sm:text-[5px]", "bg-card")}>Spanish</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Paper edge effect */}
        <div className="absolute inset-0 rounded-lg ring-1 ring-border/80" />
      </div>
    </div>
  );
}

// Template Card Component
function TemplateCard({ template, onUseTemplate, realTemplate }: { template: TemplateItem; onUseTemplate?: (template: TemplateItem) => void; realTemplate?: any }) {
  const [imageError, setImageError] = React.useState(false);
  
  // Use real template thumbnail if available, otherwise use mock preview
  const hasRealThumbnail = realTemplate?.thumbnail && (
    realTemplate.thumbnail.startsWith('data:image') || 
    realTemplate.thumbnail.startsWith('http://') || 
    realTemplate.thumbnail.startsWith('https://')
  );

  return (
    <article 
      data-card
      className="group relative snap-start flex-none w-[260px] sm:w-[300px] md:w-[320px] rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-ring cursor-pointer"
      onClick={() => onUseTemplate?.(template)}>
      {/* Template Preview */}
      <div className="p-2 aspect-[3/4] overflow-hidden">
        {hasRealThumbnail && !imageError ? (
          <img 
            src={realTemplate.thumbnail.startsWith('http') ? `http://localhost:3001/api/templates/thumbnail/${realTemplate._id || template._id}?t=${Date.now()}` : realTemplate.thumbnail}
            alt={`${realTemplate.name || template.name} template preview`}
            className="w-full h-full object-cover rounded-lg"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error(`Failed to load thumbnail for template ${realTemplate.name || template.name}:`, realTemplate.thumbnail);
              console.error(`Image src was:`, e.currentTarget.src);
              setImageError(true);
              // Try direct URL as fallback
              if (realTemplate.thumbnail.startsWith('http') && e.currentTarget.src.includes('/thumbnail/')) {
                e.currentTarget.src = realTemplate.thumbnail;
              }
            }}
            onLoad={() => {
              console.log(`Successfully loaded thumbnail for template ${realTemplate.name || template.name}`);
            }}
          />
        ) : (
        <ResumeMiniPreview styleVariant={template.style} profileData={template.profileData} />
        )}
      </div>

      {/* Template Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1">
        {(realTemplate?.isPremium || template.isPremium) && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
            <Star className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )}
        {(realTemplate?.atsScore || template.atsScore) && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            {(realTemplate?.atsScore || template.atsScore)}% ATS
          </Badge>
        )}
      </div>

      {/* Hover overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-background/80 via-background/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true" 
      />

      {/* Template Info with background overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-xl p-3 sm:p-4 bg-gradient-to-t from-background via-background/98 to-background/85">
        <div className="space-y-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground truncate" title={realTemplate?.name || template.name}>
              {realTemplate?.name || template.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {template.industry} • {realTemplate?.category || template.style} • {template.experience}
            </p>
            
            {/* Template Stats */}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {template.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{template.rating}</span>
                </div>
              )}
              {template.usageCount && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{template.usageCount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="pointer-events-auto">
            <Button
              size="sm"
              onClick={() => onUseTemplate?.(template)}
              aria-label={`Use ${template.name} template`}
              className="w-full transition-transform group-hover:translate-y-0.5 cursor-pointer">
              Use Template
            </Button>
          </div>
        </div>
      </div>

      {/* Invisible accessible title for screen readers */}
      <span className="sr-only">{template.name} template preview</span>
    </article>
  );
}


export default function TemplatesShowcase({
  className,
  title = "Explore resume templates for every career path",
  description = "Choose from 22+ modern, classic, and minimal styles designed to pass ATS scans and highlight your strengths.",
  templates = DEFAULT_TEMPLATES,
  onUseTemplate
}: TemplatesShowcaseProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = React.useState<string>("all");
  const [selectedStyle, setSelectedStyle] = React.useState<string>("all");
  const [selectedExperience, setSelectedExperience] = React.useState<string>("all");
  const [showPremiumOnly, setShowPremiumOnly] = React.useState<boolean>(false);
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [realTemplates, setRealTemplates] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  // Load real templates from API
  React.useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/templates');
        if (response.ok) {
          const data = await response.json();
          setRealTemplates(data.templates || []);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  // Handle template click - navigate to resume builder with template
  const handleTemplateClick = React.useCallback((template: TemplateItem) => {
    // If template has a real _id, use it directly
    if (template._id) {
      router.push(`/resume-builder?template=${template._id}`);
      return;
    }
    
    // If we have a real template ID from the API, use it
    if (realTemplates.length > 0) {
      // Try to find a matching real template by name, category, or style
      const matchingTemplate = realTemplates.find(
        (t: any) => t.name.toLowerCase() === template.name.toLowerCase() ||
                    (t.category && t.category.toLowerCase() === template.style?.toLowerCase())
      ) || realTemplates.find(
        (t: any) => t.category === 'Professional' && template.style === 'Modern'
      ) || realTemplates.find(
        (t: any) => t.category === 'Classic' && template.style === 'Classic'
      ) || realTemplates.find(
        (t: any) => t.category === 'Minimalist' && template.style === 'Minimal'
      ) || realTemplates[0];
      
      if (matchingTemplate && matchingTemplate._id) {
        router.push(`/resume-builder?template=${matchingTemplate._id}`);
        return;
      }
    }
    
    // Fallback: use custom handler if provided, otherwise navigate to resume builder
    if (onUseTemplate) {
      onUseTemplate(template);
    } else {
      router.push('/resume-builder');
    }
  }, [realTemplates, onUseTemplate, router]);

  // Convert real templates to TemplateItem format for display
  const displayTemplates = React.useMemo(() => {
    if (realTemplates.length > 0) {
      return realTemplates.map((rt: any, index: number) => {
        const defaultTemplate = DEFAULT_TEMPLATES[index % DEFAULT_TEMPLATES.length];
        return {
          id: rt._id || `t${index}`,
          name: rt.name,
          industry: rt.category || defaultTemplate?.industry || 'General',
          style: rt.category || defaultTemplate?.style || 'Modern',
          experience: defaultTemplate?.experience || 'Mid',
          atsScore: rt.atsScore || defaultTemplate?.atsScore,
          isPremium: rt.isPremium || false,
          rating: typeof rt.rating === 'object' ? rt.rating?.average : rt.rating,
          usageCount: rt.usageCount || defaultTemplate?.usageCount,
          profileData: defaultTemplate?.profileData || {
            name: 'John Doe',
            title: 'Professional',
            skills: [],
            sections: []
          },
          _id: rt._id,
          thumbnail: rt.thumbnail,
          category: rt.category
        };
      });
    }
    return templates;
  }, [realTemplates, templates]);

  const filtered = React.useMemo(() => {
    return displayTemplates.filter((t) => {
      const matchQuery = query.trim().length === 0 || 
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        (t.industry && t.industry.toLowerCase().includes(query.toLowerCase())) ||
        (t.style && t.style.toLowerCase().includes(query.toLowerCase()));
      
      const matchIndustry = selectedIndustry === "all" || t.industry === selectedIndustry;
      const matchStyle = selectedStyle === "all" || t.style === selectedStyle;
      const matchExperience = selectedExperience === "all" || t.experience === selectedExperience;
      const matchPremium = !showPremiumOnly || t.isPremium === true;
      
      return matchQuery && matchIndustry && matchStyle && matchExperience && matchPremium;
    });
  }, [displayTemplates, query, selectedIndustry, selectedStyle, selectedExperience, showPremiumOnly]);

  // Get unique values for filter options
  const industries = React.useMemo(() => {
    const unique = Array.from(new Set(displayTemplates.map(t => t.industry).filter(Boolean)));
    return unique.sort();
  }, [displayTemplates]);

  const styles = React.useMemo(() => {
    const unique = Array.from(new Set(displayTemplates.map(t => t.style).filter(Boolean)));
    return unique.sort();
  }, [displayTemplates]);

  const experiences = React.useMemo(() => {
    const unique = Array.from(new Set(displayTemplates.map(t => t.experience).filter(Boolean)));
    return unique.sort();
  }, [displayTemplates]);

  // Calculate total pages
  const totalPages = Math.ceil(filtered.length / 5);

  const scrollByAmount = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    
    // Calculate scroll amount to show 5 cards at a time
    const cardWidth = card.offsetWidth;
    const gap = 16; // gap-4 = 16px
    const visibleCards = 5;
    const scrollAmount = (cardWidth + gap) * visibleCards;
    
    if (dir === "left") {
      setCurrentPage(prev => Math.max(0, prev - 1));
    } else {
      setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    }
    
    el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  return (
    <section className={cn("w-full", className)}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 shrink-0">
                <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center border border-border">
                  <LayoutTemplate className="h-5 w-5 text-foreground" aria-hidden="true" />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight break-words">
                  {title}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <input
                type="search"
                inputMode="search"
                placeholder="Search templates..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search templates"
                className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm outline-none ring-offset-background placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring transition w-[220px] sm:w-[260px] md:w-[300px]" />

              {query && (
                <Button variant="secondary" size="sm" onClick={() => setQuery("") } className="shrink-0">
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Industry Filter */}
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Style Filter */}
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  {styles.map(style => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Experience Filter */}
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {experiences.map(exp => (
                    <SelectItem key={exp} value={exp}>
                      {exp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Premium Filter */}
              <Button
                variant={showPremiumOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Premium Only
              </Button>

              {/* Clear All Filters */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedIndustry("all");
                  setSelectedStyle("all");
                  setSelectedExperience("all");
                  setShowPremiumOnly(false);
                  setQuery("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filtered.length} of {displayTemplates.length} templates
            </span>
            {(selectedIndustry !== "all" || selectedStyle !== "all" || selectedExperience !== "all" || showPremiumOnly || query) && (
              <span className="text-primary">
                Filters applied
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <button
          type="button"
          aria-label="Previous templates"
          onClick={() => scrollByAmount("left")}
          disabled={currentPage === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full border border-border bg-card/90 shadow-sm p-2 backdrop-blur supports-[backdrop-filter]:bg-card/70 transition-opacity ${
            currentPage === 0 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-card"
          }`}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div
          ref={scrollRef}
          className={cn(
            "flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 px-8 py-1",
            "[scrollbar-width:none] [-ms-overflow-style:none]"
          )}
          style={{
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth'
          }}>
          {filtered.map((t) => {
            // Find matching real template - use the template's own data if it has _id
            const matchingRealTemplate = t._id 
              ? realTemplates.find((rt: any) => rt._id === t._id)
              : realTemplates.find(
                  (rt: any) => rt.name.toLowerCase() === t.name.toLowerCase() ||
                              (rt.category && rt.category.toLowerCase() === t.style?.toLowerCase())
                ) || realTemplates[filtered.indexOf(t) % realTemplates.length] || null;
            
            return (
              <TemplateCard 
                key={t.id || t._id} 
                template={t} 
                onUseTemplate={handleTemplateClick}
                realTemplate={matchingRealTemplate || (t._id ? t : null)}
              />
            );
          })}

          {filtered.length === 0 && (
            <div className="flex-none w-full rounded-xl border border-dashed border-border bg-secondary p-8 text-center">
              <p className="text-sm sm:text-base text-muted-foreground">
                No templates match your search. Try a different term.
              </p>
            </div>
          )}
        </div>
        
        <button
          type="button"
          aria-label="Next templates"
          onClick={() => scrollByAmount("right")}
          disabled={currentPage === totalPages - 1}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full border border-border bg-card/90 shadow-sm p-2 backdrop-blur supports-[backdrop-filter]:bg-card/70 transition-opacity ${
            currentPage === totalPages - 1 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-card"
          }`}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = scrollRef.current;
                if (!el) return;
                const card = el.querySelector<HTMLElement>("[data-card]");
                if (!card) return;
                
                const cardWidth = card.offsetWidth;
                const gap = 16;
                const visibleCards = 5;
                const scrollAmount = (cardWidth + gap) * visibleCards;
                
                setCurrentPage(i);
                el.scrollTo({ left: scrollAmount * i, behavior: "smooth" });
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentPage === i 
                  ? "bg-primary" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}