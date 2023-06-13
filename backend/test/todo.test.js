const request = require("supertest");
const app = require("../server"); // Import your Express app

describe("Todo routes", () => {
  // Existing tests
  // Testing POST route
  describe("POST /", () => {
    it("should create a new todo and return 201 status code", async () => {
      const response = await request(app).post("/todos").send({ title: "New Todo" });
      expect(response.statusCode).toBe(201);
      expect(response.body.data.attributes.title).toBe("New Todo");
    });
  });

  // Testing GET route
  describe("GET /", () => {
    it("should get all todos and return 200 status code", async () => {
      const response = await request(app).get("/todos");
      expect(response.statusCode).toBe(200);
    });
  });

  // Testing PATCH route for updating a Todo
  describe("PATCH /:id", () => {
    it("should update a specific todo and return 200 status code", async () => {
      const response = await request(app)
        .patch("/todos/1") // Assuming you have Todo with ID 1
        .send({ status: "completed" });
      expect(response.statusCode).toBe(200);
    });
  });

  // Testing POST route for creating a Subtask
  describe("POST /:id/subtask", () => {
    it("should create a new subtask for a specific todo and return 201 status code", async () => {
      const response = await request(app)
        .post("/todos/1/subtask") // Assuming you have Todo with ID 1
        .send({ title: "New Subtask" });
      expect(response.statusCode).toBe(201);
    });
  });

  // Testing PATCH route for updating a Subtask
  describe("PATCH /subtask/:id", () => {
    it("should update a specific subtask and return 200 status code", async () => {
      const response = await request(app)
        .patch("/todos/subtask/1") // Assuming you have Subtask with ID 1
        .send({ status: "completed" });
      expect(response.statusCode).toBe(200);
    });
  });

  // Testing GET route for Subtasks of a specific Todo
  describe("GET /:id/subtasks", () => {
    it("should get subtasks for a specific todo and return 200 status code", async () => {
      const response = await request(app).get("/todos/1/subtasks");
      expect(response.statusCode).toBe(200);
    });
  });

  // Non-existent tests
  // Testing PATCH route for a non-existing Todo
  describe("PATCH /:id", () => {
    it("should return 404 status code for non-existing todo", async () => {
      const response = await request(app)
        .patch("/todos/999999") // Non-existing Todo ID
        .send({ status: "completed" });
      expect(response.statusCode).toBe(404);
    });
  });

  // Testing POST route for creating a Subtask for a non-existing Todo
  describe("POST /:id/subtask", () => {
    it("should return 404 status code for non-existing todo", async () => {
      const response = await request(app)
        .post("/todos/999999/subtask") // Non-existing Todo ID
        .send({ title: "New Subtask" });
      expect(response.statusCode).toBe(404);
    });
  });

  // Testing PATCH route for updating a non-existing Subtask
  describe("PATCH /subtask/:id", () => {
    it("should return 404 status code for non-existing subtask", async () => {
      const response = await request(app)
        .patch("/todos/subtask/999999") // Non-existing Subtask ID
        .send({ status: "completed" });
      expect(response.statusCode).toBe(404);
    });
  });

  // Testing GET route for Subtasks of a non-existing Todo
  describe("GET /:id/subtasks", () => {
    it("should return 404 status code for non-existing todo", async () => {
      const response = await request(app).get("/todos/999999/subtasks");
      expect(response.statusCode).toBe(404);
    });
  });
});
