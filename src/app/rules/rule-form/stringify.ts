 /**
   * Stringifies a JSON object in a convinient way to display it
   * @param object object to stringify
   * @param indent internal recursive parameter, leave empty
   * @returns multiline string of the object to display it
   */
 export function stringify(object: any, indent: string = ''): string {
    let result: string = "";
    const sub: string[] = [];
    if (Array.isArray(object)) {
      let totalLen = 0;
      let noObject = true;
      for (const elem of object) {
        noObject &&= !Array.isArray(elem) && typeof elem !== 'object';
        const newStr = stringify(elem, indent + '  ');
        totalLen += newStr.length;
        sub.push(newStr);
      }
      if (totalLen < 60 && noObject) {
        result = `[ ${sub.join(', ')} ]`;
      } else if (sub[0].length < 10) {
        result = `[ ${sub.join(',\n  ' + indent)}\n${indent}]`;
      } else {
        result = `[\n  ${indent + sub.join(',\n  ' + indent)}\n${indent}]`;
      }
    } else if (typeof object === 'object') {
      for (const index in object) {
        const elem = object[index];
        sub.push(`"${index}": ${stringify(elem, indent + '  ')}`)
      }
      result = `{\n  ${indent + sub.join(',\n  ' + indent)}\n${indent}}`;
    } else if (object !== undefined) {
      result = `"${object}"`;
    }
    return result;
  }