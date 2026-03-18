package com.bda.bda.repository;

import com.bda.bda.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    boolean existsByFullNameIgnoreCase(String fullName);
}