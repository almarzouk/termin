<?php

namespace App\Modules\Clinic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Clinic\Requests\InviteStaffRequest;
use App\Modules\Clinic\Requests\UpdateStaffRequest;
use App\Models\Clinic;
use App\Models\ClinicStaff;
use App\Models\User;
use App\Services\SubscriptionLimitService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class StaffController extends Controller
{
    /**
     * Display a listing of staff for a clinic
     */
    public function index(Request $request, $clinicId)
    {
        $clinic = Clinic::findOrFail($clinicId);

        $query = $clinic->staff()->with(['user', 'branch', 'services']);

        // Filter by role
        if ($request->has('role')) {
            $query->byRole($request->role);
        }

        // Filter by branch
        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Search by name or specialization
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('specialization', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $staff = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $staff,
        ]);
    }

    /**
     * Invite a new staff member
     */
    public function invite(InviteStaffRequest $request, $clinicId)
    {
        $clinic = Clinic::findOrFail($clinicId);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, Mitarbeiter für diese Klinik einzuladen.',
            ], 403);
        }

        // Check subscription limits
        $limitService = new SubscriptionLimitService();
        $limitCheck = $limitService->canCreateStaff(auth()->user());

        if (!$limitCheck['allowed']) {
            return response()->json([
                'success' => false,
                'message' => $limitCheck['message'],
                'current' => $limitCheck['current'],
                'limit' => $limitCheck['limit'],
            ], 403);
        }

        DB::beginTransaction();

        try {
            // Create user account (inactive until invitation accepted)
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt(Str::random(32)), // Random password, will be set on invitation acceptance
                'is_active' => false,
            ]);

            // Assign role
            $user->assignRole($request->role);

            // Generate invitation token
            $invitationToken = Str::random(64);

            // Create staff record
            $staff = ClinicStaff::create([
                'clinic_id' => $clinic->id,
                'branch_id' => $request->branch_id,
                'user_id' => $user->id,
                'role' => $request->role,
                'specialization' => $request->specialization,
                'license_number' => $request->license_number,
                'bio' => $request->bio,
                'hire_date' => $request->hire_date ?? now(),
                'is_active' => false,
                'invitation_token' => $invitationToken,
                'invitation_sent_at' => now(),
            ]);

            // TODO: Send invitation email
            // Mail::to($user->email)->send(new StaffInvitation($clinic, $staff, $invitationToken));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Einladung erfolgreich gesendet.',
                'data' => $staff->load(['user', 'branch']),
                'invitation_token' => $invitationToken, // For testing only, remove in production
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Senden der Einladung.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Accept staff invitation
     */
    public function acceptInvitation(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/',
        ], [
            'password.regex' => 'Das Passwort muss mindestens 8 Zeichen lang sein und Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen enthalten.',
        ]);

        $staff = ClinicStaff::where('invitation_token', $request->token)->first();

        if (!$staff) {
            return response()->json([
                'success' => false,
                'message' => 'Ungültiger Einladungstoken.',
            ], 404);
        }

        if ($staff->invitation_accepted_at) {
            return response()->json([
                'success' => false,
                'message' => 'Diese Einladung wurde bereits akzeptiert.',
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Update user password and activate account
            $staff->user->update([
                'password' => bcrypt($request->password),
                'is_active' => true,
            ]);

            // Mark invitation as accepted and activate staff
            $staff->update([
                'invitation_accepted_at' => now(),
                'invitation_token' => null,
                'is_active' => true,
            ]);

            DB::commit();

            // Generate auth token
            $token = $staff->user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Einladung erfolgreich akzeptiert. Willkommen im Team!',
                'data' => [
                    'user' => $staff->user->load('roles', 'permissions'),
                    'staff' => $staff->load(['clinic', 'branch']),
                    'token' => $token,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Akzeptieren der Einladung.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified staff member
     */
    public function show($clinicId, $id)
    {
        $staff = ClinicStaff::with(['user', 'clinic', 'branch', 'services', 'workingHours', 'appointments'])
            ->where('clinic_id', $clinicId)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $staff,
        ]);
    }

    /**
     * Update the specified staff member
     */
    public function update(UpdateStaffRequest $request, $clinicId, $id)
    {
        $clinic = Clinic::findOrFail($clinicId);
        $staff = ClinicStaff::where('clinic_id', $clinicId)->findOrFail($id);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diesen Mitarbeiter zu aktualisieren.',
            ], 403);
        }

        try {
            $staff->update($request->all());

            // Update user role if role changed
            if ($request->has('role')) {
                $staff->user->syncRoles([$request->role]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Mitarbeiter erfolgreich aktualisiert.',
                'data' => $staff->load(['user', 'branch']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren des Mitarbeiters.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified staff member (soft delete)
     */
    public function destroy($clinicId, $id)
    {
        $clinic = Clinic::findOrFail($clinicId);
        $staff = ClinicStaff::where('clinic_id', $clinicId)->findOrFail($id);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diesen Mitarbeiter zu entfernen.',
            ], 403);
        }

        // Check if staff has upcoming appointments
        $hasUpcomingAppointments = $staff->appointments()
            ->upcoming()
            ->exists();

        if ($hasUpcomingAppointments) {
            return response()->json([
                'success' => false,
                'message' => 'Dieser Mitarbeiter hat zukünftige Termine und kann nicht entfernt werden.',
            ], 422);
        }

        try {
            $staff->delete();

            return response()->json([
                'success' => true,
                'message' => 'Mitarbeiter erfolgreich entfernt.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Entfernen des Mitarbeiters.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resend invitation to staff member
     */
    public function resendInvitation($clinicId, $id)
    {
        $clinic = Clinic::findOrFail($clinicId);
        $staff = ClinicStaff::where('clinic_id', $clinicId)->findOrFail($id);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, Einladungen zu senden.',
            ], 403);
        }

        if ($staff->invitation_accepted_at) {
            return response()->json([
                'success' => false,
                'message' => 'Diese Einladung wurde bereits akzeptiert.',
            ], 422);
        }

        try {
            // Generate new token
            $invitationToken = Str::random(64);

            $staff->update([
                'invitation_token' => $invitationToken,
                'invitation_sent_at' => now(),
            ]);

            // TODO: Send invitation email
            // Mail::to($staff->user->email)->send(new StaffInvitation($clinic, $staff, $invitationToken));

            return response()->json([
                'success' => true,
                'message' => 'Einladung erfolgreich erneut gesendet.',
                'invitation_token' => $invitationToken, // For testing only
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Senden der Einladung.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get staff by role
     */
    public function byRole($clinicId, $role)
    {
        $clinic = Clinic::findOrFail($clinicId);

        $staff = $clinic->staff()
            ->byRole($role)
            ->active()
            ->with(['user', 'branch'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $staff,
        ]);
    }
}
