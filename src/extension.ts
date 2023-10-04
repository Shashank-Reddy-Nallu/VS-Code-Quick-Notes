// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vs-notes" is now active!');

	const decorationOptions = vscode.window.createTextEditorDecorationType({
		color: '#95cccc',
		fontStyle: 'oblique',
		fontWeight: 'bold'
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vs-code-quick-notes.execute', async () => {
		// The code you place here will be executed every time your command is executed

		// Check if there is an active Note Editor.
		const isActiveNoteEditor = vscode.window.visibleTextEditors.some((editors) => editors.document.languageId === 'markdown');

		if (isActiveNoteEditor) {
			focusOnNoteEditor();
		} else {
			vscode.window.showInformationMessage('VSCode Quick Notes is now active!');
			// Get the notes from the extension's global state.
			const notesContent = context.globalState.get<string>('vs_notes') || '';
			// Set the document
			const document = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: notesContent,
			});

			// Open the document with specified options
			await vscode.window.showTextDocument(document, {
				viewColumn: vscode.ViewColumn.Beside,
				preserveFocus: true
			}).then((noteEditor) => {
				// Apply the decoration to the entire document
				const range = new vscode.Range(0, 0, document.lineCount, 0);
				noteEditor.setDecorations(decorationOptions, [range]);
			});
		};
	});

	// Listen for document changes and save the vs_notes to the extension's global state.
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
		if (event.document.languageId === 'markdown') {
			context.globalState.update('vs_notes', event.document.getText());
		}
	}));

	// Show Message on Text Document close.
	context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((textDoc) => {
		if (textDoc.languageId === 'markdown' && textDoc.getText().length) {
			vscode.window.showInformationMessage("Content has been saved successfully in VS Code", { title: 'VSCode Quick Notes' });
		}
	}));

	context.subscriptions.push(disposable);
}

function focusAtEndOfLine(editor: vscode.TextEditor) {
	// Get the last line
	const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
	// Get the end of the last line
	const endOfLastLine = lastLine.range.end;
	// Reveal the range (scroll to it) and set the selection to the end of the line
	editor.revealRange(new vscode.Range(endOfLastLine, endOfLastLine));
	editor.selection = new vscode.Selection(endOfLastLine, endOfLastLine);
}

function focusOnNoteEditor() {
	// Get the note editor document
	const noteEditor = vscode.window.visibleTextEditors.find((editors) => editors.document.languageId === 'markdown');
	if (noteEditor) {
		vscode.window.showTextDocument(noteEditor.document, noteEditor.viewColumn).then(() => {
			focusAtEndOfLine(noteEditor);
		});
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }