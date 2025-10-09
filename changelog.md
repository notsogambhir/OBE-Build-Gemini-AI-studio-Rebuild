# Changelog

This document tracks all significant changes made to the NBA Outcome Based Education Portal application.

## [Unreleased] - 2024-07-27

### Mock Data and Documentation Update
- **Fixed**: Populated `mockData.json` with generated students, enrollments, and marks data. This resolves issues where student lists, CO attainment reports, and other data-dependent components were appearing empty.
- **Docs**: Updated `backend_guide.md` with a more detailed section on defining database schemas using Django models and a clearer explanation of the data migration process.

## [Unreleased] - 2024-07-26

### Data Loading Refactor
- Converted static `mockData.ts` to `mockData.json`.
- Updated `AppContext` to fetch data asynchronously, showing a loading screen on initial startup.
- Removed client-side generation logic for students, enrollments, and marks, as the `mockData.json` file is now complete. This simplifies the data loading process and ensures consistency.

## [Unreleased] - 2024-07-25

### Major Refactoring: Assessments moved from Course-level to Section-level

This architectural change provides a more granular approach to managing and evaluating student assessments, aligning them with specific class sections rather than general courses.

#### File Changes:

*   **`types.ts`**:
    *   **Modified**: Updated the `Assessment` interface.
    *   **Change**: Replaced the `courseId: string` property with `sectionId: string`.

*   **`mockData.ts`**:
    *   **Modified**: Updated the mock `assessments` array.
    *   **Change**: Re-associated all mock assessments with a specific `sectionId` instead of a `courseId`.

*   **`components/ManageCourseAssessments.tsx`**:
    *   **Heavily Refactored**: This component now orchestrates assessment management at the section level.
    *   **Change**:
        *   Added a "Select Section" dropdown to filter assessments.
        *   Dropdown population is role-based (Teachers see their assigned sections; PCs/Admins see all sections for the course).
        *   Assessment list now filters based on the selected `sectionId`.
        *   The "Create Assessment" button is disabled until a section is selected.
        *   Manages navigation to `AssessmentDetails` and preserves the selected section context for PC/Admin roles.

*   **`components/CreateAssessmentModal.tsx`**:
    *   **Modified**: Updated the component's props.
    *   **Change**: The modal now accepts `sectionId` instead of `courseId` to correctly associate newly created assessments.

*   **`components/AssessmentDetails.tsx`**:
    *   **Heavily Refactored**: Adapted the component to a section-centric data model.
    *   **Change**:
        *   Now receives the parent `course` object as a prop to maintain context.
        *   For PCs/Admins, the "Select Section" dropdown from the parent component remains visible for easy navigation between sections.
        *   Logic for downloading mark templates and uploading marks is now scoped to the students enrolled in the assessment's specific section.

*   **`pages/StudentCOAttainmentReport.tsx`**:
    *   **Fixed**: Corrected a data filtering error.
    *   **Change**: Updated logic to retrieve assessments by first finding all sections for a course (via enrollments) and then filtering assessments by those `sectionId`s, instead of the non-existent `courseId`.

*   **`components/StudentDetailsModal.tsx`**:
    *   **Fixed**: Corrected a data filtering error.
    *   **Change**: Similar to the report page, updated assessment retrieval logic to be section-aware.

*   **`pages/TeacherDetails.tsx`**:
    *   **Fixed**: Corrected a data filtering error.
    *   **Change**: Updated assessment retrieval logic to be section-aware for displaying teacher-specific information.

*   **`components/CoursePoLinkageDashboard.tsx`**:
    *   **Fixed**: Corrected a data filtering error.
    *   **Change**: Updated assessment retrieval logic to be section-aware for accurate CO attainment calculations.