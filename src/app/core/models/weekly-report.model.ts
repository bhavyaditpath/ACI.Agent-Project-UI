export interface WeeklyReport {
  id: string;
  competitorId: string;
  competitorName: string;
  title: string;
  summary: string;
  fullReport: string;
  keyInsights: string[];
  recommendations: string[];
  totalSignalsAnalyzed: number;
  weekStartDate: string;
  weekEndDate: string;
  generatedAt: string;
}

export interface WeeklyReportRequest {
  competitorId: string;
  weekStartDate: string;
  weekEndDate: string;
}
