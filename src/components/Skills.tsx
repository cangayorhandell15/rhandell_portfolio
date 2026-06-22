'use client';

import { useState } from 'react';

// Dito nakaimbak ang lahat ng aktuwal mong teknolohiya, database, at creative tools
const skillsData = {
  frontend: [
    { name: 'Next.js', percentage: 85 },
    { name: 'React', percentage: 82 },
    { name: 'Tailwind CSS', percentage: 76 },
    { name: 'JavaScript', percentage: 77 },
    { name: 'Flutter & Dart', percentage: 65},
    { name: 'HTML & CSS', percentage: 90 }
  ],
  backend: [
    { name: 'PHP', percentage: 89 },
    { name: 'Laravel', percentage: 68 },
    { name: 'Python', percentage: 67 },
    { name: 'C#', percentage: 66 },
    { name: 'RESTful APIs', percentage: 83 },
    { name: 'Web API Integration', percentage: 88 }
  ],
  database: [
    { name: 'MySQL', percentage: 88 },
    { name: 'Supabase', percentage: 85 },
    { name: 'Firebase', percentage: 74 },
    { name: 'SQLite', percentage: 73 },
    { name: 'SSMS', percentage: 73 }
  ],
  iot_hardware: [
    { name: 'ESP32 MCU', percentage: 80 },
    { name: 'Arduino Uno', percentage: 75 },
    { name: 'DHT22 Sensor', percentage: 80 },
    { name: 'Relay Modules', percentage: 80 },
    { name: 'Humidifier Automation', percentage: 80 }
  ],
  security: [
    { name: 'SQLi Protection', percentage: 70 },
    { name: 'Rate Limiting', percentage: 70 },
    { name: 'CSRF Mitigation', percentage: 70 }
  ],
  ai_workflow: [
    { name: 'Gemini API', percentage: 85 },
    { name: 'Claude API', percentage: 35 },
    { name: 'Gemini AI Assisted', percentage: 90 }
  ],
  tools: [
    { name: 'Git & GitHub', percentage: 90 },
    { name: 'Unreal Engine 5', percentage: 60 },
    { name: 'Unity', percentage: 60 },
    { name: 'Blender', percentage: 65 },
    { name: 'Photoshop', percentage: 75 },
    { name: 'Canva', percentage: 85 },
    { name: 'Docker', percentage: 81 },
    { name: 'NPM', percentage: 75 },
    { name: 'Vercel / Netlify', percentage: 85 },
    { name: 'Hostinger', percentage: 85 }
  ]
};

type CategoryKey = keyof typeof skillsData;
type SortOrder = 'default' | 'highest' | 'lowest';

export default function Skills() {
  const [activeTab, setActiveTab] = useState<CategoryKey>('frontend');
  const [sortBy, setSortBy] = useState<SortOrder>('default'); // Idinagdag na state para sa sorting

  // Helper function para ayusin ang mga skills base sa piniling order
  const getSortedSkills = () => {
    const currentSkills = [...skillsData[activeTab]];
    if (sortBy === 'highest') {
      return currentSkills.sort((a, b) => b.percentage - a.percentage);
    }
    if (sortBy === 'lowest') {
      return currentSkills.sort((a, b) => a.percentage - b.percentage);
    }
    return currentSkills; // Ibalik sa default kung walang napili
  };

  return (
    <section id="skills" className="min-h-screen w-full flex items-center justify-center p-6 py-20 md:py-32 bg-zinc-50/30 dark:bg-transparent border-b border-border">
      <div className="max-w-7xl w-full space-y-12">
        
        {/* Section Title */}
        <div className="space-y-2 border-b border-border pb-6">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            My <span className="text-blue-600">Expertise</span>
          </h2>
          <p className="text-muted font-medium max-w-md text-sm">
            Click a category to view proficiency metrics.
          </p>
        </div>

        {/* Main Container */}
        <div className="flex flex-col lg:flex-row gap-8 min-h-[500px] bg-white dark:bg-zinc-900/40 rounded-[2.5rem] border border-border p-6 md:p-10 shadow-sm">
          
          {/* LEFT SIDEBAR: Category Buttons */}
          <div className="w-full lg:w-1/4 flex flex-col gap-2 border-b lg:border-b-0 lg:border-r border-border pb-6 lg:pb-0 lg:pr-6 justify-center">
            {[
              { id: 'frontend', label: 'Frontend Dev' },
              { id: 'backend', label: 'Backend & Core' },
              { id: 'database', label: 'Databases' },
              { id: 'iot_hardware', label: 'IoT & Hardware' },
              { id: 'security', label: 'Security' },
              { id: 'ai_workflow', label: 'AI & Workflows' },
              { id: 'tools', label: 'DevOps & Tools' }
            ].map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveTab(category.id as CategoryKey)}
                className={`w-full text-left px-6 py-4 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all duration-300 ${
                  activeTab === category.id
                    ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                    : 'bg-zinc-100/70 dark:bg-zinc-800/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* RIGHT DISPLAY WITH SORTING PANELS */}
          <div className="w-full lg:w-3/4 flex flex-col justify-between p-4 min-h-[300px]">
            
            {/* Control Panel para sa Sorting Options */}
            <div className="flex justify-end gap-2 mb-6 text-xs font-bold uppercase tracking-wider">
              {[
                { id: 'default', label: 'Default' },
                { id: 'highest', label: 'Highest First' },
                { id: 'lowest', label: 'Lowest First' }
              ].map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSortBy(order.id as SortOrder)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    sortBy === order.id
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent'
                      : 'border-border text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {order.label}
                </button>
              ))}
            </div>

            {/* Circular Progress Bars Grid */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-10">
              {getSortedSkills().map((skill, index) => {
                const radius = 50;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (skill.percentage / 100) * circumference;

                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-300"
                  >
                    {/* Circular Progress Container */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <circle
                          cx="56"
                          cy="56"
                          r={radius}
                          className="stroke-zinc-100 dark:stroke-zinc-800/80 fill-transparent"
                          strokeWidth="8"
                          style={{ transform: 'translate(8px, 8px)' }}
                        />
                        {/* Active Animated Progress Circle */}
                        <circle
                          cx="56"
                          cy="56"
                          r={radius}
                          className="stroke-blue-600 fill-transparent transition-all duration-1000 ease-out"
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          style={{ transform: 'translate(8px, 8px)' }}
                        />
                      </svg>
                      
                      {/* Percentage Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg sm:text-xl font-black tracking-tight dark:text-white">
                          {skill.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Skill Label */}
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-center max-w-[130px] leading-tight">
                      {skill.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}