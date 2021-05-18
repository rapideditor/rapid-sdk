export type EntityType = 'node' | 'way' | 'relation'

export interface IEntityProps {
    id: string
    visible: boolean
    version: number
    changeset: number
    timestamp: string
    user: string
    uid: number
    tags: { [key: string]: string }
}

/**
 * Base abstract class for osm entity object model
 */
export abstract class Entity {
    protected get props(): IEntityProps { return this._props; }
    protected constructor(
        protected readonly _props: IEntityProps
    ) { }

    /**
     * @returns EntityType {@link Entity}
     */
    abstract type(): EntityType;

    get id(): string { return this.props.id; }
    set id(value: string) { this.props.id = value; }
    get visible(): boolean { return this.props.visible; }
    set visible(value: boolean) { this.props.visible = value; }
    get version(): number { return this.props.version; }
    set version(value: number) { this.props.version = value; }
    get changeset(): number { return this.props.changeset; }
    set changeset(value: number) { this.props.changeset = value; }
    get timestamp(): string { return this.props.timestamp; }
    set timestamp(value: string) { this.props.timestamp = value; }
    get user(): string { return this.props.user; }
    set user(value: string) { this.props.user = value; }
    get uid(): number { return this.props.uid; }
    set uid(value: number) { this.props.uid = value; }
    get tags(): { [key: string]: string } { return this.props.tags; }
    set tags(value: { [key: string]: string }) { this.props.tags = value; }
  
    /**
     * Creates typed id from osm long id and type
     * @param  {number} id e.g. 123
     * @param  {EntityType} type e.g. way
     * @returns typed id e.g. w123
     */
    public static idFromOsm(id: number, type: EntityType): string {
        return type[0] + id;
    }
    /**
     * Creates osm long id from typed id
     * @param  {string} id e.g. w123
     * @returns {number} id e.g. 123
     */
    public static idToOsm(id: string): number {
        return +id.slice(1);
    }
}