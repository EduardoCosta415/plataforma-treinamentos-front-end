import { Component, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexFill,
  ApexStroke,
  ApexTooltip,
  ApexGrid,
} from 'ng-apexcharts';

import { DashboardApiService } from '../../services/dashboard-api.service';
import { DashboardSummary, CourseProgress } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.scss'],
})
export class DashboardPageComponent implements OnInit {
  // =========================
  // STATE
  // =========================
  loading = false;
  error = '';

  summary!: DashboardSummary;

  // =========================
  // CHART: Students / Month (Area)
  // =========================
  studentsSeries: ApexAxisChartSeries = [];
  studentsChart: ApexChart = {
    type: 'area',
    height: 320,
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
  };

  studentsXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  studentsYAxis: ApexYAxis = {
    labels: {
      style: { colors: '#94a3b8', fontSize: '12px' },
      formatter: (value) => Math.round(value).toString(),
    },
  };

  studentsStroke: ApexStroke = {
    curve: 'smooth',
    width: 3,
    colors: ['#c8921a'],
  };

  studentsFill: ApexFill = {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: ['#c8921a'],
      opacityFrom: 0.7,
      opacityTo: 0.1,
      stops: [0, 100],
    },
  };

  studentsDataLabels: ApexDataLabels = { enabled: false };

  studentsTooltip: ApexTooltip = {
    theme: 'dark',
    y: { formatter: (value) => `${value} alunos` },
  };

  studentsGrid: ApexGrid = {
    borderColor: '#334155',
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  };

  // =========================
  // CHART: Course progress (Bar horizontal)
  // =========================
  progressSeries: ApexAxisChartSeries = [];

  progressChart: ApexChart = {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
  };

  progressPlot: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 8,
      barHeight: '65%',
      distributed: true,
    },
  };

  progressXAxis: ApexXAxis = {
    labels: {
      style: { colors: '#94a3b8', fontSize: '12px' },
      formatter: (value) => `${value}%`,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  progressYAxis: ApexYAxis = {
    labels: {
      style: { colors: '#94a3b8', fontSize: '13px', fontWeight: 600 as any },
    },
  };

  progressDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (value) => `${value}%`,
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
      colors: ['#1e293b'],
    },
    offsetX: -10,
  };

  progressTooltip: ApexTooltip = {
    theme: 'dark',
    y: { formatter: (value) => `${value}% concluído` },
  };

  progressGrid: ApexGrid = {
    borderColor: '#334155',
    strokeDashArray: 3,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
  };

  progressColors: string[] = ['#c8921a', '#10b981', '#3b82f6', '#ef4444'];

  constructor(private api: DashboardApiService) {}

  // =========================
  // LIFECYCLE
  // =========================
  ngOnInit(): void {
    this.loadAll();
  }

  // =========================
  // LOADERS (API)
  // =========================
  private loadAll(): void {
    this.loading = true;
    this.error = '';

    // 1) Summary (cards)
    this.api.getSummary().subscribe({
      next: (res) => {
        this.summary = res;
      },
      error: (err) => {
        console.log('DASH SUMMARY ERROR =>', err);
        this.error = 'Erro ao carregar resumo do dashboard';
      },
    });

    // 2) Students per month (area)
    this.api.getStudentsPerMonth(6).subscribe({
      next: (data) => {
        this.studentsSeries = [
          {
            name: 'Novos Alunos',
            data: data.map((d) => d.total),
          },
        ];

        this.studentsXAxis = {
          ...this.studentsXAxis,
          categories: data.map((d) => d.month),
        };
      },
      error: (err) => {
        console.log('STUDENTS CHART ERROR =>', err);
        this.error = 'Erro ao carregar gráfico de alunos';
      },
      complete: () => {
        this.loading = false;
      },
    });

    // 3) Course progress (bar)
    this.api.getCourseProgress(8).subscribe({
      next: (data: CourseProgress[]) => {
        this.progressSeries = [
          {
            name: 'Progresso',
            data: data.map((c) => ({
              x: c.course,
              y: this.toPercent(c.completed, c.total),
            })),
          },
        ];
      },
      error: (err) => {
        console.log('PROGRESS CHART ERROR =>', err);
        this.error = 'Erro ao carregar gráfico de progresso';
      },
    });
  }

  // =========================
  // HELPERS
  // =========================
  private toPercent(completed: number, total: number): number {
    if (!total || total <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
  }

  getKpiIcon(label: string): string {
    const icons: Record<string, string> = {
      Alunos: '👥',
      Cursos: '📚',
      Aulas: '🎓',
      Conclusão: '✅',
    };
    return icons[label] || '📊';
  }
}
