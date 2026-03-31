import { Component, OnInit } from '@angular/core';
import { Student } from '../../../../models/student.model';
import { StudentService } from '../../../../services/student.service';

@Component({
  selector: 'app-etudiant-students-content',
  standalone: false,
  templateUrl: './etudiant-students-content.component.html',
  styleUrl: './etudiant-students-content.component.css',
})
export class EtudiantStudentsContentComponent implements OnInit {
  students: Student[] = [];
  loading = true;
  errorMessage = '';

  constructor(private readonly studentService: StudentService) {}

  ngOnInit(): void {
    this.studentService.getStudents().subscribe({
      next: (data: Student[]) => {
        this.students = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les etudiants.';
        this.loading = false;
      },
    });
  }

  get totalStudents(): number {
    return this.students.length;
  }

  get globalAverage(): number {
    if (this.students.length === 0) {
      return 0;
    }
    const sum = this.students.reduce((acc, student) => acc + Number(student.average ?? 0), 0);
    return sum / this.students.length;
  }

  get studentsInAlert(): number {
    return this.students.filter((student) => Number(student.average ?? 0) < 10).length;
  }

  formatAverage(value: number): string {
    return Number(value ?? 0).toFixed(2);
  }
}

