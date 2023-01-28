
export class ErrorList {
    errors: { description: string, line: number, pos: number }[] = []
    add(description: string, line: number, pos: number) {
        this.errors.push({ description, line, pos });
    }
    hasErrors() { return this.errors.length > 0; }
}

/**
 * Information about a token, content and position
 */
export type tokenInfo_t = {
    tk: string,
    line: number,
    pos: number
}

class Tokenizer {
    private input: string;
    private result: tokenInfo_t[] = [];
    private separators: string = "[]{}:, \"'\n\r";
    private spaces: string = " \n\r";
    private stringChars: string = "\"";
    private index: number = 0;
    private line: number = 0;
    private pos: number = 0;
    private errorList: ErrorList = new ErrorList();

    constructor(input: string) {
        this.input = input;
    }

    /**
     * Gets the current char
     * @returns current char
     */
    private getCh(): string | undefined {
        return this.input.at(this.index);
    }

    /**
     * Gets the next char
     * @returns next char
     */
    private nextCh(): string | undefined {
        this.pos++;
        if (this.getCh() === '\n') {
            this.pos = 0;
            this.line++;
        }
        this.index++;

        return this.getCh();
    }

    /**
     * Adds a token to the result list
     * @param tk token to add
     */
    private addTk(tk: string) {
        this.result.push({
            tk,
            line: this.line,
            pos: this.pos
        })
    }

    /**
     * Skips spaces in the input
     */
    private skipSpaces() {
        let ch = this.getCh();
        while (ch !== undefined && this.spaces.includes(ch)) {
            ch = this.nextCh();
        }
    }

    /**
     * Adds an error
     */
    private addError(text: string) {
        this.errorList.add(text, this.line, this.pos);
    }

    /**
     * Parses a string token
     * @returns string token
     */
    private parseString() {
        const starting = this.getCh();
        let ch = this.nextCh();
        let result = "";
        while (ch !== undefined) {
            if (ch === starting || ch === '\n' || ch === '\r') {
                break;
            }
            result += ch;
            ch = this.nextCh();
        }
        if (ch !== undefined && result !== undefined) {
            this.addTk(result);
        } else {
            this.addError(`Closing ${starting} not found`);
        }
    }

    /**
     * Splits a string into token
     * @returns list of token and list of errors
     */
    public tokenize(): { token: tokenInfo_t[], errors: ErrorList } {
        let cur: string = "";
        this.skipSpaces();
        let ch = this.getCh();
        while (ch !== undefined) {
            if (this.separators.includes(ch)) {
                if (cur.length > 0) {
                    this.addTk(cur);
                    cur = "";
                }
                if (this.stringChars.includes(ch)) {
                    this.parseString();
                } else {
                    this.addTk(ch);
                }
            } else {
                cur += ch;
            }
            this.nextCh();
            this.skipSpaces();
            ch = this.getCh();
        }
        if (cur.length > 0) {
            this.addTk(cur);
        }
        return { token: this.result, errors: this.errorList }
    }
}

export class Parser {
    tokens: tokenInfo_t[];
    pos: number = 0;
    errorList: ErrorList;

    constructor(input: string) {
        const tokenizer = new Tokenizer(input);
        const tokenizerResult = tokenizer.tokenize();
        this.tokens = tokenizerResult.token;
        this.errorList = tokenizerResult.errors;
    }

    private getTk(): string | undefined {
        const cur = this.tokens[this.pos];
        return cur !== undefined ? cur.tk : undefined;
    }

    private nextTk(): string | undefined {
        this.pos++;
        let curTk = this.getTk();
        while (curTk === ' ' || curTk === '\n') {
            this.pos++;
            curTk = this.getTk();
        }
        return curTk;
    }

    /**
     * Checks that the next token is identical to expected, scips it and returns the next token
     * @param expected expected token to skip
     * @returns token after expected token or next token on error
     */
    private skipNextTk(expected: string): string | undefined {
        const tk = this.nextTk();
        if (tk !== expected) {
            this.error(expected + ' expected');
            return tk;
        } else {
            return this.nextTk();
        }
    }

    /**
     * Adds an error to the error list
     */
    private error(description: string) {
        const pos = this.pos === 0 ? 0 : this.pos - 1;
        const curTk = this.tokens[pos];
        this.errorList.add(description, curTk.line, curTk.pos)
    }

    /**
     * Parses an array
     * @returns parsed array
     */
    private parseArray(): any[] | null {
        const result = []
        let tk = this.getTk();
        if (tk !== '[' && tk !== '"["') {
            return null;
        }
        tk = this.nextTk();
        while (tk !== ']' && tk !== '"]"' && tk !== undefined) {
            result.push(this._parse());
            tk = this.getTk();
            if (tk === ',') {
                tk = this.nextTk();
            } else if (tk !== ']' && tk !== '"]"') {
                this.error(', or ] expected');
                break;
            }
        }
        if (tk === undefined) {
            this.error('] expected');
        }
        this.nextTk();
        return result;
    }

    /**
     * Parses an object
     * @returns parsed object
     */
    private parseObject(): any {
        const result: any = {}
        let tk = this.getTk();
        if (tk !== '{' && tk !== '"{"') {
            return null;
        }
        tk = this.nextTk();
        while (tk !== '}' && tk !== '"}"' && tk !== undefined) {
            const name = tk;
            this.skipNextTk(':');
            result[name] = this._parse();
            tk = this.getTk();
            if (tk === ',') {
                tk = this.nextTk();
            } else if (tk !== '}' && tk !== '"}"') {
                this.error(', or } expected');
                break;
            }

        }
        if (tk === undefined) {
            this.error('} expected');
        }
        this.nextTk();
        return result;
    }


    /**
     * parses an object
     * @returns parsed object
     */
    private _parse(): any {
        let result: any;
        switch (this.getTk()) {
            case '[':
            case '"["': result = this.parseArray(); break;
            case '{':
            case '"{"': result = this.parseObject(); break;
            default: result = this.getTk(); this.nextTk();
        }
        return result;
    }

    /**
     * Parses the input and returns the object and a list of detected errors
     * @returns parsed object and error list
     */
    parse(): { parsed: any, error: ErrorList } {
        const parsedObject = this._parse();
        if (this.getTk() !== undefined) {
            this.error('end of input expected');
        }
        return { parsed: parsedObject, error: this.errorList }
    }
}
