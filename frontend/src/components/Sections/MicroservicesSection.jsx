import React from 'react';

const MicroservicesSection = () => {
  const microservices = [
    {
      name: 'Learning Analytics Engine',
      description: 'Advanced analytics and insights for learning patterns',
      icon: '📊',
      status: 'active',
      features: ['Real-time tracking', 'Predictive analytics', 'Custom reports'],
    },
    {
      name: 'AI Recommendation System',
      description: 'Personalized learning recommendations powered by ML',
      icon: '🤖',
      status: 'active',
      features: ['Smart suggestions', 'Content matching', 'Progress optimization'],
    },
    {
      name: 'Content Management API',
      description: 'Comprehensive content organization and delivery',
      icon: '📚',
      status: 'active',
      features: ['Multi-format support', 'Version control', 'Access management'],
    },
    {
      name: 'User Authentication Service',
      description: 'Secure authentication and authorization system',
      icon: '🔐',
      status: 'active',
      features: ['SSO integration', 'Role-based access', 'Security monitoring'],
    },
    {
      name: 'Notification Service',
      description: 'Real-time notifications and communication hub',
      icon: '🔔',
      status: 'active',
      features: ['Multi-channel delivery', 'Smart scheduling', 'Preference management'],
    },
    {
      name: 'Assessment Engine',
      description: 'Intelligent assessment and evaluation system',
      icon: '📝',
      status: 'active',
      features: ['Adaptive testing', 'Auto-grading', 'Performance analysis'],
    },
  ];

  const MicroserviceCard = ({ service, index }) => (
    <div className="card-gradient group hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-blue focus:scale-105">
      {/* Floating Icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center text-3xl motion-safe:animate-float mx-auto group-hover:shadow-glow transition-all duration-300">
          {service.icon}
        </div>
        {/* Status Indicator */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-green rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full motion-safe:animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-neutral-text dark:text-neutral-text mb-3">
          {service.name}
        </h3>
        <p className="text-neutral-text2 dark:text-neutral-text2 mb-6">
          {service.description}
        </p>

        {/* Features */}
        <div className="space-y-2">
          {service.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="flex items-center justify-center space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-green rounded-full"></div>
              <span className="text-sm text-neutral-text2 dark:text-neutral-text2">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Status Badge */}
        <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green border border-accent-green/20">
          <div className="w-2 h-2 bg-accent-green rounded-full mr-2 motion-safe:animate-pulse"></div>
          {service.status}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );

  return (
    <section className="py-20 bg-neutral-bg dark:bg-dark-bg2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-display-3xl font-display font-bold text-neutral-text dark:text-neutral-text mb-4">
            Microservices Architecture
          </h2>
          <p className="text-xl text-neutral-text2 dark:text-neutral-text2 max-w-3xl mx-auto">
            Built with modern microservices architecture for scalability, reliability, and maintainability. 
            Each service is independently deployable and optimized for specific functionality.
          </p>
        </div>

        {/* Microservices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {microservices.map((service, index) => (
            <MicroserviceCard key={index} service={service} index={index} />
          ))}
        </div>

        {/* Architecture Overview */}
        <div className="mt-20">
          <div className="card-gradient max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-neutral-text dark:text-neutral-text mb-4">
                System Architecture Overview
              </h3>
              <p className="text-neutral-text2 dark:text-neutral-text2">
                Our platform is built on a robust microservices architecture that ensures high availability, 
                scalability, and maintainability.
              </p>
            </div>

            {/* Architecture Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Frontend Layer */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 motion-safe:animate-float">
                  🖥️
                </div>
                <h4 className="font-semibold text-neutral-text dark:text-neutral-text mb-2">
                  Frontend Layer
                </h4>
                <p className="text-sm text-neutral-text2 dark:text-neutral-text2">
                  React-based responsive UI with real-time updates
                </p>
              </div>

              {/* API Gateway */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 motion-safe:animate-float" style={{ animationDelay: '1s' }}>
                  🌐
                </div>
                <h4 className="font-semibold text-neutral-text dark:text-neutral-text mb-2">
                  API Gateway
                </h4>
                <p className="text-sm text-neutral-text2 dark:text-neutral-text2">
                  Centralized routing, authentication, and rate limiting
                </p>
              </div>

              {/* Microservices */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 motion-safe:animate-float" style={{ animationDelay: '2s' }}>
                  ⚙️
                </div>
                <h4 className="font-semibold text-neutral-text dark:text-neutral-text mb-2">
                  Microservices
                </h4>
                <p className="text-sm text-neutral-text2 dark:text-neutral-text2">
                  Independent, scalable services for specific domains
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-green">99.9%</div>
                <div className="text-sm text-neutral-text2 dark:text-neutral-text2">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-green">&lt;100ms</div>
                <div className="text-sm text-neutral-text2 dark:text-neutral-text2">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-green">10K+</div>
                <div className="text-sm text-neutral-text2 dark:text-neutral-text2">Concurrent Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-green">24/7</div>
                <div className="text-sm text-neutral-text2 dark:text-neutral-text2">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MicroservicesSection;
