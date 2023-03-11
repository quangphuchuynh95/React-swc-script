export function write(text: string, clear: boolean = false) {
  if (clear) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
  process.stdout.write(text);
  process.stdout.write("\n");
}
