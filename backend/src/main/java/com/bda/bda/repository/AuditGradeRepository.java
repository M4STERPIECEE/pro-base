package com.bda.bda.repository;

import com.bda.bda.model.AuditGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditGradeRepository extends JpaRepository<AuditGrade, Integer> {
    List<AuditGrade> findAllByOrderByUpdatedAtDesc();
    List<AuditGrade> findByStudentIdOrderByUpdatedAtDesc(Integer studentId);
    long countByOperationType(String operationType);
    @Query("SELECT a FROM AuditGrade a ORDER BY a.updatedAt DESC")
    List<AuditGrade> findAllSorted();
}