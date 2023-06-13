import { mount } from "@vue/test-utils";
import App from "../src/App.vue";
import apiService from "../src/services/apiService";

jest.mock("../src/services/apiService");

describe("App.vue", () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(App, {
      global: {
        mocks: {
          apiService,
        },
      },
    });
  });

  it("renders the component", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("calls getTodos on component creation", async () => {
    const getTodosSpy = jest.spyOn(apiService, "getTodos");
    const wrapper = mount(App);
    await wrapper.vm.$nextTick();
    expect(getTodosSpy).toHaveBeenCalled();
  });

  it("calls newTodo method and adds a new todo", async () => {
    // Arrange
    const newTask = "new task";
    const createdTodo = { id: 1, title: newTask, done: false };
    apiService.postTodo.mockResolvedValueOnce({ data: { data: createdTodo } });
    apiService.transformApiResponse.mockReturnValueOnce([createdTodo]);

    // Act
    await wrapper.setData({ newTask });
    await wrapper.vm.newTodo();

    // Assert
    expect(apiService.postTodo).toBeCalledWith(newTask); // Updated
    expect(wrapper.vm.todos).toContainEqual(createdTodo);
    expect(wrapper.vm.newTask).toBe(null);
  });
});
