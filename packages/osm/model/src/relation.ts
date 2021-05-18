import { Entity, EntityType, IEntityProps } from "./entity"

export interface IMember {
    id: string,
    type: EntityType,
    role: string
}

export interface IRelationProps extends IEntityProps {
    members: IMember[]
}

/** 
 * Osm relation object
 * Extends {@link Entity}
*/
export class Relation extends Entity{
    protected get props(): IRelationProps { return this._props as IRelationProps; }
    constructor(props: IRelationProps) { super(props); }
    
    type = (): EntityType => 'relation';

    get members(): IMember[] { return this.props.members; }
    set members(value: IMember[]) { this.props.members = value; }
}