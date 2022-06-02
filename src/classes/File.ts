import { FileUpload } from "graphql-upload";
import { Stream } from "stream";
import { v4 } from "uuid";
import { SavingFileError } from "../errors/SavingFileError";
import { join } from "path";
import * as Sharp from "sharp";
import { createWriteStream, unlink, exists } from "fs";

export class File {
  private static readonly _rootDir = join(process.cwd(), "static");
  private _file: FileUpload;
  private _path: string;
  private _name: string;
  private _extension: string;
  private _linkedFiles: File[] = [];

  get file() {
    return this._file;
  }

  get name() {
    return this._name;
  }

  get nameWithExtension() {
    return `${this._name}.${this.extension}`;
  }

  get path() {
    return this._path;
  }

  get extension() {
    return this._extension;
  }

  get fullPath() {
    return join(File._rootDir, this._path, this.nameWithExtension);
  }

  get linkedFiles() {
    return this._linkedFiles;
  }

  private constructor(file?: FileUpload) {
    this._file = file;
  }

  static getPath(...paths: string[]) {
    return join(File._rootDir, ...paths);
  }

  static async create(file?: Promise<FileUpload>) {
    if (file) {
      return new File(await file);
    }
    return new File();
  }

  autoName() {
    this._name = v4();
    return this;
  }

  setExtension(extension: string) {
    this._extension = extension;
    return this;
  }

  setName(name: string) {
    this._name = name;
    return this;
  }

  setPath(...paths: string[]) {
    this._path = join(...paths);
    return this;
  }

  async saveImage() {
    if (
      !["image/jpg", "image/jpeg", "image/png"].includes(this._file.mimetype)
    ) {
      throw new Error("File isn't jpg/png/jpeg");
    }

    const stream: Stream = this._file.createReadStream();

    try {
      await this.saveStream(stream, this.fullPath);
    } catch (err) {
      this.delete();
      throw new SavingFileError();
    }

    return this;
  }

  async saveImageAndWebp() {
    try {
      await this.setPath("images").autoName().setExtension("png").saveImage();
      await this.createWebp();
      return this;
    } catch (err) {
      console.log(err);
      this.deleteWithLinkedFiles();
      throw new SavingFileError();
    }
  }

  static async delete(file: File) {
    return new Promise(async (resolve, reject) => {
      const exists = await file.exists();

      if (!exists) {
        resolve();
      } else {
        unlink(file.fullPath, (err) => {
          if (err) {
            reject("Error while deleting a file");
            console.log(err);
          } else {
            resolve(file.fullPath);
          }
        });
      }
    });
  }

  async delete() {
    await File.delete(this);
    return this;
  }

  async deleteWithLinkedFiles() {
    await Promise.all([this, ...this.linkedFiles].map((f) => f.delete()));
    return this;
  }

  async exists() {
    return new Promise((resolve, reject) => {
      exists(this.fullPath, (exists) => {
        resolve(exists);
      });
    });
  }

  isImage(mimetype: string) {
    return ["image/png", "image/jpg", "image/jpeg"].includes(mimetype);
  }

  async createWebp() {
    const file = (await File.create())
      .setPath(this._path, "webp")
      .setName(this.name)
      .setExtension("webp");
    this.linkedFiles.push(file);
    await Sharp(this.fullPath).webp().toFile(file.fullPath);
    return this;
  }

  async saveStream(stream: Stream, path: string) {
    return new Promise((resolve, reject) => {
      stream
        .on("error", (err) => {
          unlink(path, () => {});
          reject(err);
        })
        .pipe(createWriteStream(path))
        .on("error", (err) => {
          console.log(err);
          reject(err);
        })
        .on("finish", () => resolve(path));
    });
  }
}
