import { useState } from "react";
import type { Task } from "../../types";
import { X } from "lucide-react";

export default function MainLayout() {
  //store and update whole task
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");
  //currently dragged
  const [draggedTaskId, setDraggedTaskId] = useState<string[]>([]);
  //currently selected
  const [selectedTaskId, setSelectedTaskId] = useState<string[]>([]);

  //addtask
  const addTask = () => {
    if (!text.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: text,
      status: "todo",
    };
    setTasks((prev) => [...prev, newTask]);

    setText("");
  };

  //deletetask
  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };
  //movetask
  const dragTasks = (taskIds: string[], status: Task["status"]) => {
    setTasks((prev) =>
      prev.map((task) =>
        taskIds.includes(task.id) ? { ...task, status } : task,
      ),
    );
  };
  //filters task whose id === taskid.
  //Keeps the selected tasks in array.
  const multipleSelect = (taskId: string) => {
    setSelectedTaskId((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };
  console.log(selectedTaskId);

  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "inProgress");
  const doneTasks = tasks.filter((task) => task.status === "done");
  return (
    <>
      <div>
        <div className=" flex flex-col min-h-screen bg-linear-to-br from-sky-100 via-blue-200 to-blue-400">
          <div className="h-45">
            <label className="font-bold font-serif ml-2">Enter Task: </label>
            <input
              className="outline h-7 w-40 mt-5 rounded-2xl p-2"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTask();
                }
              }}
            ></input>
            <button
              onClick={addTask}
              className=" ml-3 h-8 bg-linear-to-r from-blue-500 to-blue-700 text-white px-4  rounded-lg"
            >
              Add Todo
            </button>
          </div>

          <div className="flex flex-row justify-center items-center">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedTaskId.length === 0) return;
                dragTasks(draggedTaskId, "todo");
                setDraggedTaskId([]);
              }}
              className="text-2xl text-center h-120 w-100 bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-8 w-full max-w-md mr-5"
            >
              <h2>
                <strong>Todo</strong>
              </h2>
              {todoTasks.map((task) => (
                <div
                  className="flex flex-row"
                  key={task.id}
                  draggable
                  //if selected task is dragged move all else move only selected task
                  onDragStart={() => {
                    if (selectedTaskId.includes(task.id)) {
                      setDraggedTaskId(selectedTaskId);
                    } else {
                      setDraggedTaskId([task.id]);
                    }
                  }}
                >
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 p-2 text-sm"
                  >
                    <X size={20} />
                  </button>
                  <div
                    onClick={() => multipleSelect(task.id)}
                    className={
                      selectedTaskId.includes(task.id) ? "bg-gray-300" : ""
                    }
                  >
                    {task.title}
                  </div>
                </div>
              ))}
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!draggedTaskId.length) return;
                dragTasks(draggedTaskId, "inProgress");
                setDraggedTaskId([]);
              }}
              className="text-2xl  text-center h-120 w-100 bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-8  w-full  max-w-md  mr-5"
            >
              <h2>
                <strong>InProgress</strong>
              </h2>

              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => {
                    if (selectedTaskId.includes(task.id)) {
                      setDraggedTaskId(selectedTaskId);
                    } else {
                      setDraggedTaskId([task.id]);
                    }
                  }}
                  className="flex flex-row"
                >
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 p-2 text-sm"
                  >
                    <X size={20} />
                  </button>
                  <div
                    onClick={() => multipleSelect(task.id)}
                    className={
                      selectedTaskId.includes(task.id) ? "bg-gray-300" : ""
                    }
                  >
                    {task.title}
                  </div>
                </div>
              ))}
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!draggedTaskId.length) return;
                dragTasks(draggedTaskId, "done");
                setDraggedTaskId([]);
              }}
              className="text-2xl text-center h-120 w-100  bg-white/30 backdrop-blur-md rounded-2xl shadow-xl  border border-white/40  p-8 w-full max-w-md"
            >
              <h2>
                <strong>Completed</strong>
              </h2>
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => {
                    if (selectedTaskId.includes(task.id)) {
                      setDraggedTaskId(selectedTaskId);
                    } else {
                      setDraggedTaskId([task.id]);
                    }
                  }}
                  className="flex flex-row"
                >
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 p-2 text-sm"
                  >
                    <X size={20} />
                  </button>
                  <div
                    onClick={() => multipleSelect(task.id)}
                    className={
                      selectedTaskId.includes(task.id) ? "bg-gray-300" : ""
                    }
                  >
                    {task.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
