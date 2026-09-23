CREATE TABLE `certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`issuer` text NOT NULL,
	`issued_at` text,
	`credential_id` text,
	`skills` text DEFAULT '[]' NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`object_key` text NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "valid_certificate_size" CHECK("certificates"."size_bytes" > 0 and "certificates"."size_bytes" <= 8388608)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `certificates_object_key_unique` ON `certificates` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_certificates_user_created` ON `certificates` (`user_id`,`created_at`);
