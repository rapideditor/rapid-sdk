import { Entity, EntityType, IEntityProps } from "./entity"

export interface IWayProps extends IEntityProps {
    nodes: string[]
}

/** 
 * Osm way object
 * Extends {@link Entity}
*/
export class Way extends Entity {
    protected get props(): IWayProps { return this._props as IWayProps; }
    constructor(props: IWayProps) { super(props); }

    type = (): EntityType => 'way';

    get nodes(): string[] { return this.props.nodes; }
    set nodes(value: string[]) { this.props.nodes = value; }
}