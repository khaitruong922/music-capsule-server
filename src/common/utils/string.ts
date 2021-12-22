export const CHAT_MAX_LENGTH = 1000;
export const NAME_MAX_LENGTH = 100;

export const truncateString = (s: string, length: number) => {
  return s.length <= length ? s : s.slice(0, length);
};

export const filterChat = (content: string) => {
  return truncateString(content.trim(), CHAT_MAX_LENGTH);
};

export const filterName = (name: string) => {
  return truncateString(name.trim(), NAME_MAX_LENGTH);
};
