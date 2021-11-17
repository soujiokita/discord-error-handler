export = discord_error_handler;

declare class discord_error_handler {
    constructor(...args: any[]);

    createrr(...args: any[]): void;

    report(...args: any[]): void;

    status(...args: any[]): void;

}
