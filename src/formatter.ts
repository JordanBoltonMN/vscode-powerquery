import { format, FormatRequest, IndentationLiteral, NewlineLiteral, Result, ResultType, SerializerOptions } from "pq-fmt-core";
import * as vscode from "vscode";
import { CancellationToken, DocumentFormattingEditProvider, FormattingOptions, Range, TextDocument, TextEdit } from "vscode";

export class PowerQueryEditProvider implements DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(
        document: TextDocument,
        options: FormattingOptions,
        _: CancellationToken
    ): Promise<TextEdit[]> {
        const documentText = document.getText();
        if (!documentText) {
            return Promise.resolve([]);
        }

        let indentationLiteral;
        if (options.insertSpaces) {
            indentationLiteral = IndentationLiteral.SpaceX4;
        }
        else {
            indentationLiteral = IndentationLiteral.Tab;
        }

        const serializerOptions: SerializerOptions = {
            indentationLiteral,
            newlineLiteral: NewlineLiteral.Unix,
        };
        const formatRequest: FormatRequest = {
            document: documentText,
            options: serializerOptions,
        }
        const formatResult: Result<string, string> = format(formatRequest);
        if (formatResult.type === ResultType.Ok) {
            return Promise.resolve([
                TextEdit.replace(
                    fullDocumentRange(document),
                    formatResult.value,
                )
            ]);
        }
        else {
            vscode.window.showInformationMessage("An error has occured while formatting");
            console.log(formatResult.error);
            return Promise.reject("An error occured while formatting");
        }
    }
}

function fullDocumentRange(document: TextDocument): Range {
    const lastLineId = document.lineCount - 1;
    return new Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}
