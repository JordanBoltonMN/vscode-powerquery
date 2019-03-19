import * as pqFmt from "powerquery-fmt";
import * as vscode from "vscode";
import {
    CancellationToken,
    DocumentFormattingEditProvider,
    FormattingOptions,
    Range,
    TextDocument,
    TextEdit
} from "vscode";

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
            indentationLiteral = pqFmt.IndentationLiteral.SpaceX4;
        } else {
            indentationLiteral = pqFmt.IndentationLiteral.Tab;
        }

        const serializerOptions: pqFmt.SerializerOptions = {
            indentationLiteral,
            newlineLiteral: pqFmt.NewlineLiteral.Unix
        };
        const formatRequest: pqFmt.FormatRequest = {
            document: documentText,
            options: serializerOptions
        };
        const formatResult: pqFmt.Result<string, pqFmt.TFormatError> = pqFmt.format(
            formatRequest
        );
        if (formatResult.kind === pqFmt.ResultKind.Ok) {
            return Promise.resolve([
                TextEdit.replace(fullDocumentRange(document), formatResult.value)
            ]);
        } else {
            const error = formatResult.error;
            console.error(error);

            let informationMessage;
            if (error instanceof pqFmt.LexerError || error instanceof pqFmt.ParserError) {
                informationMessage = error.innerError.message;
            } else {
                informationMessage = "An unknown error occured during formatting.";
            }

            vscode.window.showInformationMessage(informationMessage);
            return Promise.reject(error);
        }
    }
}

function fullDocumentRange(document: TextDocument): Range {
    const lastLineId = document.lineCount - 1;
    return new Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}
