import { createSignal } from "solid-js";
import NumText from "./NumText.js";
import indexURL from "./index.js?url";
import htmlURL from "../index.html?url";
import "./App.css";

import type { Accessor, Setter } from "solid-js";

const [index, html] = await Promise.all([indexURL, htmlURL].map(url => fetch(url).then(response => response.text())));

export default function App() {
  const [editors, setEditors] = createSignal<EditorState[]>([]);

  setEditors(previous => [...previous, new EditorState({ name: "index.js", value: index }), new EditorState({ name: "index.html", value: html })]);

  return (
    <div class="App">
      <Workspace editors={editors} setEditors={setEditors}/>
    </div>
  );
}

function Workspace(props: { editors: Accessor<EditorState[]>; setEditors: Setter<EditorState[]>; }) {
  return (
    <div class="Workspace">
      <Tabs editors={props.editors} setEditors={props.setEditors}/>
      <Editors editors={props.editors}/>
    </div>
  );
}

function Tabs(props: { editors: Accessor<EditorState[]>; setEditors: Setter<EditorState[]>; }) {
  return (
    <div class="Tabs">
      {props.editors().map(editor => <Tab editor={editor} setEditors={props.setEditors}/>)}
      <Menus setEditors={props.setEditors}/>
    </div>
  );
}

function Tab(props: { editor: EditorState; setEditors: Setter<EditorState[]>; }) {
  return (
    <div class="Tab">
      <button>{props.editor.name}</button>
      <button onclick={() => props.setEditors(previous => previous.filter(editor => editor.uuid !== props.editor.uuid))}>×</button>
    </div>
  );
}

function Menus(props: { setEditors: Setter<EditorState[]>; }) {
  return (
    <div class="Menus">
      <Menu onclick={async () => {
        const files: File[] = await openFile({ multiple: true });
        const entries: [string, string][] = await Promise.all(files.map(async file => [file.name, await file.text()]));
        const editors: EditorState[] = entries.map(([name, value]) => new EditorState({ name, value }));
        props.setEditors(previous => [...previous, ...editors]);
      }}>📎</Menu>
      <Menu onclick={() => props.setEditors(previous => [...previous, new EditorState({ name: "Untitled.txt", value: `Hello world!\n${crypto.randomUUID()}` })])}>+</Menu>
    </div>
  );
}

function Menu(props: { onclick: () => void; children: string; }) {
  return (
    <button class="Menu" onclick={props.onclick}>{props.children}</button>
  );
}

function Editors(props: { editors: Accessor<EditorState[]>; }) {
  return (
    <div class="Editors">
      {props.editors().map(editor => <Editor editor={editor}/>)}
    </div>
  );
}

function Editor(props: { editor: EditorState; }) {
  return (
    <NumText
      value={props.editor.value}
    />
  );
}

class EditorState {
  name: string;
  value: string;
  readonly uuid = crypto.randomUUID();

  constructor({ name, value }: { name: string, value: string }) {
    this.name = name;
    this.value = value;
  }
}

async function openFile({ multiple = false }: { multiple?: boolean; }): Promise<File[]> {
  return await new Promise<File[]>((resolve, reject) => {
    const input: HTMLInputElement = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    input.addEventListener("change", () => resolve([...input.files!]), { once: true });
    input.addEventListener("error", reject, { once: true });
    input.click();
  });
}