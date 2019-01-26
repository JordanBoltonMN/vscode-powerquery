import { format, FormatRequest, IndentationLiteral, NewlineLiteral, Result, ResultType, SerializerOptions } from "pq-fmt-core";
import * as vscode from "vscode";
import { CancellationToken, DocumentFilter, DocumentFormattingEditProvider, DocumentSelector, FormattingOptions, Range, TextDocument, TextEdit } from "vscode";

export class PowerQueryEditProvider implements DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(
        document: TextDocument,
        options: FormattingOptions,
        _: CancellationToken
    ): Promise<TextEdit[]> {
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
            document: document.getText(),
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

function selector(): DocumentSelector {
    const allLanguages = allEnabledLanguages();
    const allRangeLanguages = rangeSupportedLanguages();
    const { disableLanguages } = getConfig();
    const globalLanguageSelector = allLanguages.filter(
        l => !disableLanguages.includes(l)
    );
    const globalRangeLanguageSelector = allRangeLanguages.filter(
        l => !disableLanguages.includes(l)
    );
    if (workspace.workspaceFolders === undefined) {
        // no workspace opened
        return {
            languageSelector: globalLanguageSelector,
            rangeLanguageSelector: globalRangeLanguageSelector,
        };
    }

    // at least 1 workspace
    const untitledLanguageSelector: DocumentFilter[] = globalLanguageSelector.map(
        l => ({ language: l, scheme: 'untitled' })
    );
    const untitledRangeLanguageSelector: DocumentFilter[] = globalRangeLanguageSelector.map(
        l => ({ language: l, scheme: 'untitled' })
    );
    const fileLanguageSelector: DocumentFilter[] = globalLanguageSelector.map(
        l => ({ language: l, scheme: 'file' })
    );
    const fileRangeLanguageSelector: DocumentFilter[] = globalRangeLanguageSelector.map(
        l => ({ language: l, scheme: 'file' })
    );
    return {
        languageSelector: untitledLanguageSelector.concat(fileLanguageSelector),
        rangeLanguageSelector: untitledRangeLanguageSelector.concat(
            fileRangeLanguageSelector
        ),
    };
}

function fullDocumentRange(document: TextDocument): Range {
    const lastLineId = document.lineCount - 1;
    return new Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}