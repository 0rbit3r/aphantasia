export interface fullThoughtDto{
    id: number,
    author: string,
    title: string,
    content: string,
    color: string,
    dateCreated: string,
    links: number[],
    backlinks:number[],
    size: number
}

export interface createThoughtDto {
    title: string,
    content: string,
    links: number[]
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