// import { format, FormatRequest, IndentationLiteral, NewlineLiteral, Result, ResultType, SerializerOptions } from "pq-fmt-core";
import * as vscode from "vscode";
import { CancellationToken, DocumentFilter, DocumentFormattingEditProvider, DocumentSelector, FormattingOptions, Range, TextDocument, TextEdit } from "vscode";

export class PowerQueryEditProvider implements DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(
        document: TextDocument,
        options: FormattingOptions,
        _: CancellationToken
    ): Promise<TextEdit[]> {
        return Promise.resolve([
            TextEdit.replace(
                fullDocumentRange(document),
                "hi",
            )
        ]);

        // let indentationLiteral;
        // if (options.insertSpaces) {
        //     indentationLiteral = IndentationLiteral.SpaceX4;
        // }
        // else {
        //     indentationLiteral = IndentationLiteral.Tab;
        // }

        // const serializerOptions: SerializerOptions = {
        //     indentationLiteral,
        //     newlineLiteral: NewlineLiteral.Unix,
        // };
        // const formatRequest: FormatRequest = {
        //     document: document.getText(),
        //     options: serializerOptions,
        // }
        // const formatResult: Result<string, string> = format(formatRequest);
        // if (formatResult.type === ResultType.Ok) {
        //     return Promise.resolve([
        //         TextEdit.replace(
        //             fullDocumentRange(document),
        //             formatResult.value,
        //         )
        //     ]);
        // }
        // else {
        //     vscode.window.showInformationMessage("An error has occured while formatting");
        //     console.log(formatResult.error);
        //     return Promise.reject("An error occured while formatting");
        // }
    }
}

export function powerQueryDocumentSelector(): DocumentSelector {
    const languages = [
        "pq",
        "m",
        "mout",
    ];
    const selectors: DocumentFilter[] = languages.map(l => ({ language: l }));
    return selectors;
}

function fullDocumentRange(document: TextDocument): Range {
    const lastLineId = document.lineCount - 1;
    return new Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}