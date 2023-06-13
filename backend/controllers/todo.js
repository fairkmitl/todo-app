require("dotenv").config();
const { Todo, Subtask } = require("../models");

// Create a Todo
async function createTodo(req, res) {
  const { title } = req.body;

  try {
    const todo = await Todo.create({ title });
    res.status(201).json({
      data: {
        type: "todos",
        id: todo.id,
        attributes: {
          title: todo.title,
        },
        links: {
          self: `${process.env.APP_URL}/todos/${todo.id}`,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: [{ message: "Internal Server Error" }] });
  }
}

// Get list of Todos with Subtasks
async function getTodos(req, res) {
  try {
    const todos = await Todo.findAll({
      include: [
        {
          model: Subtask,
          as: "subtasks",
        },
      ],
    });

    const todoData = todos.map((todo) => ({
      type: "todos",
      id: todo.id,
      attributes: {
        title: todo.title,
        status: todo.status,
        createdAt: todo.createdAt,
      },
      relationships: {
        subtasks: {
          links: {
            self: `${process.env.APP_URL}/todos/${todo.id}/relationships/subtasks`,
            related: `${process.env.APP_URL}/todos/${todo.id}/subtasks`,
          },
          data: todo.subtasks.map((subtask) => ({
            type: "subtasks",
            id: subtask.id,
            title: subtask.title,
            status: subtask.status,
          })),
        },
      },
      links: {
        self: `${process.env.APP_URL}/todos/${todo.id}`,
      },
    }));

    res.status(200).json({
      data: todoData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: [{ message: "Internal Server Error" }] });
  }
}

// Update a Todo
async function updateTodo(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    let todo = await Todo.findByPk(id, {
      include: [{ model: Subtask, as: "subtasks" }],
    });

    if (!todo) {
      return res.status(404).json({ errors: [{ message: "Todo not found" }] });
    }

    // Update the status of the Todo and its subtasks
    todo.status = status;
    todo.subtasks.forEach((subtask) => {
      subtask.status = status;
    });

    // Save the changes
    await Promise.all([todo.save(), ...todo.subtasks.map((subtask) => subtask.save())]);

    // If the Todo is completed, reopen the parent Todo if any subtask is pending
    if (status === "completed") {
      const parentTodoId = todo.parentTodoId;

      if (parentTodoId) {
        const parentTodo = await Todo.findByPk(parentTodoId, {
          include: [{ model: Subtask, as: "subtasks" }],
        });

        if (parentTodo && parentTodo.subtasks.some((subtask) => subtask.status === "pending")) {
          parentTodo.status = "pending";
          await parentTodo.save();
        }
      }
    }

    return res.status(200).json({
      data: {
        type: "todos",
        id: todo.id,
        attributes: {
          title: todo.title,
          status: todo.status,
        },
        relationships: {
          subtasks: {
            links: {
              self: `${process.env.APP_URL}/todos/${todo.id}/relationships/subtasks`,
              related: `${process.env.APP_URL}/todos/${todo.id}/subtasks`,
            },
            data: todo.subtasks.map((subtask) => ({
              type: "subtasks",
              id: subtask.id,
            })),
          },
        },
        links: {
          self: `${process.env.APP_URL}/todos/${todo.id}`,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errors: [{ message: "Internal Server Error" }] });
  }
}

// Create a Subtask
async function createSubtask(req, res) {
  const { id } = req.params;
  const { title } = req.body;

  try {
    // check existing todo
    const todo = await Todo.findByPk(id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    const subtask = await Subtask.create({ title, TodoId: id });
    res.status(201).json({
      data: {
        type: "subtasks",
        id: subtask.id,
        attributes: {
          title: subtask.title,
        },
        links: {
          self: `${process.env.APP_URL}/subtasks/${subtask.id}`,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: [{ message: "Internal Server Error" }] });
  }
}

// Update a Subtask
async function updateSubtask(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    let subtask = await Subtask.findByPk(id, {
      include: [{ model: Todo, as: "todo" }],
    });

    if (!subtask) {
      return res.status(404).json({ errors: [{ message: "Subtask not found" }] });
    }

    // Update the status of the Subtask
    subtask.status = status;

    // If the Subtask is marked as pending and the parent Todo is completed, reopen the parent Todo
    if (status === "pending" && subtask.todo.status === "completed") {
      subtask.todo.status = "pending";
      await subtask.todo.save();
    }

    // Save the changes
    await subtask.save();

    return res.status(200).json({
      data: {
        type: "subtasks",
        id: subtask.id,
        attributes: {
          title: subtask.title,
          status: subtask.status,
        },
        relationships: {},
        links: {
          self: `${process.env.APP_URL}/subtasks/${subtask.id}`,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errors: [{ message: "Internal Server Error" }] });
  }
}

// Get subtasks by TodoId
async function getSubtasksByTodoId(req, res) {
  const { id } = req.params;

  try {
    // check existing todo
    const todo = await Todo.findByPk(id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    const subtasks = await Subtask.findAll({
      where: { TodoId: id },
    });

    const subtaskData = subtasks.map((subtask) => ({
      type: "subtasks",
      id: subtask.id,
      attributes: {
        title: subtask.title,
        status: subtask.status,
        createdAt: subtask.createdAt,
        todoId: subtask.TodoId,
      },
      relationships: {},
      links: {
        self: `${process.env.APP_URL}/todos/${id}/subtasks`,
      },
    }));

    res.status(200).json({
      data: subtaskData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  createSubtask,
  updateSubtask,
  getSubtasksByTodoId,
};
