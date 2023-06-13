import axios from "axios";

let baseURL;

try {
  baseURL = import.meta.env.VITE_APP_API_URL; // use this line when start development
  // baseURL = process.env.TEST_APP_API_URL; // use this lien when start testing
} catch (error) {
  throw new Error(error);
}

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default {
  getTodos() {
    return apiClient.get("/");
  },

  getSubtasksByTodoId(todoId) {
    return apiClient.get(`/${todoId}/subtasks`);
  },

  postTodo(title) {
    return apiClient.post(`/`, { title });
  },

  updateTodo(status, todoId) {
    return apiClient.patch(`/${todoId}`, { status });
  },

  updateSubtask(status, subtaskId) {
    return apiClient.patch(`/subtask/${subtaskId}`, { status });
  },

  postSubtask(title, todoId) {
    return apiClient.post(`/${todoId}/subtask`, { title });
  },

  transformApiResponse(responseData) {
    return responseData.map((resource) => {
      const attributes = resource.attributes;
      const relationships = {};

      if (
        resource.relationships &&
        resource.relationships.subtasks &&
        resource.relationships.subtasks.data &&
        Array.isArray(resource.relationships.subtasks.data)
      ) {
        relationships.subtasks = resource.relationships.subtasks.data.map(
          (subtask) => {
            return {
              id: subtask.id,
              title: subtask.title || "",
              done: subtask.status === "completed",
            };
          }
        );
      }
      const done = attributes.status === "completed";

      return {
        id: resource.id,
        type: resource.type,
        ...attributes,
        done,
        subtasks: relationships.subtasks || [],
      };
    });
  },
};
