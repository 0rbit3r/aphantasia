import type { Concept } from "../model/dto/concept";
import type { Thought } from "../model/dto/thought";
import type { User } from "../model/dto/user";

export function isThought(obj: unknown): obj is Thought {
  return (
    typeof obj === 'object' && 
    obj !== null && 
    'title' in obj && 
    'content' in obj
  );
}

export function isConcept(obj: unknown): obj is Concept {
  return (
    typeof obj === 'object' && 
    obj !== null && 
    'tag' in obj && 
    'largestThoughts' in obj &&
    !('id' in obj)
  );
}

export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' && 
    obj !== null && 
    'name' in obj && 
    'bio' in obj
  );
}