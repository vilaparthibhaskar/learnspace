// com.example.learnspace.service.FileStorageService
package com.example.learnspace.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final Cloudinary cloudinary;

    public UploadedFile uploadSubmissionFile(MultipartFile file, Long classId, Long assignmentId, String studentEmail) throws Exception {
        // Add foldering to keep things tidy
        String folder = "learnspace/class_" + classId + "/assignment_" + assignmentId;
        Map<?,?> res = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto",      // pdf, docx, images, etc.
                "overwrite", true,
                "use_filename", true,
                "unique_filename", true
        ));
        String url = (String) res.get("secure_url");
        String publicId = (String) res.get("public_id");
        String originalName = file.getOriginalFilename();

        return new UploadedFile(url, publicId, originalName);
    }

    public record UploadedFile(String url, String publicId, String fileName) {}
}
