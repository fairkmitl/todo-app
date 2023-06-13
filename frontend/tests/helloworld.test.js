// helloworld.test.js

import HelloWorld from "../src/components/HelloWorld.vue";
import { mount } from "@vue/test-utils";

test("HelloWorld Component renders the correct text", () => {
  const wrapper = mount(HelloWorld);
  expect(wrapper.text()).toBe("Hello there!");
});
