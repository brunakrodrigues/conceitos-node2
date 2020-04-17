const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];
const likes = [];

function logRequests(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.log(logLabel)
  
  return next(); 
}

function validateRepositoryId(request, responde, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({error: 'Invalid repository ID'})
  }

  return next();
}

app.use(logRequests);
app.use('/repositories/:id', validateRepositoryId);

app.get("/repositories", (request, response) => {
  const { title } = request.query;

  const results = title
  ? repositories.filter(repository => repository.title.includes(title))
  : repositories;

  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = { id: uuid(), title, url, techs};

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  if (repositoryIndex < 0) {
    return response.status(400).json({error: 'Repository not found'})
  }

  const repository = {
    id,
    title,
    url,
    techs,
  };
  
  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  if (repositoryIndex < 0) {
    return response.status(400).json({error: 'repository not found'})
  }

  repositories.splice(repositoryIndex, 1);
  
  return response.status(204).send();
});

app.get("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  if (repositoryIndex < 0) {
    return response.status(400).json({error: 'repository not found'})
  }

  const likeIndex = likes.findIndex(like => like.repository_id === id);
  const like = likes[likeIndex];

  return response.json(like || {});
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  if (repositoryIndex < 0) {
    return response.status(400).json({error: 'repository not found'})
  }

  let likeIndex = likes.findIndex(like => like.repository_id === id);
  if (likeIndex === -1) {
    likeIndex = 0;
  }
  
  let like = likes[likeIndex];
  if (!like) {
    likes[likeIndex] = {
      id: uuid(),
      repository_id: id,
      counter: 0,
    }
  }

  likes[likeIndex].counter++;
  return response.status(204).send();
});

module.exports = app;
