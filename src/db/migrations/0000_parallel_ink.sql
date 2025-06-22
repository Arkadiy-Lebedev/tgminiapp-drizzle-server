CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255) NOT NULL,
	`nickName` text(255) NOT NULL,
	`avatar` text,
	`userId` integer,
	`chat` integer,
	`currentEnergy` integer,
	`ticket` integer,
	`lastVisit` integer NOT NULL,
	`winStreak` integer NOT NULL,
	`totalEnergy` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
