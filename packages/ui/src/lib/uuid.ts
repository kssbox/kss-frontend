import { nanoid } from 'nanoid'

export function generateId(): string {
  return nanoid()
}

export function generateMessageId(): string {
  return `msg_${generateId()}`
}
