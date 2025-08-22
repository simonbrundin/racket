// validators.ts - Valideringsfunktioner för måldata
import { Goal } from '@/datamodell/goal-entity';

export interface ValidationError {
  field: string;
  message: string;
}

export class GoalValidator {
  static validateGoal(goal: Partial<Goal>): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Validera titel
    if (!goal.title || goal.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Titel är obligatorisk'
      });
    } else if (goal.title && goal.title.length > 255) {
      errors.push({
        field: 'title',
        message: 'Titel får inte vara längre än 255 tecken'
      });
    }
    
    // Validera URL:er om de finns
    if (goal.image_url) {
      try {
        new URL(goal.image_url);
      } catch (e) {
        errors.push({
          field: 'image_url',
          message: 'Bild-URL måste vara en giltig URL'
        });
      }
    }
    
    if (goal.icon_url) {
      try {
        new URL(goal.icon_url);
      } catch (e) {
        errors.push({
          field: 'icon_url',
          message: 'Ikon-URL måste vara en giltig URL'
        });
      }
    }
    
    return errors;
  }
  
  static validateGoalForCreation(goalData: Omit<Goal, 'id' | 'is_completed' | 'parent_ids' | 'child_ids'>): ValidationError[] {
    // För skapande av mål behöver vi inte validera id, is_completed, parent_ids och child_ids
    // eftersom de kommer att sättas av backend
    return this.validateGoal(goalData as Partial<Goal>);
  }
  
  static validateGoalForUpdate(goal: Goal): ValidationError[] {
    // För uppdatering av mål måste vi validera hela objektet
    const errors = this.validateGoal(goal);
    
    // Validera att id finns
    if (!goal.id) {
      errors.push({
        field: 'id',
        message: 'ID är obligatoriskt för uppdatering'
      });
    }
    
    return errors;
  }
}

export default GoalValidator;