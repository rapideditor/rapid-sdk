import { Entity } from "@id-sdk/osm.model"

export interface IConverter {
    convert(payload: any, callback: ({message: string, status: number}, data?: Entity[]) => void): void;
}