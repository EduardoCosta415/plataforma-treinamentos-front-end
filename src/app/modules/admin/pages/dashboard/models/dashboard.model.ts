export type DashboardSummary = {
  totalStudents: number;
  totalCourses: number;
  totalLessons: number;
  completionRate: number;
};

export type StudentsPerMonth = {
  month: string;
  total: number;
};

export type CourseProgress = {
  course: string;
  completed: number;
  total: number;
};
