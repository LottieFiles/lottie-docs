/*
Generate bundle with
    node_modules/.bin/rollup -c
*/
import {basicSetup} from "codemirror"
export {javascript} from "@codemirror/lang-javascript"
export {json, jsonParseLinter} from "@codemirror/lang-json"
export {EditorState, StateField, StateEffect} from "@codemirror/state"
export {undo, redo} from "@codemirror/commands"
import {defaultKeymap, history, historyKeymap, indentWithTab, redo} from "@codemirror/commands"
import {keymap, EditorView, Decoration} from "@codemirror/view"
export {
    EditorView,
    WidgetType,
    Decoration,
    ViewPlugin,
    keymap,
    showTooltip
} from "@codemirror/view"
import {
    syntaxHighlighting,
    defaultHighlightStyle,
    indentUnit,
    HighlightStyle
} from "@codemirror/language"
export {ensureSyntaxTree, LanguageSupport} from "@codemirror/language"
import {tags} from "@lezer/highlight"
export {linter, lintGutter, lintKeymap, setDiagnostics} from "@codemirror/lint";
export {autocompletion, insertCompletionText} from "@codemirror/autocomplete";
import {gotoLine} from "@codemirror/search";
export {openSearchPanel, gotoLine} from "@codemirror/search";



const myHighlightStyle = HighlightStyle.define([
    { tag: tags.propertyName, color: "#d14" },
]);


export const default_extensions = [
    history(),
    keymap.of([
        {key: "Mod-g", scope: "editor", run: gotoLine, preventDefault: true},
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab,
        {linux: "Mod-Shift-z", run: redo, preventDefault: true},
    ]),
    basicSetup,
    syntaxHighlighting(defaultHighlightStyle),
    syntaxHighlighting(myHighlightStyle),
    indentUnit.of("    ")
];

export function on_change(callback)
{
    return EditorView.updateListener.of((update) =>
    {
        if (update.docChanged)
            callback(update);
    });
}
