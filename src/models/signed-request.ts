export type SignedRequest = {
  method: string;
  url: string;
  headers?: { [key: string]: string };
  query?: { [key: string]: string };
  parameters?: { [key: string]: string };
};
