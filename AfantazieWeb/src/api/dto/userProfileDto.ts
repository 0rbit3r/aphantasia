import { thoughtNodeDto } from "./ThoughtDto";

export interface userProfileDto {
    username: string,
    color: string,
    totalCount: number,
    joinedDate: string,
    thoughts: thoughtNodeDto[],
    bio: string,
}