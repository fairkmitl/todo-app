<template>
  <v-container style="max-width: 500px">
    <v-text-field
      v-model="newTask"
      label="What are you working on?"
      variant="solo"
      @keydown.enter="newTodo"
    >
      <template v-slot:append-inner>
        <v-fade-transition>
          <v-btn
            icon="mdi-plus-circle"
            variant="text"
            @click="newTodo"
            color="purple-darken-2"
          ></v-btn>
        </v-fade-transition>
      </template>
    </v-text-field>

    <h2 class="text-h4 text-purple-darken-2 ps-4">
      Todos:&nbsp;
      <v-fade-transition leave-absolute>
        <span :key="`todos-${todos.length}`">
          {{ todos.length }}
        </span>
      </v-fade-transition>
    </h2>

    <v-divider class="mt-4"></v-divider>

    <v-row class="my-1" align="center">
      <strong class="mx-4 text-info-darken-2">
        Remaining: {{ remainingTasks }}
      </strong>

      <v-divider vertical></v-divider>

      <strong class="mx-4 text-success-darken-2">
        Completed: {{ completedTasks }}
      </strong>

      <v-spacer></v-spacer>

      <v-progress-circular
        v-model="progress"
        :value="progress"
        class="me-2"
        color="orange-darken-4"
      ></v-progress-circular>
    </v-row>

    <v-divider class="mb-4"></v-divider>

    <v-expansion-panels v-model="panel">
      <v-expansion-panel v-for="(todo, i) in todos" :key="i">
        <v-expansion-panel-title>
          <div style="display: flex; align-items: center">
            <v-checkbox-btn
              v-model="todo.done"
              color="orange-darken-4"
              @click.stop="updateTodo(todo)"
            ></v-checkbox-btn>
            <span>{{ todo.title }}</span>
          </div>
          <div
            class="pr-4 pb-1 text-grey"
            style="position: absolute; bottom: 0; right: 0"
          >
            <template v-if="todo.subtasks">
              {{ countCompletedSubtasks(todo.subtasks) }} of
              {{ todo.subtasks?.length ?? 0 }} completed
            </template>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-card v-if="todo.subtasks && todo.subtasks.length > 0" class="mb-4">
            <v-slide-y-transition class="py-0" group tag="v-list">
              <template
                v-for="(st, j) in todo.subtasks"
                :key="`${j}-${todo.title}`"
              >
                <v-divider v-if="j !== 0" :key="`${i}-divider`"></v-divider>

                <v-list-item @click="st.done = !st.done">
                  <template v-slot:prepend>
                    <v-checkbox-btn
                      v-model="st.done"
                      color="grey"
                      @change="updateSubtask(st, todo)"
                    ></v-checkbox-btn>
                  </template>

                  <v-list-item-title>
                    <span :class="st.done ? 'text-grey' : 'text-primary'">{{
                      st.title
                    }}</span>
                  </v-list-item-title>

                  <template v-slot:append>
                    <v-expand-x-transition>
                      <v-icon v-if="st.done" color="success">
                        mdi-check
                      </v-icon>
                    </v-expand-x-transition>
                  </template>
                </v-list-item>
              </template>
            </v-slide-y-transition>
          </v-card>

          <v-text-field
            :disabled="todo.done"
            class="mt-4"
            v-model="newSubtask"
            label="Add subtask"
            variant="outlined"
            @keydown.enter="() => createSubtask(todo)"
          >
            <template v-slot:append-inner>
              <v-fade-transition>
                <v-btn
                  icon="mdi-plus-circle"
                  variant="text"
                  @click="() => createSubtask(todo)"
                ></v-btn>
              </v-fade-transition>
            </template>
          </v-text-field>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
import apiService from "./services/apiService";

export default {
  data: () => ({
    todos: [],
    newTask: null,
    newSubtask: null,
    panel: null,
  }),

  async created() {
    await this.getTodos();
  },

  async beforeMount() {},

  computed: {
    completedTasks() {
      return this.todos.filter((todo) => todo.done).length;
    },
    progress() {
      return this.todos.length > 0
        ? (this.completedTasks / this.todos.length) * 100
        : 0;
    },
    remainingTasks() {
      return this.todos.length - this.completedTasks;
    },
  },

  methods: {
    countCompletedSubtasks(subtasks) {
      return (subtasks ?? []).reduce((count, subtask) => {
        return subtask.done ? count + 1 : count;
      }, 0);
    },

    async getTodos() {
      try {
        let response = await apiService.getTodos();
        this.todos = apiService.transformApiResponse(response.data.data);
      } catch (error) {
        console.error(error);
      }
    },

    async newTodo() {
      try {
        const response = await apiService.postTodo(this.newTask);
        const createdTodo = apiService.transformApiResponse([
          response.data.data,
        ]);
        this.todos.push(createdTodo[0]);
        this.newTask = null;
      } catch (error) {
        console.error(error);
      }
    },

    async updateTodo(todo) {
      const index = this.todos.indexOf(todo);
      this.todos.splice(index, 1, {
        ...todo,
        done: !todo.done,
      });
      todo = this.todos[index];
      const status = todo.done ? "completed" : "pending";
      try {
        await apiService.updateTodo(status, todo.id);
        if (todo.done) {
          await Promise.all(
            todo.subtasks.map(async (subtask) => {
              if (!subtask.done) {
                subtask.done = true;
                await this.updateSubtask(subtask, todo);
              }
            })
          );
        }
      } catch (error) {
        console.error(error);
      }
    },

    async createSubtask(todo) {
      try {
        await apiService
          .postSubtask(this.newSubtask, todo.id)
          .then((response) => {
            let createdSubtask = apiService.transformApiResponse([
              response.data.data,
            ]);
            console.log(todo.subtasks);
            todo.subtasks.push(createdSubtask[0]);
            this.newSubtask = null;
          });
      } catch (error) {
        console.error(error);
      }
    },

    async updateSubtask(subtask, parentTodo) {
      var status = subtask.done ? "completed" : "pending";
      try {
        await apiService.updateSubtask(status, subtask.id).then((response) => {
          let updatedSubtask = apiService.transformApiResponse([
            response.data.data,
          ]);
          subtask = updatedSubtask[0];
          // Check if any subtask is not done
          if (parentTodo && parentTodo.subtasks.some((st) => !st.done)) {
            parentTodo.done = false;
          }
        });
      } catch (error) {
        console.error(error);
      }
    },

    // async getSubtasks(todo) {
    //   try {
    //     const response = await apiService.getSubtasksByTodoId(todo.id);
    //     todo.subtasks = apiService.transformApiResponse(response.data.data);
    //     this.newSubtask = null;
    //   } catch (error) {
    //     console.error(error);
    //   }
    // },
  },
};
</script>
