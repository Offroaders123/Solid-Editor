import { Accessor, createEffect, createMemo, createSignal, Setter } from "solid-js";
import "./NumText.css";

export interface NumTextProps {
  value?: string;
}

export default function NumText(props: NumTextProps) {
  const [getValue, setValue] = createSignal<string>(props.value ?? "");
  const getLines = createMemo<number>(() => (getValue().match(/\n/g) || []).length + 1);

  createEffect(() => {
    console.log(getLines());
  });

  return (
    <div class="NumText">
      <Gutter
        getLines={getLines}
      />
      <Textarea
        getValue={getValue}
        setValue={setValue}
      />
    </div>
  );
}

interface GutterProps {
  getLines: Accessor<number>;
}

function Gutter(props: GutterProps) {
  return (
    <ol class="Gutter">{
      Array.from({ length: props.getLines() }).map(() => <LineNumber/>)
    }</ol>
  );
}

function LineNumber() {
  return (
    <li
      class="LineNumber"
    />
  );
}

interface TextareaProps {
  getValue: Accessor<string>;
  setValue: Setter<string>;
}

function Textarea(props: TextareaProps) {
  return (
    <textarea
      class="Textarea"
      value={props.getValue()}
      oninput={event => props.setValue(event.currentTarget.value)}
    />
  );
}