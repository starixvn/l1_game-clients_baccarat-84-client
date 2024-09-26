export interface ConfigJson {
    type: string;
    table: string;
    colors: { [tableName: string]: ColorJson };
}

export interface ColorJson {
    [objectName: string]: any;
}
