import { deleteBase } from "./apiBase"

export const api_deleteThought = (id: string) =>{
    return deleteBase('/thoughts/' + (id ?? ""))
}