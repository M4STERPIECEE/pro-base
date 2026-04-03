import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from '../../../../models/subject.model';
import { SubjectService, SubjectsApiResponse } from '../../../../services/subject.service';

interface KpiCard {
  label: string;
  value: string;
  icon: string;
  cardClass: string;
  iconClass: string;
  valueClass: string;
  footerIcon?: string;
  footerText?: string;
  footerClass?: string;
}

interface TableHeader {
  label: string;
  className?: string;
}

interface RowAction {
  title: string;
  icon: string;
  className: string;
}

@Component({
  selector: 'app-etudiant-subjects-content',
  standalone: false,
  templateUrl: './etudiant-subjects-content.component.html',
  styleUrl: './etudiant-subjects-content.component.css',
})
export class EtudiantSubjectsContentComponent implements OnInit, OnDestroy {
  private readonly pageSize = 5;
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;
  subjects: Subject[] = [];
  currentPage = 0;
  totalPages = 0;
  loading = true;
  errorMessage = '';
  searchTerm = '';
  filterHighCoefficientOnly = false;
  isCreateModalOpen = false;
  isSubmitting = false;
  createErrorMessage = '';
  successToastMessage = '';
  readonly subjectForm;
  statsTotalSubjects = 0;
  statsAverageCoefficient = 0;
  statsLastAudit = '03/04/2026';
  readonly tableHeaders: TableHeader[] = [
    { label: 'ID Matière' },
    { label: 'Désignation' },
    { label: 'Coefficient', className: 'text-center' },
    { label: 'Actions', className: 'text-right' },
  ];

  readonly rowActions: RowAction[] = [
    {
      title: 'Voir',
      icon: 'visibility',
      className: 'action-btn action-view',
    },
    {
      title: 'Modifier',
      icon: 'edit',
      className: 'action-btn action-edit',
    },
    {
      title: 'Supprimer',
      icon: 'delete',
      className: 'action-btn action-delete',
    },
  ];

  constructor(
    private readonly subjectService: SubjectService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.subjectForm = this.formBuilder.nonNullable.group({
      label: ['', [Validators.required, Validators.maxLength(100)]],
      coefficient: [1, [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
    this.refreshSubjects(true);
  }

  ngOnDestroy(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index);
  }

  get displayedTotalSubjects(): number {
    return this.statsTotalSubjects;
  }

  get kpiCards(): KpiCard[] {
    return [
      {
        label: 'Total Matières',
        value: String(this.displayedTotalSubjects),
        icon: 'library_books',
        cardClass: 'kpi-card kpi-blue',
        iconClass: 'material-symbols-outlined',
        valueClass: 'kpi-value',
        footerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-3.svg',
        footerText: '+3 ce semestre',
        footerClass: 'kpi-footer-positive',
      },
      {
        label: 'Moyenne coeff',
        value: this.formatCoefficient(this.statsAverageCoefficient),
        icon: 'calculate',
        cardClass: 'kpi-card kpi-violet',
        iconClass: 'material-symbols-outlined',
        valueClass: 'kpi-value',
        footerText: 'Pondération équilibrée',
      },
      {
        label: 'Dernier audit',
        value: this.statsLastAudit,
        icon: 'history',
        cardClass: 'kpi-card kpi-red',
        iconClass: 'material-symbols-outlined',
        valueClass: 'kpi-value kpi-value-date',
        footerText: 'Mis à jour le 3 Avr',
      },
    ];
  }

  loadPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.loadSubjects(page, true);
  }

  refreshSubjects(resetPage = false): void {
    const targetPage = resetPage ? 0 : this.currentPage;
    this.loadSubjects(targetPage, true);
    this.loadStats();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.loadSubjects(0, true);
  }

  toggleFilter(): void {
    this.filterHighCoefficientOnly = !this.filterHighCoefficientOnly;
    this.loadSubjects(0, true);
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
    this.createErrorMessage = '';
    this.subjectForm.reset({ label: '', coefficient: 1 });
  }

  closeCreateModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isCreateModalOpen = false;
    this.createErrorMessage = '';
    this.subjectForm.reset({ label: '', coefficient: 1 });
  }

  submitCreateSubject(): void {
    if (this.subjectForm.invalid || this.isSubmitting) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const label = this.subjectForm.controls.label.value.trim();
    const coefficient = Number(this.subjectForm.controls.coefficient.value);
    if (!label) {
      this.subjectForm.controls.label.setErrors({ required: true });
      return;
    }

    if (!Number.isFinite(coefficient) || coefficient <= 0) {
      this.subjectForm.controls.coefficient.setErrors({ min: true });
      return;
    }

    this.isSubmitting = true;
    this.createErrorMessage = '';

    this.subjectService.createSubject({ label, coefficient }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isCreateModalOpen = false;
        this.subjectForm.reset({ label: '', coefficient: 1 });
        this.showSuccessToast('Matière ajoutée avec succès.');
        this.refreshSubjects(true);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (error.status === 409) {
          this.createErrorMessage = 'Cette matière existe déjà.';
          return;
        }

        this.createErrorMessage = "Impossible d'ajouter la matière.";
      },
    });
  }

  formatCoefficient(value: number): string {
    return Number(value ?? 0).toFixed(2);
  }

  private loadSubjects(page: number, showLoader: boolean): void {
    this.loading = showLoader;
    if (showLoader) {
      this.errorMessage = '';
    }

    const minCoefficient = this.filterHighCoefficientOnly ? 3 : undefined;
    this.subjectService.getSubjects(page, this.pageSize, this.searchTerm.trim(), minCoefficient).subscribe({
      next: (response) => {
        const normalized = this.normalizeSubjectsResponse(response, page);
        this.subjects = normalized.subjects;
        this.currentPage = normalized.currentPage;
        this.totalPages = normalized.totalPages;
        this.loading = false;
      },
      error: () => {
        this.subjects = Array.isArray(this.subjects) ? this.subjects : [];
        if (this.subjects.length === 0) {
          this.errorMessage = 'Impossible de charger les matières.';
        }
        this.loading = false;
      },
    });
  }

  private loadStats(): void {
    this.subjectService.getSubjectStats().subscribe({
      next: (stats) => {
        this.statsTotalSubjects = Number(stats.totalSubjects ?? 0);
        this.statsAverageCoefficient = Number(stats.averageCoefficient ?? 0);
      },
      error: () => {
      },
    });
  }

  private normalizeSubjectsResponse(response: SubjectsApiResponse, requestedPage: number): { subjects: Subject[]; currentPage: number; totalPages: number } {
    if (Array.isArray(response)) {
      const subjects = response;
      return {
        subjects,
        currentPage: 0,
        totalPages: subjects.length > 0 ? 1 : 0,
      };
    }

    const subjects = Array.isArray(response?.content) ? response.content : [];
    const currentPage = Number.isInteger(response?.number) ? response.number : requestedPage;
    const rawTotalPages = Number(response?.totalPages ?? 0);
    const totalPages = Number.isFinite(rawTotalPages)
      ? Math.max(rawTotalPages, subjects.length > 0 ? 1 : 0)
      : (subjects.length > 0 ? 1 : 0);

    return { subjects, currentPage, totalPages };
  }

  private showSuccessToast(message: string): void {
    this.successToastMessage = message;
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }

    this.toastTimeoutId = setTimeout(() => {
      this.successToastMessage = '';
      this.toastTimeoutId = null;
    }, 1600);
  }
}
