const { Todo, Subtask } = require('../models');

async function seedData() {
    try {
      // Create sample Todos
      const todo1 = await Todo.create({ title: 'Todo 1' });
      const todo2 = await Todo.create({ title: 'Todo 2' });
  
      // Create sample Subtasks
      await Subtask.create({ title: 'Subtask 1', TodoId: todo1.id });
      await Subtask.create({ title: 'Subtask 2', TodoId: todo1.id });
      await Subtask.create({ title: 'Subtask 3', TodoId: todo2.id });
  
      console.log('Seeding completed successfully!');
    } catch (error) {
      console.error('Seeding failed:', error);
    }
  }
  
  module.exports = { seedData };
