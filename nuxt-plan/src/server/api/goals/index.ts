import { readBody, defineEventHandler, H3Event } from 'h3';
import type { Goal } from '~/types/goal-entity';
import { GoalValidator, ValidationError } from '~/server/utils/goalValidator';

// Simulated database
let goals: Goal[] = [];
let nextId = 1;

export default defineEventHandler(async (event: H3Event) => {
  const method = event.node.req.method;

  if (method === 'GET') {
    try {
      return goals;
    } catch (error) {
      console.error('Error fetching goals:', error);
      event.node.res.statusCode = 500;
      return { error: 'Failed to fetch goals' };
    }
  } else if (method === 'POST') {
    try {
      const body = await readBody(event);
      const { title, image_url, icon_url, parent_ids = [], child_ids = [] } = body;

      const goalData = {
        title,
        image_url,
        icon_url,
        parent_ids,
        child_ids
      };
      
      const validationErrors: ValidationError[] = GoalValidator.validateGoal(goalData);
      
      if (validationErrors.length > 0) {
        event.node.res.statusCode = 400;
        return { error: 'Validation failed', details: validationErrors };
      }

      const newGoal: Goal = {
        id: (nextId++).toString(),
        title,
        image_url,
        icon_url,
        is_completed: false,
        parent_ids,
        child_ids
      };

      goals.push(newGoal);
      event.node.res.statusCode = 201;
      return newGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      event.node.res.statusCode = 500;
      return { error: 'Failed to create goal' };
    }
  }
});