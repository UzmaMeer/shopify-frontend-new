import React, { useState } from 'react';

const TemplatePicker = ({ onTemplateSelect }) => {
  const [selected, setSelected] = useState('minimal');

  const templates = [
    {
      id: 'minimal',
      title: 'Minimalist (Polaris)',
      desc: 'Clean Shopify look with soft indigo fades and professional spacing.',
      badge: 'Recommended',
      icon: '✨'
    },
    {
      id: 'dynamic',
      title: 'High Energy',
      desc: 'Fast paced transitions with bold Shopify Blue accents for social ads.',
      badge: 'Fast',
      icon: '⚡'
    },
    {
      id: 'luxury',
      title: 'Luxury Story',
      desc: 'Sophisticated dark-indigo theme for premium high-ticket products.',
      badge: 'Premium',
      icon: '🏆'
    }
  ];

  const handleSelect = (id) => {
    setSelected(id);
    if (onTemplateSelect) onTemplateSelect(id);
  };

  return (
    <div className="bg-[#f6f6f7] p-8 rounded-xl border border-[#e1e3e5] shadow-sm font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 border-b border-[#e1e3e5] pb-4">
          <h2 className="text-[#202223] text-2xl font-semibold">Video Templates</h2>
          <p className="text-[#6d7175] mt-1">Choose a visual style that fits your brand identity.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((temp) => (
            <div 
              key={temp.id}
              onClick={() => handleSelect(temp.id)}
              className={`relative cursor-pointer transition-all duration-200 bg-white rounded-lg border-2 p-5 flex flex-col h-full
                ${selected === temp.id 
                  ? 'border-[#007ace] shadow-[0_0_0_1px_#007ace]' 
                  : 'border-[#e1e3e5] hover:border-[#c9cccf]'}`}
            >
              {/* Badge */}
              <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full 
                ${selected === temp.id ? 'bg-[#007ace] text-white' : 'bg-[#f1f2f3] text-[#6d7175]'}`}>
                {temp.badge}
              </span>

              {/* Icon & Title */}
              <div className="text-3xl mb-3">{temp.icon}</div>
              <h3 className="text-[#202223] font-bold text-lg mb-2">{temp.title}</h3>
              <p className="text-[#6d7175] text-sm leading-relaxed flex-grow">
                {temp.desc}
              </p>

              {/* Selected Indicator */}
              <div className="mt-5 flex items-center justify-between">
                <span className={`text-sm font-medium ${selected === temp.id ? 'text-[#007ace]' : 'text-transparent'}`}>
                  ✓ Selected
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selected === temp.id ? 'border-[#007ace] bg-[#007ace]' : 'border-[#c9cccf]'}`}>
                  {selected === temp.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button Style (Polaris Indigo) */}
        <div className="mt-10 flex justify-center">
          <button className="bg-[#008060] hover:bg-[#006e52] text-white px-8 py-3 rounded-md font-semibold transition-colors shadow-sm">
            Save & Next Step
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePicker;