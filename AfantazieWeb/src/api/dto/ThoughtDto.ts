import { ThoughtShape } from "../../pages/graph/model/thoughtShape";

export interface fullThoughtDto{
    id: number,
    author: string,
    title: string,
    content: string,
    color: string,
    shape: ThoughtShape,
    dateCreated: string,
    links: number[],
    backlinks:number[],
    size: number
}

export interface createThoughtDto {
    title: string,
    content: string,
    shape: ThoughtShape
}

export interface thoughtColoredTitleDto {
    id: number,
    title: string,
    color: string,
}

export interface thoughtNodeDto {
    id: number,
    title: string,
    size: number,
    author: string,
    dateCreated: string,
    color: string,
    shape: ThoughtShape,
    links: number[],
    backlinks: number[]
}

export interface thoughtsTemporalFilterDto
{
    beforeThoughtId?: number;
    afterThoughtId?: number;
    aroundThoughtId?: number;
    amount: number;
}