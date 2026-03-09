import type { Concept } from "../model/dto/concept";
import type { Thought } from "../model/dto/thought";
import type { User } from "../model/dto/user";
import type { ThoughtInMaking } from "../model/ThoughtInMaking";

// this is ai vomit - todo redo

export type Tagged = Thought | Concept | User | ThoughtInMaking;

export function tag<T extends Tagged>(type: T['_type'], obj: Omit<T, '_type'>): T {
  return { _type: type, ...obj } as T;
}

export function isThought(obj?: Tagged): obj is Thought {
  return obj?._type === 'Thought';
}

export function isConcept(obj?: Tagged): obj is Concept {
  return obj?._type === 'Concept';
}

export function isUser(obj?: Tagged): obj is User {
  return obj?._type === 'User';
}

export function isThoughtInMaking(obj?: Tagged): obj is ThoughtInMaking {
  return obj?._type === 'ThoughtInMaking';
}