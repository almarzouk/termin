<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Modules\Patient\Models\Patient;

class CreateMissingPatientRecords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'patients:create-missing';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create patient records for users who don\'t have one';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking for users without patient records...');

        // Get all users with 'customer' role who don't have a patient record
        $users = User::whereHas('roles', function ($query) {
            $query->where('name', 'customer');
        })->whereDoesntHave('patient')->get();

        if ($users->isEmpty()) {
            $this->info('✅ All customer users already have patient records!');
            return 0;
        }

        $this->info("📝 Found {$users->count()} users without patient records. Creating...");

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        $created = 0;
        $failed = 0;

        foreach ($users as $user) {
            try {
                $nameParts = explode(' ', $user->name, 2);
                $firstName = $nameParts[0] ?? $user->name ?? 'Unknown';
                $lastName = $nameParts[1] ?? '';

                Patient::create([
                    'user_id' => $user->id,
                    'patient_type' => 'self',
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'gender' => $user->gender,
                    'date_of_birth' => $user->date_of_birth,
                ]);
                $created++;
            } catch (\Exception $e) {
                $this->error("\n❌ Failed to create patient for user {$user->id}: {$e->getMessage()}");
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Successfully created {$created} patient records.");
        if ($failed > 0) {
            $this->warn("⚠️  Failed to create {$failed} patient records.");
        }

        return 0;
    }
}
