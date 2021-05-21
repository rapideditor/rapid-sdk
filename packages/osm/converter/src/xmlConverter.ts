import { Entity, Node, Relation, Way, EntityType, IMember } from "@id-sdk/osm.model"
import { IConverter } from "./converter"

/**
 * Osm Xml Converter - Used for parsing osm api result xml to internal osm model @link @id-sdk/osm.model 
 * 
 * ElementsPayload
 * e.g.
*
<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6" generator="CGImap 0.8.3 (2598603 spike-07.openstreetmap.org)" copyright="OpenStreetMap and contributors" attribution="http://www.openstreetmap.org/copyright" license="http://opendatacommons.org/licenses/odbl/1-0/">
    <node id="765658993" visible="true" version="4" changeset="57694453" timestamp="2018-03-31T17:23:26Z" user="Daeron" uid="38239" lat="60.2085923" lon="24.9440530">
        <tag k="lane:ends" v="right"/>
    </node>
    <way id="30326719" visible="true" version="8" changeset="20640488" timestamp="2014-02-18T16:52:58Z" user="ij_" uid="139957">
        <nd ref="271402643"/>
        <nd ref="60707539"/>
        <tag k="highway" v="residential"/>
        <tag k="lit" v="yes"/>
        <tag k="name" v="Tursontie"/>
        <tag k="name:fi" v="Tursontie"/>
        <tag k="name:sv" v="Tursovägen"/>
        <tag k="paved:date" v="2009-08"/>
        <tag k="snowplowing" v="yes"/>
        <tag k="surface" v="paved"/>
        <tag k="traffic:hourly:22:We:winter:backward" v="8/7:30"/>
        <tag k="traffic:hourly:22:We:winter:forward" v="&lt;8/7:30"/>
    </way>
    ......
</osm>
 */

interface IElementsPayload {
    elements: IElement[]
}

interface IElementMember {
    ref: number,
    type: EntityType,
    role: string
}

interface IElement {
    nodeName: EntityType,
    attributes: IAttributes
}

interface IAttributes {
    id: { value: number },
    visible?: { value: boolean },
    lat: { value: number },
    lon: { value: number },
    timestamp: { value: string },
    version: { value: number },
    changeset: { value: number },
    user: { value: string },
    uid: { value: number },
    tags?: { [key: string]: string }
    nodes?: { value: number[] },
    members?: { value: IElementMember[] }
}

export class XmlConverter implements IConverter{
    private readonly cache: { [key: string]: boolean };

    public constructor(private readonly _options: any) {
        this.cache = {};
    }

    public convert(payload: XMLDocument, callback: ({ message: string, status: number }, data?: Entity[]) => void): void {
        if (!payload) {
            return callback({ message: 'No XML', status: -1 });
        }

        let elements = payload?.childNodes[0]?.childNodes;
        if (!elements) {
            return callback({ message: 'No XML', status: -1 });
        }

        let entities: Entity[] = [];
        elements.forEach(element => {
            let entity: Entity = this.translateElement(element as unknown as IElement);
            if (entity) entities.push(entity);
        });

        callback({ message: '', status: 0 }, entities);
    }

    public translateElement(element: IElement): Entity {
        let type = element.nodeName;
        let translator: (element: IElement) => Entity = XmlConverter.typeToConverter[type]

        //let typedId = uid = Entity.idfromOSM(child.nodeName, child.attributes.id.value);
        // if (options.skipSeen) {
        //     if (_tileCache.seen[uid]) return null;  // avoid reparsing a "seen" entity
        //     _tileCache.seen[uid] = true;
        // }
        return translator(element);
    }

    private static typeToConverter: { [key: string]: (element: IElement) => Entity } = {
        'node': XmlConverter.convertNode,
        'way': XmlConverter.convertWay,
        'relation': XmlConverter.convertRelation,
    }

    private static convertNode(element: IElement): Entity {
        var attrs = element.attributes;
        return new Node({
            id: Entity.idfromOSM(element.nodeName, element.attributes.id.value),
            visible: attrs?.visible?.value ?? true,
            version: attrs.version.value,
            changeset: attrs.changeset.value,
            timestamp: attrs.timestamp.value,
            user: attrs.user.value,
            uid: attrs.uid.value,
            tags: XmlConverter.convertTags(element),
            loc: XmlConverter.convertLoc(attrs)
        });
    }

    private static convertWay(element: IElement): Entity {
        var attrs = element.attributes;
        return new Way({
            id: Entity.idfromOSM(element.nodeName, element.attributes.id.value),
            visible: attrs?.visible?.value ?? true,
            version: attrs.version.value,
            changeset: attrs.changeset.value,
            timestamp: attrs.timestamp.value,
            user: attrs.user.value,
            uid: attrs.uid.value,
            tags: XmlConverter.convertTags(element),
            nodes: XmlConverter.convertWayNodes(element),
        });
    }

    private static convertRelation(element: IElement): Entity {
        var attrs = element.attributes;
        return new Relation({
            id: Entity.idfromOSM(element.nodeName, element.attributes.id.value),
            visible: attrs?.visible?.value ?? true,
            version: attrs.version.value,
            changeset: attrs.changeset.value,
            timestamp: attrs.timestamp.value,
            user: attrs.user.value,
            uid: attrs.uid.value,
            tags: XmlConverter.convertTags(element),
            members: XmlConverter.convertRelationMembers(element)
        });
    }

    private static convertLoc(attrs: any) {
        var lon = attrs.lon && attrs.lon.value;
        var lat = attrs.lat && attrs.lat.value;
        return [parseFloat(lon), parseFloat(lat)];
    }

    private static convertWayNodes(obj: any): string[] {
        var elems = obj.getElementsByTagName('nd');
        var nodes = new Array(elems.length);
        for (var i = 0, l = elems.length; i < l; i++) {
            nodes[i] = 'n' + elems[i].attributes.ref.value;
        }
        return nodes;
    }

    private static convertRelationMembers(obj: any): IMember[] {
        var elems = obj.getElementsByTagName('member');
        var members = new Array(elems.length);
        for (var i = 0, l = elems.length; i < l; i++) {
            var attrs = elems[i].attributes;
            members[i] = {
                id: attrs.type.value[0] + attrs.ref.value,
                type: attrs.type.value,
                role: attrs.role.value
            };
        }
        return members;
    }

    private static convertTags(obj : any): any {
        var elems = obj.getElementsByTagName('tag');
        var tags = {};
        for (var i = 0, l = elems.length; i < l; i++) {
            var attrs = elems[i].attributes;
            tags[attrs.k.value] = attrs.v.value;
        }
    
        return tags;
    }
}