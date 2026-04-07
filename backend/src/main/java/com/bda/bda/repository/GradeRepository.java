package com.bda.bda.repository;

import com.bda.bda.model.Grade;
import com.bda.bda.model.GradeId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, GradeId> {
    @Override
    @EntityGraph(attributePaths = {"student", "subject"})
    Page<Grade> findAll(Pageable pageable);

    @Query("SELECT g FROM Grade g JOIN FETCH g.student JOIN FETCH g.subject")
    List<Grade> findAllWithDetails();
    @Query("SELECT g FROM Grade g JOIN FETCH g.student JOIN FETCH g.subject WHERE g.id.studentId = :studentId")
    List<Grade> findAllByStudentId(@Param("studentId") Integer studentId);

    @Query("SELECT g FROM Grade g JOIN FETCH g.student JOIN FETCH g.subject WHERE g.id.studentId = :studentId AND g.id.subjectId = :subjectId")
    Optional<Grade> findByStudentIdAndSubjectId(@Param("studentId") Integer studentId, @Param("subjectId") Integer subjectId
    );
}