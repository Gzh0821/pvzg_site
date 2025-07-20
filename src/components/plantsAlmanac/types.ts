interface Element {
  [key: string]: number | string;
}
export interface KeyMap {
  [key: string]: { zh: string, en: string, icon?: string };
}
export interface Plant {
  elements: Element;
  id: number;
  name: string;
  enName: string;
  enFamily: string;
  codename: string;
  description: string;
  chat: String;
  plantType: string;
  obtainWorld: string;
  special: [Element] | [];
  subPlants: [string];
  objdata: { [key: string]: number | string };
}