"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Plus, 
  X, 
  Search,
  Lightbulb,
  TrendingUp,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedSkillsInputProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  className?: string;
}

// Popular skills by category
const SKILL_CATEGORIES = {
  'Programming Languages': [
    'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
    'PHP', 'Ruby', 'Scala', 'R', 'MATLAB', 'Perl', 'Haskell', 'Clojure', 'Elixir'
  ],
  'Web Development': [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js', 'Nuxt.js', 'Svelte',
    'HTML5', 'CSS3', 'Sass', 'Less', 'Tailwind CSS', 'Bootstrap', 'jQuery', 'Webpack', 'Vite'
  ],
  'Backend & Databases': [
    'REST APIs', 'GraphQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Firebase', 'Supabase'
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Xamarin',
    'Ionic', 'Cordova', 'Swift', 'Kotlin', 'Objective-C'
  ],
  'Data & Analytics': [
    'SQL', 'Python', 'R', 'Tableau', 'Power BI', 'Excel', 'Pandas', 'NumPy', 'Scikit-learn',
    'TensorFlow', 'PyTorch', 'Apache Spark', 'Hadoop', 'Machine Learning', 'Data Visualization'
  ],
  'Design & UX': [
    'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InDesign', 'User Research',
    'Wireframing', 'Prototyping', 'UI/UX Design', 'Design Systems', 'Accessibility'
  ],
  'Project Management': [
    'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Trello', 'Asana', 'Project Planning',
    'Risk Management', 'Team Leadership', 'Stakeholder Management'
  ],
  'Marketing & Sales': [
    'Google Analytics', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
    'Email Marketing', 'HubSpot', 'Salesforce', 'CRM', 'Lead Generation'
  ],
  'Business & Finance': [
    'Financial Analysis', 'Budgeting', 'Forecasting', 'Excel', 'QuickBooks', 'SAP',
    'Business Intelligence', 'Process Improvement', 'Strategic Planning'
  ]
};

export function EnhancedSkillsInput({ 
  skills, 
  onSkillsChange, 
  className = '' 
}: EnhancedSkillsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get all skills as a flat array
  const allSkills = Object.values(SKILL_CATEGORIES).flat();

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allSkills
        .filter(skill => 
          skill.toLowerCase().includes(inputValue.toLowerCase()) &&
          !skills.includes(skill)
        )
        .slice(0, 10);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, skills, allSkills]);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      onSkillsChange([...skills, trimmedSkill]);
      setInputValue('');
      toast.success(`Added skill: ${trimmedSkill}`);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const getSkillCategory = (skill: string) => {
    for (const [category, categorySkills] of Object.entries(SKILL_CATEGORIES)) {
      if (categorySkills.includes(skill)) {
        return category;
      }
    }
    return 'Other';
  };

  const getPopularSkills = () => {
    return allSkills.slice(0, 20); // Top 20 most common skills
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Skills */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Your Skills ({skills.length})</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add Skill Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Add Skills</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a skill and press Enter..."
                className="pr-10"
              />
              {inputValue && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => addSkill(inputValue)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Lightbulb className="w-4 h-4" />
              Suggestions
            </h4>
            <div className="flex flex-wrap gap-1">
              {suggestions.slice(0, 8).map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => addSkill(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Skills */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Popular Skills
          </h4>
          <div className="flex flex-wrap gap-1">
            {getPopularSkills().slice(0, 12).map((skill) => (
              <Button
                key={skill}
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-gray-600 hover:text-gray-900"
                onClick={() => addSkill(skill)}
                disabled={skills.includes(skill)}
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>

        {/* Skill Categories */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Browse by Category</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SKILL_CATEGORIES).map(([category, categorySkills]) => (
              <Popover key={category}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs justify-start">
                    {category}
                    <span className="ml-auto text-gray-400">({categorySkills.length})</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <Command>
                    <CommandInput placeholder={`Search ${category.toLowerCase()}...`} />
                    <CommandList>
                      <CommandEmpty>No skills found.</CommandEmpty>
                      <CommandGroup>
                        {categorySkills.map((skill) => (
                          <CommandItem
                            key={skill}
                            onSelect={() => {
                              addSkill(skill);
                              setIsOpen(false);
                            }}
                            disabled={skills.includes(skill)}
                          >
                            {skill}
                            {skills.includes(skill) && (
                              <span className="ml-auto text-xs text-gray-400">Added</span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h5 className="text-sm font-medium text-blue-900 mb-1">💡 Tips for better skills</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Include both technical and soft skills</li>
            <li>• Use industry-standard terminology</li>
            <li>• Order skills by proficiency level</li>
            <li>• Keep the list relevant to your target role</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
