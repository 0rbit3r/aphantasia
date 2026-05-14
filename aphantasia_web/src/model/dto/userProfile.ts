import type { ThoughtNode } from "./thought";
import type { User } from "./user";

export interface UserProfile {
    user: User,
    thoughts: ThoughtNode[]
}