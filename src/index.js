const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers

  const userFounded = users.find(user => user.username === username)

  if (!userFounded)
    return response.status(404).json({ error: 'User not found!' })


  request.user = userFounded

  next()


}

app.post('/users', (request, response) => {

  const { name, username } = request.body

  const userFounded = users.find(user => user.username == username)

  if (userFounded) {
    return response.status(400).json({ error: 'User already exists, try another one' })
  }

  let userJson = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(userJson)

  return response.status(201).json(userJson)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user


  return response.status(200).json(todos)


});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { title, deadline } = request.body
  const { todos } = request.user

  let newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  todos.push(newTodo)

  return response.status(201).json(newTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  let { todos } = request.user
  const { title, deadline } = request.body
  const { id } = request.params

  const todo = todos.find(todo => todo.id === id)

  if (!todo)
    return response.status(404).json({ error: ' todo not exists' })

  todo.title = title
  todo.deadline = deadline

  return response.json(todo)


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  let { todos } = request.user
  const { id: todoId } = request.params

  const todo = todos.find(todo => todo.id === todoId)

  if (!todo)
    return response.status(404).json({ error: 'todo not found' })


  todo.done = true

  return response.json(todo)


});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { id: todoId } = request.params
  let { todos } = request.user

  const todoFounded = todos.find(todo => todo.id === todoId)

  if (!todoFounded) {
    return response.status(404).json({ error: 'todo not found' })
  }


  todos.splice(todoFounded, 1)

  return response.status(204).json({ message: `todo ${todoFounded.title} deleted`, todosListUpdated: todos })



});

module.exports = app;