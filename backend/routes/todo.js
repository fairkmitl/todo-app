const express = require("express");
const todosController = require("../controllers/todo");
const router = express.Router();

// Create a Todo
router.post("/", todosController.createTodo);

// Update a Todo
router.patch("/:id", todosController.updateTodo);

// Get list of Todos with Subtasks
router.get("/", todosController.getTodos);

// Create a Subtask
router.post("/:id/subtask", todosController.createSubtask);

// Update a Subtask
router.patch("/subtask/:id", todosController.updateSubtask);

// Get subtasks by TodoId
router.get("/:id/subtasks", todosController.getSubtasksByTodoId);

module.exports = router;
