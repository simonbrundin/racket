import { readBody, defineEventHandler, H3Event } from 'h3';
import type { Goal } from '~/types/goal-entity';
import { GoalValidator, ValidationError } from '~/server/utils/goalValidator';

// Simulated database (same as in index.ts for simplicity, in a real app this would be a shared service/module)
let goals: Goal[] = []; // This should ideally be a shared module for actual persistence across requests

export default defineEventHandler(async (event: H3Event) => {
  const method = event.node.req.method;
  const id = event.context.params?.id as string;

  if (method === 'PUT') {
    try {
      if (!id) {
        event.node.res.statusCode = 400;
        return { error: 'Goal ID is required' };
      }

      const body = await readBody(event);
      const { title, image_url, icon_url, is_completed, parent_ids, child_ids } = body;

      const goalIndex = goals.findIndex(goal => goal.id === id);
      
      if (goalIndex === -1) {
        event.node.res.statusCode = 404;
        return { error: 'Goal not found' };
      }

      const updatedGoalData = {
        id,
        title,
        image_url,
        icon_url,
        is_completed,
        parent_ids,
        child_ids
      };
      
      const validationErrors: ValidationError[] = GoalValidator.validateGoalForUpdate(updatedGoalData as Goal);
      
      if (validationErrors.length > 0) {
        event.node.res.statusCode = 400;
        return { error: 'Validation failed', details: validationErrors };
      }

      const updatedGoal: Goal = {
        ...goals[goalIndex],
        ...(title !== undefined && { title }),
        ...(image_url !== undefined && { image_url }),
        ...(icon_url !== undefined && { icon_url }),
        ...(is_completed !== undefined && { is_completed }),
        ...(parent_ids !== undefined && { parent_ids }),
        ...(child_ids !== undefined && { child_ids })
      };

      goals[goalIndex] = updatedGoal;
      return updatedGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      event.node.res.statusCode = 500;
      return { error: 'Failed to update goal' };
    }
  } else if (method === 'DELETE') {
    try {
      if (!id) {
        event.node.res.statusCode = 400;
        return { error: 'Goal ID is required' };
      }

      const initialLength = goals.length;
      goals = goals.filter(goal => goal.id !== id);

      if (goals.length === initialLength) {
        event.node.res.statusCode = 404;
        return { error: 'Goal not found' };
      }

      event.node.res.statusCode = 204; // No Content
      return {};
    } catch (error) {
      console.error('Error deleting goal:', error);
      event.node.res.statusCode = 500;
      return { error: 'Failed to delete goal' };
    }
  }
});