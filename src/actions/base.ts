export interface Action {
  (upload: File, runView: (name: string, upload: File) => {}): Promise<string>;
}
