import { relations } from "drizzle-orm/relations";
import { users, userGoals, goals, goalRelations } from "./schema";

export const userGoalsRelations = relations(userGoals, ({one}) => ({
	user: one(users, {
		fields: [userGoals.userId],
		references: [users.id]
	}),
	goal: one(goals, {
		fields: [userGoals.goalId],
		references: [goals.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userGoals: many(userGoals),
}));

export const goalsRelations = relations(goals, ({many}) => ({
	userGoals: many(userGoals),
	goalRelations_parentId: many(goalRelations, {
		relationName: "goalRelations_parentId_goals_id"
	}),
	goalRelations_childId: many(goalRelations, {
		relationName: "goalRelations_childId_goals_id"
	}),
}));

export const goalRelationsRelations = relations(goalRelations, ({one}) => ({
	goal_parentId: one(goals, {
		fields: [goalRelations.parentId],
		references: [goals.id],
		relationName: "goalRelations_parentId_goals_id"
	}),
	goal_childId: one(goals, {
		fields: [goalRelations.childId],
		references: [goals.id],
		relationName: "goalRelations_childId_goals_id"
	}),
}));