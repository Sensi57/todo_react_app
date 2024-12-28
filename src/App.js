import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash, Edit } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [filterState, setFilterState] = useState(null);
  const [sortState, setSortState] = useState(null);

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const taskState = useRef("");
  const taskDeadline = useRef("");

  function createNewTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current.value || "Not done",
      deadline: taskDeadline.current.value || null,
    };

    if (editingTaskIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editingTaskIndex] = newTask;
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setEditingTaskIndex(null);
    } else {
      setTasks([...tasks, newTask]);
      saveTasks([...tasks, newTask]);
    }
  }

  function deleteTask(index) {
    const clonedTasks = [...tasks];
    clonedTasks.splice(index, 1);
    setTasks(clonedTasks);
    saveTasks(clonedTasks);
  }

  function loadTasks() {
    const loadedTasks = localStorage.getItem("tasks");
    const parsedTasks = JSON.parse(loadedTasks);
    if (parsedTasks) setTasks(parsedTasks);
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = tasks
    .filter((task) => !filterState || task.state === filterState)
    .sort((a, b) => {
      if (sortState) {
        if (sortState === "Done") return a.state === "Done" ? -1 : 1;
        if (sortState === "Doing right now") return a.state === "Doing right now" ? -1 : 1;
        if (sortState === "Not done") return a.state === "Not done" ? -1 : 1;
        if (sortState === "Deadline")
          return new Date(a.deadline) - new Date(b.deadline);
      }
      return 0;
    });

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Modal
            opened={opened}
            size={"md"}
            title={editingTaskIndex !== null ? "Edit Task" : "New Task"}
            withCloseButton={false}
            onClose={() => setOpened(false)}
            centered
          >
            <TextInput
              ref={taskTitle}
              mt={"md"}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              mt={"md"}
              label={"State"}
              ref={taskState}
              placeholder={"Select state"}
              data={["Done", "Not done", "Doing right now"]}
            />
            <TextInput
              ref={taskDeadline}
              mt={"md"}
              type="date"
              label={"Deadline"}
              placeholder={"Select deadline"}
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => setOpened(false)}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  createNewTask();
                  setOpened(false);
                }}
              >
                {editingTaskIndex !== null ? "Save Changes" : "Create Task"}
              </Button>
            </Group>
          </Modal>
          <Container size={550} my={40}>
            <Group position={"apart"}>
              <Title
                sx={(theme) => ({
                  fontFamily: `Arial, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <MoonStars size={16} />
                )}
              </ActionIcon>
            </Group>
            <Group mt={"md"}>
              Firstly
              <Button color="red" onClick={() => setSortState("Deadline")}>Deadline</Button>
              <Button color="green" sonClick={() => setSortState("Done")}>Done</Button>
              <Button onClick={() => setSortState("Doing right now")}>Doing</Button>
              <Button onClick={() => setSortState("Not done")}>Not Done</Button>
            </Group>
            <Group mt={"md"}>
              Show by
              <Button color="green" onClick={() => setFilterState("Done")}>Done</Button>
              <Button onClick={() => setFilterState("Not done")}>
                Not done
              </Button>
              <Button onClick={() => setFilterState("Doing right now")}>
                Doing
              </Button>
            </Group>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <Group>
                      <ActionIcon
                        onClick={() => {
                          setEditingTaskIndex(index);
                          setOpened(true);
                        }}
                        color={"blue"}
                        variant={"transparent"}
                      >
                        <Edit />
                      </ActionIcon>
                      <ActionIcon
                        onClick={() => deleteTask(index)}
                        color={"red"}
                        variant={"transparent"}
                      >
                        <Trash />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary || "No summary provided"}
                  </Text>
                  <Text size={"sm"} mt={"sm"}>
                    State: {task.state}
                  </Text>
                  {task.deadline && (
                    <Text size={"sm"}>Deadline: {task.deadline}</Text>
                  )}
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}
            <Button
              onClick={() => {
                setEditingTaskIndex(null);
                setOpened(true);
              }}
              fullWidth
              mt={"md"}
            >
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
