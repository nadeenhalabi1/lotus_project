import React, { useState } from 'react';

const UserTypesSection = () => {
  const [activeCard, setActiveCard] = useState(0);

  const userTypes = [
    {
      role: 'Learner',
      description: 'Individual learners seeking to enhance their skills and knowledge',
      avatar: '👨‍🎓',
      color: 'primary',
      features: [
        'Personalized learning paths',
        'Progress tracking and analytics',
        'AI-powered recommendations',
        'Interactive assessments',
        'Achievement badges and certificates',
        'Social learning features',
      ],
      stats: { users: '15,000+', courses: '500+', completion: '87%' },
    },
    {
      role: 'Trainer',
      description: 'Educators and trainers creating and managing learning content',
      avatar: '👩‍🏫',
      color: 'secondary',
      features: [
        'Content creation tools',
        'Student progress monitoring',
        'Assessment and grading',
        'Analytics and reporting',
        'Collaboration features',
        'Certification management',
      ],
      stats: { trainers: '2,500+', courses: '1,200+', students: '45,000+' },
    },
    {
      role: 'Organization',
      description: 'Companies and institutions managing team learning programs',
      avatar: '🏢',
      color: 'accent',
      features: [
        'Team management and analytics',
        'Custom learning programs',
        'Compliance tracking',
        'ROI measurement',
        'Integration capabilities',
        'Enterprise security',
      ],
      stats: { organizations: '500+', employees: '100,000+', programs: '2,000+' },
    },
  ];

  const UserTypeCard = ({ userType, index, isActive }) => {
    const gradientClass = `bg-gradient-${userType.color}`;
    const isActiveCard = isActive;

    return (
      <div 
        className={`card-gradient cursor-pointer transition-all duration-500 ${
          isActiveCard ? 'scale-105 shadow-hover' : 'hover:scale-102'
        } focus:outline-none focus:ring-2 focus:ring-primary-blue focus:scale-105`}
        onClick={() => setActiveCard(index)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setActiveCard(index);
          }
        }}
        tabIndex={0}
        role="button"
        aria-pressed={isActiveCard}
      >
        {/* Animated Avatar */}
        <div className="relative mb-6">
          <div className={`w-20 h-20 ${gradientClass} rounded-full flex items-center justify-center text-4xl mx-auto motion-safe:animate-float ${
            isActiveCard ? 'shadow-glow' : ''
          }`}>
            {userType.avatar}
          </div>
          
          {/* Ripple Effect */}
          {isActiveCard && (
            <div className="absolute inset-0 rounded-full border-2 border-primary-blue motion-safe:animate-ripple"></div>
          )}
          
          {/* Status Indicator */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-green rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full motion-safe:animate-pulse"></div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-neutral-text dark:text-neutral-text mb-3">
            {userType.role}
          </h3>
          <p className="text-neutral-text2 dark:text-neutral-text2 mb-6">
            {userType.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Object.entries(userType.stats).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-lg font-bold text-neutral-text dark:text-neutral-text">
                  {value}
                </div>
                <div className="text-xs text-neutral-text2 dark:text-neutral-text2 capitalize">
                  {key}
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-2">
            {userType.features.map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent-green rounded-full"></div>
                <span className="text-sm text-neutral-text2 dark:text-neutral-text2">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Active Indicator */}
          {isActiveCard && (
            <div className="mt-6 w-full h-1 bg-gradient-primary rounded-full motion-safe:animate-progress-glow"></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="py-20 bg-neutral-bg2 dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-display-3xl font-display font-bold text-neutral-text dark:text-neutral-text mb-4">
            Designed for Everyone
          </h2>
          <p className="text-xl text-neutral-text2 dark:text-neutral-text2 max-w-3xl mx-auto">
            Our platform serves learners, trainers, and organizations with tailored experiences 
            that adapt to their unique needs and goals.
          </p>
        </div>

        {/* User Types Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {userTypes.map((userType, index) => (
            <UserTypeCard
              key={index}
              userType={userType}
              index={index}
              isActive={activeCard === index}
            />
          ))}
        </div>

        {/* Active User Type Details */}
        <div className="card-gradient max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-neutral-text dark:text-neutral-text mb-4">
              {userTypes[activeCard].role} Experience
            </h3>
            <p className="text-neutral-text2 dark:text-neutral-text2">
              Discover how our platform empowers {userTypes[activeCard].role.toLowerCase()}s to achieve their goals.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-neutral-text dark:text-neutral-text">
                Key Features
              </h4>
              <div className="space-y-3">
                {userTypes[activeCard].features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-sm">
                      ✓
                    </div>
                    <span className="text-neutral-text2 dark:text-neutral-text2">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-neutral-text dark:text-neutral-text">
                Success Metrics
              </h4>
              <div className="space-y-4">
                {Object.entries(userTypes[activeCard].stats).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-neutral-text2 dark:text-neutral-text2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="text-lg font-bold text-neutral-text dark:text-neutral-text">
                        {value}
                      </div>
                      <div className="w-2 h-2 bg-accent-green rounded-full motion-safe:animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <button className="btn-primary px-8 py-3 text-lg font-semibold">
              Get Started as {userTypes[activeCard].role}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserTypesSection;
