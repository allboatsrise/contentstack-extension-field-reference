
declare module '@contentstack/ui-extensions-sdk' {
  /**
   * @todo Document this type
   */
  type Stack = unknown

  type Store = {
    /**
     * Gets the value of key
     * @param key Key of the stored data
     * @example extension.store.get('key').then((value) => console.log(value)) // will log value for the given key
     */
    get(key: string): Promise<unknown>
  
    /**
     * Gets an object with all the stored key-value pairs.
     * @example extension.store.getAll().then((obj) => obj)
     */
    getAll(): Promise<Record<string, unknown>>
  
    /**
       * Sets the value of a key
       * @param key Key of the stored data.
       * @param value Data to be stored.
       * @example extension.store.set('key', 'value').then((success) => console.log(success)) // will log ‘true’ when value is set
       */
    set(key: string, value: unknown): Promise<boolean>
  
    /**
     * Removes the value of a key
     * @param key  Key of the data to be removed from the store
     * @example extension.store.remove('key').then((success) => console.log(success)) // will log ‘true’ when value is removed
     */
    remove(key: string): Promise<boolean>
  
    /**
     * Clears all the stored data of an extension
     * @example extension.store.clear().then((success) => console.log(success)) // will log ‘true’ when values are cleared
     */
    clear(): Promise<boolean>
  }

  type Field = {
    /**
     * The UID of the current field is defined in the content type of the entry.
     */
    uid: string

    /**
     * The data type of the current field is set using this method.
     */
    data_type: string


    /**
     * The schema of the current field (schema of fields such as ‘Single Line Textbox’, ‘Number’,
     *  and so on) is set using this method.
     */
    schema: object;


    /**
     * Sets the data for the current field.
     * @param data Data to be set on the field
     * @return A promise object which is resolved when data is set for a field. Note: The data set by this function will only be saved when user saves the entry.
     */
    setData(data: object | string | number): Promise<void>


    /**
      * Gets the data of the current field
      * @param options Options object for get Data method.
      * @param options.resolved If the resolved parameter is set to true for the File field, then the method will return a resolved asset object along with all the field metadata, e.g. 'field.getData({resolved:true})'.
      * @return Returns the field data.
      */
    getData(options?: { resolved?: boolean }): object | string | number


    /**
     * Sets the focus for a field when an extension is being used. This method shows user presence and highlights the extension field that the user is currently accessing in Contentstack UI.
     * @return A promise object which is resolved when Contentstack UI returns an acknowledgement of the focused state.
     */
    setFocus(): Promise<void>


    /**
     * This function is called when another extension programmatically changes data of this field using field.setData() function, only available for extension field, only support extensions of data type text, number, boolean or date.
     * @param callback The function to be called when an entry is published.
     */
    onChange(callback: () => void): void
  }

  type Entry = {
    /**
     * Gets the content type of the current entry.
     */
    content_type: object

    /**
     * Gets the locale of the current entry.
     */
    locale: string

    /**
     * Gets data of the current entry.
     * @return Returns entry data.
     */
    getData(): unknown

    /**
     * Gets the field object for the saved data, which allows you to interact with the field.
     * This object will have all the same methods and properties of extension.field.
     * Note: For fields initialized using the getFields function, the setData function currently works only for the following fields: as single_line, multi_line, RTE, markdown, select, number, boolean, date, link, and extension of data type text, number, boolean, and date.
     * @example
     * var field = entry.getField('field_uid');
     * var fieldSchema = field.schema;
     * var fieldUid = field.uid;
     * var fieldData = field.getData();
     * @param uid Unique ID of the field
     * @return Field object
     */
    getField(uid: string): Field

    /**
     * This function executes the callback function every time an entry is saved.
     * @param callback The function to be called when an entry is saved.
     */
    onSave(callback: () => void): void

    /**
     * The field.onChange() function is called when another extension programmatically changes the data of the current extension field using the field.setData() function. This function is only available for extension fields that support the following data types: text, number, boolean, or date.
     * @param callback The function to be called when an entry is edited/changed.
     */
    onChange(callback: () => void): void


    /**
     * The onPublish() function executes the callback function every time an entry has been published with the respective payload.
     * @param callback The function to be called when an entry is published.
     */
    onPublish(callback: () => void): void

    /**
     * The onUnPublish() function executes the callback function every time an entry has been unpublished with the respective payload.
     * @param callback The function to be called when an entry is un published.
     */
    onUnPublish(callback: () => void): void
  }

  type Window = {
    /**
     * This method activates the resize button that gives you the provision to resize the window size of your Dashboard Widget.
     * @return {external:Promise}  A promise object which will resolve when a resize button is visible on the Dashboard Widget.
     */
    enableResizing(): Promise<void>

    /**
     * This function executes the callback function whenever a Dashboard Widget extension is maximized or minimized. Only applicable on Dashboard Widget extensions.
     * @param callback Function to be called when a Dashboard Widget extension is maximized or minimized
     * @return Will return true
     */
    onDashboardResize(callback: () => void): boolean

    /**
     * This method updates the extension height on Contentstack UI.
     * If the ‘height’ argument is not passed, it will calculate the scroll height and set the height of extension window accordingly.
     * @param height Desired height of the iframe window
     * @return A promise object which will be resolved when Contentstack UI sends an acknowledgement stating that the height has been updated.
     */
    updateHeight(height: string | number): Promise<void>

    /**
     * This method enables auto resizing of the extension height.
     */
    enableAutoResizing(): Window

    /**
     * This method disables auto resizing of the extension height.
     * @return {Window}.
     */
    disableAutoResizing(): Window
  }

  type BaseExtension<T extends 'FIELD' | 'WIDGET' | 'DASHBOARD'> = {
    /**
     * This method gives you the configuration parameters. Check out our {@link https://www.contentstack.com/docs/guide/extensions|UI Extension documentation} .
     */
    config: object

    /**
     * This object holds details of the current user.
     */
    currentUser: object

    /**
     * type of extension, 'FIELD' || 'WIDGET' || 'DASHBOARD'.
     */
    type: T

    /**
     * Store to persist data for extension.
     * Note: Data is stored in the browser {@link external:localStorage} and will be lost if the {@link external:localStorage} is cleared in the browser.
     */
    store: Store

    /**
     * This method returns stack object which allows users to read and manipulate a range of objects in a stack.
     */
    stack: Stack
  }

  type BaseExtensionWithEntry = {
    /**
     * This gives you the entry object which allows you to interact with the current entry. Not available in case of the Dashboard Widget extension.
     */
    entry: Entry
  }

  type BaseExtensionWithWindow = {
    /**
     * The window object provides users with methods that allow them to adjust the size of the iframe that contains the extension. Not available in case of custom widgets.
     */
    window: Window
  }

  type FieldExtension = BaseExtension<'FIELD'> & BaseExtensionWithEntry & BaseExtensionWithWindow & {
    /**
     * This method gives you the instance configuration parameters set from the content type builder page in the field settings. This is only available for the Custom Field extension.
     */
    fieldConfig: object

    /**
     * Gives you the extension field object which allows you to interact with the field. Only available for the Custom Field extension.
     */
    field: Field
  }

  type WidgetExtension = BaseExtension<'WIDGET'> & BaseExtensionWithEntry

  type DashboardExtension = BaseExtension<'DASHBOARD'> & BaseExtensionWithWindow

  type Extension = FieldExtension | WidgetExtension | DashboardExtension

  export function init(): Promise<Extension>
}