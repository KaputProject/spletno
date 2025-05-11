const Todo = require('../models/Todo');

// Get all todos
exports.getTodos = async (req, res) => {
    const todos = await Todo.find();
    res.json(todos);
};

// Create a new todo
exports.createTodo = async (req, res) => {
    const newTodo = new Todo(req.body);
    await newTodo.save();
    res.json(newTodo);
};

// Update a todo
exports.updateTodo = async (req, res) => {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTodo);
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
    await Todo.findByIdAndRemove(req.params.id);
    res.json({ message: 'Todo deleted successfully' });
};
