CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`title` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "valid_agent" CHECK("conversations"."agent_id" in ('faculdade','concursos','ipe','carreira'))
);
--> statement-breakpoint
CREATE INDEX `idx_conversations_user_updated` ON `conversations` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `messages` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "valid_role" CHECK("messages"."role" in ('user','assistant'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `messages_id_unique` ON `messages` (`id`);--> statement-breakpoint
CREATE INDEX `idx_messages_conversation_seq` ON `messages` (`conversation_id`,`seq`);--> statement-breakpoint
CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`user_id` text NOT NULL,
	`message_id` text NOT NULL,
	`request_key` text NOT NULL,
	`agent_version` text NOT NULL,
	`model` text,
	`status` text NOT NULL,
	`error` text,
	`input_tokens` integer,
	`output_tokens` integer,
	`charged_attempt` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`finished_at` text,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "valid_status" CHECK("runs"."status" in ('running','completed','failed','cancelled'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_runs_user_request` ON `runs` (`user_id`,`request_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_runs_one_active_user` ON `runs` (`user_id`) WHERE "runs"."status" = 'running';--> statement-breakpoint
CREATE INDEX `idx_runs_conversation_created` ON `runs` (`conversation_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_runs_user_date` ON `runs` (`user_id`,`created_at`);
