export const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS Z';
export const APP_NAME = 'cyl-note';
export const EMPTY_TITLE = '(empty title)';

export const INDEX_NOTE_TITLE = 'INDEX_NOTE';

export enum SortByEnums {
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
  Title = 'TITLE',
  Custom = 'CUSTOM',
  Default = 'DEFAULT',
}

export enum SortDirectEnums {
  Default = 'DEFAULT',
  Asc = 'ASC',
  Desc = 'DESC',
}

export enum EntityTypes {
  Notebook = 'NOTEBOOK',
  Note = 'NOTE',
}
