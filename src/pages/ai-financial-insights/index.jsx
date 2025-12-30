import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Calendar, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { geminiFinancialService } from '../../services/geminiFinancialService';

export default function AIFinancialInsights() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState('patterns');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3))?.toISOString()?.split('T')?.[0],
    endDate: new Date()?.toISOString()?.split('T')?.[0]
  });
  const [insights, setInsights] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleAnalyze = async () => {
    if (!user?.id) {
      setError('Utilisateur non connecté');
      return;
    }

    setLoading(true);
    setError('');
    setInsights(null);
    setTrends(null);
    setRecommendations(null);

    try {
      switch (analysisType) {
        case 'patterns':
          const patternsResult = await geminiFinancialService?.analyzeTransactionPatterns(
            user?.id,
            {
              startDate: dateRange?.startDate,
              endDate: dateRange?.endDate,
              focusAreas: ['all']
            }
          );
          setInsights(patternsResult);
          break;

        case 'trends':
          const trendsResult = await geminiFinancialService?.identifySpendingTrends(
            user?.id,
            {
              startDate: dateRange?.startDate,
              endDate: dateRange?.endDate,
              compareWithPrevious: true
            }
          );
          setTrends(trendsResult);
          break;

        case 'recommendations':
          const recsResult = await geminiFinancialService?.generateRecommendations(
            user?.id,
            {
              startDate: dateRange?.startDate,
              endDate: dateRange?.endDate,
              goals: []
            }
          );
          setRecommendations(recsResult);
          break;

        case 'streaming':
          setIsStreaming(true);
          setStreamingText('');
          await geminiFinancialService?.streamFinancialAnalysis(
            user?.id,
            {
              startDate: dateRange?.startDate,
              endDate: dateRange?.endDate,
              analysisType: 'comprehensive'
            },
            (chunk) => {
              setStreamingText(prev => prev + chunk);
            }
          );
          setIsStreaming(false);
          break;
      }
    } catch (err) {
      setError(err?.message || 'Erreur lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Insights Financiers IA</h1>
                <p className="text-sm text-gray-600">Analyse intelligente avec Google Gemini</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration de l'analyse</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Analysis Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'analyse
              </label>
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="patterns">Analyse des tendances</option>
                <option value="trends">Évolution des dépenses</option>
                <option value="recommendations">Recommandations</option>
                <option value="streaming">Analyse en temps réel</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange?.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e?.target?.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange?.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e?.target?.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || isStreaming}
            className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading || isStreaming ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Analyse en cours...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Lancer l'analyse</span>
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Insights Display */}
        {insights?.success && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">Aperçu général</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{insights?.insights?.overview}</p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>{insights?.transactionCount} transactions analysées</span>
              </div>
            </div>

            {insights?.insights?.keyPoints?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Points clés</h2>
                </div>
                <ul className="space-y-3">
                  {insights?.insights?.keyPoints?.map((point, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights?.insights?.risks?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Risques identifiés</h2>
                </div>
                <ul className="space-y-3">
                  {insights?.insights?.risks?.map((risk, idx) => (
                    <li key={idx} className="flex items-start">
                      <AlertTriangle className="flex-shrink-0 w-5 h-5 text-red-500 mr-3 mt-0.5" />
                      <span className="text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights?.insights?.opportunities?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Opportunités</h2>
                </div>
                <ul className="space-y-3">
                  {insights?.insights?.opportunities?.map((opp, idx) => (
                    <li key={idx} className="flex items-start">
                      <Lightbulb className="flex-shrink-0 w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                      <span className="text-gray-700">{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Trends Display */}
        {trends?.success && (
          <div className="space-y-6">
            {trends?.trends?.mainTrends?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Tendances principales</h2>
                </div>
                <ul className="space-y-3">
                  {trends?.trends?.mainTrends?.map((trend, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700">{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {trends?.trends?.anomalies?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Anomalies détectées</h2>
                </div>
                <ul className="space-y-3">
                  {trends?.trends?.anomalies?.map((anomaly, idx) => (
                    <li key={idx} className="flex items-start">
                      <AlertTriangle className="flex-shrink-0 w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                      <span className="text-gray-700">{anomaly}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {trends?.trends?.forecasts?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Prévisions</h2>
                </div>
                <ul className="space-y-3">
                  {trends?.trends?.forecasts?.map((forecast, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700">{forecast}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {trends?.trends?.actions?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Actions recommandées</h2>
                </div>
                <ul className="space-y-3">
                  {trends?.trends?.actions?.map((action, idx) => (
                    <li key={idx} className="flex items-start">
                      <Lightbulb className="flex-shrink-0 w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Display */}
        {recommendations?.success && (
          <div className="space-y-6">
            {recommendations?.recommendations?.priority?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Actions prioritaires</h2>
                </div>
                <ul className="space-y-3">
                  {recommendations?.recommendations?.priority?.map((action, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations?.recommendations?.optimizations?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Optimisations</h2>
                </div>
                <ul className="space-y-3">
                  {recommendations?.recommendations?.optimizations?.map((opt, idx) => (
                    <li key={idx} className="flex items-start">
                      <TrendingUp className="flex-shrink-0 w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                      <span className="text-gray-700">{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations?.recommendations?.riskManagement?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Gestion des risques</h2>
                </div>
                <ul className="space-y-3">
                  {recommendations?.recommendations?.riskManagement?.map((risk, idx) => (
                    <li key={idx} className="flex items-start">
                      <AlertTriangle className="flex-shrink-0 w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                      <span className="text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations?.recommendations?.growthOpportunities?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Opportunités de croissance</h2>
                </div>
                <ul className="space-y-3">
                  {recommendations?.recommendations?.growthOpportunities?.map((opp, idx) => (
                    <li key={idx} className="flex items-start">
                      <Lightbulb className="flex-shrink-0 w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <span className="text-gray-700">{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Streaming Display */}
        {isStreaming || streamingText ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Analyse en temps réel</h2>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {streamingText}
                {isStreaming && <span className="inline-block w-2 h-4 bg-indigo-600 animate-pulse ml-1"></span>}
              </div>
            </div>
          </div>
        ) : null}

        {/* Info Box */}
        {!loading && !insights && !trends && !recommendations && !streamingText && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <Brain className="w-6 h-6 text-blue-600 mt-1 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Analyse intelligente de vos finances
                </h3>
                <p className="text-blue-800 mb-4">
                  Utilisez l'intelligence artificielle Google Gemini pour obtenir des insights approfondis sur vos transactions et recevoir des recommandations personnalisées.
                </p>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>Sélectionnez le type d'analyse et la période</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>Cliquez sur "Lancer l'analyse" pour obtenir vos insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>Explorez les différents types d'analyses disponibles</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}