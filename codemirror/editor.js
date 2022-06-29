/*
Generate bundle with
    node_modules/.bin/rollup -c
*/
import {basicSetup} from "codemirror"
export {javascript} from "@codemirror/lang-javascript"
export {json, jsonParseLinter} from "@codemirror/lang-json"
export {EditorState, StateField, StateEffect} from "@codemirror/state"
import {defaultKeymap, history, historyKeymap, indentWithTab} from "@codemirror/commands"
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
export {linter, lintGutter, lintKeymap} from "@codemirror/lint";
export {autocompletion, insertCompletionText} from "@codemirror/autocomplete";



const myHighlightStyle = HighlightStyle.define([
    { tag: tags.propertyName, color: "#d14" },
]);


export const default_extensions = [
    basicSetup,
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
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
