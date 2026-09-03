CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_rate_expiry` ON `rate_limits` (`expires_at`);--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`credential_hash` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`guests` integer NOT NULL,
	`needs_stay` integer DEFAULT 0 NOT NULL,
	`stay_guests` integer DEFAULT 0 NOT NULL,
	`check_in` text,
	`check_out` text,
	`notes` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'none' NOT NULL,
	`consent_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rsvps_credential_hash_unique` ON `rsvps` (`credential_hash`);--> statement-breakpoint
CREATE INDEX `idx_rsvps_stay_date` ON `rsvps` (`needs_stay`,`check_in`);