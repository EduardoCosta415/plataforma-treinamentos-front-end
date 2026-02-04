import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

type CourseItem = {
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: number;
  lessons: number;
};

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  // dropdown do header
  showMenu = false;

  // estados do formulário
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // ano do footer
  year = new Date().getFullYear();

  // formulário
  form: FormGroup;

  // WhatsApp (troque pelo real)
  private whatsappNumber = '5531999999999';
  private whatsappMessage = 'Olá! Tenho interesse na plataforma LAENA. Pode me passar mais detalhes?';

  // ======= CAROUSEL (Cursos) =======
  courses: CourseItem[] = [
    { title: 'NR 10 — Segurança em Instalações Elétricas', description: 'Treinamento completo com aulas, prova e certificado automático. Ideal para equipes técnicas.', level: 'Mais vendido', duration: '⏱ 2h 30m', modules: 6, lessons: 18 },
    { title: 'Integração de Segurança (Admissional)', description: 'Padronize a integração de novos colaboradores com trilha de aprendizagem e registro.', level: 'Essencial', duration: '⏱ 1h 20m', modules: 4, lessons: 10 },
    { title: 'Boas Práticas de Qualidade', description: 'Treine times de produção com conteúdo prático, prova por curso e acompanhamento.', level: 'Recomendado', duration: '⏱ 3h 10m', modules: 7, lessons: 22 },
    { title: 'NR 35 — Trabalho em Altura', description: 'Conteúdo objetivo com avaliação e emissão de certificado. Perfeito para rotinas operacionais.', level: 'Alta demanda', duration: '⏱ 2h 05m', modules: 5, lessons: 14 },
    { title: 'LGPD para Times', description: 'Treinamento prático para conscientização e boas práticas de proteção de dados.', level: 'Compliance', duration: '⏱ 1h 45m', modules: 5, lessons: 12 },
    { title: '5S na Prática', description: 'Melhore organização, produtividade e padronização do ambiente com prova por curso.', level: 'Operação', duration: '⏱ 1h 10m', modules: 3, lessons: 9 },
    { title: 'Atendimento ao Cliente', description: 'Treine equipe com aulas curtas e prova, focando padronização e qualidade no atendimento.', level: 'Vendas', duration: '⏱ 2h 00m', modules: 6, lessons: 16 },
    { title: 'Segurança Comportamental', description: 'Reduza incidentes com cultura e rotina de segurança aplicada no dia a dia.', level: 'SST', duration: '⏱ 2h 40m', modules: 6, lessons: 20 },
    { title: 'Gestão de Tempo', description: 'Organize prioridades e rotina com conteúdos práticos e acompanhamento.', level: 'Produtividade', duration: '⏱ 1h 30m', modules: 4, lessons: 11 },
    { title: 'Liderança para Supervisores', description: 'Treinamento direto para líderes de linha: comunicação, feedback e gestão.', level: 'Gestão', duration: '⏱ 3h 00m', modules: 7, lessons: 21 },
    { title: 'Prevenção de Acidentes', description: 'Treinamento essencial com prova e certificado para reforçar normas e condutas.', level: 'Essencial', duration: '⏱ 1h 55m', modules: 4, lessons: 13 },
    { title: 'Normas Internas da Empresa', description: 'Centralize conteúdo interno e registre prova/certificado por colaborador.', level: 'Interno', duration: '⏱ 1h 00m', modules: 3, lessons: 8 },
    { title: 'CIPA — Noções Fundamentais', description: 'Treinamento base para comissão interna, com conteúdo e avaliação.', level: 'SST', duration: '⏱ 2h 15m', modules: 5, lessons: 15 },
    { title: 'Boas Práticas de Higiene', description: 'Conteúdo rápido para padronização de processos e segurança operacional.', level: 'Operação', duration: '⏱ 55m', modules: 3, lessons: 7 },
    { title: 'Ética & Conduta', description: 'Treinamento de compliance para reforçar cultura, regras e responsabilidade.', level: 'Compliance', duration: '⏱ 1h 25m', modules: 4, lessons: 10 },
  ];

  courseIndex = 0;     // índice de "página"
  cardsPerView = 3;    // 3 desktop, 2 tablet, 1 mobile
  stepPercent = 33.333333; // 100 / cardsPerView

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // define quantos cards por view no carregamento
    this.updateCarouselLayout();
  }

  // fecha dropdown com ESC
  @HostListener('document:keydown.escape')
  onEsc() {
    this.showMenu = false;
  }

  // fecha dropdown ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement | null;
    if (!target) return;

    const dropdown = target.closest?.('.dropdown');
    if (!dropdown) this.showMenu = false;
  }

  // recalcula layout do carrossel ao redimensionar
  @HostListener('window:resize')
  onResize() {
    this.updateCarouselLayout();
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  goPlans() {
    this.showMenu = false;
    this.scrollToId('plans');
  }

  goCourses() {
    this.showMenu = false;
    this.scrollToId('courses');
  }

  openSignup() {
    this.showMenu = false;
    this.scrollToId('signup');
  }

  goLogin() {
    this.showMenu = false;
    // ajuste se seu login for outro path
    this.router.navigate(['/login']);
  }

  openWhatsApp() {
    const url =
      `https://wa.me/${this.whatsappNumber}` +
      `?text=${encodeURIComponent(this.whatsappMessage)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  submit() {
    this.error = null;
    this.success = null;

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.error = 'Preencha os campos corretamente.';
      return;
    }

    this.loading = true;

    // mock seguro: troque pela API real depois
    setTimeout(() => {
      this.loading = false;
      this.success = 'Cadastro realizado! Redirecionando...';
      this.router.navigate(['/login']);
    }, 900);
  }

  // ======= CAROUSEL METHODS =======
  get maxCourseIndex() {
    // quantas "páginas" existem (baseado em cardsPerView)
    const pagesCount = Math.max(1, Math.ceil(this.courses.length / this.cardsPerView));
    return pagesCount - 1;
  }

  get pages() {
    const pagesCount = Math.max(1, Math.ceil(this.courses.length / this.cardsPerView));
    return Array.from({ length: pagesCount });
  }

  prevCourse() {
    this.courseIndex = Math.max(0, this.courseIndex - 1);
  }

  nextCourse() {
    this.courseIndex = Math.min(this.maxCourseIndex, this.courseIndex + 1);
  }

  goCourse(i: number) {
    this.courseIndex = Math.max(0, Math.min(this.maxCourseIndex, i));
  }

  private updateCarouselLayout() {
    const w = window.innerWidth;

    // 3 no desktop, 2 no tablet, 1 no celular
    if (w <= 640) this.cardsPerView = 1;
    else if (w <= 980) this.cardsPerView = 2;
    else this.cardsPerView = 3;

    this.stepPercent = 100 / this.cardsPerView;

    // garante que não fique em uma página inválida ao mudar o tamanho
    if (this.courseIndex > this.maxCourseIndex) this.courseIndex = this.maxCourseIndex;
  }

  private scrollToId(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
