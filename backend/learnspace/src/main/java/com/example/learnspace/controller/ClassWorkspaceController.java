package com.example.learnspace.controller;

import com.example.learnspace.dto.AssignmentDto;
import com.example.learnspace.dto.ClassDetailDto;
import com.example.learnspace.dto.ClassMemberDto;
import com.example.learnspace.model.enums.ClassRole;
import com.example.learnspace.service.ClassWorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
public class ClassWorkspaceController {

    private final ClassWorkspaceService classService;

    /** GET /api/classes/{id} — detail (optionally pass callerEmail in query or body for myRole resolution) */
    @GetMapping("/{id}")
    public ClassDetailDto detail(@PathVariable Long id, @RequestParam(required = false) String callerEmail) {
        return classService.getClassDetail(id, callerEmail);
    }

    /** GET /api/classes/{id}/members */
    @GetMapping("/{id}/members")
    public List<ClassMemberDto> members(@PathVariable Long id) {
        return classService.getMembers(id);
    }

    /** POST /api/classes/{id}/members  { requesterEmail,newMemberEmail,role } */
    @PostMapping("/{id}/members")
    public ResponseEntity<ClassMemberDto> addMember(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String requesterEmail = body.get("requesterEmail");
        String newMemberEmail = body.get("newMemberEmail");
        ClassRole role = body.get("role") == null ? ClassRole.STUDENT : ClassRole.valueOf(body.get("role"));
        ClassMemberDto created = classService.addMember(id, requesterEmail, newMemberEmail, role);
        return ResponseEntity.status(201).body(created);
    }

    /** PATCH /api/classes/{id}/members/{memberId}  { requesterEmail, role } */
    @PatchMapping("/{id}/members/{memberId}")
    public ClassMemberDto updateRole(@PathVariable Long id, @PathVariable Long memberId, @RequestBody Map<String, String> body) {
        String requesterEmail = body.get("requesterEmail");
        ClassRole role = ClassRole.valueOf(body.get("role"));
        return classService.updateMemberRole(id, memberId, requesterEmail, role);
    }

    /** DELETE /api/classes/{id}/members/{memberId}  { requesterEmail } */
    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<Void> remove(@PathVariable Long id, @PathVariable Long memberId, @RequestBody Map<String, String> body) {
        String requesterEmail = body.get("requesterEmail");
        classService.removeMember(id, memberId, requesterEmail);
        return ResponseEntity.noContent().build();
    }
    
}
