import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TrendingTopicResponse {
  topic: string;
  mentionCount: number;
  competitorName?: string;
  period: string;
  generatedAt: string;
}

export interface SentimentDistributionResponse {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  competitorName?: string;
}

export interface SignalsByAgentResponse {
  agentType: string;
  count: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

export interface DashboardAnalyticsResponse {
  trendingTopics: TrendingTopicResponse[];
  sentimentDistribution: SentimentDistributionResponse;
  totalSignalsThisWeek: number;
  totalCompetitors: number;
  totalAgentRunsToday: number;
  totalReportsGenerated: number;
  signalsByAgent: SignalsByAgentResponse[];
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private baseUrl = environment.apiUrl + '/analytics';

  constructor(private http: HttpClient) {}

  getDashboardAnalytics(): Observable<DashboardAnalyticsResponse> {
    return this.http.get<DashboardAnalyticsResponse>(
      `${this.baseUrl}/dashboard`
    );
  }

  getTrendingTopics(
    topN: number = 10,
    competitorId?: string
  ): Observable<TrendingTopicResponse[]> {
    let url = `${this.baseUrl}/trending?topN=${topN}`;
    if (competitorId) {
      url += `&competitorId=${competitorId}`;
    }
    return this.http.get<TrendingTopicResponse[]>(url);
  }

  getSentimentDistribution(
    days: number = 7,
    competitorId?: string
  ): Observable<SentimentDistributionResponse> {
    let url = `${this.baseUrl}/sentiment?days=${days}`;
    if (competitorId) {
      url += `&competitorId=${competitorId}`;
    }
    return this.http.get<SentimentDistributionResponse>(url);
  }

  generateTrendingTopics(): Observable<any> {
    return this.http.post(`${this.baseUrl}/trending/generate`, {});
  }
}
