import { tx, id } from "@dorilama/instantdb-vue";
import type { Todo } from "@/db";
import { db } from "@/db";

export function addTodo(text: string) {
  if (!text) {
    return;
  }
  db.transact(
    tx.todos[id()].update({
      text,
      done: false,
      createdAt: Date.now(),
    })
  );
}

export function toggleAll(todos: Todo[] = []) {
  const newVal = todos.some((todo) => !todo.done);
  db.transact(todos.map((todo) => tx.todos[todo.id].update({ done: newVal })));
}

export function willCheckAll(todos: Todo[] = []) {
  return todos.some((todo) => !todo.done);
}

export function deleteCompleted(todos: Todo[]) {
  const completed = todos.filter((todo) => todo.done);
  const txs = completed.map((todo) => tx.todos[todo.id].delete());
  db.transact(txs);
}

export function toggleDone(todo: Todo) {
  db.transact(tx.todos[todo.id].update({ done: !todo.done }));
}

export function deleteTodo(todo: Todo) {
  db.transact(tx.todos[todo.id].delete());
}
