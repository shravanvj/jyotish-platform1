'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BirthDataForm, type BirthFormData } from '@/components/forms/birth-data-form';
import { cn } from '@/lib/utils';

interface PersonData {
  name: string;
  birthData: BirthFormData | null;
}

interface GunaMilanScore {
  aspect: string;
  maxPoints: number;
  scoredPoints: number;
  description: string;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

interface MatchResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  recommendation: string;
  gunaScores: GunaMilanScore[];
  doshas: {
    name: string;
    present: boolean;
    severity: 'high' | 'medium' | 'low' | 'none';
    remedy?: string;
  }[];
}

// Mock match calculation
function calculateMockMatch(person1: BirthFormData, person2: BirthFormData): MatchResult {
  const gunaAspects = [
    { name: 'Varna', max: 1, desc: 'Spiritual compatibility and ego levels' },
    { name: 'Vashya', max: 2, desc: 'Mutual attraction and control' },
    { name: 'Tara', max: 3, desc: 'Birth star compatibility and health' },
    { name: 'Yoni', max: 4, desc: 'Physical and sexual compatibility' },
    { name: 'Graha Maitri', max: 5, desc: 'Mental compatibility and friendship' },
    { name: 'Gana', max: 6, desc: 'Temperament and character matching' },
    { name: 'Bhakoot', max: 7, desc: 'Love and emotional bonding' },
    { name: 'Nadi', max: 8, desc: 'Health and genetic compatibility' },
  ];

  const gunaScores: GunaMilanScore[] = gunaAspects.map(aspect => {
    const scored = Math.random() * aspect.max;
    const percentage = scored / aspect.max;
    return {
      aspect: aspect.name,
      maxPoints: aspect.max,
      scoredPoints: Math.round(scored * 10) / 10,
      description: aspect.desc,
      status: percentage >= 0.75 ? 'excellent' : percentage >= 0.5 ? 'good' : percentage >= 0.25 ? 'average' : 'poor',
    };
  });

  const totalScore = gunaScores.reduce((sum, g) => sum + g.scoredPoints, 0);
  const maxScore = 36;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const doshas = [
    {
      name: 'Manglik Dosha (Person 1)',
      present: Math.random() > 0.7,
      severity: Math.random() > 0.5 ? 'medium' : 'low',
      remedy: 'Kumbh Vivah or Mangal Shanti Puja recommended',
    },
    {
      name: 'Manglik Dosha (Person 2)',
      present: Math.random() > 0.7,
      severity: Math.random() > 0.5 ? 'medium' : 'low',
      remedy: 'Kumbh Vivah or Mangal Shanti Puja recommended',
    },
    {
      name: 'Nadi Dosha',
      present: Math.random() > 0.8,
      severity: 'high',
      remedy: 'Nadi Dosha Nivaran Puja and donation recommended',
    },
    {
      name: 'Bhakoot Dosha',
      present: Math.random() > 0.8,
      severity: 'medium',
      remedy: 'Specific planetary remedies based on chart analysis',
    },
  ];

  let recommendation = '';
  if (percentage >= 75) {
    recommendation = 'Excellent match! This is a highly compatible pairing with strong potential for a harmonious and prosperous married life.';
  } else if (percentage >= 60) {
    recommendation = 'Good match. The couple has good compatibility with minor areas that may need understanding and adjustment.';
  } else if (percentage >= 45) {
    recommendation = 'Average match. There are some compatibility concerns that should be discussed. Consider consulting an astrologer for remedies.';
  } else {
    recommendation = 'Below average compatibility. Significant differences exist that may cause challenges. Remedial measures strongly recommended before proceeding.';
  }

  return {
    totalScore: Math.round(totalScore * 10) / 10,
    maxScore,
    percentage,
    recommendation,
    gunaScores,
    doshas: doshas.map(d => ({
      ...d,
      severity: d.present ? d.severity as 'high' | 'medium' | 'low' : 'none',
    })),
  };
}

