import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from '../models/subject.model';
import { API_ENDPOINTS } from '../utils/api-config';

interface CreateSubjectRequest {
  label: string;
  coefficient: number;
}

interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type SubjectsApiResponse = PageResponse<Subject> | Subject[];

interface SubjectStatsResponse {
  totalSubjects: number;
  averageCoefficient: number;
}

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private readonly apiUrl = API_ENDPOINTS.subjects.list;
  private readonly statsUrl = `${API_ENDPOINTS.subjects.list}/stats`;

  constructor(private readonly http: HttpClient) {}

  getSubjects(page = 0, size = 5, search = '', minCoefficient?: number): Observable<SubjectsApiResponse> {
    const params: Record<string, string> = {
      page: String(page),
      size: String(size),
      search,
    };
    if (minCoefficient !== undefined) {
      params['minCoefficient'] = String(minCoefficient);
    }

    return this.http.get<SubjectsApiResponse>(this.apiUrl, {
      params,
      headers: this.buildAuthHeaders(),
    });
  }

  getSubjectStats(): Observable<SubjectStatsResponse> {
    return this.http.get<SubjectStatsResponse>(this.statsUrl, {
      headers: this.buildAuthHeaders(),
    });
  }

  createSubject(payload: CreateSubjectRequest): Observable<Subject> {
    return this.http.post<Subject>(this.apiUrl, payload, {
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
