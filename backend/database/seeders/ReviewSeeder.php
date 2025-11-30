<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Clinic;
use App\Models\Appointment;
use Carbon\Carbon;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all patients from patients table
        $patients = DB::table('patients')->get();

        // Get all clinics
        $clinics = Clinic::all();

        if ($patients->isEmpty() || $clinics->isEmpty()) {
            $this->command->warn('⚠️  No patients or clinics found. Please run patients and clinics seeders first.');
            return;
        }

        $reviews = [];
        $reviewComments = [
            // 5 stars comments
            5 => [
                'Ausgezeichnete Klinik! Sehr professionelles Personal und moderne Ausstattung.',
                'Ich bin sehr zufrieden mit der Behandlung. Der Arzt war sehr kompetent und freundlich.',
                'Beste Klinik in der Stadt! Kurze Wartezeiten und hervorragender Service.',
                'Hervorragende Betreuung vom Empfang bis zur Behandlung. Sehr empfehlenswert!',
                'Top Klinik! Saubere Räume, freundliches Personal und erstklassige Behandlung.',
                'Perfekte Erfahrung! Der Arzt hat sich viel Zeit genommen und alles erklärt.',
                'Sehr professionell und gut organisiert. Ich komme gerne wieder.',
                'Exzellenter Service! Das gesamte Team war sehr hilfsbereit.',
            ],
            // 4 stars comments
            4 => [
                'Gute Klinik mit kompetenten Ärzten. Nur die Wartezeit könnte kürzer sein.',
                'Sehr zufrieden mit der Behandlung. Preis-Leistung stimmt.',
                'Freundliches Personal und gute Behandlung. Empfehlenswert.',
                'Gute Erfahrung insgesamt. Die Terminvergabe könnte verbessert werden.',
                'Kompetente Ärzte und moderne Ausstattung. Parkplätze sind etwas knapp.',
                'Sehr gute Beratung und Behandlung. Wartezeit war akzeptabel.',
            ],
            // 3 stars comments
            3 => [
                'Durchschnittliche Erfahrung. Die Behandlung war okay, aber nichts Besonderes.',
                'Ganz okay. Wartezeit war etwas lang, aber der Arzt war kompetent.',
                'Mittelmäßiger Service. Es gibt Raum für Verbesserungen.',
                'Die Behandlung war in Ordnung, aber der Empfang könnte freundlicher sein.',
            ],
            // 2 stars comments
            2 => [
                'Lange Wartezeiten und unpersönlicher Service.',
                'Nicht sehr zufrieden. Die Kommunikation könnte besser sein.',
                'Zu teuer für die gebotene Leistung.',
                'Enttäuschend. Die Terminvereinbarung war kompliziert.',
            ],
            // 1 star comment
            1 => [
                'Sehr unzufrieden mit dem Service. Würde nicht empfehlen.',
                'Schlechte Erfahrung. Lange Wartezeit und unfreundliches Personal.',
            ],
        ];

        $this->command->info('🌟 Creating reviews...');

        // Track which patients have reviewed which clinics
        $patientClinicReviews = [];

        foreach ($clinics as $clinic) {
            // Each clinic gets 10-15 reviews
            $numberOfReviews = rand(10, 15);
            $availablePatients = $patients->shuffle();

            $reviewsForClinic = 0;

            foreach ($availablePatients as $patient) {
                if ($reviewsForClinic >= $numberOfReviews) {
                    break;
                }

                // Check if this patient already reviewed this clinic
                $key = $patient->id . '_' . $clinic->id;
                if (isset($patientClinicReviews[$key])) {
                    continue; // Skip - patient already reviewed this clinic
                }

                // Get a random appointment for this patient at this clinic (if exists)
                $appointment = Appointment::where('patient_id', $patient->id)
                    ->whereHas('staff', function ($query) use ($clinic) {
                        $query->where('clinic_id', $clinic->id);
                    })
                    ->inRandomOrder()
                    ->first();

                // Weighted rating distribution (more 4-5 stars)
                $rand = rand(1, 100);
                if ($rand <= 45) {
                    $rating = 5; // 45%
                } elseif ($rand <= 75) {
                    $rating = 4; // 30%
                } elseif ($rand <= 88) {
                    $rating = 3; // 13%
                } elseif ($rand <= 96) {
                    $rating = 2; // 8%
                } else {
                    $rating = 1; // 4%
                }

                $comment = $reviewComments[$rating][array_rand($reviewComments[$rating])];

                // 80% of reviews are approved
                $isApproved = rand(1, 100) <= 80;

                $createdAt = Carbon::now()->subDays(rand(1, 90));

                $reviews[] = [
                    'clinic_id' => $clinic->id,
                    'patient_id' => $patient->id,
                    'appointment_id' => $appointment?->id,
                    'rating' => $rating,
                    'comment' => $comment,
                    'is_approved' => $isApproved,
                    'approved_at' => $isApproved ? $createdAt->copy()->addHours(rand(1, 24)) : null,
                    'approved_by' => $isApproved ? 1 : null, // Approved by super_admin
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                    'deleted_at' => null,
                ];

                // Mark this patient-clinic combination as reviewed
                $patientClinicReviews[$key] = true;
                $reviewsForClinic++;
            }

            $this->command->info("  ✓ Created {$reviewsForClinic} reviews for {$clinic->name}");
        }

        // Insert all reviews
        DB::table('reviews')->insert($reviews);

        $totalReviews = count($reviews);
        $approvedReviews = count(array_filter($reviews, fn($r) => $r['is_approved']));
        $pendingReviews = $totalReviews - $approvedReviews;

        $this->command->info("\n✅ Review Seeder completed!");
        $this->command->info("📊 Statistics:");
        $this->command->info("  • Total reviews: {$totalReviews}");
        $this->command->info("  • Approved: {$approvedReviews}");
        $this->command->info("  • Pending: {$pendingReviews}");
        $this->command->info("  • Average per clinic: " . round($totalReviews / $clinics->count(), 1));

        // Rating distribution
        $ratingCounts = [
            5 => count(array_filter($reviews, fn($r) => $r['rating'] === 5)),
            4 => count(array_filter($reviews, fn($r) => $r['rating'] === 4)),
            3 => count(array_filter($reviews, fn($r) => $r['rating'] === 3)),
            2 => count(array_filter($reviews, fn($r) => $r['rating'] === 2)),
            1 => count(array_filter($reviews, fn($r) => $r['rating'] === 1)),
        ];

        $this->command->info("\n⭐ Rating Distribution:");
        foreach ($ratingCounts as $stars => $count) {
            $percentage = round(($count / $totalReviews) * 100, 1);
            $this->command->info("  {$stars} ⭐: {$count} ({$percentage}%)");
        }

        $avgRating = round(array_sum(array_map(fn($r) => $r['rating'], $reviews)) / $totalReviews, 2);
        $this->command->info("\n📈 Average Rating: {$avgRating} / 5.0");
    }
}
