export type CourseMini = {
  id: string;
  title: string;
};

export type ExamAdmin = {
  id: string;
  title: string;
  passScore: number;
  isActive: boolean;
  courseId: string;
  course?: CourseMini;

  _count?: {
    questions?: number;
    attempts?: number;
  };
};

export type ExamQuestionAdmin = {
  id: string;
  title: string;
  order: number;
  options: ExamOptionAdmin[];
};

export type ExamOptionAdmin = {
  id: string;
  label: string;
  isCorrect: boolean;
};

export type CreateExamPayload = {
  courseId: string;
  title: string;
  passScore?: number;
  isActive?: boolean;
};

export type UpdateExamPayload = {
  title?: string;
  passScore?: number;
  isActive?: boolean;
};

export type CreateQuestionPayload = {
  title: string;
  order: number;
  options: { label: string; isCorrect: boolean }[];
};

export default ExamAdmin;
