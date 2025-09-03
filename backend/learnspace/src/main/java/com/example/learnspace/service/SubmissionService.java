// src/main/java/com/example/learnspace/service/SubmissionService.java
package com.example.learnspace.service;

import com.example.learnspace.dto.SubmissionDto;
import com.example.learnspace.model.entity.Person;
import com.example.learnspace.repository.AssignmentRepository;
import com.example.learnspace.repository.ClassMemberRepository;
import com.example.learnspace.repository.PersonRepository;
import com.example.learnspace.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.learnspace.model.entity.Assignment;
import com.example.learnspace.model.entity.ClassMember;
import com.example.learnspace.model.entity.Submission;
import com.example.learnspace.model.enums.ClassRole;
import com.example.learnspace.model.enums.SubmissionStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.math.BigDecimal;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepo;
    private final AssignmentRepository assignmentRepo;
    private final PersonRepository personRepo;
    private final ClassMemberRepository classMemberRepo;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<SubmissionDto> getMySubmissionsByEmail(String email) {
        // (Nice error for unknown user; optional)
        Person p = personRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        return submissionRepo.findByStudent_EmailOrderBySubmittedAtDesc(email)
                .stream().map(SubmissionDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<SubmissionDto> myInClass(String email, Long classId) {
        personRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + email));

        return submissionRepo.findMyInClass(email, classId)
                .stream().map(SubmissionDto::from).toList();
    }

    @Transactional
    public SubmissionDto create(String studentEmail, Long assignmentId, String fileUrl, String fileName) {
        Person student = personRepo.findByEmail(studentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + studentEmail));
        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

        // ensure student belongs to the class
        Long classId = assignment.getClazz().getId();
        classMemberRepo.findByPerson_EmailAndClazz_Id(studentEmail, classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of this class"));

        Submission s = Submission.builder()
                .assignment(assignment)
                .student(student)
                .status(SubmissionStatus.SUBMITTED)
                .submittedAt(Instant.now())
                .textAnswer(null)             // optional
                .fileUrl(fileUrl)             // if you added fields; otherwise put into textAnswer
                .fileName(fileName)
                .build();
        s = submissionRepo.save(s);

        // notify instructors/admins for this class
        notifyInstructorsOnNewSubmission(classId, student.getName(), assignment.getTitle(), fileUrl);

        return SubmissionDto.from(s);
    }

    @Transactional
    public SubmissionDto grade(String graderEmail, Long submissionId, BigDecimal points, String feedback) {
        Submission s = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));

        Long classId = s.getAssignment().getClazz().getId();

        // Only instructor can grade
        boolean isInstructor = classMemberRepo.existsByPerson_EmailAndClazz_IdAndRoleInClass(
                graderEmail, classId, ClassRole.INSTRUCTOR);
        if (!isInstructor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only instructors can grade");
        }

        Person grader = personRepo.findByEmail(graderEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grader not found"));

        s.setGradePoints(points);
        s.setFeedback(feedback);
        s.setGradedBy(grader);
        s.setGradedAt(Instant.now());
        s = submissionRepo.save(s);

        // Notify the student
        String subject = "Your submission was graded";
        String body = "Hi " + s.getStudent().getName() + ",\n\n" +
                "Your submission for \"" + s.getAssignment().getTitle() + "\" has been graded.\n" +
                "Points: " + points + "\n" +
                (feedback != null ? "Feedback: " + feedback + "\n" : "") +
                "\nThanks.";
        emailService.send(s.getStudent().getEmail(), subject, body);

        return SubmissionDto.from(s);
    }

    private void notifyInstructorsOnNewSubmission(Long classId, String studentName, String assignmentTitle, String fileUrl) {
        // fetch instructors of the class
        List<ClassMember> members = classMemberRepo.findAll().stream()
                .filter(cm -> cm.getClazz().getId().equals(classId))
                .filter(cm -> cm.getRoleInClass() == ClassRole.INSTRUCTOR)
                .toList();

        String subject = "New submission received";
        String body = "A new submission has been made.\n\n" +
                "Student: " + studentName + "\n" +
                "Assignment: " + assignmentTitle + "\n" +
                (fileUrl != null ? "File: " + fileUrl + "\n" : "") +
                "\nPlease review and grade.";

        for (ClassMember cm : members) {
            emailService.send(cm.getPerson().getEmail(), subject, body);
        }
    }
}
