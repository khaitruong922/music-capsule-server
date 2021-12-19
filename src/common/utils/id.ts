import { customAlphabet } from 'nanoid';

const alphabet =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
const nanoid = customAlphabet(alphabet, 8);
export function generateRoomId() {
  return nanoid();
}
