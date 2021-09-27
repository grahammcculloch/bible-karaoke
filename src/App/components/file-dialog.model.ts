// Copied from `electron.d.ts` v9.4.4 since we can't import from 'electron' on the frontend.

interface FileFilter {
  // Docs: http://electronjs.org/docs/api/structures/file-filter

  extensions: string[];
  name: string;
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  /**
   * Custom label for the confirmation button, when left empty the default label will
   * be used.
   */
  buttonLabel?: string;
  filters?: FileFilter[];
  /**
   * Contains which features the dialog should use. The following values are
   * supported:
   */
  properties?: Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'promptToCreate'
    | 'noResolveAliases'
    | 'treatPackageAsDirectory'
    | 'dontAddToRecent'
  >;
  /**
   * Message to display above input boxes.
   *
   * @platform darwin
   */
  message?: string;
  /**
   * Create security scoped bookmarks when packaged for the Mac App Store.
   *
   * @platform darwin,mas
   */
  securityScopedBookmarks?: boolean;
}

export interface SaveDialogOptions {
  title?: string;
  /**
   * Absolute directory path, absolute file path, or file name to use by default.
   */
  defaultPath?: string;
  /**
   * Custom label for the confirmation button, when left empty the default label will
   * be used.
   */
  buttonLabel?: string;
  filters?: FileFilter[];
  /**
   * Message to display above text fields.
   *
   * @platform darwin
   */
  message?: string;
  /**
   * Custom label for the text displayed in front of the filename text field.
   *
   * @platform darwin
   */
  nameFieldLabel?: string;
  /**
   * Show the tags input box, defaults to `true`.
   *
   * @platform darwin
   */
  showsTagField?: boolean;
  properties?: Array<
    'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'showOverwriteConfirmation' | 'dontAddToRecent'
  >;
  /**
   * Create a security scoped bookmark when packaged for the Mac App Store. If this
   * option is enabled and the file doesn't already exist a blank file will be
   * created at the chosen path.
   *
   * @platform darwin,mas
   */
  securityScopedBookmarks?: boolean;
}
