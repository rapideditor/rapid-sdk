import { Entity, EntityType, IEntityProps } from "./entity"

export interface INodeProps extends IEntityProps {
    loc: [number, number]
}

/** 
 * Osm node object
 * Extends {@link Entity}
*/
export class Node extends Entity {
    protected get props(): INodeProps { return this._props as INodeProps; }
    constructor(props: INodeProps) { super(props); }

    type = (): EntityType => 'node';

    get loc(): [number, number] { return this.props.loc; }
    set loc(value: [number, number]) { this.props.loc = value; }
}