// Temporary stub for GamificationContext during deployment
import React, { createContext, useContext, ReactNode } from 'react';

const GamificationContext = createContext<any>({
  state: { user: null, achievements: [], challenges: [], theme: {}, isLoading: false, error: null },
  actions: {
    unlockAchievement: async () => {},
    completeChallenge: async () => {},
    addXP: async () => {},
    awardXP: async () => {},
    logActivity: async () => {},
    setTheme: () => {}
  }
});

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const value = {
    state: { 
      user: { 
        id: 'stub', 
        level: 1, 
        totalXP: 0, 
        currentStreak: 0,
        currentLevelXP: 0,
        nextLevelXP: 100,
        stats: { achievementsUnlocked: 0, challengesCompleted: 0, currentStreak: 0, pointsEarned: 0 }
      }, 
      achievements: [], 
      challenges: [], 
      theme: {}, 
      isLoading: false, 
      error: null 
    },
    actions: {
      unlockAchievement: async () => {},
      completeChallenge: async () => {},
      addXP: async () => {},
      awardXP: async () => {},
      logActivity: async () => {},
      setTheme: () => {}
    }
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => useContext(GamificationContext);

export default GamificationProvider;