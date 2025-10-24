import React from 'react';

const DashboardGrid = () => {
  const dashboardCards = [
    {
      title: 'Learning Analytics',
      description: 'Comprehensive insights into learning patterns and progress',
      icon: '📊',
      gradient: 'bg-gradient-primary',
      stats: { value: '2.4K', label: 'Active Learners' },
      trend: '+12%',
    },
    {
      title: 'AI Insights',
      description: 'Personalized recommendations powered by machine learning',
      icon: '🤖',
      gradient: 'bg-gradient-secondary',
      stats: { value: '847', label: 'AI Recommendations' },
      trend: '+24%',
    },
    {
      title: 'Performance Metrics',
      description: 'Track and analyze individual and team performance',
      icon: '📈',
      gradient: 'bg-gradient-accent',
      stats: { value: '94.2%', label: 'Success Rate' },
      trend: '+3%',
    },
    {
      title: 'Course Management',
      description: 'Organize and manage your learning content efficiently',
      icon: '📚',
      gradient: 'bg-gradient-primary',
      stats: { value: '156', label: 'Active Courses' },
      trend: '+8%',
    },
    {
      title: 'Skill Development',
      description: 'Identify skill gaps and create targeted learning paths',
      icon: '🎯',
      gradient: 'bg-gradient-secondary',
      stats: { value: '89', label: 'Skills Tracked' },
      trend: '+15%',
    },
    {
      title: 'User Engagement',
      description: 'Monitor user activity and engagement patterns',
      icon: '👥',
      gradient: 'bg-gradient-accent',
      stats: { value: '12.5K', label: 'Monthly Active Users' },
      trend: '+18%',
    },
  ];

  const IconTile = ({ icon, gradient, title, description, stats, trend }) => (
    <div className="card-gradient group hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-blue focus:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center text-2xl motion-safe:animate-float`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-neutral-text dark:text-neutral-text">
            {stats.value}
          </div>
          <div className="text-xs text-neutral-text2 dark:text-neutral-text2">
            {stats.label}
          </div>
          <div className="text-xs text-accent-green font-medium">
            {trend}
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-neutral-text dark:text-neutral-text mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-text2 dark:text-neutral-text2">
        {description}
      </p>
      
      {/* Hover effect indicator */}
      <div className="mt-4 w-full h-1 bg-neutral-bg3 dark:bg-neutral-bg3 rounded-full overflow-hidden">
        <div className={`h-full ${gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-neutral-bg2 dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-display-3xl font-display font-bold text-neutral-text dark:text-neutral-text mb-4">
            Personalized Dashboard
          </h2>
          <p className="text-xl text-neutral-text2 dark:text-neutral-text2 max-w-3xl mx-auto">
            Access comprehensive insights and analytics tailored to your learning journey. 
            Monitor progress, track achievements, and discover new opportunities.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dashboardCards.map((card, index) => (
            <IconTile
              key={index}
              icon={card.icon}
              gradient={card.gradient}
              title={card.title}
              description={card.description}
              stats={card.stats}
              trend={card.trend}
            />
          ))}
        </div>

        {/* Additional Stats Section */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Streak */}
          <div className="card-gradient text-center">
            <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center text-3xl mx-auto mb-4 motion-safe:animate-xp-glow">
              🔥
            </div>
            <h3 className="text-xl font-semibold text-neutral-text dark:text-neutral-text mb-2">
              Learning Streak
            </h3>
            <div className="text-3xl font-bold text-accent-orange mb-2">47</div>
            <div className="text-sm text-neutral-text2 dark:text-neutral-text2">Days in a row</div>
          </div>

          {/* XP Progress */}
          <div className="card-gradient">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-text dark:text-neutral-text">
                Experience Points
              </h3>
              <div className="text-sm text-neutral-text2 dark:text-neutral-text2">
                Level 12
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-text2 dark:text-neutral-text2">Progress to Level 13</span>
                <span className="text-neutral-text dark:text-neutral-text font-medium">2,847 / 3,200 XP</span>
              </div>
              <div className="w-full bg-neutral-bg3 dark:bg-neutral-bg3 rounded-full h-3">
                <div 
                  className="bg-gradient-accent h-3 rounded-full motion-safe:animate-xp-glow transition-all duration-1000"
                  style={{ width: '89%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recent Achievement */}
          <div className="card-gradient">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-xl">
                🏆
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-text dark:text-neutral-text">
                  Recent Achievement
                </h3>
                <div className="text-sm text-neutral-text2 dark:text-neutral-text2">
                  Master Learner
                </div>
              </div>
            </div>
            <p className="text-sm text-neutral-text2 dark:text-neutral-text2">
              Completed 10 advanced courses in the last month. Keep up the great work!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardGrid;
