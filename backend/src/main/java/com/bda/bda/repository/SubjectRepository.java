package com.bda.bda.repository;

import com.bda.bda.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    boolean existsByLabelIgnoreCase(String label);
}