import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, of, timeout } from 'rxjs';
import { AuditEntry, AuditStats } from '../../../../models/audit.model';
import { AuditService } from '../../../../services/audit.service';

@Component({
  selector: 'app-admin-audit-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-audit-content.component.html',
  styleUrl: './admin-audit-content.component.css',
})
export class AdminAuditContentComponent implements OnInit {
  private requestVersion = 0;
  readonly studentCodeYear = new Date().getFullYear();
  readonly pageSize = 6;

  stats: AuditStats = {
    insertCount: 0,
    updateCount: 0,
    deleteCount: 0,
    totalCount: 0,
  };

  entries: AuditEntry[] = [];
  displayedEntries: AuditEntry[] = [];

  loading = true;
  errorMessage = '';
  activeFilter: '' | 'INSERT' | 'UPDATE' | 'DELETE' = '';
  searchTerm = '';

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private readonly auditService: AuditService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.refresh(true);
  }

  refresh(forceLoader = this.entries.length === 0): void {
    this.loading = forceLoader;
    this.errorMessage = '';
    this.fetchEntriesForActiveFilter(this.currentPage, forceLoader);
    this.fetchStats();
  }

  setFilter(type: '' | 'INSERT' | 'UPDATE' | 'DELETE'): void {
    this.activeFilter = type;
    this.searchTerm = '';
    this.errorMessage = '';
    this.currentPage = 0;

    this.displayedEntries = [];
    this.loading = true;
    this.fetchEntriesForActiveFilter(0, true);
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applySearch();
  }

  goToPage(page: number): void {
    if (this.loading) return;
    if (page < 0 || page >= this.totalPages || page === this.currentPage) return;

    this.errorMessage = '';
    this.currentPage = page;
    this.displayedEntries = [];
    this.fetchEntriesForActiveFilter(page, true);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  get pageNumbers(): number[] {
    if (this.totalPages <= 1) return [];

    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    const start = Math.max(0, this.currentPage - half);
    const end = Math.min(this.totalPages, start + maxButtons);
    const adjustedStart = Math.max(0, end - maxButtons);

    return Array.from({ length: end - adjustedStart }, (_, i) => adjustedStart + i);
  }

  formatNote(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '-';
    }
    return Number(value).toFixed(2);
  }

  formatOperationLabel(operationType: string | null | undefined): string {
    const normalized = String(operationType ?? '').toUpperCase();
    if (normalized === 'INSERT') return 'AJOUT';
    if (normalized === 'UPDATE') return 'MODIFICATION';
    if (normalized === 'DELETE') return 'SUPPRESSION';
    return normalized || '-';
  }

  getOperationClass(operationType: string | null | undefined): string {
    const normalized = String(operationType ?? '').toUpperCase();
    if (normalized === 'INSERT') return 'op-insert';
    if (normalized === 'UPDATE') return 'op-update';
    if (normalized === 'DELETE') return 'op-delete';
    return '';
  }

  formatStudentDisplayId(studentId: number | null | undefined): string {
    const id = Number(studentId);
    if (!Number.isFinite(id) || id <= 0) return '-';
    return `ETU${this.studentCodeYear}${id.toString().padStart(3, '0')}`;
  }

  trackById(_: number, entry: AuditEntry): number {
    return entry.auditId;
  }

  private applySearch(): void {
    const source = this.entries;
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.displayedEntries = [...source];
      this.cdr.detectChanges();
      return;
    }

    this.displayedEntries = source.filter((entry) => {
      const studentId = String(entry.studentId ?? '').toLowerCase();
      const studentCode = this.formatStudentDisplayId(entry.studentId).toLowerCase();
      const operationType = String(entry.operationType ?? '').toLowerCase();
      const studentName = String(entry.studentName ?? '').toLowerCase();
      const subjectLabel = String(entry.subjectLabel ?? '').toLowerCase();
      const dbUser = String(entry.dbUser ?? '').toLowerCase();
      const updatedAt = String(entry.updatedAt ?? '').toLowerCase();

      return (
        studentId.includes(term) ||
        studentCode.includes(term) ||
        operationType.includes(term) ||
        studentName.includes(term) ||
        subjectLabel.includes(term) ||
        dbUser.includes(term) ||
        updatedAt.includes(term)
      );
    });

    this.cdr.detectChanges();
  }

  private normalizeEntries(entries: AuditEntry[] | null | undefined): AuditEntry[] {
    if (!Array.isArray(entries)) return [];
    return entries.map((entry) => ({
      ...entry,
      operationType: String(entry.operationType ?? '').toUpperCase(),
      studentName: entry.studentName ?? '-',
      subjectLabel: entry.subjectLabel ?? '-',
      dbUser: entry.dbUser ?? '-',
    }));
  }

  private computeStatsFromEntries(entries: AuditEntry[]): AuditStats {
    const insertCount = entries.filter((entry) => entry.operationType === 'INSERT').length;
    const updateCount = entries.filter((entry) => entry.operationType === 'UPDATE').length;
    const deleteCount = entries.filter((entry) => entry.operationType === 'DELETE').length;
    return {
      insertCount,
      updateCount,
      deleteCount,
      totalCount: entries.length,
    };
  }

  private fetchEntriesForActiveFilter(page: number, showLoader: boolean): void {
    const requestId = ++this.requestVersion;
    const type = this.activeFilter || undefined;

    if (showLoader) {
      this.loading = true;
    }

    this.auditService
      .getAuditEntries(page, this.pageSize, type)
      .pipe(timeout(10000))
      .subscribe({
        next: (response) => {
          if (requestId !== this.requestVersion) return;

          const normalized = this.normalizeEntries(response?.content ?? []);
          this.entries = normalized;
          this.totalPages = Number(response?.totalPages ?? 0);
          this.totalElements = Number(response?.totalElements ?? normalized.length);
          this.currentPage = Number(response?.number ?? page);

          this.applySearch();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          if (requestId !== this.requestVersion) return;

          this.loading = false;
          this.errorMessage =
            error.status === 403
              ? 'Accès interdit: la supervision audit est réservée au rôle ADMIN.'
              : 'Impossible de charger les données d\'audit.';
          this.cdr.detectChanges();
        },
      });
  }

  private fetchStats(): void {
    this.auditService
      .getAuditStats()
      .pipe(
        timeout(8000),
        catchError(() => of(this.computeStatsFromEntries(this.entries)))
      )
      .subscribe((stats) => {
        this.stats = {
          insertCount: Number(stats.insertCount ?? 0),
          updateCount: Number(stats.updateCount ?? 0),
          deleteCount: Number(stats.deleteCount ?? 0),
          totalCount: Number(stats.totalCount ?? 0),
        };
      });
  }
}
