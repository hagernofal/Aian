export abstract class StorageProvider {
  /**
   * Saves a file to the underlying storage system.
   *
   * @param file The Multer file object containing the buffer
   * @param filename The unique filename to save it as
   * @param category The logical category or folder (e.g., 'images', 'documents')
   * @returns A promise that resolves to the public URL or relative path of the saved file
   */
  abstract save(
    file: Express.Multer.File,
    filename: string,
    category: string,
  ): Promise<string>;
}