export default function MatchmakingPage() {
  const [person1, setPerson1] = useState<PersonData>({ name: '', birthData: null });
  const [person2, setPerson2] = useState<PersonData>({ name: '', birthData: null });
  const [result, setResult] = useState<MatchResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'person1' | 'person2' | 'result'>('person1');

  const handlePerson1Submit = (data: BirthFormData) => {
    setPerson1({ name: data.name || 'Person 1', birthData: data });
    setActiveTab('person2');
  };

  const handlePerson2Submit = (data: BirthFormData) => {
    setPerson2({ name: data.name || 'Person 2', birthData: data });
  };

  const handleCalculateMatch = () => {
    if (!person1.birthData || !person2.birthData) return;
    
    setIsCalculating(true);
    // Simulate API call
    setTimeout(() => {
      const matchResult = calculateMockMatch(person1.birthData!, person2.birthData!);
      setResult(matchResult);
      setIsCalculating(false);
      setActiveTab('result');
    }, 1500);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 45) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'average': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Kundli Matching
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Calculate Ashtakoot Guna Milan score and analyze compatibility 
              between two horoscopes for marriage.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('person1')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  activeTab === 'person1' 
                    ? 'bg-primary-600 text-white' 
                    : person1.birthData 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">
                  {person1.birthData ? '✓' : '1'}
                </span>
                <span className="hidden sm:inline">{person1.name || 'Person 1'}</span>
              </button>
              
              <div className="h-px w-8 bg-border" />
              
              <button
                onClick={() => person1.birthData && setActiveTab('person2')}
                disabled={!person1.birthData}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  activeTab === 'person2' 
                    ? 'bg-primary-600 text-white' 
                    : person2.birthData 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-muted text-muted-foreground',
                  !person1.birthData && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">
                  {person2.birthData ? '✓' : '2'}
                </span>
                <span className="hidden sm:inline">{person2.name || 'Person 2'}</span>
              </button>
              
              <div className="h-px w-8 bg-border" />
              
              <button
                onClick={() => result && setActiveTab('result')}
                disabled={!result}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  activeTab === 'result' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-muted text-muted-foreground',
                  !result && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">
                  3
                </span>
                <span className="hidden sm:inline">Results</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mt-8">
            {/* Person 1 Form */}
            {activeTab === 'person1' && (
              <div className="max-w-2xl mx-auto">
                <div className="card-vedic p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Enter First Person's Details
                  </h2>
                  <BirthDataForm
                    onSubmit={handlePerson1Submit}
                    submitLabel="Continue to Person 2"
                    showName={true}
                  />
                </div>
              </div>
            )}

            {/* Person 2 Form */}
            {activeTab === 'person2' && (
              <div className="max-w-2xl mx-auto">
                <div className="card-vedic p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Enter Second Person's Details
                  </h2>
                  <BirthDataForm
                    onSubmit={handlePerson2Submit}
                    submitLabel="Save Details"
                    showName={true}
                  />
                  
                  {person2.birthData && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <button
                        onClick={handleCalculateMatch}
                        disabled={isCalculating}
                        className="w-full rounded-lg bg-secondary-600 px-4 py-3 text-sm font-medium text-white hover:bg-secondary-700 disabled:opacity-50 transition-colors"
                      >
                        {isCalculating ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Calculating Compatibility...
                          </span>
                        ) : (
                          '💍 Calculate Match Compatibility'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results */}
            {activeTab === 'result' && result && (
              <div className="space-y-6">
                {/* Score Summary */}
                <div className="card-vedic p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">💑</div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          {person1.name} & {person2.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">Ashtakoot Guna Milan</p>
                      </div>
                    </div>
                    
                    <div className="text-center md:text-right">
                      <p className={cn('text-4xl font-bold', getScoreColor(result.percentage))}>
                        {result.totalScore} / {result.maxScore}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.percentage}% Compatibility
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-1000',
                          result.percentage >= 75 ? 'bg-green-500' :
                          result.percentage >= 60 ? 'bg-blue-500' :
                          result.percentage >= 45 ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                        style={{ width: `${result.percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <p className="mt-4 text-sm text-foreground">
                    {result.recommendation}
                  </p>
                </div>

                {/* Guna Scores Grid */}
                <div className="card-vedic p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Ashtakoot Details
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {result.gunaScores.map((guna) => (
                      <div key={guna.aspect} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{guna.aspect}</h4>
                          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(guna.status))}>
                            {guna.scoredPoints}/{guna.maxPoints}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{guna.description}</p>
                        <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              guna.status === 'excellent' ? 'bg-green-500' :
                              guna.status === 'good' ? 'bg-blue-500' :
                              guna.status === 'average' ? 'bg-yellow-500' : 'bg-red-500'
                            )}
                            style={{ width: `${(guna.scoredPoints / guna.maxPoints) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doshas Analysis */}
                <div className="card-vedic p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Dosha Analysis
                  </h3>
                  <div className="space-y-4">
                    {result.doshas.map((dosha, index) => (
                      <div
                        key={index}
                        className={cn(
                          'p-4 rounded-lg',
                          dosha.present 
                            ? dosha.severity === 'high' 
                              ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                              : 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800'
                            : 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {dosha.present ? '⚠️' : '✅'}
                            </span>
                            <div>
                              <h4 className="font-medium text-foreground">{dosha.name}</h4>
                              {dosha.present && (
                                <p className="text-xs text-muted-foreground">
                                  Severity: {dosha.severity.charAt(0).toUpperCase() + dosha.severity.slice(1)}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            dosha.present 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          )}>
                            {dosha.present ? 'Present' : 'Not Present'}
                          </span>
                        </div>
                        {dosha.present && dosha.remedy && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            <strong>Remedy:</strong> {dosha.remedy}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setPerson1({ name: '', birthData: null });
                      setPerson2({ name: '', birthData: null });
                      setResult(null);
                      setActiveTab('person1');
                    }}
                    className="px-6 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-muted transition-colors"
                  >
                    Start New Match
                  </button>
                  <button className="px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                    Download Report (PDF)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
