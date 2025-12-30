import genAI from '../lib/geminiClient';
import { financialAnalyticsService } from './financialAnalyticsService';

/**
 * Handles common Gemini API errors with user-friendly messages.
 * @param {Error} error - The error object from the API.
 * @returns {Object} Error information with message and isInternal flag.
 */
function handleGeminiError(error) {
  if (error?.status === 401 || error?.message?.toLowerCase()?.includes("api key")) {
    return { isInternal: true, message: error?.message }
  }

  if(error?.status === 403 || error?.message?.toLowerCase()?.includes("forbidden")){
    return { isInternal: true, message: error?.message }
  }

  if(error?.status === 404 || error?.message?.toLowerCase()?.includes("not found")){
    return { isInternal: true, message: error?.message }
  }

  if(error?.status === 429 || error?.message?.toLowerCase()?.includes("rate limit exceeded")){
    return { isInternal: true, message: error?.message }
  }

  if(error?.status >= 500){
    return { isInternal: true, message: error?.message }
  }

  return {
    isInternal: false,
    message: error?.message || 'Une erreur s\'est produite lors de l\'analyse'
  }
}

/**
 * Gemini Financial Service
 * Provides AI-powered financial insights using Google Gemini
 */
export const geminiFinancialService = {
  /**
   * Analyzes transaction patterns and provides insights
   * @param {string} userId - User ID
   * @param {Object} options - Analysis options (dateRange, focusAreas)
   * @returns {Promise<Object>} AI-generated insights
   */
  async analyzeTransactionPatterns(userId, options = {}) {
    try {
      if (!genAI) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
      }

      const { startDate, endDate, focusAreas = ['all'] } = options;
      
      // Fetch transaction data
      const transactions = await financialAnalyticsService?.getTransactions(userId, {
        startDate,
        endDate
      });

      if (!transactions || transactions?.length === 0) {
        return {
          success: false,
          message: 'Aucune transaction trouvée pour la période sélectionnée'
        };
      }

      // Prepare data for AI analysis
      const transactionSummary = this._prepareTransactionSummary(transactions);
      
      // Generate AI prompt
      let prompt = this._buildAnalysisPrompt(transactionSummary, focusAreas);
      
      // Call Gemini API
      const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model?.generateContent(prompt);
      const response = await result?.response;
      const analysisText = response?.text();
      
      // Parse and structure the response
      const insights = this._parseInsights(analysisText);
      
      return {
        success: true,
        insights,
        rawAnalysis: analysisText,
        transactionCount: transactions?.length,
        analysisDate: new Date()?.toISOString()
      };
      
    } catch (error) {
      const errorInfo = handleGeminiError(error);
      if (errorInfo?.isInternal) {
        console.log('Error in transaction pattern analysis:', errorInfo?.message);
      } else {
        console.error('Error in transaction pattern analysis:', error);
      }
      throw new Error(errorInfo.message);
    }
  },

  /**
   * Identifies spending trends and anomalies
   * @param {string} userId - User ID
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Spending trends analysis
   */
  async identifySpendingTrends(userId, options = {}) {
    try {
      if (!genAI) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
      }

      const { startDate, endDate, compareWithPrevious = true } = options;
      
      // Fetch current period data
      const currentTransactions = await financialAnalyticsService?.getTransactions(userId, {
        startDate,
        endDate
      });

      let previousTransactions = [];
      if (compareWithPrevious) {
        const daysDiff = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const prevStartDate = new Date(new Date(startDate).getTime() - (daysDiff * 24 * 60 * 60 * 1000))?.toISOString()?.split('T')?.[0];
        const prevEndDate = new Date(new Date(startDate).getTime() - (24 * 60 * 60 * 1000))?.toISOString()?.split('T')?.[0];
        
        previousTransactions = await financialAnalyticsService?.getTransactions(userId, {
          startDate: prevStartDate,
          endDate: prevEndDate
        });
      }

      // Prepare trend analysis data
      const trendData = this._prepareTrendData(currentTransactions, previousTransactions);
      
      // Generate AI prompt for trend analysis
      let prompt = this._buildTrendAnalysisPrompt(trendData);
      
      // Call Gemini API
      const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model?.generateContent(prompt);
      const response = await result?.response;
      const trendAnalysis = response?.text();
      
      return {
        success: true,
        trends: this._parseTrends(trendAnalysis),
        rawAnalysis: trendAnalysis,
        comparisonPeriod: compareWithPrevious,
        analysisDate: new Date()?.toISOString()
      };
      
    } catch (error) {
      const errorInfo = handleGeminiError(error);
      if (errorInfo?.isInternal) {
        console.log('Error in spending trends analysis:', errorInfo?.message);
      } else {
        console.error('Error in spending trends analysis:', error);
      }
      throw new Error(errorInfo.message);
    }
  },

  /**
   * Generates actionable financial recommendations
   * @param {string} userId - User ID
   * @param {Object} options - Recommendation options
   * @returns {Promise<Object>} Financial recommendations
   */
  async generateRecommendations(userId, options = {}) {
    try {
      if (!genAI) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
      }

      const { startDate, endDate, goals = [] } = options;
      
      // Fetch comprehensive financial data
      const transactions = await financialAnalyticsService?.getTransactions(userId, {
        startDate,
        endDate
      });

      const budgets = await financialAnalyticsService?.getBudgetPlans(userId, {
        isActive: true
      });

      const trends = await financialAnalyticsService?.getFinancialTrends(userId);
      
      // Prepare comprehensive data
      const financialOverview = this._prepareFinancialOverview(transactions, budgets, trends);
      
      // Generate AI prompt for recommendations
      let prompt = this._buildRecommendationPrompt(financialOverview, goals);
      
      // Call Gemini API with higher quality model for recommendations
      const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-pro' });
      const result = await model?.generateContent(prompt);
      const response = await result?.response;
      const recommendationsText = response?.text();
      
      return {
        success: true,
        recommendations: this._parseRecommendations(recommendationsText),
        rawAnalysis: recommendationsText,
        goalsConsidered: goals?.length,
        analysisDate: new Date()?.toISOString()
      };
      
    } catch (error) {
      const errorInfo = handleGeminiError(error);
      if (errorInfo?.isInternal) {
        console.log('Error generating recommendations:', errorInfo?.message);
      } else {
        console.error('Error generating recommendations:', error);
      }
      throw new Error(errorInfo.message);
    }
  },

  /**
   * Streaming analysis for real-time insights
   * @param {string} userId - User ID
   * @param {Object} options - Analysis options
   * @param {Function} onChunk - Callback for each streamed chunk
   */
  async streamFinancialAnalysis(userId, options = {}, onChunk) {
    try {
      if (!genAI) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
      }

      const { startDate, endDate, analysisType = 'comprehensive' } = options;
      
      // Fetch data
      const transactions = await financialAnalyticsService?.getTransactions(userId, {
        startDate,
        endDate
      });

      const transactionSummary = this._prepareTransactionSummary(transactions);
      let prompt = this._buildStreamingPrompt(transactionSummary, analysisType);
      
      // Stream from Gemini
      const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model?.generateContentStream(prompt);

      for await (const chunk of result?.stream) {
        const text = chunk?.text();
        if (text) {
          onChunk(text);
        }
      }
      
    } catch (error) {
      const errorInfo = handleGeminiError(error);
      if (errorInfo?.isInternal) {
        console.log('Error in streaming analysis:', errorInfo?.message);
      } else {
        console.error('Error in streaming analysis:', error);
      }
      throw new Error(errorInfo.message);
    }
  },

  // ============================================================
  // PRIVATE HELPER METHODS
  // ============================================================

  _prepareTransactionSummary(transactions) {
    const summary = {
      totalTransactions: transactions?.length,
      revenue: 0,
      expenses: 0,
      byCategory: {},
      byMonth: {},
      averageTransactionSize: 0
    };

    transactions?.forEach(tx => {
      const amount = parseFloat(tx?.amount);
      const category = tx?.transactionCategory || 'other';
      const month = new Date(tx.transactionDate)?.toISOString()?.slice(0, 7);

      if (tx?.transactionType === 'income') {
        summary.revenue += amount;
      } else {
        summary.expenses += amount;
      }

      summary.byCategory[category] = (summary?.byCategory?.[category] || 0) + amount;
      summary.byMonth[month] = (summary?.byMonth?.[month] || 0) + amount;
    });

    summary.averageTransactionSize = (summary?.revenue + summary?.expenses) / transactions?.length;
    summary.netIncome = summary?.revenue - summary?.expenses;

    return summary;
  },

  _prepareTrendData(currentTransactions, previousTransactions) {
    const current = this._prepareTransactionSummary(currentTransactions);
    const previous = previousTransactions?.length > 0 
      ? this._prepareTransactionSummary(previousTransactions)
      : null;

    const trendData = { current };

    if (previous) {
      trendData.previous = previous;
      trendData.changes = {
        revenueChange: ((current?.revenue - previous?.revenue) / previous?.revenue * 100)?.toFixed(2),
        expenseChange: ((current?.expenses - previous?.expenses) / previous?.expenses * 100)?.toFixed(2),
        netIncomeChange: ((current?.netIncome - previous?.netIncome) / (previous?.netIncome || 1) * 100)?.toFixed(2)
      };
    }

    return trendData;
  },

  _prepareFinancialOverview(transactions, budgets, trends) {
    const transactionSummary = this._prepareTransactionSummary(transactions);
    
    return {
      transactions: transactionSummary,
      budgets: budgets?.map(b => ({
        name: b?.budgetName,
        category: b?.category,
        planned: b?.plannedAmount,
        period: b?.budgetPeriod
      })),
      trends: trends?.slice(0, 5)?.map(t => ({
        type: t?.trendType,
        direction: t?.trendDirection,
        description: t?.description
      }))
    };
  },

  _buildAnalysisPrompt(summary, focusAreas) {
    return `Tu es un expert en analyse financière pour les entreprises françaises. Analyse les données de transactions suivantes et fournis des insights détaillés en français.

**Données financières:**
- Total des transactions: ${summary?.totalTransactions}
- Revenus totaux: ${summary?.revenue?.toFixed(2)} €
- Dépenses totales: ${summary?.expenses?.toFixed(2)} €
- Résultat net: ${summary?.netIncome?.toFixed(2)} €
- Taille moyenne des transactions: ${summary?.averageTransactionSize?.toFixed(2)} €

**Répartition par catégorie:**
${Object.entries(summary?.byCategory)?.map(([cat, amount]) => `- ${cat}: ${amount?.toFixed(2)} €`)?.join('\n')}

**Répartition mensuelle:**
${Object.entries(summary?.byMonth)?.map(([month, amount]) => `- ${month}: ${amount?.toFixed(2)} €`)?.join('\n')}

**Domaines d'analyse demandés:** ${focusAreas?.join(', ')}

Fournis une analyse structurée avec:
1. **Aperçu général** - Résumé de la santé financière
2. **Points clés** - 3-5 observations importantes
3. **Risques identifiés** - Problèmes potentiels
4. **Opportunités** - Domaines d'amélioration

Utilise des termes comptables français et fournis des chiffres précis.`;
  },

  _buildTrendAnalysisPrompt(trendData) {
    const hasComparison = !!trendData?.previous;
    
    let prompt = `Tu es un expert en analyse de tendances financières. Analyse les données suivantes et identifie les tendances importantes en français.

**Période actuelle:**
- Revenus: ${trendData?.current?.revenue?.toFixed(2)} €
- Dépenses: ${trendData?.current?.expenses?.toFixed(2)} €
- Résultat net: ${trendData?.current?.netIncome?.toFixed(2)} €`;

    if (hasComparison) {
      prompt += `

**Période précédente:**
- Revenus: ${trendData?.previous?.revenue?.toFixed(2)} €
- Dépenses: ${trendData?.previous?.expenses?.toFixed(2)} €
- Résultat net: ${trendData?.previous?.netIncome?.toFixed(2)} €

**Évolutions:**
- Revenus: ${trendData?.changes?.revenueChange}%
- Dépenses: ${trendData?.changes?.expenseChange}%
- Résultat net: ${trendData?.changes?.netIncomeChange}%`;
    }

    prompt += `

Fournis une analyse des tendances avec:
1. **Tendances principales** - Mouvements significatifs
2. **Anomalies détectées** - Variations inhabituelles
3. **Prévisions** - Projection court terme
4. **Actions recommandées** - Mesures à prendre

Sois précis et actionnable.`;

    return prompt;
  },

  _buildRecommendationPrompt(overview, goals) {
    return `Tu es un conseiller financier expert pour les entreprises françaises. Fournis des recommandations actionables basées sur ces données.

**Situation financière:**
- Revenus: ${overview?.transactions?.revenue?.toFixed(2)} €
- Dépenses: ${overview?.transactions?.expenses?.toFixed(2)} €
- Résultat net: ${overview?.transactions?.netIncome?.toFixed(2)} €

**Budgets actifs:**
${overview?.budgets?.map(b => `- ${b?.name} (${b?.category}): ${b?.planned} € / ${b?.period}`)?.join('\n')}

**Tendances récentes:**
${overview?.trends?.map(t => `- ${t?.type}: ${t?.direction} - ${t?.description}`)?.join('\n')}

${goals?.length > 0 ? `**Objectifs:** ${goals?.join(', ')}` : ''}

Fournis des recommandations structurées avec:
1. **Actions prioritaires** - 3 actions immédiates
2. **Optimisations** - Améliorations de processus
3. **Gestion des risques** - Mesures préventives
4. **Opportunités de croissance** - Initiatives stratégiques

Chaque recommandation doit inclure:
- Impact estimé (€ ou %)
- Effort requis (faible/moyen/élevé)
- Échéance suggérée

Sois pragmatique et orienté résultats.`;
  },

  _buildStreamingPrompt(summary, analysisType) {
    return `Analyse en temps réel des données financières suivantes en français:

Revenus: ${summary?.revenue?.toFixed(2)} €
Dépenses: ${summary?.expenses?.toFixed(2)} €
Résultat net: ${summary?.netIncome?.toFixed(2)} €

Type d'analyse: ${analysisType}

Fournis une analyse complète et détaillée avec des insights actionnables.`;
  },

  _parseInsights(analysisText) {
    const insights = {
      overview: '',
      keyPoints: [],
      risks: [],
      opportunities: []
    };

    const sections = analysisText?.split(/\*\*|\n#/);
    
    sections?.forEach(section => {
      const lowerSection = section?.toLowerCase();
      
      if (lowerSection?.includes('aperçu') || lowerSection?.includes('général')) {
        insights.overview = section?.replace(/aperçu général|overview/gi, '')?.trim();
      } else if (lowerSection?.includes('points clés') || lowerSection?.includes('key points')) {
        const points = section?.split(/[-•]\s+/)?.filter(p => p?.trim()?.length > 10);
        insights.keyPoints = points?.map(p => p?.trim());
      } else if (lowerSection?.includes('risques') || lowerSection?.includes('risks')) {
        const risks = section?.split(/[-•]\s+/)?.filter(r => r?.trim()?.length > 10);
        insights.risks = risks?.map(r => r?.trim());
      } else if (lowerSection?.includes('opportunités') || lowerSection?.includes('opportunities')) {
        const opps = section?.split(/[-•]\s+/)?.filter(o => o?.trim()?.length > 10);
        insights.opportunities = opps?.map(o => o?.trim());
      }
    });

    return insights;
  },

  _parseTrends(trendAnalysis) {
    const trends = {
      mainTrends: [],
      anomalies: [],
      forecasts: [],
      actions: []
    };

    const sections = trendAnalysis?.split(/\*\*|\n#/);
    
    sections?.forEach(section => {
      const lowerSection = section?.toLowerCase();
      
      if (lowerSection?.includes('tendances principales') || lowerSection?.includes('main trends')) {
        const items = section?.split(/[-•]\s+/)?.filter(i => i?.trim()?.length > 10);
        trends.mainTrends = items?.map(i => i?.trim());
      } else if (lowerSection?.includes('anomalies')) {
        const items = section?.split(/[-•]\s+/)?.filter(i => i?.trim()?.length > 10);
        trends.anomalies = items?.map(i => i?.trim());
      } else if (lowerSection?.includes('prévisions') || lowerSection?.includes('forecasts')) {
        const items = section?.split(/[-•]\s+/)?.filter(i => i?.trim()?.length > 10);
        trends.forecasts = items?.map(i => i?.trim());
      } else if (lowerSection?.includes('actions')) {
        const items = section?.split(/[-•]\s+/)?.filter(i => i?.trim()?.length > 10);
        trends.actions = items?.map(i => i?.trim());
      }
    });

    return trends;
  },

  _parseRecommendations(recommendationsText) {
    const recommendations = {
      priority: [],
      optimizations: [],
      riskManagement: [],
      growthOpportunities: []
    };

    const sections = recommendationsText?.split(/\*\*|\n#/);
    
    sections?.forEach(section => {
      const lowerSection = section?.toLowerCase();
      
      if (lowerSection?.includes('actions prioritaires') || lowerSection?.includes('priority')) {
        const items = section?.split(/[-•]\s+/)?.filter(i => i?.trim()?.length > 10);
        recommendations.priority = items?.map(i => i?.trim());
      } else if (lowerSection?.includes('optimisations') || lowerSection?.includes('optimizations')) {
        const items = section?.split(/[-•]\s+/)?.filter(i => i?.trim()?.length > 10);
        recommendations.optimizations = items?.map(i => i?.trim());
      } else if (lowerSection?.includes('gestion des risques') || lowerSection?.includes('risk')) {
        const items = section?.split(/[-•]\s+/)?.filter(i => i?.trim()?.length > 10);
        recommendations.riskManagement = items?.map(i => i?.trim());
      } else if (lowerSection?.includes('croissance') || lowerSection?.includes('growth')) {
        const items = section?.split(/[-•]\s+/)?.filter(i => i?.trim()?.length > 10);
        recommendations.growthOpportunities = items?.map(i => i?.trim());
      }
    });

    return recommendations;
  }
};