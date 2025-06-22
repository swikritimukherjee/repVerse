// Helper to determine if a string is an HTTP(S) URL
export const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

export const FileCtor: typeof File =
  typeof File !== "undefined"
    ? File
    : (class NodeFile extends Blob {
        name: string;
        lastModified: number;
        constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
          super(bits, options);
          this.name = name;
          this.lastModified = options?.lastModified ?? Date.now();
        }
      } as any);
