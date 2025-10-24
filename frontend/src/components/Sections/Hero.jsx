import React from 'react';

const Hero = () => {
  const stats = [
    { label: 'Active Users', value: '12,543', change: '+12%' },
    { label: 'Courses Completed', value: '8,921', change: '+8%' },
    { label: 'AI Insights Generated', value: '2,847', change: '+24%' },
    { label: 'Success Rate', value: '94.2%', change: '+3%' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-emerald-50/40 to-cyan-50/40 dark:from-dark-bg dark:via-dark-bg2 dark:to-dark-bg3 motion-safe:animate-gradient-shift bg-[length:400%_400%]"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-blue rounded-full motion-safe:animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-primary-purple rounded-full motion-safe:animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-40 w-28 h-28 bg-primary-cyan rounded-full motion-safe:animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-accent-gold rounded-full motion-safe:animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-display-4xl font-display font-bold text-neutral-text dark:text-neutral-text">
                AI-Powered Learning
                <span className="block text-gradient">Management Platform</span>
              </h1>
              <p className="text-xl text-neutral-text2 dark:text-neutral-text2 max-w-2xl">
                Transform your organization's learning experience with intelligent insights, 
                personalized recommendations, and comprehensive analytics powered by cutting-edge AI.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary px-8 py-4 text-lg font-semibold">
                Get Started
              </button>
              <button className="btn-outline px-8 py-4 text-lg font-semibold">
                Watch Demo
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-neutral-text dark:text-neutral-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-text2 dark:text-neutral-text2">
                    {stat.label}
                  </div>
                  <div className="text-xs text-accent-green font-medium">
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Floating Card */}
          <div className="relative">
            <div className="card-gradient max-w-md mx-auto lg:mx-0 motion-safe:animate-background-shift">
              {/* Progress Card Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-text dark:text-neutral-text">
                  Learning Progress
                </h3>
                <div className="w-3 h-3 bg-accent-green rounded-full motion-safe:animate-pulse"></div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-text2 dark:text-neutral-text2">JavaScript Fundamentals</span>
                    <span className="text-neutral-text dark:text-neutral-text font-medium">85%</span>
                  </div>
                  <div className="w-full bg-neutral-bg3 dark:bg-neutral-bg3 rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full motion-safe:animate-progress-glow transition-all duration-1000"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-text2 dark:text-neutral-text2">React Advanced</span>
                    <span className="text-neutral-text dark:text-neutral-text font-medium">62%</span>
                  </div>
                  <div className="w-full bg-neutral-bg3 dark:bg-neutral-bg3 rounded-full h-2">
                    <div 
                      className="bg-gradient-secondary h-2 rounded-full motion-safe:animate-progress-glow transition-all duration-1000"
                      style={{ width: '62%' }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-text2 dark:text-neutral-text2">AI & Machine Learning</span>
                    <span className="text-neutral-text dark:text-neutral-text font-medium">43%</span>
                  </div>
                  <div className="w-full bg-neutral-bg3 dark:bg-neutral-bg3 rounded-full h-2">
                    <div 
                      className="bg-gradient-accent h-2 rounded-full motion-safe:animate-progress-glow transition-all duration-1000"
                      style={{ width: '43%' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Achievement Badge */}
              <div className="mt-6 p-4 bg-gradient-to-r from-accent-gold/10 to-accent-orange/10 dark:from-accent-gold/20 dark:to-accent-orange/20 rounded-lg border border-accent-gold/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🏆</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-text dark:text-neutral-text">
                      Achievement Unlocked!
                    </div>
                    <div className="text-xs text-neutral-text2 dark:text-neutral-text2">
                      Completed 5 courses this month
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-primary rounded-full motion-safe:animate-float opacity-80"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-accent rounded-full motion-safe:animate-float opacity-80" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
