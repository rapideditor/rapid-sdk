import { Entity, Node, Relation, Way, EntityType, IMember } from "@id-sdk/osm.model"
import { IConverter } from "./converter"

/**
 * Osm Json Converter - Used for parsing osm api result json strings to internal osm model @link @id-sdk/osm.model 
 * 
 * ElementsPayload
 * e.g.
 * {
    "version": "0.6",
    "generator": "CGImap 0.8.3 (3114333 spike-06.openstreetmap.org)",
    "copyright": "OpenStreetMap and contributors",
    "attribution": "http://www.openstreetmap.org/copyright",
    "license": "http://opendatacommons.org/licenses/odbl/1-0/",
    "elements": [
        {
            "type": "way",
            "id": 30326719,
            "timestamp": "2014-02-18T16:52:58Z",
            "version": 8,
            "changeset": 20640488,
            "user": "ij_",
            "uid": 139957,
            "nodes": [
                271402643,
                60707539
            ],
            "tags": {
                "highway": "residential",
                "lit": "yes",
                "name": "Tursontie",
                "name:fi": "Tursontie",
                "name:sv": "Tursovägen",
                "paved:date": "2009-08",
                "snowplowing": "yes",
                "surface": "paved",
                "traffic:hourly:22:We:winter:backward": "8/7:30",
                "traffic:hourly:22:We:winter:forward": "<8/7:30"
            }
        },
        .....
    }
 */

interface IElementsPayload {
    elements : IElement[]
}

interface IElementMember {
    ref : number,
    type: EntityType,
    role: string
}

interface IElement {
    type: EntityType,
    id: number,
    visible?: boolean,
    lat: number,
    lon: number,
    timestamp: string,
    version: number,
    changeset: number,
    user: string,
    uid: number,
    tags?: {[key: string] : string}

    nodes? : number[],
    members? : IElementMember[]
}

export class JsonConverter implements IConverter{
    private readonly cache : {[key: string] : boolean};

    public constructor(private readonly _options: any) {
        this.cache = {};
    }

    //payload: ParsedJSONObject
    public convert(payload: any, callback: ({message: string, status: number}, data?: Entity[]) => void): void {
        if (!payload) {
            return callback({ message: 'No JSON', status: -1 });
        }

        let elementsPayload : IElementsPayload = JSON.parse(payload) as IElementsPayload;
        let elements: IElement[] = elementsPayload?.elements;

        if (!elements) {
            return callback({ message: 'No JSON', status: - 1 });
        }

        let entities : Entity[] = [];
        elements.forEach(element => {
            let entity : Entity = this.translateElement(element);
            if (entity) entities.push(entity);
        });

        callback({message: '', status: 0}, entities);
    }

    public translateElement(element: IElement) : Entity {
        let type = element.type;
        let translator : (element : IElement) => Entity = JsonConverter.typeToConverter[type]

        //let typedId = Entity.fromOSM(type, element.id);
        // if (options.skipSeen) {
        //     if (_tileCache.seen[uid]) return null;  // avoid reparsing a "seen" entity
        //     _tileCache.seen[uid] = true;
        // }

        return translator(element);
    }

    private static typeToConverter : {[key: string] : (element : IElement) => Entity} = {
        'node'     : JsonConverter.convertNode,
        'way'      : JsonConverter.convertWay,
        'relation' : JsonConverter.convertRelation,
    }

    private static convertNode(element : IElement) : Entity {
        return new Node({
            id: Entity.idFromOsm(element.id, element.type),
            visible: element.visible ?? true,
            version: element.version,
            changeset: element.changeset,
            timestamp: element.timestamp,
            user: element.user,
            uid: element.uid,
            loc: [element.lon, element.lat],
            tags: element.tags
        });
    }

    private static convertWay(element : IElement) : Entity {
        return new Way({
            id:  Entity.idFromOsm(element.id, element.type),
            visible: element.visible ?? true,
            version: element.version,
            changeset: element.changeset,
            timestamp: element.timestamp,
            user: element.user,
            uid: element.uid,
            tags: element.tags,
            nodes: JsonConverter.convertWayNodes(element.nodes as any[])
        });
    }

    private static convertRelation(element : IElement) : Entity {
        return new Relation({
            id:  Entity.idFromOsm(element.id, element.type),
            visible: element.visible ?? true,
            version: element.version,
            changeset: element.changeset,
            timestamp: element.timestamp,
            user: element.user,
            uid: element.uid,
            tags: element.tags,
            members: JsonConverter.convertRelationMembers(element.members as IElementMember[])
        });
    }

    private static convertWayNodes(elems : any[]) : string[] {
        var nodes = new Array(elems.length);
        for (var i = 0, l = elems.length; i < l; i++) {
            nodes[i] = 'n' + elems[i];
        }
        return nodes;
    }

    private static convertRelationMembers(elems : IElementMember[]) : IMember[] {
        var members = new Array(elems.length);
        for (var i = 0, l = elems.length; i < l; i++) {
            var attrs = elems[i];
            members[i] = {
                id: Entity.idFromOsm(attrs.ref, attrs.type),
                type: attrs.type,
                role: attrs.role
            };
        }
        return members;
    }
}