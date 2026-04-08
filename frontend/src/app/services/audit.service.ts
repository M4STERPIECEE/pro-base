import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../utils/api-config';
import { AuditEntry, AuditStats } from '../models/audit.model';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly apiUrl = API_ENDPOINTS.audit.list;
  private readonly statsUrl = `${API_ENDPOINTS.audit.list}/stats`;

  constructor(private readonly http: HttpClient) {}

  getAuditEntries(page = 0, size = 6, operationType?: string): Observable<PageResponse<AuditEntry>> {
    const uniqueTs = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let params = new HttpParams()
      .set('_ts', uniqueTs)
      .set('page', page.toString())
      .set('size', size.toString());

    if (operationType) {
      params = params.set('type', operationType);
    }

    return this.http.get<PageResponse<AuditEntry>>(this.apiUrl, {
      params,
      headers: this.buildAuthHeaders(),
    });
  }

  getAuditStats(): Observable<AuditStats> {
    return this.http.get<AuditStats>(this.statsUrl, {
      headers: this.buildAuthHeaders(),
    });
  }

  private buildAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('bda_token');
    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
