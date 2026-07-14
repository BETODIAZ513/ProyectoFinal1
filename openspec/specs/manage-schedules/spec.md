# manage-schedules

## Purpose
Define the navigation flow, schedules viewing permissions, and scheduling rules for clinical roles.

## Requirements

### Requirement: Backoffice Schedule Navigation
The backoffice application SHALL display a "Horarios" page for all authenticated roles.
- For Veterinarios: Displays their personal calendar of appointments and allows booking new appointments.
- For AuxiliarClinico: Displays their shift schedules and allows choosing a Veterinarian to view their active appointments.
- For Administradores and Recepcionistas: Allows selecting any veterinarian or auxiliary to inspect their schedule.

#### Scenario: Navigating to schedules
- **WHEN** any logged-in user clicks "Horarios" in the navigation menu
- **THEN** the application SHALL route to the /horarios view and render the role-appropriate schedule board

### Requirement: Veterinarian Appointment Self-Scheduling
The application SHALL allow veterinarians to add appointments directly for themselves.

#### Scenario: Successful veterinarian self-scheduling
- **WHEN** a logged-in Veterinarian submits a new appointment for a date and time that has no overlapping appointments
- **THEN** the system SHALL create the appointment and update the schedule view

#### Scenario: Overlapping veterinarian self-scheduling failure
- **WHEN** a logged-in Veterinarian submits a new appointment that overlaps with an existing appointment (within a 30-minute window)
- **THEN** the system SHALL block the creation and display an error warning of the conflict

### Requirement: Auxiliary Multi-Schedule View
The application SHALL allow auxiliaries to inspect both their own schedule and the doctors' schedules.

#### Scenario: Switch veterinarian schedule inspect
- **WHEN** a logged-in AuxiliarClinico selects a Veterinarian from the dropdown menu in the Horarios page
- **THEN** the application SHALL fetch and render that veterinarian's daily appointments list
