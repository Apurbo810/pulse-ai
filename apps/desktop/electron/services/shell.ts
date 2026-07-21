import { shell } from "electron";

export function openFileLocation(
  executablePath: string
) {
  shell.showItemInFolder(executablePath);
}