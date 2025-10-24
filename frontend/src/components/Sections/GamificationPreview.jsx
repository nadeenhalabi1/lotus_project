import React from 'react';

const GamificationPreview = () => {
  const badges = [
    { name: 'First Steps', icon: '👶', description: 'Complete your first course', earned: true },
    { name: 'Quick Learner', icon: '⚡', description: 'Complete 5 courses in a week', earned: true },
    { name: 'Knowledge Seeker', icon: '🔍', description: 'Complete 20 courses', earned: true },
    { name: 'Master Scholar', icon: '🎓', description: 'Complete 50 courses', earned: false },
    { name: 'Streak Master', icon: '🔥', description: 'Maintain 30-day learning streak', earned: false },
    { name: 'Team Player', icon: '👥', description: 'Help 10 fellow learners', earned: false },
  ];

  const achievements = [
    { title: 'Course Completion', progress: 85, total: 100, xp: 250 },
    { title: 'Weekly Goal', progress: 60, total: 100, xp: 150 },
    { title: 'Skill Development', progress: 40, total: 100, xp: 100 },
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah Johnson', xp: 15420, avatar: '👩', streak: 45 },
    { rank: 2, name: 'Mike Chen', xp: 14280, avatar: '👨', streak: 38 },
    { rank: 3, name: 'Emily Davis', xp: 13890, avatar: '👩', streak: 42 },
    { rank: 4, name: 'Alex Rodriguez', xp: 12560, avatar: '👨', streak: 35 },
    { rank: 5, name: 'You', xp: 11240, avatar: '👤', streak: 28 },
  ];

  return (
    <section className="py-20 bg-neutral-bg dark:bg-dark-bg2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-display-3xl font-display font-bold text-neutral-text dark:text-neutral-text mb-4">
            Gamification Preview
          </h2>
          <p className="text-xl text-neutral-text2 dark:text-neutral-text2 max-w-3xl mx-auto">
            Stay motivated and engaged with our comprehensive gamification system featuring 
            XP points, badges, achievements, and friendly competition.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - XP Progress & Achievements */}
          <div className="space-y-8">
            {/* XP Progress Bar */}
            <div className="card-gradient">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-neutral-text dark:text-neutral-text">
                  Experience Points
                </h3>
                <div className="text-sm text-neutral-text2 dark:text-neutral-text2">
                  Level 12
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-text2 dark:text-neutral-text2">Progress to Level 13</span>
                  <span className="text-neutral-text dark:text-neutral-text font-medium">2,847 / 3,200 XP</span>
                </div>
                <div className="w-full bg-neutral-bg3 dark:bg-neutral-bg3 rounded-full h-4">
                  <div 
                    className="bg-gradient-accent h-4 rounded-full motion-safe:animate-xp-glow transition-all duration-1000"
                    style={{ width: '89%' }}
                  ></div>
                </div>
                <div className="text-center text-sm text-neutral-text2 dark:text-neutral-text2">
                  353 XP to next level
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="card-gradient">
              <h3 className="text-xl font-semibold text-neutral-text dark:text-neutral-text mb-6">
                Current Achievements
              </h3>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-text2 dark:text-neutral-text2">
                        {achievement.title}
                      </span>
                      <span className="text-neutral-text dark:text-neutral-text font-medium">
                        {achievement.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-bg3 dark:bg-neutral-bg3 rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full motion-safe:animate-progress-glow transition-all duration-1000"
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-accent-green font-medium">
                      +{achievement.xp} XP available
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Badges & Leaderboard */}
          <div className="space-y-8">
            {/* Badges */}
            <div className="card-gradient">
              <h3 className="text-xl font-semibold text-neutral-text dark:text-neutral-text mb-6">
                Badges Collection
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      badge.earned 
                        ? 'border-accent-green bg-accent-green/5' 
                        : 'border-neutral-bg3 dark:border-neutral-bg3 bg-neutral-bg2 dark:bg-neutral-bg3'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-3xl mb-2 ${badge.earned ? '' : 'grayscale opacity-50'}`}>
                        {badge.icon}
                      </div>
                      <div className={`text-sm font-semibold mb-1 ${
                        badge.earned ? 'text-neutral-text dark:text-neutral-text' : 'text-neutral-text2 dark:text-neutral-text2'
                      }`}>
                        {badge.name}
                      </div>
                      <div className="text-xs text-neutral-text2 dark:text-neutral-text2">
                        {badge.description}
                      </div>
                      {badge.earned && (
                        <div className="mt-2 text-xs text-accent-green font-medium">
                          ✓ Earned
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="card-gradient">
              <h3 className="text-xl font-semibold text-neutral-text dark:text-neutral-text mb-6">
                Leaderboard
              </h3>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                      user.name === 'You' 
                        ? 'bg-gradient-primary/10 border border-primary-blue/20' 
                        : 'bg-neutral-bg2 dark:bg-neutral-bg3'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        user.rank <= 3 
                          ? 'bg-gradient-accent text-white' 
                          : 'bg-neutral-bg3 dark:bg-neutral-bg3 text-neutral-text2 dark:text-neutral-text2'
                      }`}>
                        {user.rank}
                      </div>
                      <div className="text-lg">{user.avatar}</div>
                      <div>
                        <div className={`text-sm font-medium ${
                          user.name === 'You' 
                            ? 'text-primary-blue dark:text-primary-cyan' 
                            : 'text-neutral-text dark:text-neutral-text'
                        }`}>
                          {user.name}
                        </div>
                        <div className="text-xs text-neutral-text2 dark:text-neutral-text2">
                          {user.streak} day streak
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-neutral-text dark:text-neutral-text">
                        {user.xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="card-gradient text-center">
            <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center text-3xl mx-auto mb-4 motion-safe:animate-xp-glow">
              🏆
            </div>
            <div className="text-2xl font-bold text-neutral-text dark:text-neutral-text mb-2">47</div>
            <div className="text-sm text-neutral-text2 dark:text-neutral-text2">Badges Earned</div>
          </div>

          <div className="card-gradient text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-3xl mx-auto mb-4 motion-safe:animate-float">
              🔥
            </div>
            <div className="text-2xl font-bold text-neutral-text dark:text-neutral-text mb-2">28</div>
            <div className="text-sm text-neutral-text2 dark:text-neutral-text2">Day Streak</div>
          </div>

          <div className="card-gradient text-center">
            <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center text-3xl mx-auto mb-4 motion-safe:animate-float" style={{ animationDelay: '1s' }}>
              ⭐
            </div>
            <div className="text-2xl font-bold text-neutral-text dark:text-neutral-text mb-2">156</div>
            <div className="text-sm text-neutral-text2 dark:text-neutral-text2">Total XP</div>
          </div>

          <div className="card-gradient text-center">
            <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center text-3xl mx-auto mb-4 motion-safe:animate-float" style={{ animationDelay: '2s' }}>
              🎯
            </div>
            <div className="text-2xl font-bold text-neutral-text dark:text-neutral-text mb-2">12</div>
            <div className="text-sm text-neutral-text2 dark:text-neutral-text2">Current Level</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamificationPreview;
